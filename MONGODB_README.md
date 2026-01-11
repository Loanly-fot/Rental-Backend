# Rental Equipment Checkout System - MongoDB Backend

A complete Node.js + Express + MongoDB backend API with JWT authentication and role-based access control for managing rental equipment.

## Tech Stack

- **Node.js** + **Express** - Backend framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** (jsonwebtoken) - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **csv-writer** - CSV report generation

## Features

✅ JWT-based authentication with role-based access control  
✅ Three user roles: Admin, User (Customer), Delivery  
✅ Complete CRUD operations for equipment, rentals, and deliveries  
✅ Equipment approval workflow  
✅ Rental management with status tracking  
✅ Delivery assignment and tracking  
✅ CSV report generation  
✅ Activity logging  
✅ Dashboard statistics for all roles

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Edit `.env` file (already created):

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rental_system
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB:**

   ```bash
   # Make sure MongoDB is running
   mongod
   ```

4. **Start the server:**

   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

5. **Server will run on:** `http://localhost:5000`

## API Endpoints

### Authentication (Public)

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/register` | Register new user            |
| POST   | `/api/auth/login`    | Login user                   |
| GET    | `/api/auth/me`       | Get current user (Protected) |
| GET    | `/api/auth/users`    | Get all users (Admin only)   |

### Equipment

| Method | Endpoint                     | Description                                    | Access     |
| ------ | ---------------------------- | ---------------------------------------------- | ---------- |
| GET    | `/api/equipment`             | Get all equipment (filter by status, category) | Public     |
| GET    | `/api/equipment/:id`         | Get equipment by ID                            | Public     |
| POST   | `/api/equipment`             | Create equipment                               | Admin/User |
| PUT    | `/api/equipment/:id`         | Update equipment                               | Admin      |
| DELETE | `/api/equipment/:id`         | Delete equipment                               | Admin      |
| POST   | `/api/equipment/:id/approve` | Approve equipment                              | Admin      |

### Rentals

| Method | Endpoint                    | Description                  | Access     |
| ------ | --------------------------- | ---------------------------- | ---------- |
| GET    | `/api/rentals`              | Get all rentals (with limit) | Admin      |
| GET    | `/api/rentals/me`           | Get current user's rentals   | User       |
| POST   | `/api/rentals/:equipmentId` | Create rental                | User       |
| PUT    | `/api/rentals/:id/status`   | Update rental status         | Admin      |
| POST   | `/api/rentals/:id/cancel`   | Cancel rental                | User/Admin |

### Deliveries

| Method | Endpoint                        | Description             | Access   |
| ------ | ------------------------------- | ----------------------- | -------- |
| GET    | `/api/deliveries/assigned`      | Get assigned deliveries | Delivery |
| POST   | `/api/deliveries/:id/delivered` | Mark as delivered       | Delivery |
| POST   | `/api/deliveries/:id/returned`  | Mark as returned        | Delivery |
| POST   | `/api/deliveries`               | Create delivery         | Admin    |
| GET    | `/api/deliveries`               | Get all deliveries      | Admin    |

### Reports

| Method | Endpoint                                     | Description             | Access |
| ------ | -------------------------------------------- | ----------------------- | ------ |
| GET    | `/api/reports/admin?type=daily\|monthly`     | Get admin report (JSON) | Admin  |
| GET    | `/api/reports/user?type=daily\|monthly`      | Get user report (JSON)  | User   |
| GET    | `/api/reports/admin/csv?type=daily\|monthly` | Download admin CSV      | Admin  |
| GET    | `/api/reports/user/csv?type=daily\|monthly`  | Download user CSV       | User   |
| GET    | `/api/reports/logs`                          | Get activity logs       | Admin  |

### Dashboards

| Method | Endpoint                  | Description            | Access   |
| ------ | ------------------------- | ---------------------- | -------- |
| GET    | `/api/dashboard/admin`    | Get admin dashboard    | Admin    |
| GET    | `/api/dashboard/user`     | Get user dashboard     | User     |
| GET    | `/api/dashboard/delivery` | Get delivery dashboard | Delivery |

## Database Models

### User

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['admin', 'user', 'delivery'], default: 'user'),
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Equipment

```javascript
{
  name: String (required),
  category: String (required),
  description: String,
  quantity: Number (required, min: 0),
  dailyRate: Number,
  status: String (enum: ['available', 'maintenance', 'retired']),
  createdBy: ObjectId (ref: User),
  approved: Boolean (default: false),
  approvedBy: ObjectId (ref: User),
  approvalNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Rental

```javascript
{
  equipmentId: ObjectId (ref: Equipment, required),
  userId: ObjectId (ref: User, required),
  status: String (enum: ['pending', 'approved', 'active', 'completed', 'cancelled']),
  startDate: Date (required),
  endDate: Date (required),
  notes: String,
  quantity: Number (default: 1),
  totalCost: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Delivery

```javascript
{
  rentalId: ObjectId (ref: Rental, required),
  deliveryPersonId: ObjectId (ref: User),
  status: String (enum: ['assigned', 'delivered', 'returned']),
  address: String (required),
  deliveryNotes: String,
  deliveredAt: Date,
  returnedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing with Postman/Thunder Client

### 1. Register a User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### 2. Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Save the `token` from response

### 3. Create Equipment (Protected)

```http
POST http://localhost:5000/api/equipment
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Laptop Dell XPS 15",
  "category": "Electronics",
  "quantity": 5,
  "dailyRate": 50,
  "status": "available",
  "description": "High-performance laptop"
}
```

### 4. Create Rental

```http
POST http://localhost:5000/api/rentals/EQUIPMENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "notes": "Need for project work",
  "quantity": 1
}
```

### 5. Get User's Rentals

```http
GET http://localhost:5000/api/rentals/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## Project Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   └── schema.sql         # (Legacy SQL schema - can be removed)
├── controllers/
│   ├── authController.js
│   ├── equipmentController.js
│   ├── rentalController.js
│   ├── deliveryController.js
│   ├── reportController.js
│   └── dashboardController.js
├── middleware/
│   ├── authMiddleware.js  # JWT verification & role checks
│   └── loggerMiddleware.js
├── models/
│   ├── User.js            # Mongoose schema
│   ├── Equipment.js       # Mongoose schema
│   ├── Rental.js          # Mongoose schema
│   ├── Delivery.js        # Mongoose schema
│   └── Log.js             # Mongoose schema
├── routes/
│   ├── authRoutes.js
│   ├── equipmentRoutes.js
│   ├── rentalRoutes.js
│   ├── deliveryRoutes.js
│   ├── reportRoutes.js
│   └── dashboardRoutes.js
├── utils/
│   ├── generateToken.js   # JWT token generation
│   └── csvGenerator.js    # CSV file generation
├── app.js                 # Express app configuration
└── server.js             # Server entry point
```

## Key Features Implemented

### 1. Role-Based Access Control

- **Admin**: Full access to all resources
- **User**: Create rentals, view own rentals, create equipment (requires approval)
- **Delivery**: Manage assigned deliveries

### 2. Equipment Approval Workflow

- Users can create equipment (marked as not approved)
- Admins can approve equipment
- Only approved equipment is available for rent

### 3. Rental Management

- Create rentals with date validation
- Automatic cost calculation based on daily rate
- Status tracking (pending → approved → active → completed)
- Users can cancel their own rentals

### 4. Delivery Tracking

- Auto-assign deliveries to delivery personnel
- Track delivery status (assigned → delivered → returned)
- Update rental status based on delivery status

### 5. Reports & CSV Generation

- Daily and monthly rental reports
- Admin and user-specific reports
- CSV export functionality
- Activity logging

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication
- ✅ Token expiration (7 days default)
- ✅ Role-based authorization middleware
- ✅ Input validation
- ✅ CORS protection
- ✅ Mongoose schema validation

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Success Responses

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Notes

- Password must be at least 6 characters
- All dates should be in ISO format
- Token must be included in Authorization header as: `Bearer YOUR_TOKEN`
- Equipment created by users requires admin approval before it's available
- Rentals automatically calculate total cost based on daily rate and duration

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## License

ISC
