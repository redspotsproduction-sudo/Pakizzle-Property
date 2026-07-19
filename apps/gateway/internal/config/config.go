package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Env           string
	Port          string
	DatabaseURL   string
	JWTSecret     string
	CloudinaryURL string
	AIServiceURL  string
	AdminEmail    string
	PublicBaseURL string
	SESRegion     string
	SESFromEmail  string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	c := &Config{
		Env:           getenv("ENV", "development"),
		Port:          getenv("PORT", "8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		JWTSecret:     os.Getenv("JWT_SECRET"),
		CloudinaryURL: os.Getenv("CLOUDINARY_URL"),
		AIServiceURL:  getenv("AI_SERVICE_URL", "http://localhost:8000"),
		AdminEmail:    getenv("ADMIN_EMAIL", "redspotsproduction@gmail.com"),
		PublicBaseURL: getenv("PUBLIC_BASE_URL", "http://localhost:8080"),
		SESRegion:     getenv("SES_REGION", getenv("AWS_REGION", "us-east-1")),
		SESFromEmail:  getenv("SES_FROM_EMAIL", "Pakizzle <noreply@pakizzle.amsterdamhostel.cloud>"),
	}

	var missing []string
	if c.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if c.JWTSecret == "" {
		missing = append(missing, "JWT_SECRET")
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	return c, nil
}

func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
