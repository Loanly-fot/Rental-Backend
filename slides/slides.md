---
title: Equipment Rental Management - Final Presentation
author: Project Team
---

# Equipment Rental Management

## Overview

- Purpose: Manage equipment checkout, returns, and reporting
- Tech stack: Node.js, Express, MySQL, Swagger

---

## System Architecture

- Frontend (SPA)
- Backend (Express REST API)
- MySQL (schema + views + stored procedures)

(See `docs/architecture.md` for diagram)

---

## Data Model (ERD)

- `users`, `equipment`, `rentals`, `logs`

(See `docs/erd.md`)

---

## Key Features

- User registration & JWT authentication
- Equipment CRUD (admin)
- Checkout & return workflows (transactional)
- Reporting (active, overdue, utilization)
- PDF and CSV exports

---

## API Highlights

- `/api/auth` - register/login
- `/api/equipment` - list/create/update/delete
- `/api/rentals` - checkout/return
- `/api/reports` - active/overdue/utilization

(Interactive docs: `/api-docs`)

---

## Demo Flow

1. Login as admin
2. Create equipment
3. Checkout equipment to a user
4. View active/overdue rentals
5. Return equipment and confirm availability

---

## Deployment & Scaling

- Run behind Nginx with TLS
- Environment variables for secrets & DB
- Use managed MySQL or RDS for production
- Horizontal scale backend (stateless)

---

## Next Steps

- Add refresh tokens & role-based ACL
- Add CI/CD pipeline with automated tests
- Add comprehensive integration tests

---

## Thank You

Questions?

Notes to presenter: open `http://localhost:5000/api-docs` and the database to demonstrate schema.
