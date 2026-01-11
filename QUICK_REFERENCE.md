# Quick Reference - Role-Based System

## User Registration & Authentication

### Register New User (Default: Normal User)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Response includes token and user role
```

### Promote User to Admin (Database)

```bash
mysql -u root -p rental_db
UPDATE users SET role = 'admin' WHERE id = 1;
```

---

## Equipment Workflow

### Normal User: Upload Equipment (Pending)

```bash
TOKEN="your_user_token"
curl -X POST http://localhost:5000/api/equipment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professional Camera",
    "description": "Canon EOS R5",
    "category": "Photography",
    "dailyRate": 150,
    "quantity": 3,
    "available": 3
  }'

# Response: status = "pending"
```

### Admin: View Pending Equipment

```bash
ADMIN_TOKEN="your_admin_token"
curl -X GET http://localhost:5000/api/equipment/admin/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Admin: Approve Equipment

```bash
curl -X PUT http://localhost:5000/api/equipment/9/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approval_notes": "Equipment verified"}'

# Response: status = "approved"
```

### Admin: Reject Equipment

```bash
curl -X PUT http://localhost:5000/api/equipment/9/reject \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rejection_reason": "Damaged condition"}'

# Response: status = "rejected"
```

### Normal User: View Only Approved Equipment

```bash
curl -X GET http://localhost:5000/api/equipment \
  -H "Authorization: Bearer $TOKEN"

# Returns only approved equipment
```

---

## Rental Operations

### Checkout Equipment (Any User)

```bash
curl -X POST http://localhost:5000/api/rentals/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": 1,
    "return_date": "2025-12-15T10:00:00Z",
    "quantity": 1
  }'
```

### Get My Rentals (Normal User)

```bash
curl -X GET http://localhost:5000/api/rentals/user/all \
  -H "Authorization: Bearer $TOKEN"

# Returns only current user's rentals
```

### Get All Rentals (Admin Only)

```bash
curl -X GET http://localhost:5000/api/rentals \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Returns all users' rentals
```

### Get Active Rentals (Admin Only)

```bash
curl -X GET http://localhost:5000/api/rentals/admin/active \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Overdue Rentals (Admin Only)

```bash
curl -X GET http://localhost:5000/api/rentals/admin/overdue \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Return Equipment (Own or Admin)

```bash
curl -X POST http://localhost:5000/api/rentals/return \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rental_id": 1}'
```

---

## Dashboard

### Get Dashboard (Auto-Detects Role)

```bash
# Normal User - Returns personal statistics
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"

# Admin - Returns system-wide statistics
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Expected Admin Response

```json
{
  "dashboardType": "admin",
  "summary": {
    "rentals": { "total": 50, "active": 12, "overdue": 2, "completed": 36 },
    "equipment": { "total": 25, "approved": 23, "pending": 1, "rejected": 1 },
    "inventory": {
      "totalQuantity": 150,
      "availableQuantity": 120,
      "checkedOutQuantity": 30
    },
    "revenue": { "total": "5400.00", "fromActiveRentals": "800.00" }
  }
}
```

### Expected User Response

```json
{
  "dashboardType": "user",
  "summary": {
    "rentals": { "total": 5, "active": 2, "overdue": 0, "completed": 3 },
    "uploads": { "total": 2, "approved": 1, "pending": 1, "rejected": 0 },
    "spending": { "total": "250.00", "fromActiveRentals": "100.00" }
  }
}
```

---

## Reports

### Get Report Data (Role-Based)

```bash
# Types: daily, monthly, inventory, activity, overdue

# Normal User - Returns own data
curl -X GET http://localhost:5000/api/reports/data/monthly \
  -H "Authorization: Bearer $USER_TOKEN"

# Admin - Returns all system data
curl -X GET http://localhost:5000/api/reports/data/monthly \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Download Report as CSV (Admin Only)

```bash
curl -X GET http://localhost:5000/api/reports/daily/csv \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  --output report.csv
```

### Download Report as PDF (Admin Only)

```bash
curl -X GET http://localhost:5000/api/reports/daily/pdf \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  --output report.pdf
```

---

## Common Error Messages

| Error                               | Cause                                | Solution                                |
| ----------------------------------- | ------------------------------------ | --------------------------------------- |
| `No token provided`                 | Missing Authorization header         | Add `-H "Authorization: Bearer $TOKEN"` |
| `Invalid or expired token`          | Token expired or malformed           | Re-login to get new token               |
| `Admin access required`             | Normal user accessing admin endpoint | Login as admin account                  |
| `You do not have permission...`     | Accessing other user's resource      | Check user ID matches `req.user.id`     |
| `Equipment not found`               | Invalid equipment ID                 | Verify equipment exists and is approved |
| `Available quantity...exceed total` | Renting more than available          | Reduce rental quantity                  |

---

## Role Permissions Matrix

| Action                  | Normal User        | Admin         |
| ----------------------- | ------------------ | ------------- |
| Upload Equipment        | ✅ (pending)       | ✅ (approved) |
| View Approved Equipment | ✅                 | ✅            |
| View Pending Equipment  | ❌                 | ✅            |
| Approve Equipment       | ❌                 | ✅            |
| Reject Equipment        | ❌                 | ✅            |
| Checkout Equipment      | ✅ (approved only) | ✅ (all)      |
| View Own Rentals        | ✅                 | ✅            |
| View All Rentals        | ❌                 | ✅            |
| View Personal Dashboard | ✅                 | N/A           |
| View System Dashboard   | ❌                 | ✅            |
| Download Own Reports    | ✅                 | ✅            |
| Download All Reports    | ❌                 | ✅            |
| View Own Activity       | ✅                 | ✅            |
| View All Activity       | ❌                 | ✅            |

---

## Database Quick Commands

### Check User Roles

```sql
SELECT id, username, email, role FROM users;
```

### View Equipment Status

```sql
SELECT id, name, status, uploaded_by, approved_by FROM equipment;
```

### Count Pending Equipment

```sql
SELECT COUNT(*) as pending_count FROM equipment WHERE status = 'pending';
```

### Check Active Rentals

```sql
SELECT r.id, u.name, e.name, r.checkout_date, r.return_date
FROM rentals r
JOIN users u ON r.user_id = u.id
JOIN equipment e ON r.equipment_id = e.id
WHERE r.status = 'active';
```

### Promote User to Admin

```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

### Demote Admin to User

```sql
UPDATE users SET role = 'user' WHERE id = 1;
```

---

## Middleware Usage

### verifyToken

```javascript
router.get("/endpoint", verifyToken, controllerMethod);
// Validates JWT, attaches user to req.user
```

### verifyAdmin

```javascript
router.get("/endpoint", verifyToken, verifyAdmin, controllerMethod);
// Requires user.role === 'admin'
```

### verifyNormalUser

```javascript
router.get("/endpoint", verifyToken, verifyNormalUser, controllerMethod);
// Requires user.role === 'user'
```

### verifyRole

```javascript
router.get(
  "/endpoint",
  verifyToken,
  verifyRole("user", "admin"),
  controllerMethod
);
// Allows multiple roles
```

### verifyResourceOwner

```javascript
router.put("/resource/:id", verifyToken, verifyResourceOwner, controllerMethod);
// Normal users access only own resources; admins access all
```

---

## Testing Script Template

```bash
#!/bin/bash

# Setup
API="http://localhost:5000/api"
USER_EMAIL="user@rental.com"
ADMIN_EMAIL="admin@rental.com"
PASSWORD="TestPass123!"

# Register users
echo "Registering users..."
USER_TOKEN=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"$USER_EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.token')

ADMIN_TOKEN=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testadmin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.token')

# Promote to admin (via database)
# mysql -u root -p rental_db -e "UPDATE users SET role='admin' WHERE email='$ADMIN_EMAIL';"

# Test user upload (pending)
echo "User uploading equipment..."
curl -X POST $API/equipment \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"Electronics","dailyRate":50,"quantity":5,"available":5}'

# Test admin approval
echo "Admin approving equipment..."
curl -X PUT $API/equipment/1/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test dashboard
echo "User dashboard..."
curl -X GET $API/dashboard \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.dashboardType'

echo "Admin dashboard..."
curl -X GET $API/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.dashboardType'
```

---

## Troubleshooting

### Equipment not showing up for user

- Check status is 'approved' (not 'pending' or 'rejected')
- Verify user role allows viewing (normal users see approved only)

### Can't approve equipment

- Ensure logged in as admin (`role: 'admin'`)
- Check equipment exists and status is 'pending'
- Verify token hasn't expired

### Dashboard shows no data

- Check user has created rentals or equipment
- Verify correct role (admins see system data, users see personal data)
- Check date ranges for reports

### "Admin access required" errors

- User role is not 'admin'
- Promote user in database or use different admin account
- Verify token includes correct role

### Token expired

- Tokens expire after 24 hours (default)
- Call `/api/auth/login` again to get fresh token
- Store token securely on frontend

---

## Documentation Files

- **Multi-User API:** `docs/multi-user-api.md` (comprehensive guide)
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md` (task completion details)
- **Quick Reference:** This file
- **Original API Docs:** `docs/api.md` (unchanged endpoints)
- **Architecture:** `docs/architecture.md` (system design)
