import { useState } from "react";
import { Scale, Eye, EyeOff, ArrowLeft } from "lucide-react";

import { CASE_CATEGORIES } from "../lib/departmentMapping";

interface SignupPageProps {
  onSignup: (role: string, email: string, name: string) => void;
  onNavigateToLogin: () => void;
}

export function SignupPage({ onSignup, onNavigateToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    employeeId: "",
    department: "Transport",
    role: "verifier",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    onSignup(formData.role, formData.email, formData.fullName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B0000] via-[#6B0000] to-[#4B0000] flex items-center justify-center p-4 overflow-y-auto py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#FFD700] rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-[#FFD700] rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-[#FFD700] rotate-45 animate-pulse"></div>
      </div>

      {/* Glassy Card with Enhanced Shadow */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(139,0,0,0.3)] w-full max-w-2xl relative z-10 my-8 border border-white/20">
        <div className="bg-gradient-to-r from-[#8B0000] to-[#6B0000] p-8 rounded-t-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-white/30">
              <Scale className="w-12 h-12 text-[#8B0000]" />
            </div>
            <h1 className="text-white text-2xl mb-2 drop-shadow-lg">
              Access Request Form
            </h1>
            <div className="text-[#FFD700] text-sm drop-shadow">
              Government of Karnataka
            </div>
          </div>
        </div>

        <div className="p-8">
          <button
            onClick={onNavigateToLogin}
            className="flex items-center gap-2 text-[#8B0000] hover:text-[#6B0000] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </button>

          <div className="mb-6">
            <h2 className="text-gray-900 text-center mb-2">
              Create New Account
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Submit your details for access approval
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Employee ID *
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  placeholder="KA-2026-XXXX"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Official Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@karnataka.gov.in"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {formData.role !== "admin" ? (
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required={formData.role !== "admin"}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {CASE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Requested Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const nextRole = e.target.value;
                    setFormData({
                      ...formData,
                      role: nextRole,
                      department:
                        nextRole === "admin"
                          ? ""
                          : formData.department || "Transport",
                    });
                  }}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                >
                  <option value="verifier">Verifier</option>
                  <option value="department">Department User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Create password"
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

              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Re-enter password"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xs text-blue-800 space-y-1">
                <div className="mb-2">Password requirements:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Minimum 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 accent-[#8B0000]"
              />
              <label className="text-xs text-gray-600">
                I confirm that all information provided is accurate and I agree
                to the{" "}
                <button
                  type="button"
                  className="text-[#2563EB] hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-[#2563EB] hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B0000] to-[#6B0000] text-white py-3 rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all shadow-lg"
            >
              Submit Access Request
            </button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-xs text-amber-800 text-center">
              ⚠️ Your request will be reviewed by the system administrator. You
              will receive an email notification once approved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
