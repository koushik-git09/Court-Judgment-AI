import { type ReactNode, useMemo } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { AdminSidebar } from "./components/AdminSidebar";
import { VerifierSidebar } from "./components/VerifierSidebar";
import { DepartmentSidebar } from "./components/DepartmentSidebar";
import { Header } from "./components/Header";
import { AdminDashboard } from "./components/AdminDashboard";
import { AllCasesPage } from "./components/AllCasesPage";
import { UserManagement } from "./components/UserManagement";
import { ActiveVerification } from "./components/ActiveVerification";
import { CompletedVerifications } from "./components/CompletedVerifications";
import { VerificationQueue } from "./components/VerificationQueue";
import { DepartmentDashboard } from "./components/DepartmentDashboard";
import { CompletedCases } from "./components/CompletedCases";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { DepartmentAnalytics } from "./components/DepartmentAnalytics";
import { SettingsDashboard } from "./components/SettingsDashboard";
import { VerifierAnalytics } from "./components/VerifierAnalytics";
import { ChatWidget } from "./components/ChatWidget";

import { AuthProvider, type UserRole, useAuth } from "./context/AuthContext";

const DEFAULT_ROUTE: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  verifier: "/verifier/queue",
  department: "/department/assigned",
};

function RequireRole({
  allowed,
  children,
}: {
  allowed: UserRole;
  children: ReactNode;
}) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== allowed) return <Navigate to={DEFAULT_ROUTE[role]} replace />;
  return <>{children}</>;
}

function getTitleFromPath(role: UserRole, pathname: string): string {
  if (role === "admin") {
    if (pathname.startsWith("/admin/dashboard")) return "Admin Dashboard";
    if (pathname.startsWith("/admin/cases")) return "All Cases";
    if (pathname.startsWith("/admin/users")) return "User Management";
    if (pathname.startsWith("/admin/analytics")) return "System Analytics";
    if (pathname.startsWith("/admin/settings")) return "System Settings";
    return "Admin Dashboard";
  }

  if (role === "verifier") {
    if (pathname.startsWith("/verifier/queue")) return "Verification Queue";
    if (pathname.startsWith("/verifier/active")) return "Active Verification";
    if (pathname.startsWith("/verifier/completed"))
      return "Completed Verifications";
    if (pathname.startsWith("/verifier/analytics")) return "My Analytics";
    if (pathname.startsWith("/verifier/settings")) return "Settings";
    return "Verification Queue";
  }

  if (pathname.startsWith("/department/assigned")) return "Assigned Cases";
  if (pathname.startsWith("/department/pending")) return "Pending Actions";
  if (pathname.startsWith("/department/completed")) return "Completed Cases";
  if (pathname.startsWith("/department/analytics"))
    return "Department Analytics";
  if (pathname.startsWith("/department/settings")) return "Settings";
  return "Assigned Cases";
}

function getActiveViewFromPath(role: UserRole, pathname: string): string {
  if (role === "admin") {
    if (pathname.startsWith("/admin/dashboard")) return "dashboard";
    if (pathname.startsWith("/admin/cases")) return "all-cases";
    if (pathname.startsWith("/admin/users")) return "users";
    if (pathname.startsWith("/admin/analytics")) return "analytics";
    if (pathname.startsWith("/admin/settings")) return "settings";
    return "dashboard";
  }

  if (role === "verifier") {
    if (pathname.startsWith("/verifier/queue")) return "queue";
    if (pathname.startsWith("/verifier/active")) return "verify";
    if (pathname.startsWith("/verifier/completed")) return "completed";
    if (pathname.startsWith("/verifier/analytics")) return "analytics";
    if (pathname.startsWith("/verifier/settings")) return "settings";
    return "queue";
  }

  if (pathname.startsWith("/department/assigned")) return "assigned";
  if (pathname.startsWith("/department/pending")) return "pending";
  if (pathname.startsWith("/department/completed")) return "completed";
  if (pathname.startsWith("/department/analytics")) return "analytics";
  if (pathname.startsWith("/department/settings")) return "settings";
  return "assigned";
}

function LayoutShell({
  role,
  onLogout,
}: {
  role: UserRole;
  onLogout: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const userName = (userEmail || "user").split("@")[0].replace(".", " ");

  const activeView = useMemo(
    () => getActiveViewFromPath(role, location.pathname),
    [role, location.pathname],
  );
  const title = useMemo(
    () => getTitleFromPath(role, location.pathname),
    [role, location.pathname],
  );

  const onNavigateView = (view: string) => {
    if (role === "admin") {
      const map: Record<string, string> = {
        dashboard: "/admin/dashboard",
        "all-cases": "/admin/cases",
        users: "/admin/users",
        analytics: "/admin/analytics",
        settings: "/admin/settings",
      };
      navigate(map[view] ?? "/admin/dashboard");
      return;
    }

    if (role === "verifier") {
      const map: Record<string, string> = {
        queue: "/verifier/queue",
        verify: "/verifier/active",
        completed: "/verifier/completed",
        analytics: "/verifier/analytics",
        settings: "/verifier/settings",
      };
      navigate(map[view] ?? "/verifier/queue");
      return;
    }

    const map: Record<string, string> = {
      assigned: "/department/assigned",
      pending: "/department/pending",
      completed: "/department/completed",
      analytics: "/department/analytics",
      settings: "/department/settings",
    };
    navigate(map[view] ?? "/department/assigned");
  };

  const sidebar =
    role === "admin" ? (
      <AdminSidebar activeView={activeView} onNavigate={onNavigateView} />
    ) : role === "verifier" ? (
      <VerifierSidebar activeView={activeView} onNavigate={onNavigateView} />
    ) : (
      <DepartmentSidebar activeView={activeView} onNavigate={onNavigateView} />
    );

  return (
    <div className="size-full flex bg-[#F5F7FA]">
      {sidebar}

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header
          title={title}
          userName={userName}
          userRole={role}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}

function LoginRoute({}: {}) {
  const navigate = useNavigate();
  const { role } = useAuth();

  if (role) {
    return <Navigate to={DEFAULT_ROUTE[role]} replace />;
  }

  return (
    <LoginPage
      onLoggedIn={(r) => {
        navigate(`/${r}`, { replace: true });
      }}
      onNavigateToForgotPassword={() => navigate("/forgot-password")}
    />
  );
}

function SignupRoute({ onSignupComplete }: { onSignupComplete: () => void }) {
  const navigate = useNavigate();
  return (
    <SignupPage
      onSignup={() => {
        onSignupComplete();
        navigate("/login");
      }}
      onNavigateToLogin={() => navigate("/login")}
    />
  );
}

function LandingRoute({ role }: { role: UserRole | null }) {
  const navigate = useNavigate();

  if (role) {
    return <Navigate to={DEFAULT_ROUTE[role]} replace />;
  }

  return <LandingPage onGetStarted={() => navigate("/login")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRouteWrapper />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/signup"
            element={
              <SignupRoute
                onSignupComplete={() =>
                  alert(
                    "Access request submitted successfully! You will be notified once approved.",
                  )
                }
              />
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <RequireRole allowed="admin">
                  <RoleShell role="admin" />
                </RequireRole>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="cases" element={<AllCasesPage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="settings" element={<SettingsDashboard />} />
          </Route>

          <Route
            path="/verifier"
            element={
              <PrivateRoute>
                <RequireRole allowed="verifier">
                  <RoleShell role="verifier" />
                </RequireRole>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/verifier/queue" replace />} />
            <Route path="queue" element={<VerifierQueueRoute />} />
            <Route path="active" element={<ActiveVerification />} />
            <Route path="completed" element={<CompletedVerifications />} />
            <Route path="analytics" element={<VerifierAnalytics />} />
            <Route path="settings" element={<SettingsDashboard />} />
          </Route>

          <Route
            path="/department"
            element={
              <PrivateRoute>
                <RequireRole allowed="department">
                  <RoleShell role="department" />
                </RequireRole>
              </PrivateRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/department/assigned" replace />}
            />
            <Route path="assigned" element={<DepartmentDashboard />} />
            <Route path="pending" element={<DepartmentDashboard />} />
            <Route path="completed" element={<CompletedCases />} />
            <Route path="analytics" element={<DepartmentAnalytics />} />
            <Route path="settings" element={<SettingsDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RoleShell({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <LayoutShell
      role={role}
      onLogout={() => {
        logout();
        navigate("/login");
      }}
    />
  );
}

function LandingRouteWrapper() {
  const { role } = useAuth();
  const navigate = useNavigate();
  if (role) return <Navigate to={DEFAULT_ROUTE[role]} replace />;
  return <LandingPage onGetStarted={() => navigate("/login")} />;
}

function VerifierQueueRoute() {
  const navigate = useNavigate();
  return (
    <VerificationQueue onSelectCase={() => navigate("/verifier/active")} />
  );
}
