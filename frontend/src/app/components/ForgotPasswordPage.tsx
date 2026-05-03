import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setResetToken(null);
    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
      if (result.resetToken) setResetToken(result.resetToken);
    } catch (err: any) {
      setMessage(err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F7FA]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-gray-900 mb-1">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email to generate a reset token.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] text-white py-3 rounded-lg hover:bg-[#6B0000] transition-colors disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Reset Token"}
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

        {resetToken && (
          <div className="mt-4 text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-gray-900 mb-1">Reset Token</div>
            <div className="break-all font-mono text-xs text-gray-800">
              {resetToken}
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/reset-password?token=${encodeURIComponent(resetToken)}`,
                )
              }
              className="mt-3 w-full bg-[#2563EB] text-white py-2 rounded-lg hover:bg-[#1E40AF] transition-colors"
            >
              Continue to Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
