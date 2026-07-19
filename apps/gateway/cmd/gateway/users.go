package main

import (
	"context"
	"errors"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// ErrEmailTaken is returned by userStore.Create when the email is already registered.
var ErrEmailTaken = errors.New("email already registered")

type userRecord struct {
	ID             int64
	FullName       string
	Email          string
	PasswordHash   string
	Role           string
	EmailVerified  bool
	PhoneVerified  bool
	IdentityStatus string
	BusinessStatus string
	Badge          string
}

func (u userRecord) public() map[string]any {
	return map[string]any{
		"id":             u.ID,
		"fullName":       u.FullName,
		"email":          u.Email,
		"role":           u.Role,
		"emailVerified":  u.EmailVerified,
		"phoneVerified":  u.PhoneVerified,
		"identityStatus": u.IdentityStatus,
		"businessStatus": u.BusinessStatus,
		"badge":          u.Badge,
	}
}

// userStore: Postgres if pool != nil, else in-memory fallback.
type userStore struct {
	pool *pgxpool.Pool

	mu      sync.RWMutex
	memByID map[int64]*userRecord
	memByEm map[string]*userRecord
	nextID  atomic.Int64
}

func newUserStore(pool *pgxpool.Pool) *userStore {
	s := &userStore{
		pool:    pool,
		memByID: make(map[int64]*userRecord),
		memByEm: make(map[string]*userRecord),
	}
	if pool == nil {
		// seed admin in memory mode
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		s.nextID.Store(1)
		u := &userRecord{
			ID:           s.nextID.Add(1),
			FullName:     "Admin",
			Email:        "admin@pakizzle.com",
			PasswordHash: string(hash),
			Role:         "admin",
			Badge:        "business",
		}
		s.memByID[u.ID] = u
		s.memByEm[u.Email] = u
	}
	return s
}

func (s *userStore) Create(ctx context.Context, fullName, email, hash string) (*userRecord, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return nil, errors.New("email required")
	}
	if s.pool == nil {
		s.mu.Lock()
		defer s.mu.Unlock()
		if _, ok := s.memByEm[email]; ok {
			return nil, ErrEmailTaken
		}
		u := &userRecord{
			ID:           s.nextID.Add(1),
			FullName:     fullName,
			Email:        email,
			PasswordHash: hash,
			Role:         "user",
			Badge:        "none",
		}
		s.memByID[u.ID] = u
		s.memByEm[email] = u
		return u, nil
	}

	row := s.pool.QueryRow(ctx, `
INSERT INTO users (full_name, email, password_hash)
VALUES ($1, $2, $3)
RETURNING id, full_name, email, password_hash, COALESCE(role,'user'),
          COALESCE(email_verified,false), COALESCE(phone_verified,false),
          COALESCE(identity_status,'none'), COALESCE(business_status,'none'),
          COALESCE(badge,'none')`, fullName, email, hash)
	u := &userRecord{}
	if err := row.Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role,
		&u.EmailVerified, &u.PhoneVerified, &u.IdentityStatus, &u.BusinessStatus, &u.Badge); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailTaken
		}
		return nil, err
	}
	return u, nil
}

func (s *userStore) GetByEmail(ctx context.Context, email string) (*userRecord, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if s.pool == nil {
		s.mu.RLock()
		defer s.mu.RUnlock()
		return s.memByEm[email], nil
	}
	row := s.pool.QueryRow(ctx, `
SELECT id, full_name, email, password_hash, COALESCE(role,'user'),
       COALESCE(email_verified,false), COALESCE(phone_verified,false),
       COALESCE(identity_status,'none'), COALESCE(business_status,'none'),
       COALESCE(badge,'none')
FROM users WHERE email=$1`, email)
	u := &userRecord{}
	err := row.Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role,
		&u.EmailVerified, &u.PhoneVerified, &u.IdentityStatus, &u.BusinessStatus, &u.Badge)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return u, err
}

func (s *userStore) GetByID(ctx context.Context, id int64) (*userRecord, error) {
	if s.pool == nil {
		s.mu.RLock()
		defer s.mu.RUnlock()
		return s.memByID[id], nil
	}
	row := s.pool.QueryRow(ctx, `
SELECT id, full_name, email, password_hash, COALESCE(role,'user'),
       COALESCE(email_verified,false), COALESCE(phone_verified,false),
       COALESCE(identity_status,'none'), COALESCE(business_status,'none'),
       COALESCE(badge,'none')
FROM users WHERE id=$1`, id)
	u := &userRecord{}
	err := row.Scan(&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role,
		&u.EmailVerified, &u.PhoneVerified, &u.IdentityStatus, &u.BusinessStatus, &u.Badge)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return u, err
}
