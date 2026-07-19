# Pakizzle v2 — monorepo root.
# Three services live under apps/: web (Next.js), gateway (Go), ai (Python).
# Each has its own Makefile for service-local commands; this one orchestrates.

REGISTRY  ?= ghcr.io/redspotsproduction-sudo
TAG       ?= latest
NAMESPACE ?= pakizzle

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

# -------------------------------------------------------------------
# Local development
# -------------------------------------------------------------------

.PHONY: dev
dev: ## Bring up the full stack with docker compose
	docker compose up --build

.PHONY: dev-infra
dev-infra: ## Only Postgres + Redis (run services natively)
	docker compose up -d postgres redis

.PHONY: dev-down
dev-down: ## Tear down compose stack (keeps volumes)
	docker compose down

.PHONY: dev-nuke
dev-nuke: ## Tear down compose stack and wipe volumes
	docker compose down -v

# -------------------------------------------------------------------
# Per-service helpers
# -------------------------------------------------------------------

.PHONY: web
web: ## Run web (Next.js) locally
	cd apps/web && npm run dev

.PHONY: gateway
gateway: ## Run gateway (Go) locally
	cd apps/gateway && make run

.PHONY: ai
ai: ## Run ai (Python) locally
	cd apps/ai && make run

# -------------------------------------------------------------------
# Docker build & push
# -------------------------------------------------------------------

# Public env vars are inlined into the Next.js client bundle at build time —
# they MUST be passed as --build-arg or the browser will fall back to
# localhost / same-origin and every /api call returns a Next.js 404.
NEXT_PUBLIC_GATEWAY_URL ?= https://api.pakizzle.amsterdamhostel.cloud
NEXT_PUBLIC_AI_URL      ?= https://ai.pakizzle.amsterdamhostel.cloud

.PHONY: build-web
build-web: ## Build web image
	docker build \
	  --build-arg NEXT_PUBLIC_GATEWAY_URL=$(NEXT_PUBLIC_GATEWAY_URL) \
	  --build-arg NEXT_PUBLIC_AI_URL=$(NEXT_PUBLIC_AI_URL) \
	  -t $(REGISTRY)/pakizzle-web:$(TAG) apps/web

.PHONY: build-gateway
build-gateway: ## Build gateway image
	docker build -t $(REGISTRY)/pakizzle-gateway:$(TAG) apps/gateway

.PHONY: build-ai
build-ai: ## Build ai image
	docker build -t $(REGISTRY)/pakizzle-ai:$(TAG) apps/ai

.PHONY: build-all
build-all: build-web build-gateway build-ai ## Build all images

.PHONY: push-all
push-all: build-all ## Build & push all images
	docker push $(REGISTRY)/pakizzle-web:$(TAG)
	docker push $(REGISTRY)/pakizzle-gateway:$(TAG)
	docker push $(REGISTRY)/pakizzle-ai:$(TAG)

# -------------------------------------------------------------------
# k8s
# -------------------------------------------------------------------

.PHONY: k8s-apply
k8s-apply: ## Apply all manifests (excluding secrets — apply those separately)
	kubectl apply -f k8s/00-namespace.yaml
	kubectl apply -f k8s/50-redis.yaml
	kubectl apply -f k8s/10-gateway.yaml
	kubectl apply -f k8s/20-ai.yaml
	kubectl apply -f k8s/30-web.yaml
	kubectl apply -f k8s/40-ingress.yaml

.PHONY: k8s-status
k8s-status: ## Show pakizzle namespace status
	kubectl -n $(NAMESPACE) get pods,svc,ingress

.PHONY: k8s-logs-gateway
k8s-logs-gateway:
	kubectl -n $(NAMESPACE) logs -f deploy/pakizzle-gateway

.PHONY: k8s-logs-ai
k8s-logs-ai:
	kubectl -n $(NAMESPACE) logs -f deploy/pakizzle-ai

.PHONY: k8s-logs-web
k8s-logs-web:
	kubectl -n $(NAMESPACE) logs -f deploy/pakizzle-web

.PHONY: k8s-rollout
k8s-rollout: ## Roll new TAG across all three deployments
	kubectl -n $(NAMESPACE) set image deploy/pakizzle-gateway gateway=$(REGISTRY)/pakizzle-gateway:$(TAG)
	kubectl -n $(NAMESPACE) set image deploy/pakizzle-ai      ai=$(REGISTRY)/pakizzle-ai:$(TAG)
	kubectl -n $(NAMESPACE) set image deploy/pakizzle-web     web=$(REGISTRY)/pakizzle-web:$(TAG)
	kubectl -n $(NAMESPACE) rollout status deploy/pakizzle-gateway
	kubectl -n $(NAMESPACE) rollout status deploy/pakizzle-ai
	kubectl -n $(NAMESPACE) rollout status deploy/pakizzle-web

# -------------------------------------------------------------------
# Misc
# -------------------------------------------------------------------

.PHONY: openapi
openapi: ## Validate the shared OpenAPI contract
	npx @redocly/cli lint packages/proto/openapi.yaml
