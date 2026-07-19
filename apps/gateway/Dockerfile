FROM golang:1.25-alpine AS builder
WORKDIR /src

RUN apk add --no-cache git

COPY go.mod go.sum* ./
RUN go mod download || true

COPY . .
RUN go mod tidy && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/gateway ./cmd/gateway

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=builder /out/gateway /app/gateway
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/gateway"]
