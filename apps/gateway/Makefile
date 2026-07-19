.PHONY: run build tidy

run:
	go run ./cmd/gateway

build:
	CGO_ENABLED=0 go build -o bin/gateway ./cmd/gateway

tidy:
	go mod tidy
