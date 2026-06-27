/**
 * auth.ts — Phase 1.5 Frontend Authentication
 *
 * In-memory token store + auth utilities for the MYL AI Dashboard.
 *
 * SECURITY DESIGN:
 *   - access_token stored ONLY in memory (React state via AuthContext)
 *   - refresh_token stored ONLY in HttpOnly cookie (set by backend)
 *   - No token ever written to localStorage or sessionStorage
 *   - All API calls include Authorization: Bearer <access_token>
 *   - On 401: auto-refresh once via /api/auth/refresh, then retry
 *   - On refresh failure: redirect to /login
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://maya-ai-sales-production.up.railway.app';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// ─── In-memory token store ────────────────────────────────────────────────────
// This module-level variable is the ONLY place the access token is stored.
// It is never serialized or written to any browser storage.

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
    return _accessToken;
}

export function setAccessToken(token: string | null): void {
    _accessToken = token;
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export interface LoginResult {
    success: boolean;
    access_token: string;
    user: AuthUser;
    error?: string;
}

/**
 * Login: POST /api/auth/login
 * Returns access_token (stored in memory) and sets HttpOnly refresh cookie.
 */
export async function loginRequest(email: string, password: string): Promise<LoginResult> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Required: backend sets HttpOnly refresh_token cookie
          body: JSON.stringify({ email, password }),
    });

  const data = await res.json();

  if (!res.ok) {
        return { success: false, access_token: '', user: null as any, error: data.error || 'Login failed' };
  }

  return {
        success: true,
        access_token: data.access_token,
        user: data.user,
  };
}

/**
 * Refresh: POST /api/auth/refresh
 * Uses the HttpOnly refresh_token cookie (sent automatically by browser).
 * Returns new access_token on success, null on failure.
 */
export async function refreshRequest(): Promise<string | null> {
    try {
          const res = await fetch(`${API_BASE}/api/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include', // Send HttpOnly refresh_token cookie
                  body: JSON.stringify({}),
          });

      if (!res.ok) return null;

      const data = await res.json();
          return data.access_token || null;
    } catch {
          return null;
    }
}

/**
 * Logout: POST /api/auth/logout
 * Revokes the refresh token session on the backend.
 * Clears the in-memory access token.
 */
export async function logoutRequest(): Promise<void> {
    try {
          await fetch(`${API_BASE}/api/auth/logout`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({}),
          });
    } catch {
          // Best-effort: clear local state regardless
    } finally {
          setAccessToken(null);
    }
}

/**
 * Get current user: GET /api/auth/me
 * Validates the in-memory access token against the backend.
 */
export async function getMeRequest(token: string): Promise<AuthUser | null> {
    try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
                  method: 'GET',
                  headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                  },
                  credentials: 'include',
          });

      if (!res.ok) return null;

      const data = await res.json();
          return data.user || null;
    } catch {
          return null;
    }
}
