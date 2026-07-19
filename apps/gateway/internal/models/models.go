package models

import "time"

type User struct {
	ID             int64     `json:"id"`
	FullName       string    `json:"fullName"`
	Email          string    `json:"email"`
	Role           string    `json:"role"`
	EmailVerified  bool      `json:"emailVerified"`
	PhoneVerified  bool      `json:"phoneVerified"`
	IdentityStatus string    `json:"identityStatus"`
	BusinessStatus string    `json:"businessStatus"`
	Badge          string    `json:"badge"`
	CreatedAt      time.Time `json:"createdAt"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type RegisterRequest struct {
	FullName string `json:"fullName" validate:"required,min=2,max=255"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=128"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type PhoneSendRequest struct {
	Phone string `json:"phone" validate:"required,min=6,max=20"`
}

type PhoneVerifyRequest struct {
	Phone string `json:"phone" validate:"required,min=6,max=20"`
	Code  string `json:"code" validate:"required,min=4,max=8"`
}

type EmailSendRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type EmailVerifyRequest struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,min=4,max=8"`
}

type Make struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	LogoURL   string `json:"logoUrl"`
	SortOrder int32  `json:"sortOrder"`
	IsActive  bool   `json:"isActive"`
}

type Model struct {
	ID        int64  `json:"id"`
	MakeID    int64  `json:"makeId"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	SortOrder int32  `json:"sortOrder"`
	IsActive  bool   `json:"isActive"`
}

type Variant struct {
	ID           int64  `json:"id"`
	ModelID      int64  `json:"modelId"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	EngineCC     string `json:"engineCc"`
	FuelType     string `json:"fuelType"`
	Transmission string `json:"transmission"`
	BodyType     string `json:"bodyType"`
	IsActive     bool   `json:"isActive"`
}

type MakeInput struct {
	Name      string `json:"name" validate:"required,min=1,max=255"`
	Slug      string `json:"slug" validate:"required,min=1,max=255"`
	LogoURL   string `json:"logoUrl"`
	SortOrder int32  `json:"sortOrder"`
	IsActive  *bool  `json:"isActive"`
}

type ModelInput struct {
	MakeID    int64  `json:"makeId" validate:"required,gt=0"`
	Name      string `json:"name" validate:"required,min=1,max=255"`
	Slug      string `json:"slug" validate:"required,min=1,max=255"`
	SortOrder int32  `json:"sortOrder"`
	IsActive  *bool  `json:"isActive"`
}

type VariantInput struct {
	ModelID      int64  `json:"modelId" validate:"required,gt=0"`
	Name         string `json:"name" validate:"required,min=1,max=255"`
	Slug         string `json:"slug" validate:"required,min=1,max=255"`
	EngineCC     string `json:"engineCc"`
	FuelType     string `json:"fuelType"`
	Transmission string `json:"transmission"`
	BodyType     string `json:"bodyType"`
	IsActive     *bool  `json:"isActive"`
}

type Listing struct {
	ID           int64     `json:"id"`
	SellerID     int64     `json:"sellerId"`
	MakeID       int64     `json:"makeId"`
	ModelID      int64     `json:"modelId"`
	VariantID    *int64    `json:"variantId,omitempty"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Price        int64     `json:"price"`
	Year         int32     `json:"year"`
	Mileage      int32     `json:"mileage"`
	City         string    `json:"city"`
	Condition    string    `json:"condition"`
	Transmission string    `json:"transmission"`
	FuelType     string    `json:"fuelType"`
	Color        string    `json:"color"`
	Images       []string  `json:"images"`
	Status       string    `json:"status"`
	ViewCount    int32     `json:"viewCount"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Seller       *User     `json:"seller,omitempty"`
}

type ListingCreateInput struct {
	MakeID       int64    `json:"makeId" validate:"required,gt=0"`
	ModelID      int64    `json:"modelId" validate:"required,gt=0"`
	VariantID    *int64   `json:"variantId"`
	Title        string   `json:"title" validate:"required,min=3,max=255"`
	Description  string   `json:"description" validate:"max=10000"`
	Price        int64    `json:"price" validate:"required,gt=0"`
	Year         int32    `json:"year" validate:"required,gte=1900,lte=2100"`
	Mileage      int32    `json:"mileage" validate:"gte=0"`
	City         string   `json:"city" validate:"required,min=2,max=100"`
	Condition    string   `json:"condition" validate:"omitempty,oneof=excellent good fair poor"`
	Transmission string   `json:"transmission" validate:"omitempty,oneof=manual automatic cvt"`
	FuelType     string   `json:"fuelType" validate:"max=50"`
	Color        string   `json:"color" validate:"max=50"`
	Images       []string `json:"images" validate:"dive,url"`
}

type ListingUpdateInput struct {
	MakeID       *int64    `json:"makeId"`
	ModelID      *int64    `json:"modelId"`
	VariantID    *int64    `json:"variantId"`
	Title        *string   `json:"title" validate:"omitempty,min=3,max=255"`
	Description  *string   `json:"description" validate:"omitempty,max=10000"`
	Price        *int64    `json:"price" validate:"omitempty,gt=0"`
	Year         *int32    `json:"year" validate:"omitempty,gte=1900,lte=2100"`
	Mileage      *int32    `json:"mileage" validate:"omitempty,gte=0"`
	City         *string   `json:"city" validate:"omitempty,min=2,max=100"`
	Condition    *string   `json:"condition" validate:"omitempty,oneof=excellent good fair poor"`
	Transmission *string   `json:"transmission" validate:"omitempty,oneof=manual automatic cvt"`
	FuelType     *string   `json:"fuelType"`
	Color        *string   `json:"color"`
	Images       *[]string `json:"images"`
	Status       *string   `json:"status" validate:"omitempty,oneof=draft active sold suspended"`
}

type ListingSearchParams struct {
	MakeID   *int64
	ModelID  *int64
	MinPrice *int64
	MaxPrice *int64
	City     string
	Query    string
	Limit    int
	Offset   int
}

type ListingSearchResult struct {
	Items []Listing `json:"items"`
	Total int64     `json:"total"`
}

type VerificationStatus struct {
	EmailVerified  bool                  `json:"emailVerified"`
	PhoneVerified  bool                  `json:"phoneVerified"`
	IdentityStatus string                `json:"identityStatus"`
	BusinessStatus string                `json:"businessStatus"`
	Badge          string                `json:"badge"`
	PendingRequest *PendingRequestStub   `json:"pendingRequest"`
}

type PendingRequestStub struct {
	Type      string    `json:"type"`
	CreatedAt time.Time `json:"createdAt"`
}

type PendingVerification struct {
	ID             int64                  `json:"id"`
	UserID         int64                  `json:"userId"`
	Type           string                 `json:"type"`
	Status         string                 `json:"status"`
	CreatedAt      time.Time              `json:"createdAt"`
	User           PendingVerificationUser `json:"user"`
	Documents      []VerificationDocument `json:"documents"`
}

type PendingVerificationUser struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
}

type VerificationDocument struct {
	ID           int64  `json:"id"`
	DocumentType string `json:"documentType"`
	FileURL      string `json:"fileUrl"`
}

type ApproveRequest struct {
	RequestID int64 `json:"requestId" validate:"required,gt=0"`
}

type RejectRequest struct {
	RequestID int64  `json:"requestId" validate:"required,gt=0"`
	Reason    string `json:"reason" validate:"required,min=2,max=1000"`
}

type ErrorBody struct {
	Error string `json:"error"`
	Code  string `json:"code,omitempty"`
}

type PingResponse struct {
	Pong bool      `json:"pong"`
	Time time.Time `json:"time"`
}

type HealthResponse struct {
	OK bool `json:"ok"`
	DB bool `json:"db"`
}
