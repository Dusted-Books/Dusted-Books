# 📚 Dusted Books — Technical Handoff & Architecture Guide

This document serves as a comprehensive technical handoff for the **Dusted Books** full-stack application. It details the system architecture, repository structure, environment configuration, local development setup, production deployment strategies, and important security/operational considerations.

---

## 🛠️ 1. System Architecture & Tech Stack

Dusted Books is a modern full-stack web application designed for book cataloging, library requests, and user book selling/trading.

### **Frontend Stack (`/client/dusted-books-app`)**
- **Framework**: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [@preline/collapse](https://preline.co/) for responsive UI components
- **Animations**: [GSAP](https://gsap.com/) for fluid UI micro-interactions
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) & Native Fetch API wrapper (`apiFetch`) with credential inclusion

### **Backend Stack (`/server`)**
- **Runtime & Framework**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via [Mongoose v9](https://mongoosejs.com/))
- **File & Media Storage**: [Cloudinary](https://cloudinary.com/) integrated with [Multer](https://github.com/expressjs/multer) & `multer-storage-cloudinary`
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) transmitted securely via **HTTP-Only Cookies** (`cookie-parser`) + [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) password hashing
- **Security & Hardening**:
  - **[Helmet](https://github.com/helmetjs/helmet)**: Secure HTTP headers
  - **[CORS](https://github.com/expressjs/cors)**: Strictly configured origin whitelist with credential support
  - **[express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)**: Brute-force throttling on authentication endpoints
  - **[express-mongo-sanitize](https://github.com/froman/express-mongo-sanitize)**: NoSQL injection defense (custom middleware stripping `$` and `.` operators from `req.body` and `req.params`)

---

## 📂 2. Repository Structure

```text
Dusted-Books/
├── client/
│   └── dusted-books-app/        # Vite + React SPA
│       ├── public/              # Static assets
│       ├── src/
│       │   ├── components/      # Reusable UI & Admin UI components
│       │   ├── context/         # React Context (AuthContext, ThemeContext)
│       │   ├── enums/           # TypeScript enums (Roles, Statuses)
│       │   ├── pages/           # Application views (Landing, Login, Customer/Admin Layouts)
│       │   ├── service/         # Centralized API client (apiClient.ts)
│       │   └── main.tsx         # Application entry point
│       ├── package.json         # Frontend dependencies & scripts
│       └── vite.config.ts       # Vite configuration
├── server/                      # Express REST API
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── controller/              # Business logic (users, books, requests)
│   ├── middleware/              # Auth verification, role guards, file uploaders
│   ├── model/                   # Mongoose schemas (User, Book, BookRequest, SellRequest)
│   ├── routes/                  # Express route definitions
│   ├── util/                    # Helper utilities (JWT generation)
│   ├── package.json             # Backend dependencies & scripts
│   └── server.js                # Server entry point & global middleware
└── handoff.md                   # This documentation
```

---

## 🔐 3. Environment Variables Reference

Before running or deploying the application, ensure the following environment variables are configured in their respective directories. **Never commit `.env` files to version control.**

### **Backend Configuration (`server/.env`)**
| Variable Name | Required | Description / Example |
| :--- | :---: | :--- |
| `PORT` | Optional | API server port (default: `5000`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | 64+ character cryptographically random secret for token signing |
| `JWT_EXPIRES_IN`| Optional | Token expiration duration (default: `1d`) |
| `client_url` | Yes | Allowed frontend origin for CORS (e.g., `http://localhost:5173` or `https://yourdomain.com`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for media storage |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

### **Frontend Configuration (`client/dusted-books-app/.env`)**
| Variable Name | Required | Description / Example |
| :--- | :---: | :--- |
| `VITE_API_URL` | Optional | Base URL for the backend API (default fallback: `http://localhost:5000/api`) |

---

## 💻 4. Local Development Setup

### **Prerequisites**
- Node.js v18+ installed
- MongoDB locally installed or a MongoDB Atlas cluster URI
- Cloudinary account credentials

### **Step 1: Start the Backend Server**
```bash
cd server
npm install
# Ensure server/.env is created and populated
npm run dev   # Runs with nodemon on port 5000
```

### **Step 2: Start the Frontend Client**
Open a new terminal window:
```bash
cd client/dusted-books-app
npm install
# Ensure client/dusted-books-app/.env is created and populated
npm run dev   # Runs Vite dev server on http://localhost:5173
```

---

## 🚀 5. Production Deployment & Free Hosting Strategy

The application can be hosted **100% free** using modern cloud platforms. There are two primary deployment models:

### **Strategy A: Unified Single-Service Deployment on Render (Recommended ⭐)**
In this model, the Node/Express backend builds and serves the compiled static React frontend in production. This runs as a single service on [Render.com](https://render.com/), eliminating domain mismatch and CORS issues.

#### **1. Code Modification Needed for Unified Hosting**
In `server/server.js`, right before the error handlers or after API route declarations, add:
```javascript
const path = require("path");

if (process.env.NODE_ENV === "production") {
    // Serve static files from React build
    app.use(express.static(path.join(__dirname, "../client/dusted-books-app/dist")));

    // Handle React Router SPA routing
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client/dusted-books-app/dist", "index.html"));
    });
}
```

#### **2. Render Web Service Configuration**
- **Root Directory**: Leave blank (repo root `.`)
- **Build Command**:
  ```bash
  cd client/dusted-books-app && npm install && npm run build && cd ../../server && npm install
  ```
- **Start Command**:
  ```bash
  node server/server.js
  ```
- **Environment Variables**: Set `NODE_ENV=production`, `client_url=https://yourdomain.com`, plus your MongoDB and Cloudinary credentials.

---

### **Strategy B: Separated Deployment (Vercel/Cloudflare + Render)**
If deploying frontend and backend independently:
- **Frontend**: Deploy `client/dusted-books-app` to **Vercel** or **Cloudflare Pages** (Vite preset). Set `VITE_API_URL=https://api.yourdomain.com/api`.
- **Backend**: Deploy `server` to **Render** as a Web Service. Set `client_url=https://yourdomain.com`.

---

## ⚠️ 6. Critical Technical Notes & Gotchas

### **1. Authentication Cookies & `SameSite` Policy**
In `server/util/jwtGenerate.js` and `server/controller/userController.js`, authentication cookies are configured as:
```javascript
res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // 👈 Critical setting
    maxAge: 24 * 60 * 60 * 1000
});
```
- **Why this matters**: Because `sameSite` is `"strict"`, modern browsers will reject and discard the cookie if the API request originates from a different root domain than the API server.
- **Production Solution**:
  - If using **Strategy A (Unified)**, frontend and backend share the exact same domain, so `"strict"` works flawlessly.
  - If using **Strategy B (Separated)**, you **must** configure a subdomain for your backend (e.g., `api.yourdomain.com` and `yourdomain.com`). Because they share the same eTLD+1 root domain, browsers treat them as same-site.
  - *If you host on completely different domains (e.g., `.vercel.app` + `.onrender.com`), you must change `sameSite: "strict"` to `sameSite: "none"` and ensure `secure: true`.*

### **2. Hardcoded `localhost` Fallbacks**
Some older frontend components may contain fallback strings to `http://localhost:5000/api`. Always ensure `apiFetch` from `src/service/apiClient.ts` is used for network requests so that `import.meta.env.VITE_API_URL` is respected across all environments.

### **3. Express 5 Compatibility & Sanitization**
The project uses Express 5. Because Express 5 makes `req.query` a read-only getter, default `express-mongo-sanitize` middleware cannot reassign it directly. The project includes custom middleware in `server/server.js` (lines 33–37) that explicitly sanitizes `req.body` and `req.params` without crashing Express 5.

---

## 📞 7. Handoff Checklist
- [ ] Ensure MongoDB Atlas IP Whitelist allows Render IPs (or `0.0.0.0/0` for cloud hosting).
- [ ] Verify DNS records (A/CNAME) are properly pointing from your domain registrar to your hosting provider.
- [ ] Confirm Cloudinary storage folder permissions and API limits.
- [ ] Test login/logout flows in staging/production to verify HTTP-Only cookie persistence across HTTPS.
