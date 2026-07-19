# Security Specification

## Data Invariants
- A User must have a verified email to perform write operations (unless explicitly designated as a mock user).
- A User cannot change their own role or status.
- A user's UID in the document must match their Auth UID.
- Public profile data (display name, photo, join date) is readable by anyone to support marketplace interactions.
- Sensitive data (email, full address, private notes) is ONLY readable by the owner or an admin.

## The "Dirty Dozen" Payloads (Users)
1. **Identity Spoofing**: `uid: "someone_else_uid", email: "my@email.com"` -> REJECT (uid mismatch)
2. **Privilege Escalation**: `role: "admin"` -> REJECT (role is immutable/admin-only)
3. **Ghost Field Injection**: `isVerified: true, hacker: "evil"` -> REJECT (strict keys)
4. **ID Poisoning**: `match /users/VERY_LONG_JUNK_STRING...` -> REJECT (isValidId)
5. **PII Scraping**: Unauthenticated user `get /users/userId` -> ALLOW (only if doc exists, but exclude sensitive fields check)
6. **State Shortcut**: `status: "active"` update to `status: "suspended"` -> REJECT (user cannot suspend self)
7. **Email Hijack**: `email: "admin@gmail.com"` -> REJECT (email must match auth)
8. **Shadow Admin**: `request.auth.token.email: "attacker@gmail.com"` -> REJECT (hardcoded admin check)
9. **Null Injection**: `email: null` -> REJECT (type check)
10. **Resource Exhaustion**: `displayName: "A" * 1000000` -> REJECT (size check)
11. **Orphan Creation**: Create doc with `uid` that doesn't match path -> REJECT
12. **Status Locking Bypass**: Update a "banned" user document -> REJECT

## Test Runner (Conceptual Summary)
Tests will verify that these payloads fail specifically at the rules layer.
