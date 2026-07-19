package badge

const (
	None     = "none"
	Basic    = "basic"
	Identity = "identity"
	Business = "business"
)

// Calculate mirrors the calculateBadge() logic in the legacy server.ts.
// Order matters: business > identity > basic > none.
func Calculate(businessStatus, identityStatus string, emailVerified, phoneVerified bool) string {
	if businessStatus == "approved" {
		return Business
	}
	if identityStatus == "approved" {
		return Identity
	}
	if emailVerified && phoneVerified {
		return Basic
	}
	return None
}
