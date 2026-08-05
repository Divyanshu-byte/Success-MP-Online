/**
 * supabase.ts — DEPRECATED
 *
 * Supabase has been removed from this project.
 * This file is kept only as a placeholder to prevent import errors
 * in case any file still imports from here.
 *
 * All authentication is now handled by the NestJS backend:
 *   - Email/password: POST /api/v1/auth/login
 *   - Google OAuth:   GET  /api/v1/auth/google  (backend redirect)
 *   - Profile:        GET  /api/v1/auth/me
 *
 * See: src/context/AuthContext.tsx
 */

// Empty export so this file is a valid module
export {};
