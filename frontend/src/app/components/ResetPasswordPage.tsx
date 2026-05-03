import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { resetPassword } = useAuth();

  const initialToken = useMemo(() => params.get("token") || "", [params]);

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await resetPassword(token, newPassword);
      setMessage("Password reset successful. You can now login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err: any) {
      setMessage(err?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F7FA]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-gray-900 mb-1">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Paste the reset token and set a new password.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">
              Reset Token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-2 block">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] text-white py-3 rounded-lg hover:bg-[#6B0000] transition-colors disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </button>
        </form>

        {message && (
          <div className="mt-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
