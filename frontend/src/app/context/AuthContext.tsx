import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UserRole = "admin" | "verifier" | "department";

type AuthUser = {
  userId: string;
  role: UserRole;
  email: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  apiBaseUrl: string;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  requestAccess: (args: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  forgotPassword: (
    email: string,
  ) => Promise<{ resetToken?: string; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN = "token";
const STORAGE_ROLE = "role";
const STORAGE_USER_ID = "user_id";
const STORAGE_USER_EMAIL = "user_email";

function getApiBaseUrl() {
  const raw = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  return raw?.trim() || "http://127.0.0.1:8000";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_TOKEN),
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedRole = localStorage.getItem(STORAGE_ROLE) as UserRole | null;
    const storedUserId = localStorage.getItem(STORAGE_USER_ID);
    const storedEmail = localStorage.getItem(STORAGE_USER_EMAIL);
    if (!storedRole || !storedUserId) return null;
    return { role: storedRole, userId: storedUserId, email: storedEmail || "" };
  });

  const role = user?.role ?? null;
  const userEmail = user?.email || null;
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(STORAGE_TOKEN);
      return;
    }
    localStorage.setItem(STORAGE_TOKEN, token);
  }, [token]);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem(STORAGE_ROLE);
      localStorage.removeItem(STORAGE_USER_ID);
      localStorage.removeItem(STORAGE_USER_EMAIL);
      return;
    }
    localStorage.setItem(STORAGE_ROLE, user.role);
    localStorage.setItem(STORAGE_USER_ID, user.userId);
    localStorage.setItem(STORAGE_USER_EMAIL, user.email);
  }, [user]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_ROLE);
    localStorage.removeItem(STORAGE_USER_ID);
    localStorage.removeItem(STORAGE_USER_EMAIL);
  };

  const authFetch: AuthContextValue["authFetch"] = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  const login: AuthContextValue["login"] = async (email, password) => {
    const res = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Login failed");
    }

    const data = (await res.json()) as {
      access_token: string;
      role: UserRole;
      user_id: string;
    };

    setToken(data.access_token);
    setUser({ role: data.role, userId: data.user_id, email });

    return { role: data.role, userId: data.user_id, email };
  };

  const requestAccess: AuthContextValue["requestAccess"] = async (args) => {
    const res = await fetch(`${apiBaseUrl}/auth/request-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Request access failed");
    }
  };

  const forgotPassword: AuthContextValue["forgotPassword"] = async (email) => {
    const res = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Forgot password failed");
    }

    const data = (await res.json()) as {
      reset_token?: string;
      message?: string;
    };
    if (data.reset_token) {
      return {
        resetToken: data.reset_token,
        message: "Reset token generated.",
      };
    }
    return {
      message:
        data.message || "If that email exists, a reset token was generated.",
    };
  };

  const resetPassword: AuthContextValue["resetPassword"] = async (
    resetToken,
    newPassword,
  ) => {
    const res = await fetch(`${apiBaseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, new_password: newPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Reset password failed");
    }
  };

  const value: AuthContextValue = {
    token,
    user,
    role,
    userEmail,
    isAuthenticated,
    apiBaseUrl,
    login,
    logout,
    requestAccess,
    forgotPassword,
    resetPassword,
    authFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
