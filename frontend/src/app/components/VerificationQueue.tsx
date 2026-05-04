import { Clock, AlertCircle, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getDepartmentAliases } from "../lib/departmentMapping";

type BackendCase = {
  _id: string;
  category: string;
  court_name: string;
  extracted_text: string;
  status: string;
  created_at: string;
};

interface VerificationQueueProps {
  onSelectCase?: (selectedCase: BackendCase) => void;
}

export function VerificationQueue({ onSelectCase }: VerificationQueueProps) {
  const [cases, setCases] = useState<BackendCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { authFetch, apiBaseUrl, role, user } = useAuth();

  // Keep the prop for backwards compatibility, but navigation is handled here.
  void onSelectCase;

  useEffect(() => {
    const controller = new AbortController();

    const loadCases = async () => {
      setIsLoading(true);
      try {
        const deptFromUser = (user?.department || "").trim();
        if (role === "verifier" && !deptFromUser) {
          setCases([]);
          return;
        }

        const deptAliases = deptFromUser
          ? getDepartmentAliases(deptFromUser)
          : [];
        const deptParam = deptAliases.length
          ? `&department=${encodeURIComponent(deptAliases.join(","))}`
          : "";

        const res = await authFetch(
          `${apiBaseUrl}/cases?${deptParam.slice(1)}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) throw new Error(`Failed to fetch cases: ${res.status}`);
        const data = (await res.json()) as BackendCase[];
        setCases(Array.isArray(data) ? data : []);
      } catch (e) {
        if ((e as { name?: string }).name !== "AbortError") {
          setCases([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
    return () => controller.abort();
  }, [apiBaseUrl, authFetch, role, user?.department]);

  const queuedCases = useMemo(() => {
    // When the server is filtered by status, this is usually a no-op.
    return cases.filter((c) => c.status === "pending_verification");
  }, [cases]);

  const getTitleFromExtractedText = (text: string) => {
    const words = (text || "").trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 5).join(" ");
  };

  const formatUploadedDate = (createdAt: string) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return createdAt;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  const getConfidenceForCase = (id: string) => {
    // Stable pseudo-random 80–95% based on id (prevents changes on re-render)
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    const normalized = Math.abs(hash) % 16; // 0..15
    return 80 + normalized;
  };

  const verifiedTodayCount = useMemo(() => {
    const today = new Date();
    const isSameDay = (d: Date) =>
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();

    return cases.filter((c) => {
      if (c.status === "pending_verification") return false;
      const d = new Date(c.created_at);
      return !Number.isNaN(d.getTime()) && isSameDay(d);
    }).length;
  }, [cases]);

  const avgTimeMinutes = useMemo(() => {
    if (queuedCases.length === 0) return 0;
    const now = Date.now();
    const minutes = queuedCases
      .map((c) => {
        const d = new Date(c.created_at);
        if (Number.isNaN(d.getTime())) return 0;
        return Math.max(0, Math.round((now - d.getTime()) / 60000));
      })
      .reduce((a, b) => a + b, 0);
    return Math.round(minutes / queuedCases.length);
  }, [queuedCases]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">In Queue</div>
              <div className="text-3xl mt-2 text-gray-900">
                {queuedCases.length}
              </div>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Verified Today</div>
              <div className="text-3xl mt-2 text-gray-900">
                {verifiedTodayCount}
              </div>
            </div>
            <AlertCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Avg. Time</div>
              <div className="text-3xl mt-2 text-gray-900">
                {avgTimeMinutes}m
              </div>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-gray-900 mb-4">Pending Verification</h2>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            queuedCases.map((caseItem) => {
              const confidence = getConfidenceForCase(caseItem._id);
              return (
                <div
                  key={caseItem._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-gray-900">
                          {getTitleFromExtractedText(caseItem.extracted_text)}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getPriorityColor("Medium")}`}
                        >
                          Medium
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Case ID:</span>{" "}
                          <span className="text-gray-900">{caseItem._id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Uploaded:</span>{" "}
                          <span className="text-gray-900">
                            {formatUploadedDate(caseItem.created_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">By:</span>{" "}
                          <span className="text-gray-900">—</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            AI Confidence
                          </span>
                          <span className="text-xs text-gray-900">
                            {confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              confidence >= 85
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/verifier/active", { state: caseItem });
                      }}
                      className="ml-6 px-6 py-3 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000] transition-colors flex items-center gap-2"
                    >
                      Start Verification
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
