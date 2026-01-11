# Multi-User Role-Based System Documentation

## Overview

The Equipment Rental System now supports two user roles with distinct permissions and workflows:

- **Normal Users**: Can browse equipment, upload equipment for approval, rent approved equipment, and manage their own rentals
- **Admins**: Have complete system access, can approve/reject equipment, manage all rentals, and view system-wide reports

---

## User Roles & Permissions

### Normal User (`role: 'user'`)

**Permissions:**

- ✅ Browse all approved equipment
- ✅ Upload equipment (status: `pending`)
- ✅ View pending status of their uploads
- ✅ Rent any approved equipment
- ✅ View their own rentals (active, completed, overdue)
- ✅ Return equipment they've rented
- ✅ View personal dashboard (spending, active rentals, upload status)
- ✅ Download their own rental reports (daily, monthly, activity)

**Restrictions:**

- ❌ Cannot view other users' rentals
- ❌ Cannot approve/reject equipment
- ❌ Cannot view system-wide reports
- ❌ Cannot modify equipment status

### Admin User (`role: 'admin'`)

**Permissions:**

- ✅ Browse all equipment (approved, pending, rejected)
- ✅ Create equipment directly (auto-approved)
- ✅ Approve pending equipment uploads
- ✅ Reject equipment with optional reason/notes
- ✅ View all user rentals across system
- ✅ Manage all rentals (checkout, return)
- ✅ View system-wide dashboard (statistics, utilization, revenue)
- ✅ Download all reports (daily, monthly, inventory, activity, overdue)
- ✅ View all user activity logs

---

## Database Schema Updates

### Users Table

```sql
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
ALTER TABLE users ADD INDEX idx_role (role);
```

### Equipment Table

```sql
ALTER TABLE equipment ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved';
ALTER TABLE equipment ADD COLUMN uploaded_by INT;
ALTER TABLE equipment ADD COLUMN approved_by INT;
ALTER TABLE equipment ADD COLUMN approval_notes TEXT;
ALTER TABLE equipment ADD FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE equipment ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE equipment ADD INDEX idx_status (status);
ALTER TABLE equipment ADD INDEX idx_uploaded_by (uploaded_by);
```

---

## API Endpoints by Role

### Equipment Management

#### 1. **Get All Equipment** (Role-Based)

```
GET /api/equipment
```

**Response:**

- **Normal Users:** Returns only approved equipment
- **Admins:** Returns all equipment (pending, approved, rejected)

**Example:**

```bash
curl -H "Authorization: Bearer {token}" http://localhost:5000/api/equipment
```

**Response (Normal User):**

```json
{
  "success": true,
  "count": 8,
  "equipment": [
    {
      "id": 1,
      "name": "Laptop Dell XPS",
      "description": "High performance laptop with 16GB RAM",
      "category": "Electronics",
      "daily_rate": 50.0,
      "qty_total": 10,
      "qty_available": 8,
      "status": "approved",
      "created_at": "2025-12-08T10:30:00Z"
    }
  ]
}
```

---

#### 2. **Upload Equipment** (Normal Users & Admins)

```
POST /api/equipment
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Professional Drone",
  "description": "DJI Mavic 3 with 4K camera",
  "category": "Photography",
  "dailyRate": 150.0,
  "quantity": 5,
  "available": 5
}
```

**Response:**

- **Normal Users:** Equipment created with `status: 'pending'` (requires admin approval)
- **Admins:** Equipment created with `status: 'approved'` immediately

**Example (Normal User):**

```json
{
  "success": true,
  "message": "Equipment created successfully (status: pending)",
  "equipmentId": 9,
  "equipment": {
    "id": 9,
    "name": "Professional Drone",
    "status": "pending",
    "uploadedBy": 2,
    "created_at": "2025-12-08T14:22:00Z"
  }
}
```

---

#### 3. **Get Pending Equipment for Approval** (Admin Only)

```
GET /api/equipment/admin/pending
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 3,
  "message": "3 equipment awaiting approval",
  "equipment": [
    {
      "id": 9,
      "name": "Professional Drone",
      "category": "Photography",
      "daily_rate": 150.0,
      "status": "pending",
      "uploaded_by": 2,
      "created_at": "2025-12-08T14:22:00Z"
    }
  ]
}
```

---

#### 4. **Approve Equipment** (Admin Only)

```
PUT /api/equipment/:id/approve
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (Optional):**

```json
{
  "approval_notes": "Verified condition, ready for rental"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Equipment approved successfully",
  "equipment": {
    "id": 9,
    "name": "Professional Drone",
    "status": "approved",
    "approved_by": 1,
    "approval_notes": "Verified condition, ready for rental"
  }
}
```

---

#### 5. **Reject Equipment** (Admin Only)

```
PUT /api/equipment/:id/reject
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (Optional):**

```json
{
  "rejection_reason": "Damaged condition, needs repair"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Equipment rejected successfully",
  "equipment": {
    "id": 9,
    "name": "Professional Drone",
    "status": "rejected",
    "approved_by": 1,
    "rejection_reason": "Damaged condition, needs repair"
  }
}
```

---

#### 6. **Get User's Equipment Uploads**

```
GET /api/equipment/user/uploads
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "equipment": [
    {
      "id": 9,
      "name": "Professional Drone",
      "status": "pending",
      "uploaded_by": 2,
      "approval_notes": null,
      "created_at": "2025-12-08T14:22:00Z"
    }
  ]
}
```

---

### Rental Management

#### 1. **Get All Rentals** (Admin Only)

```
GET /api/rentals
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 15,
  "rentals": [...]
}
```

**Note:** Normal users cannot access this. They use `/api/rentals/user/all` instead.

---

#### 2. **Get User's Own Rentals**

```
GET /api/rentals/user/all
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "rentals": [
    {
      "id": 1,
      "user_id": 2,
      "equipment_id": 1,
      "equipment_name": "Laptop Dell XPS",
      "checkout_date": "2025-12-08T10:00:00Z",
      "return_date": "2025-12-10T10:00:00Z",
      "status": "active",
      "quantity": 1,
      "total_cost": 100.0
    }
  ]
}
```

---

#### 3. **Get Active Rentals** (Admin Only)

```
GET /api/rentals/admin/active
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 8,
  "rentals": [...]
}
```

---

#### 4. **Get Overdue Rentals** (Admin Only)

```
GET /api/rentals/admin/overdue
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "rentals": [...]
}
```

---

### Dashboard Endpoints

#### 1. **Get Dashboard** (Auto-Role Detection)

```
GET /api/dashboard
Authorization: Bearer {token}
```

**Returns different data based on user role:**

**Admin Response:**

```json
{
  "success": true,
  "dashboardType": "admin",
  "summary": {
    "rentals": {
      "total": 50,
      "active": 12,
      "overdue": 2,
      "completed": 36
    },
    "equipment": {
      "total": 25,
      "approved": 23,
      "pending": 1,
      "rejected": 1
    },
    "inventory": {
      "totalQuantity": 150,
      "availableQuantity": 120,
      "checkedOutQuantity": 30,
      "utilizationRate": "20.00%"
    },
    "revenue": {
      "total": "5400.00",
      "fromActiveRentals": "800.00"
    }
  },
  "recentActivity": {
    "activeRentals": [...],
    "overdueRentals": [...],
    "pendingApprovals": [...]
  }
}
```

**Normal User Response:**

```json
{
  "success": true,
  "dashboardType": "user",
  "userId": 2,
  "summary": {
    "rentals": {
      "total": 5,
      "active": 2,
      "overdue": 0,
      "completed": 3
    },
    "uploads": {
      "total": 2,
      "approved": 1,
      "pending": 1,
      "rejected": 0
    },
    "spending": {
      "total": "250.00",
      "fromActiveRentals": "100.00"
    }
  },
  "recentActivity": {
    "activeRentals": [...],
    "overdueRentals": [],
    "recentUploads": [...]
  }
}
```

---

### Reports (Role-Based Filtering)

#### 1. **Get Report Data** (Role-Based)

```
GET /api/reports/data/:type
Authorization: Bearer {token}
```

**Types:** `daily`, `monthly`, `inventory`, `activity`, `overdue`

**Role-Based Behavior:**

- **Normal Users:**
  - `daily/monthly/activity`: Returns only their own data
  - `inventory`: Shows only approved equipment
  - `overdue`: Rejected (403)
- **Admins:**
  - All types return system-wide data

**Example (Normal User):**

```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/reports/data/monthly
```

**Response:**

```json
[
  {
    "id": 1,
    "customerName": "John Doe",
    "email": "john@example.com",
    "equipmentName": "Laptop Dell XPS",
    "category": "Electronics",
    "startDate": "2025-12-08T10:00:00Z",
    "endDate": "2025-12-10T10:00:00Z",
    "status": "active",
    "totalCost": 100.0
  }
]
```

---

## Authentication & Authorization Flow

### 1. **User Registration**

```
POST /api/auth/register
Content-Type: application/json
```

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Note:** All new users default to `role: 'user'`. Admins must be promoted by existing admins via database update.

---

### 2. **User Login**

```
POST /api/auth/login
Content-Type: application/json
```

**Request:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**JWT Token Payload:**

```json
{
  "id": 2,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "iat": 1702032000,
  "exp": 1702118400
}
```

---

## Middleware & Access Control

### 1. **verifyToken**

Validates JWT token and attaches user info to `req.user`.

**Usage:**

```javascript
router.get("/endpoint", verifyToken, controllerMethod);
```

---

### 2. **verifyAdmin**

Checks if `req.user.role === 'admin'`. Must be used after `verifyToken`.

**Usage:**

```javascript
router.get("/admin/endpoint", verifyToken, verifyAdmin, controllerMethod);
```

---

### 3. **verifyNormalUser**

Checks if `req.user.role === 'user'`. Must be used after `verifyToken`.

**Usage:**

```javascript
router.get("/user/endpoint", verifyToken, verifyNormalUser, controllerMethod);
```

---

### 4. **verifyRole**

Flexible role verification for multiple allowed roles.

**Usage:**

```javascript
router.get(
  "/endpoint",
  verifyToken,
  verifyRole("user", "admin"),
  controllerMethod
);
```

---

### 5. **verifyResourceOwner**

Ensures normal users can only access their own resources.

**Usage:**

```javascript
router.put(
  "/profile/:userId",
  verifyToken,
  verifyResourceOwner,
  controllerMethod
);
```

---

## Error Responses

### 401 Unauthorized (Missing Token)

```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden (Insufficient Permissions)

```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 400 Bad Request (Invalid Input)

```json
{
  "success": false,
  "message": "Name, category, quantity, and available are required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Equipment not found"
}
```

---

## Migration from Single-User System

If upgrading from a single-user system:

1. **Add role column to users:**

   ```sql
   ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
   ```

2. **Promote existing users to admin:**

   ```sql
   UPDATE users SET role = 'admin' WHERE id = 1;  -- Promote first user
   ```

3. **Update equipment schema:**

   ```sql
   ALTER TABLE equipment ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved';
   ALTER TABLE equipment ADD COLUMN uploaded_by INT;
   ALTER TABLE equipment ADD COLUMN approved_by INT;
   ```

4. **Mark existing equipment as approved by admin:**
   ```sql
   UPDATE equipment SET status = 'approved', uploaded_by = 1, approved_by = 1;
   ```

---

## Testing Role-Based Access

### Create Test Users

**Admin:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "email": "admin@rental.com",
    "password": "AdminPass123!"
  }'
# Then promote via database: UPDATE users SET role = 'admin' WHERE id = 1;
```

**Normal User:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "normal_user",
    "email": "user@rental.com",
    "password": "UserPass123!"
  }'
```

### Test Equipment Upload (Normal User)

```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Authorization: Bearer {normal_user_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Equipment",
    "category": "Electronics",
    "dailyRate": 50,
    "quantity": 5,
    "available": 5
  }'
# Response shows "status: pending"
```

### Test Equipment Approval (Admin)

```bash
curl -X PUT http://localhost:5000/api/equipment/9/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"approval_notes": "Verified and ready"}'
```

### Test Admin Dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer {admin_token}"
# Returns comprehensive system statistics
```

### Test User Dashboard

```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer {normal_user_token}"
# Returns personal statistics only
```

---

## Best Practices

1. **Token Management:**

   - Store JWT token securely in frontend (httpOnly cookie or secure storage)
   - Token expires in 24 hours (configurable via `JWT_EXPIRY`)
   - Re-login required after token expiry

2. **Role Assignment:**

   - New users always register as `'user'`
   - Admins must be manually promoted in database
   - Never trust client-side role claims

3. **Equipment Workflow:**

   - Normal users upload with `status: 'pending'`
   - Admins review and approve/reject
   - Only approved equipment visible to other users
   - Rejected equipment hidden but retained for audit trail

4. **Resource Access:**
   - Always verify `user_id` matches `req.user.id` for personal resources
   - Admins can bypass checks (enforced in middleware)
   - Audit all changes via logs

---

## Troubleshooting

| Issue                                        | Solution                                             |
| -------------------------------------------- | ---------------------------------------------------- |
| "Admin access required" on equipment approve | Ensure user role is 'admin' in database              |
| Normal user sees all equipment               | Check `Equipment.findAll()` is filtering by status   |
| Equipment approval endpoints 404             | Verify routes are registered in `equipmentRoutes.js` |
| Dashboard shows no data                      | Check user role detection in `getDashboard()`        |
| Token expired errors                         | Ask user to re-login to get fresh token              |

---

## Summary of Changes

| Component         | Changes                                                             |
| ----------------- | ------------------------------------------------------------------- |
| **Database**      | Added user roles, equipment status, approval tracking               |
| **Models**        | Enhanced Equipment with status queries, new dashboard queries       |
| **Middleware**    | Added verifyNormalUser, verifyRole, verifyResourceOwner             |
| **Controllers**   | Updated all to enforce role-based filtering                         |
| **Routes**        | Added dashboard, approval endpoints; separated user/admin endpoints |
| **Documentation** | This comprehensive guide                                            |
