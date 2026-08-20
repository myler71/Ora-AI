# Authentication Cycle

This document explains how authentication works in this backend.

## Stack

- Express.js (JavaScript)
- MongoDB + Mongoose
- JWT for access and reset tokens
- `bcryptjs` for password hashing

## Main Components

- Model: `src/models/User.js`
- Auth controller: `src/controllers/authController.js`
- Auth routes: `src/routes/authRoutes.js`
- Auth middleware: `src/middlewares/authMiddleware.js`
- User controller: `src/controllers/userController.js`
- User routes: `src/routes/userRoutes.js`

## User Model Rules

- Fields:
  - `name` (optional)
  - `email` (required, unique, lowercase)
  - `password` (required, min length 8, `select: false`)
  - `otpCode` and `otpExpiresAt` (for password reset)
  - `isDeleted` and `deletedAt` (for soft delete)
- Password is hashed automatically in a `pre("save")` hook.
- Password is hidden from query results by default.

## Auth Endpoints

Base prefix: `/api/auth`

- `POST /signup`
- `POST /signin`
- `POST /forgot-password`
- `POST /verify-otp`
- `POST /reset-password`

## Auth Cycle (Step-by-Step)

### 1) Sign Up

Endpoint: `POST /api/auth/signup`

- Input: `name`, `email`, `password`
- Validates required fields (`email`, `password`) and password length.
- Ensures no active user exists with same email.
- Creates user (password gets hashed).
- Returns:
  - safe user data (`id`, `name`, `email`)
  - JWT access token (`accessToken`)

### 2) Sign In

Endpoint: `POST /api/auth/signin`

- Input: `email`, `password`
- Finds active user by email with `.select("+password")`.
- Compares provided password with hashed password.
- Returns:
  - safe user data
  - JWT access token

### 3) Forgot Password (Generate OTP)

Endpoint: `POST /api/auth/forgot-password`

- Input: `email`
- Finds active user.
- Generates 6-digit OTP and expiry (10 minutes).
- Saves OTP in user document.
- Returns OTP info (currently for testing; production should send by email/SMS).

### 4) Verify OTP

Endpoint: `POST /api/auth/verify-otp`

- Input: `email`, `otp`
- Confirms user has valid OTP request.
- Checks OTP expiry and value.
- Returns short-lived reset token (`resetToken`, JWT ~10 minutes).

### 5) Reset Password

Endpoint: `POST /api/auth/reset-password`

- Input: `resetToken`, `newPassword`
- Verifies reset token and purpose.
- Finds active user.
- Updates password (hashed by model hook).
- Clears OTP fields.

## Protected User Endpoints

Base prefix: `/api/users`

- `GET /me` -> get current user profile
- `PATCH /me` -> update `name`, `email`, and/or `password`
- `DELETE /me` -> soft delete current user

These endpoints require:

- Header: `Authorization: Bearer <accessToken>`
- Middleware `protect` verifies JWT and loads active user (`isDeleted: false`).

## Soft Delete Behavior

`DELETE /api/users/me` does not remove user document physically.

Instead:

- sets `isDeleted = true`
- sets `deletedAt = new Date()`
- clears OTP data

After soft delete:

- user cannot sign in again
- reset password flow for that user is blocked
- protected routes reject old token because middleware only loads active users

## Environment Variables

Required in `.env`:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`

## Notes for Production

- Do not return OTP in API responses; send it through email/SMS provider.
- Add request validation library (e.g., Joi/Zod) for stronger input checks.
- Add rate limiting on signin/forgot-password/verify-otp endpoints.
- Consider refresh tokens and token revocation strategy for larger systems.
