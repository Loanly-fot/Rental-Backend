# Testing Guide for Rental Equipment System (MongoDB)

## Quick Test Commands

### 1. Health Check

```bash
curl http://localhost:5000/health
```

### 2. Register Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin User\",\"email\":\"admin@test.com\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

### 3. Register Normal User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@test.com\",\"password\":\"user123\",\"role\":\"user\"}"
```

### 4. Register Delivery Person

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Delivery Person\",\"email\":\"delivery@test.com\",\"password\":\"delivery123\",\"role\":\"delivery\"}"
```

### 5. Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\"}"
```

**Save the token from the response!**

### 6. Create Equipment (as Admin)

```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d "{\"name\":\"Laptop Dell XPS 15\",\"category\":\"Electronics\",\"quantity\":5,\"dailyRate\":50,\"status\":\"available\",\"description\":\"High-performance laptop\"}"
```

### 7. Get All Equipment (Public)

```bash
curl http://localhost:5000/api/equipment
```

### 8. Create Rental (as User)

First login as user, then:

```bash
curl -X POST http://localhost:5000/api/rentals/EQUIPMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d "{\"startDate\":\"2025-12-20\",\"endDate\":\"2025-12-25\",\"notes\":\"Need for project\",\"quantity\":1}"
```

### 9. Get My Rentals (as User)

```bash
curl http://localhost:5000/api/rentals/me \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### 10. Get All Rentals (as Admin)

```bash
curl http://localhost:5000/api/rentals \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 11. Get Admin Dashboard

```bash
curl http://localhost:5000/api/dashboard/admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 12. Get User Dashboard

```bash
curl http://localhost:5000/api/dashboard/user \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### 13. Get All Users (Admin only)

```bash
curl http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 14. Generate Daily Report CSV (Admin)

```bash
curl http://localhost:5000/api/reports/admin/csv?type=daily \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output daily_report.csv
```

## PowerShell Test Commands

### Register Admin

```powershell
$body = @{
    name = "Admin User"
    email = "admin@test.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login as Admin

```powershell
$body = @{
    email = "admin@test.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Create Equipment

```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Laptop Dell XPS 15"
    category = "Electronics"
    quantity = 5
    dailyRate = 50
    status = "available"
    description = "High-performance laptop"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/equipment" -Method POST -Headers $headers -Body $body
```

### Get All Equipment

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/equipment" -Method GET
```

### Get Admin Dashboard

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/admin" -Method GET -Headers $headers
```

## Expected Responses

### Successful Login

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67645a1b2c3d4e5f6g7h8i9j",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

### Equipment Created

```json
{
  "success": true,
  "message": "Equipment created successfully",
  "equipment": {
    "id": "67645a1b2c3d4e5f6g7h8i9k",
    "name": "Laptop Dell XPS 15",
    "category": "Electronics",
    "quantity": 5,
    "status": "available",
    "approved": true
  }
}
```

## Common Issues

### MongoDB Not Running

Error: `MongoServerError: connect ECONNREFUSED`
Solution: Start MongoDB with `mongod` command

### Token Expired

Error: `Invalid or expired token`
Solution: Login again to get a new token

### Unauthorized Access

Error: `Admin access required`
Solution: Ensure you're using the correct role's token

## API Testing Tools

- **Postman**: Import endpoints and test interactively
- **Thunder Client**: VS Code extension for API testing
- **curl**: Command-line testing
- **PowerShell**: Native Windows testing

## Database Inspection

### Connect to MongoDB

```bash
mongosh rental_system
```

### View Collections

```javascript
show collections
```

### View Users

```javascript
db.users.find().pretty();
```

### View Equipment

```javascript
db.equipments.find().pretty();
```

### View Rentals

```javascript
db.rentals.find().pretty();
```

### Count Documents

```javascript
db.users.countDocuments();
db.equipments.countDocuments();
db.rentals.countDocuments();
```

## Success Criteria

✅ Server starts without errors  
✅ MongoDB connection established  
✅ Can register users with different roles  
✅ Can login and receive JWT token  
✅ Can create equipment (admin auto-approves)  
✅ Can view equipment list  
✅ Can create rentals with valid equipment  
✅ Can view own rentals  
✅ Admins can view all rentals  
✅ Role-based access control works  
✅ Dashboard returns statistics  
✅ Reports generate successfully

## System is Ready!

Your Rental Equipment Checkout System with MongoDB is now fully functional! 🎉
