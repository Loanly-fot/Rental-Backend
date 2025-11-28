# API Documentation

Base URL: `http://localhost:5000` (default)

Authentication: JWT (Bearer token). Acquire token via `/api/auth/login`.

--

## Auth

### POST /api/auth/register

- Description: Register a new user (may be restricted in some deployments).
- Body (JSON):
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
- Response 201 (example):

```json
{ "success": true, "message": "User registered" }
```

### POST /api/auth/login

- Description: Login and receive JWT
- Body (JSON):
  - `email` (string, required)
  - `password` (string, required)
- Response 200 (example):

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 1, "email": "admin@rental.com", "name": "Admin User" }
}
```

## Equipment

### GET /api/equipment

- Description: List equipment (supports query params e.g. `category`, `available=true`, pagination)
- Auth: public
- Response 200: array of equipment objects

### GET /api/equipment/:id

- Description: Get equipment details
- Auth: public
- Response 200: equipment object

### POST /api/equipment

- Description: Create new equipment (admin)
- Auth: Bearer token (admin)
- Body (JSON): `name`, `category`, `qty_total`, `qty_available`
- Response 201: created equipment

### PUT /api/equipment/:id

- Description: Update equipment (admin)
- Auth: Bearer token (admin)
- Body: fields to update
- Response 200: updated equipment

### DELETE /api/equipment/:id

- Description: Delete equipment (admin)
- Auth: Bearer token (admin)
- Response 200: success message

## Rentals

### GET /api/rentals

- Description: List rentals (supports filters: `user_id`, `status`, `overdue`)
- Auth: Bearer token (admin or user with visibility)
- Response 200: array of rentals

### GET /api/rentals/:id

- Description: Get rental by id
- Auth: Bearer token

### POST /api/rentals/checkout

- Description: Checkout equipment (create rental)
- Auth: Bearer token
- Body: `user_id`, `equipment_id`, `return_date` (datetime)
- Response 201: rental created

### POST /api/rentals/:id/return

- Description: Return rented equipment (mark rental returned)
- Auth: Bearer token
- Response 200: success

## Reports

### GET /api/reports/active

- Description: Active rentals view
- Auth: Bearer token (admin)

### GET /api/reports/overdue

- Description: Overdue rentals
- Auth: Bearer token (admin)

### GET /api/reports/equipment-utilization

- Description: Equipment utilization summary
- Auth: Bearer token (admin)

--

## Errors

- Standard format used across the API (example):

```json
{ "success": false, "message": "Error message", "errors": [ ... ] }
```

--

## Examples (PowerShell / curl)

```powershell
# Login
curl -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@rental.com","password":"admin123"}'

# Use token for protected route
curl -H "Authorization: Bearer <token>" "http://localhost:5000/api/equipment"
```

--

Notes:

- The project includes Swagger UI at `/api-docs` which is generated from `src/swagger.json` and provides a machine-readable OpenAPI experience. Use that UI for interactive exploration and example payloads.
- If you want, I can generate a full OpenAPI YAML/JSON from the existing routes and controllers for import into Postman or other API tools.
