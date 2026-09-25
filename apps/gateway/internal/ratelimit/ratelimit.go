package ratelimit

import (
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type entry struct {
	count     int
	resetTime time.Time
}

// Limiter manages sliding window rate limits in memory.
type Limiter struct {
	mu      sync.Mutex
	entries map[string]*entry
}

func New() *Limiter {
	l := &Limiter{
		entries: make(map[string]*entry),
	}
	// Run background cleaner every 5 minutes
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			l.cleanup()
		}
	}()
	return l
}

func (l *Limiter) cleanup() {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	for k, v := range l.entries {
		if now.After(v.resetTime) {
			delete(l.entries, k)
		}
	}
}

// Allow checks if the action under key is allowed within window and maxAttempts.
// It returns allowed (bool), remaining attempts (int), and seconds until reset (int).
func (l *Limiter) Allow(key string, maxAttempts int, window time.Duration) (bool, int, int) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	e, exists := l.entries[key]
	if !exists || now.After(e.resetTime) {
		l.entries[key] = &entry{
			count:     1,
			resetTime: now.Add(window),
		}
		retrySec := int(window.Seconds())
		if retrySec < 1 {
			retrySec = 1
		}
		return true, maxAttempts - 1, retrySec
	}

	retrySec := int(e.resetTime.Sub(now).Seconds())
	if retrySec < 1 {
		retrySec = 1
	}

	if e.count >= maxAttempts {
		return false, 0, retrySec
	}

	e.count++
	return true, maxAttempts - e.count, retrySec
}

// ClientIP extracts the real client IP from standard headers or RemoteAddr.
func ClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		ip := strings.TrimSpace(parts[0])
		if ip != "" {
			return ip
		}
	}
	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

// WriteRateLimited writes a standardized 429 response.
func WriteRateLimited(w http.ResponseWriter, retryAfterSec int, msg string) {
	w.Header().Set("Retry-After", strconv.Itoa(retryAfterSec))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusTooManyRequests)
	_, _ = w.Write([]byte(`{"error":"` + msg + `","code":"rate_limited"}`))
}
