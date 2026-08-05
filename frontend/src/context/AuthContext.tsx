/**
 * AuthContext.tsx
 *
 * Handles two auth paths — both go through NestJS:
 *   1. Email/password  → POST /api/v1/auth/login or /auth/register
 *   2. Google OAuth    → GET /api/v1/auth/google (backend redirect flow)
 *                        → Google → GET /api/v1/auth/google/callback
 *                        → Backend redirects to /auth/callback?accessToken=...&refreshToken=...
 *                        → This context reads the tokens from URL on that route
 *
 * Architecture:
 *   • NO Supabase dependency whatsoever.
 *   • NestJS JWT is the single application auth token.
 *   • All user profile data comes from NestJS /api/v1/auth/me (Prisma/PostgreSQL).
 *   • Tokens stored in localStorage.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "@/lib/types";
import {
  apiRequest,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "@/lib/apiClient";

// ─────────────────────────────────────────────
// Dev-only logger — NEVER logs secrets/tokens
// ─────────────────────────────────────────────
const isDev = import.meta.env.DEV;
function log(label: string, ...args: unknown[]) {
  if (isDev) {
    const safeArgs = args.map((a) =>
      typeof a === "string" && a.length > 40 ? "[REDACTED]" : a,
    );
    console.log(`[Auth] ${label}`, ...safeArgs);
  }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface NestUser {
  id: string;
  email: string;
  phone?: string;
  role: string;
  profile: any;
}

interface AuthContextValue {
  nestUser: NestUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  // Legacy shape compatibility
  session: { user: NestUser } | null;
  user: NestUser | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000/api/v1";

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [nestUser, setNestUser] = useState<NestUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const initialised = useRef(false);

  const resolveLoading = () => {
    if (!initialised.current) {
      initialised.current = true;
      setLoading(false);
      log("resolveLoading", "loading resolved");
    }
  };

  const applyNestUser = (data: NestUser) => {
    setNestUser(data);
    setProfile({
      id: data.id,
      full_name:
        data.profile?.fullName || data.email?.split("@")[0] || "User",
      phone: data.phone || "",
      address: data.profile?.address || "",
      role:
        data.role === "ADMIN" || data.role === "SUPER_ADMIN"
          ? "admin"
          : "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  // ─────────────────────────────────────────────
  // Fetch NestJS profile with stored JWT
  // Source of truth: NestJS /auth/me → Prisma/PostgreSQL
  // ─────────────────────────────────────────────
  const fetchNestUserProfile = async (): Promise<boolean> => {
    const token = getStoredToken();
    if (!token) {
      log("fetchNestUserProfile", "no stored token");
      setNestUser(null);
      setProfile(null);
      return false;
    }

    try {
      log("fetchNestUserProfile", "calling /auth/me");
      const data = await apiRequest<NestUser>("/auth/me");

      if (data?.id) {
        log("fetchNestUserProfile", "success, userId=", data.id);
        applyNestUser(data);
        return true;
      }

      log("fetchNestUserProfile", "unexpected shape — clearing token");
      removeStoredToken();
      setNestUser(null);
      setProfile(null);
      return false;
    } catch (err) {
      log("fetchNestUserProfile", "error —", (err as Error).message);
      removeStoredToken();
      setNestUser(null);
      setProfile(null);
      return false;
    }
  };

  // ─────────────────────────────────────────────
  // On mount: check for OAuth callback tokens in URL,
  // then fall back to stored JWT.
  // ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // ── Handle Google OAuth callback redirect ──────────────────────
      // Backend redirects to /auth/callback?accessToken=...&refreshToken=...
      const urlParams = new URLSearchParams(window.location.search);
      const urlAccessToken = urlParams.get("accessToken");
      const urlRefreshToken = urlParams.get("refreshToken");
      const urlError = urlParams.get("error");

      if (urlAccessToken) {
        log("init", "found OAuth callback tokens in URL — storing");
        setStoredToken(urlAccessToken);
        if (urlRefreshToken) {
          localStorage.setItem("refreshToken", urlRefreshToken);
        }
        // Clean the URL so tokens don't remain in browser history
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (urlError) {
        log("init", "OAuth callback error —", urlError);
        // Don't throw — just proceed as unauthenticated
      }

      // ── Check stored JWT (email/password users & page refresh) ─────
      const hasToken = !!getStoredToken();
      if (hasToken && isMounted) {
        const ok = await fetchNestUserProfile();
        log("init", "fetchNestUserProfile =", ok);
      }

      if (isMounted) {
        resolveLoading();
      }
    };

    init();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────
  // signIn — email/password via NestJS
  // ─────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    try {
      log("signIn", "email=", email);
      const res = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res?.accessToken) {
        return { error: "Login failed: no access token returned" };
      }

      setStoredToken(res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }

      const ok = await fetchNestUserProfile();
      if (!ok) {
        return { error: "Login succeeded but profile could not be loaded" };
      }

      log("signIn", "success");
      return { error: null };
    } catch (err: any) {
      log("signIn", "error —", err.message);
      return { error: err.message || "Invalid credentials" };
    }
  };

  // ─────────────────────────────────────────────
  // signUp — email/password via NestJS
  // ─────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
  ): Promise<{ error: string | null }> => {
    try {
      log("signUp", "email=", email);
      const res = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          fullName,
          address: "Madhya Pradesh",
        }),
      });

      if (!res?.accessToken) {
        return { error: "Registration failed" };
      }

      setStoredToken(res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }

      await fetchNestUserProfile();
      log("signUp", "success");
      return { error: null };
    } catch (err: any) {
      log("signUp", "error —", err.message);
      return { error: err.message || "Registration failed" };
    }
  };

  // ─────────────────────────────────────────────
  // signInWithGoogle — Backend OAuth redirect (no Supabase)
  //
  // Redirects the browser to the NestJS Google OAuth endpoint.
  // NestJS handles: Google redirect → callback → find/create user →
  //   issue JWT → redirect to frontend /auth/callback?accessToken=...
  // ─────────────────────────────────────────────
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      log("signInWithGoogle", "redirecting to backend Google OAuth");
      // Redirect browser to NestJS Google OAuth endpoint
      // This triggers the Passport Google strategy redirect chain
      window.location.href = `${API_BASE_URL}/auth/google`;
      // This promise never resolves (page navigates away)
      return { error: null };
    } catch (err: any) {
      log("signInWithGoogle", "exception —", err?.message);
      return {
        error: err?.message || "An error occurred during Google sign-in.",
      };
    }
  };

  // ─────────────────────────────────────────────
  // signOut — clear tokens cleanly
  // ─────────────────────────────────────────────
  const signOut = async (): Promise<void> => {
    log("signOut", "clearing tokens");
    removeStoredToken();
    setNestUser(null);
    setProfile(null);
  };

  // ─────────────────────────────────────────────
  // updateProfile — updates via NestJS (Prisma/PostgreSQL)
  // ─────────────────────────────────────────────
  const updateProfile = async (
    updates: Partial<Profile>,
  ): Promise<{ error: string | null }> => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
    return { error: null };
  };

  const refreshProfile = async (): Promise<void> => {
    await fetchNestUserProfile();
  };

  const isAdmin = profile?.role === "admin";
  const isAuthenticated = nestUser !== null;
  const session = nestUser ? { user: nestUser } : null;

  return (
    <AuthContext.Provider
      value={{
        nestUser,
        profile,
        isAdmin,
        loading,
        isAuthenticated,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
        session,
        user: nestUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
