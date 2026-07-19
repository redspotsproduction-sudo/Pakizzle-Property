package logger

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
	"time"
)

// Shared log schema for the whole Pakizzle stack:
//   time, level, msg, service, request_id, user_id, route, method, status, duration_ms, ...
// All three services (gateway/ai/web) use the same field names so a single
// Loki/CloudWatch query can correlate requests across the call chain.

type ctxKey int

const (
	ctxLoggerKey ctxKey = iota
	ctxRequestIDKey
)

const HeaderRequestID = "X-Request-Id"

func New() *slog.Logger {
	level := slog.LevelInfo
	switch strings.ToLower(os.Getenv("LOG_LEVEL")) {
	case "debug":
		level = slog.LevelDebug
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	}
	h := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     level,
		AddSource: false,
		ReplaceAttr: func(_ []string, a slog.Attr) slog.Attr {
			// Promote slog's "time" -> ISO8601 string to match Python/Node.
			if a.Key == slog.TimeKey {
				if t, ok := a.Value.Any().(time.Time); ok {
					return slog.String("time", t.UTC().Format(time.RFC3339Nano))
				}
			}
			return a
		},
	})
	return slog.New(h).With("service", "gateway")
}

// FromContext returns a logger pre-bound with request-scoped fields.
// Safe to call on any context — falls back to slog.Default() if unset.
func FromContext(ctx context.Context) *slog.Logger {
	if l, ok := ctx.Value(ctxLoggerKey).(*slog.Logger); ok {
		return l
	}
	return slog.Default()
}

func WithLogger(ctx context.Context, l *slog.Logger) context.Context {
	return context.WithValue(ctx, ctxLoggerKey, l)
}

func RequestIDFrom(ctx context.Context) string {
	if v, ok := ctx.Value(ctxRequestIDKey).(string); ok {
		return v
	}
	return ""
}

func WithRequestID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, ctxRequestIDKey, id)
}

// HTTP returns chi-compatible middleware that:
//   - reads or mints X-Request-Id
//   - binds a logger with request_id + method + path
//   - logs the request envelope on completion (status + duration)
//   - recovers from panics with stack traces
//   - mirrors X-Request-Id back to the client for end-to-end tracing
func HTTP(base *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			reqID := r.Header.Get(HeaderRequestID)
			if reqID == "" {
				reqID = newID()
			}
			w.Header().Set(HeaderRequestID, reqID)

			rl := base.With(
				"request_id", reqID,
				"method", r.Method,
				"route", r.URL.Path,
				"remote", clientIP(r),
			)
			ctx := WithRequestID(WithLogger(r.Context(), rl), reqID)

			ww := &statusRecorder{ResponseWriter: w, status: 200}

			defer func() {
				if rec := recover(); rec != nil {
					rl.Error("panic recovered",
						"err", rec,
						"stack", string(debug.Stack()),
					)
					http.Error(ww, `{"error":"internal server error","code":"panic"}`, http.StatusInternalServerError)
				}
				attrs := []any{
					"status", ww.status,
					"duration_ms", time.Since(start).Milliseconds(),
					"bytes", ww.written,
				}
				switch {
				case ww.status >= 500:
					rl.Error("request", attrs...)
				case ww.status >= 400:
					rl.Warn("request", attrs...)
				default:
					rl.Info("request", attrs...)
				}
			}()

			next.ServeHTTP(ww, r.WithContext(ctx))
		})
	}
}

type statusRecorder struct {
	http.ResponseWriter
	status  int
	written int
	wrote   bool
}

func (s *statusRecorder) WriteHeader(code int) {
	if !s.wrote {
		s.status = code
		s.wrote = true
	}
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(b []byte) (int, error) {
	if !s.wrote {
		s.wrote = true
		s.status = 200
	}
	n, err := s.ResponseWriter.Write(b)
	s.written += n
	return n, err
}

// Flush is required for SSE-aware proxies.
func (s *statusRecorder) Flush() {
	if f, ok := s.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

func clientIP(r *http.Request) string {
	if h := r.Header.Get("X-Forwarded-For"); h != "" {
		if i := strings.Index(h, ","); i > 0 {
			return strings.TrimSpace(h[:i])
		}
		return strings.TrimSpace(h)
	}
	if h := r.Header.Get("X-Real-Ip"); h != "" {
		return h
	}
	return strings.SplitN(r.RemoteAddr, ":", 2)[0]
}

// newID returns a short collision-resistant id (e.g. "k9c8h2q4-x7v3").
// crypto/rand is plenty fast and we don't want dependencies.
func newID() string {
	// 12 url-safe chars from time + crand
	const charset = "0123456789abcdefghijklmnopqrstuvwxyz"
	var buf [12]byte
	t := time.Now().UnixNano()
	for i := range buf {
		buf[i] = charset[t&31]
		t >>= 5
		if t == 0 {
			t = time.Now().UnixNano() ^ int64(i)
		}
	}
	return string(buf[:])
}
