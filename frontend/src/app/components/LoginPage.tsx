import { useState } from "react";
import { Eye, EyeOff, Scale, Shield, X } from "lucide-react";

import { type UserRole, useAuth } from "../context/AuthContext";
import { DEPARTMENTS } from "../lib/departmentMapping";

interface LoginPageProps {
  onLoggedIn: (role: UserRole) => void;
  onNavigateToForgotPassword: () => void;
}

export function LoginPage({
  onLoggedIn,
  onNavigateToForgotPassword,
}: LoginPageProps) {
  const { login, logout, requestAccess } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPassword, setReqPassword] = useState("");
  const [reqRole, setReqRole] = useState<UserRole>("department");
  const [reqDepartment, setReqDepartment] = useState<string>("Transport");
  const [reqMessage, setReqMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role !== selectedRole) {
        logout();
        setError(
          `Selected role '${selectedRole}' does not match your account role '${u.role}'.`,
        );
        return;
      }
      onLoggedIn(u.role);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqMessage(null);
    try {
      await requestAccess({
        name: reqName,
        email: reqEmail,
        password: reqPassword,
        role: reqRole,
        department: reqRole !== "admin" ? reqDepartment : null,
      });
      setReqMessage(
        "Access request submitted successfully. An admin must approve your account.",
      );
      setReqName("");
      setReqEmail("");
      setReqPassword("");
      setReqRole("department");
      setReqDepartment("Transport");
    } catch (err: any) {
      setReqMessage(err?.message || "Request failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B0000] via-[#6B0000] to-[#4B0000] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#FFD700] rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-[#FFD700] rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-[#FFD700] rotate-45 animate-pulse"></div>
      </div>

      {/* Glassy Card with Enhanced Shadow */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(139,0,0,0.3)] w-full max-w-md relative z-10 border border-white/20">
        <div className="bg-gradient-to-r from-[#8B0000] to-[#6B0000] p-8 rounded-t-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-white/30">
              <Scale className="w-12 h-12 text-[#8B0000]" />
            </div>
            <h1 className="text-white text-2xl mb-2 drop-shadow-lg">
              Court Judgment Intelligence
            </h1>
            <div className="text-[#FFD700] text-sm drop-shadow">
              Government of Karnataka
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-gray-900 text-center mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-600 text-center">
              Sign in to access the monitoring system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`py-2.5 px-3 rounded-lg text-sm transition-all ${
                    selectedRole === "admin"
                      ? "bg-[#8B0000] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("verifier")}
                  className={`py-2.5 px-3 rounded-lg text-sm transition-all ${
                    selectedRole === "verifier"
                      ? "bg-[#8B0000] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Verifier
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("department")}
                  className={`py-2.5 px-3 rounded-lg text-sm transition-all ${
                    selectedRole === "department"
                      ? "bg-[#8B0000] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Department
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@karnataka.gov.in"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#8B0000]" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-[#2563EB] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#8B0000] to-[#6B0000] text-white py-3 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setReqEmail(email);
                  setRequestOpen(true);
                }}
                className="text-[#8B0000] hover:underline"
              >
                Request Access
              </button>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Secured by Karnataka Government IT Systems</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs opacity-75">
        © 2026 Government of Karnataka | Court Monitoring System v1.0.0
      </div>

      {requestOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <div className="text-gray-900">Request Access</div>
                <div className="text-sm text-gray-600">
                  Accounts require admin approval.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={submitRequestAccess} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Name</label>
                <input
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">Role</label>
                <select
                  value={reqRole}
                  onChange={(e) => {
                    const nextRole = e.target.value as UserRole;
                    setReqRole(nextRole);
                    if (nextRole === "admin") {
                      setReqDepartment("");
                    } else if (!reqDepartment.trim()) {
                      setReqDepartment("Transport");
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                >
                  <option value="admin">admin</option>
                  <option value="verifier">verifier</option>
                  <option value="department">department</option>
                </select>
              </div>

              {reqRole !== "admin" ? (
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Select Department
                  </label>
                  <select
                    value={reqDepartment}
                    onChange={(e) => setReqDepartment(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={reqPassword}
                  onChange={(e) => setReqPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>

              {reqMessage && (
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {reqMessage}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#8B0000] text-white py-3 rounded-lg hover:bg-[#6B0000] transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setRequestOpen(false)}
                  className="flex-1 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
