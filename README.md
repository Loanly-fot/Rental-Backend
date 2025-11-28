# Rental Backend (Equipment Rental Management API)

This repository contains the backend for an Equipment Rental Management system built with Node.js, Express and MySQL. The backend exposes REST endpoints and Swagger UI documentation.

**This README includes:**

- Installation and run instructions (backend and suggested frontend setup)
- Environment variables
- Database setup
- How to run and verify the server
- Quick troubleshooting tips

---

**Requirements**

- Node.js (LTS recommended: v18 or v20)
- npm (bundled with Node)
- MySQL 5.7+ or MariaDB
- Optional (for frontend): Node and a frontend framework such as React

---

**1) Clone repository**

```powershell
cd C:\path\to\projects
git clone <your-repo-url> Rental-Backend
cd C:\Rental\Rental-Backend
```

**2) Install backend dependencies**

```powershell
npm install
```

**3) Environment variables**
Create a `.env` file at the project root (`C:\Rental\Rental-Backend\.env`) with the following example values and update to match your environment:

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=rental_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
```

- `JWT_SECRET`: secret for signing JWT tokens
- `DB_*`: MySQL connection parameters
- `CORS_ORIGIN`: frontend address

**4) Create the database schema**
Start your MySQL server, then import the schema located at `src/config/schema.sql`:

```powershell
# from project root
mysql -u root -p < .\src\config\schema.sql
```

Enter your MySQL password when prompted. Alternatively, open `src/config/schema.sql` in a GUI (MySQL Workbench, phpMyAdmin) and run the script.

**5) Start the server**

Development (auto-reload):

```powershell
npm run dev
```

Production:

```powershell
npm start
```

Server logs will show the server URL, environment and available endpoints.

**6) Verify the server**

- Health check: `http://localhost:5000/health`
- Swagger UI (API docs): `http://localhost:5000/api-docs`
- Root: `http://localhost:5000/`

**7) Suggested frontend (quick start)**
If you plan to build a React frontend that communicates with this backend:

```powershell
# create a React app (example)
npx create-react-app rental-frontend
cd rental-frontend
npm start
```

Ensure the frontend uses the same `CORS_ORIGIN` defined in the backend `.env` or update backend env accordingly.

**8) Authentication**

- Endpoints use JWT-based authentication.
- Register / login through `/api/auth` to obtain JWT tokens, then send `Authorization: Bearer <token>` in requests requiring auth.

**9) Useful commands**

```powershell
# install deps
npm install

# run dev server
npm run dev

# run production
npm start

# run tests (if any added later)
npm test
```

**10) Troubleshooting**

- DB connection errors: confirm `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and that MySQL is running and accepting TCP connections.
- Port already in use: change `PORT` in `.env`.
- `nodemon` not found: `npm install` will install it from `devDependencies`. You can also install globally: `npm i -g nodemon`.

---

**Further documentation**
See the `docs/` folder for system architecture, ERD, and API documentation.
See `slides/` for a presentation-ready slide deck in Markdown (Reveal.js friendly).

If you want, I can:

- Create the `.env` file for you with placeholder values
- Run `npm install` and start the server here (requires permission to run shell commands)
