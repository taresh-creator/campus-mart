# Campus Mart

Campus Mart is a student marketplace web application where university students can buy and sell educational items (textbooks, electronics, calculators, lab equipment, and more).

This project features:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons, Vite.
- **Backend**: Java 21, Spring Boot 3, Spring Data JPA, Spring Security (JWT), Maven.
- **Database**: Supabase PostgreSQL.

---

## 1. Prerequisites

- **Java 21** or later (`java -version`)
- **Node.js 18+** and **npm** (`node -v`, `npm -v`)
- A **Supabase** account and project (free at [supabase.com](https://supabase.com))

---

## 2. Supabase Database Configuration

### Step A: Run Schema Migration
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Click **New query**, paste the contents of [`../backend/src/main/resources/schema.sql`](file:///c:/Users/User/Desktop/campus-mart-main/backend/src/main/resources/schema.sql), and click **Run**.
3. This creates or updates the `profiles` and `listings` tables with necessary indexes and constraints.

### Step B: Obtain Database Connection Credentials
1. Go to your **Supabase Project Settings** -> **Database**.
2. Scroll to **Connection string**:
   - Select **URI** or **JDBC**.
   - Note the Host (`db.<project-ref>.supabase.co`), Port (`5432`), Database (`postgres`), and User (`postgres`).
   - Your JDBC URL format:
     ```
     jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
     ```
   - (Or if using connection pooler on port 6543: `jdbc:postgresql://aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require`)
   - Ensure you know your database password set during Supabase project creation.

---

## 3. Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your database credentials in `.env` or as environment variables:

```env
# Spring Boot Backend
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_database_password
JWT_SECRET=campusmartsupersecretjwtkeycampusmartsupersecretjwtkey2026
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
UPLOAD_DIR=uploads

# React Frontend
VITE_API_URL=http://localhost:8080/api
```

---

## 4. Running the Backend (Spring Boot)

Open a terminal in the `backend` directory:

```bash
cd ../backend
```

### On Windows:
```cmd
mvnw.cmd spring-boot:run
```

### On macOS / Linux:
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

*(If you have Maven installed globally, you can also run `mvn spring-boot:run`)*

The backend will start at: `http://localhost:8080`

---

## 5. Running the Frontend (React + TypeScript)

In this directory:

```bash
npm install
npm run dev
```

The frontend will start at: `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## 6. REST API Reference

All backend endpoints are prefixed with `/api`.

### Authentication
- `POST /api/auth/signup`: Register student account (`{ fullName, email, password }`) -> returns JWT token + user profile.
- `POST /api/auth/login`: Authenticate student (`{ email, password }`) -> returns JWT token + user profile.
- `GET /api/auth/me`: Get current authenticated user profile (`Authorization: Bearer <token>`).

### Profiles
- `GET /api/profiles/me`: Get own student profile.
- `PUT /api/profiles/me`: Update own profile (`{ fullName }`).
- `GET /api/profiles/{id}`: Get student profile by ID.

### Marketplace Listings
- `GET /api/listings`: Browse all active listings (supports query params `?search=term&category=Books`).
- `GET /api/listings/{id}`: View individual item details including seller info.
- `GET /api/listings/my-listings`: Fetch all listings belonging to logged-in user.
- `POST /api/listings`: Create new listing (`Authorization: Bearer <token>`).
- `PUT /api/listings/{id}`: Update listing (owner only).
- `DELETE /api/listings/{id}`: Delete listing (owner only).
- `PATCH /api/listings/{id}/status`: Mark item as sold or active (`{ status: "sold" | "active" }`).

### Image Upload
- `POST /api/upload`: Multipart file upload (`file`) -> returns `{ url: "http://localhost:8080/api/uploads/...", path: "..." }`.
- `GET /api/uploads/{filename}`: Static resource serving of uploaded listing images.
