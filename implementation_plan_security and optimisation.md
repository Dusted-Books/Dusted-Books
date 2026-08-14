# Optimization, Security & Landing Page for Dusted Books

Improve security posture across the full stack, optimize performance on both client and server, and add a public landing page for unauthenticated visitors.

---

## Proposed Changes

### 1. Server Security Hardening

#### [MODIFY] [server.js](file:///d:/Dustedbooks/Dusted-Books/server/server.js)
- Add **Helmet** middleware for secure HTTP headers (XSS protection, content-type sniffing prevention, HSTS, etc.)
- Add **express-rate-limit** to throttle brute-force attacks on login/signup endpoints
- Add **express-mongo-sanitize** to prevent NoSQL injection via `$gt`, `$ne` operators in request bodies
- Add a global async error handler so unhandled rejections don't leak stack traces
- Move route mounting **before** `app.listen()` (currently routes are mounted after listen — a subtle bug)

#### [MODIFY] [protect.js](file:///d:/Dustedbooks/Dusted-Books/server/middleware/protect.js)
- Wrap `jwt.verify` to check for token expiry explicitly and return a clear "Token expired" message
- Add check: if `JWT_SECRET` is missing, fail loudly at startup rather than silently signing with `undefined`

#### [MODIFY] [upload.js](file:///d:/Dustedbooks/Dusted-Books/server/middleware/upload.js)
- Add **file type filter** (only allow `image/jpeg`, `image/png`, `image/webp`) — currently any file type up to 3 MB is accepted

#### [MODIFY] [userController.js](file:///d:/Dustedbooks/Dusted-Books/server/controller/userController.js)
- Add **input validation**: email format check, password minimum length (8 chars), name length bounds
- Add a **logout endpoint** that clears the `token` cookie properly (currently client-side `logout()` only nulls state — the cookie persists)
- Sanitize/trim inputs before DB operations

#### [NEW] [authRoute.js](file:///d:/Dustedbooks/Dusted-Books/server/routes/authRoute.js)
- Add `POST /api/users/logout` route to clear the JWT cookie server-side

---

### 2. Client Security Improvements

#### [MODIFY] [Auth.ts](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/service/Auth.ts)
- Use `VITE_API_URL` env variable instead of hardcoded `http://localhost:5000/api`
- Add proper error handling: check `response.ok` before returning JSON

#### [MODIFY] [authContext.tsx](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/context/authContext.tsx)
- Update `logout()` to call the server-side logout endpoint (clear cookie) before nulling state
- Add error handling for `refreshUser` so network failures don't leave stale state

#### [NEW] [apiClient.ts](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/service/apiClient.ts)
- Centralized API base URL + `fetch` wrapper that always includes `credentials: "include"` and handles errors consistently
- Eliminates the repeated `import.meta.env.VITE_API_URL || "http://localhost:5000/api"` pattern scattered across ~6 files

---

### 3. Optimization

#### Server
- **[MODIFY] [bookController.js](file:///d:/Dustedbooks/Dusted-Books/server/controller/bookController.js)**: Add `.lean()` to Mongoose queries that don't modify documents (returns plain JS objects, ~3x faster)
- **[MODIFY] [bookRequestController.js](file:///d:/Dustedbooks/Dusted-Books/server/controller/bookRequestController.js)**: Add `.lean()` to read-only queries
- **[MODIFY] [sellRequestController.js](file:///d:/Dustedbooks/Dusted-Books/server/controller/sellRequestController.js)**: Add `.lean()` to read-only queries
- **[MODIFY] [book.js](file:///d:/Dustedbooks/Dusted-Books/server/model/book.js)**: Add `timestamps: true` for consistency and add index on common query fields
- **[MODIFY] [bookRequest.js](file:///d:/Dustedbooks/Dusted-Books/server/model/bookRequest.js)**: Add index on `userId` for faster customer lookups
- **[MODIFY] [sellRequest.js](file:///d:/Dustedbooks/Dusted-Books/server/model/sellRequest.js)**: Add index on `userId`

#### Client
- **[MODIFY] [App.tsx](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/App.tsx)**: Add `React.lazy()` + `Suspense` for code splitting. Heavy pages (Browse, SellBook, Admin) will load on demand instead of all at once
- **[MODIFY] [Browse.tsx](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/pages/Browse.tsx)**: Replace `axios` with the centralized `apiClient` fetch wrapper (removes an extra dependency for this file)

---

### 4. Landing Page for Unauthenticated Users

#### [NEW] [Landing.tsx](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/pages/Landing.tsx)
A stunning public landing page shown at `/` when the user is **not logged in**. Design:
- **Hero section**: Large gradient banner with the DustedBooks brand, tagline ("Give books a second life"), and CTA buttons (Browse Collection / Sign Up)
- **Featured books carousel**: Fetch a few books from the public `/api/books` endpoint and display them
- **How it works**: 3-step visual workflow (Browse → Buy/Request → Sell)
- **Call-to-action footer strip**: "Join Dusted Books today" with login/signup links
- Matches the existing amber/warm design system, with dark mode support
- Smooth scroll animations using GSAP (already a dependency)

#### [MODIFY] [App.tsx](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/App.tsx)
- Change `/` route: if user is logged in → show `Home`, if not → show `Landing`
- This avoids the current behavior where unauthenticated users are immediately redirected to `/login`

#### [MODIFY] [protected.tsx](file:///d:/Dustedbooks/Dusted-Books/client/dusted-books-app/src/routes/protected.tsx)
- Redirect unauthenticated users to `/` (landing) instead of `/login`, since landing itself has login links

---

## Open Questions

> [!IMPORTANT]
> **npm install required**: The security middleware packages (`helmet`, `express-rate-limit`, `express-mongo-sanitize`) need to be installed via `npm install`. Should I proceed with installing these?

> [!NOTE]
> The `/api/books` and `/api/books/:id` routes are currently **public** (no `protect` middleware). This is actually good for the landing page since it can fetch featured books without auth. I'll keep them public intentionally.

---

## Verification Plan

### Build Check
- Run `npm run build` in the client to verify TypeScript compiles with all changes

### Manual Verification
- Verify landing page renders at `/` when not logged in
- Verify logged-in users still see the Home page at `/`
- Verify logout properly clears the cookie (check browser DevTools)
- Verify file upload rejects non-image files
- Verify rate limiting kicks in after excessive login attempts
