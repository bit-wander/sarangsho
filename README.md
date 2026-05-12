# Sarangsho (সারাংশ) - Book Review & Summary Platform

**Sarangsho** is a web application for book enthusiasts to discover books, manage summaries, and submit reviews/ratings. Built using FastAPI, SQLModel, React, and Tailwind CSS.

---

## Key Features

### User Authentication & Authorization
- **Secure Registration & Login**: Users can register with a unique username and email. Authentication returns secure JWT bearer tokens.
- **Role-Based Access Control (RBAC)**: Support for distinct user roles (`user` and `admin`).
- **Protected Routes**: Access to sensitive UI views and admin API actions is protected by token validation interceptors and dependency injectors.

### Book Management
- **Full CRUD Capabilities**: Securely create, view, update, and delete book entries (Admin role restricted for writing/modifying).
- **Advanced Search & Filtering**: Search across book titles, authors, and descriptions simultaneously. Filter results by specific genres.
- **Dynamic Sorting**: Custom query support to sort books dynamically by their aggregated average rating or creation date.
- **Cover Image Uploads**: Upload files for book covers. Automatically verifies valid image extensions (`jpg`, `jpeg`, `png`, `webp`), enforces strict file size constraints (max 5MB), assigns unique UUID filenames, and cleans up older cover files upon replacement.

### Reviews & Dynamic Ratings
- **User Reviews**: Authenticated users can write review text and submit 1-5 star ratings for individual books.
- **Integrity Validation**: The system prevents duplicate reviews by ensuring a single user can leave only one review per book.
- **Dynamic Aggregation**: Automatically computes average book ratings dynamically via SQL outer joins and aggregate grouping (`func.avg`) to guarantee real-time data correctness.
- **Moderation**: Users can delete their own reviews, while Admins retain complete system-wide moderation privileges to manage any review.

---

## Tech Stack

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework for building APIs.
- **ORM & Database**: [SQLModel](https://sqlmodel.tiangolo.com/) - Leverages Pydantic and SQLAlchemy for elegant and type-safe database interactions.
- **Database Engine**: Configured for **PostgreSQL** (via connection string setting).
- **Authentication**: OAuth2 with Bearer token standard using **JSON Web Tokens (JWT)** via `PyJWT`.
- **Security**: Robust password hashing implemented using `pwdlib`.
- **Configuration**: Managed environment-based settings via `pydantic-settings`.
- **File Management**: Built-in validation and local file serving for uploaded book covers using FastAPI's `StaticFiles`.

### **Frontend**
- **Framework**: [React 19](https://react.dev/) powered by **TypeScript**.
- **Build Tool**: [Vite](https://vitejs.dev/) - Lightning-fast hot module replacement (HMR) and optimized builds.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework for custom responsive design.
- **Routing**: [React Router v7](https://reactrouter.com/) - Modern client-side routing.
- **HTTP Client**: **Axios** - Configured for API communication with bearer token integration.
- **State Management**: React Context API (`AuthContext`) for clean and unified authentication state sharing across views.

---


## Project Structure

```text
sarangsho/
├── backend/
│   └── app/
│       ├── core/          # Core settings (pydantic-settings) & auth dependencies
│       ├── db/            # Database engine initialization and session builders
│       ├── models/        # SQLModel schema definitions (User, Book, Review)
│       ├── routers/       # Modular API endpoints (Auth, Books, Reviews)
│       ├── schemas/       # Pydantic models for request validation/response serialization
│       └── utils/         # Helpers for security hashing, JWT encode/decode, file uploads
├── frontend/
│   ├── public/            # Static files and assets
│   └── src/
│       ├── api/           # API integration functions and configured Axios clients
│       ├── components/    # Reusable UI building blocks (e.g., ProtectedRoute)
│       ├── context/       # React context logic for global state (AuthContext)
│       ├── pages/         # Core application interfaces (Home, Login, Register)
│       └── services/      # Abstraction wrappers for external operations
└── uploads/               # Persistent directory for local file storage (covers)
```

---

## Local Development Guide

### **Prerequisites**
- **Python**: `v3.10+`
- **Node.js**: `v20+`
- **PostgreSQL**: Running instance matching the `DATABASE_URL` credentials.

---

### **1. Backend Setup**

1. **Navigate to the project root** and create a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

2. **Install required dependencies**:
   Ensure you install the core python libraries required by the app:
   ```bash
   pip install fastapi sqlmodel pydantic-settings uvicorn pwdlib pyjwt psycopg2-binary python-multipart
   ```

3. **Configure Database Settings**:
   Update the default PostgreSQL connection URI inside `backend/app/core/config.py` or set your local environment variable `DATABASE_URL` accordingly.

4. **Start the FastAPI Development Server**:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
   - The core API endpoints will be served at: `http://localhost:8000`
   - Access the interactive **Swagger API Documentation** at: `http://localhost:8000/docs`

---

### **2. Frontend Setup**

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Vite Development Server**:
   ```bash
   npm run dev
   ```
   - The web application UI will load locally at: `http://localhost:5173`

---

## API Endpoints Overview

### **Authentication**
- `POST /auth/register` - Register a new user account.
- `POST /auth/login` - Authenticate with email and password to receive a JWT access token.

### **Books**
- `GET /books/` - List books with pagination (`skip`, `limit`), `search` queries, `genre` filtering, and rating sorting.
- `GET /books/{book_id}` - Retrieve detailed info for a single book.
- `POST /books/` - Create a new book entry *(Admin only)*.
- `PUT /books/{book_id}` - Update book metadata *(Admin only)*.
- `DELETE /books/{book_id}` - Remove a book entry *(Admin only)*.
- `POST /books/{book_id}/upload-cover` - Upload a cover image file for a specified book *(Admin only)*.
- `GET /books/{book_id}/rating` - Fetch the pre-calculated dynamic average rating for a specific book.

### **Reviews**
- `POST /reviews/` - Submit a new review and rating for a book *(Authenticated Users)*.
- `GET /reviews/book/{book_id}` - Retrieve all published reviews associated with a book.
- `DELETE /reviews/{review_id}` - Delete a specific review *(Review Owner or Admin)*.

