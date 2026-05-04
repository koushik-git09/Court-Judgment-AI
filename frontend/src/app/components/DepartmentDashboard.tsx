import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { Progress } from "./ui/progress";
import { getDepartmentAliases } from "../lib/departmentMapping";

type ActionPlan = {
  summary?: string;
  action?: string;
  deadline?: string;
  department?: string;
  risk?: string;
  confidence?: number;
};

type DepartmentCase = {
  _id: string;
  status: string;
  department?: string;
  action_plan?: ActionPlan | null;
};

export function DepartmentDashboard() {
  const { authFetch, apiBaseUrl, user } = useAuth();

  const [cases, setCases] = useState<DepartmentCase[]>([]);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<
    Array<{ from: string; text: string }>
  >([
    {
      from: "System",
      text: "This chat is UI-only (no backend).",
    },
  ]);
  const [chatText, setChatText] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const deptFromUser = (user?.department || "").trim();
        if (!deptFromUser) {
          setCases([]);
          return;
        }

        const deptAliases = getDepartmentAliases(deptFromUser);
        const url = `${apiBaseUrl}/cases?status=approved&department=${encodeURIComponent(
          deptAliases.join(","),
        )}`;

        const res = await authFetch(url);
        const data = (await res.json()) as DepartmentCase[];

        const normalized = Array.isArray(data) ? data : [];
        const approved = normalized.filter(
          (caseItem) => caseItem.status === "approved",
        );
        const deptFiltered = approved.filter((caseItem) =>
          deptAliases.includes((caseItem.department || "").trim()),
        );

        setCases(deptFiltered);
      } catch (err) {
        console.error("Failed to fetch cases", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [apiBaseUrl, authFetch, user?.department]);

  const handleComplete = async (caseId: string) => {
    try {
      const res = await authFetch(`${apiBaseUrl}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_id: caseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to mark case as completed");
      }

      alert("Case marked as completed");
      setCases((prevCases) =>
        prevCases.filter((caseItem) => caseItem._id !== caseId),
      );
    } catch (err) {
      console.error("Failed to mark case as completed", err);
    }
  };

  const getRiskTone = (risk?: string) => {
    switch ((risk || "").toLowerCase()) {
      case "high":
        return {
          card: "border-l-red-500 bg-red-50/70",
          badge: "bg-red-100 text-red-800",
          text: "text-red-700",
        };
      case "medium":
        return {
          card: "border-l-yellow-500 bg-yellow-50/70",
          badge: "bg-yellow-100 text-yellow-800",
          text: "text-yellow-700",
        };
      case "low":
        return {
          card: "border-l-green-500 bg-green-50/70",
          badge: "bg-green-100 text-green-800",
          text: "text-green-700",
        };
      default:
        return {
          card: "border-l-gray-300 bg-gray-50",
          badge: "bg-gray-100 text-gray-700",
          text: "text-gray-700",
        };
    }
  };

  const getDeadlineTone = (daysRemaining: number | null) => {
    if (daysRemaining === null) return "text-gray-600";
    if (daysRemaining < 5) return "text-red-600";
    if (daysRemaining < 10) return "text-yellow-600";
    return "text-green-600";
  };

  const parseConfidence = (confidence?: number) => {
    if (typeof confidence !== "number" || Number.isNaN(confidence)) return 0;
    return confidence <= 1
      ? Math.round(confidence * 100)
      : Math.max(0, Math.min(100, Math.round(confidence)));
  };

  const parseDeadlineToDays = (deadline?: string) => {
    if (!deadline?.trim()) return null;

    const parsedDate = new Date(deadline);
    if (!Number.isNaN(parsedDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      parsedDate.setHours(0, 0, 0, 0);
      return Math.ceil((parsedDate.getTime() - today.getTime()) / 86400000);
    }

    const match = deadline.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const formatDeadlineLabel = (deadline?: string) => {
    if (!deadline?.trim()) return "No deadline provided";

    const parsedDate = new Date(deadline);
    if (!Number.isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(parsedDate);
    }

    return deadline;
  };

  const getSummaryText = (summary?: string) =>
    summary?.trim()
      ? summary
      : "AI could not extract summary. Please review manually.";

  const getTitleText = (summary?: string) => {
    const normalized = getSummaryText(summary);
    const sentence = normalized.split(/[.!?]/)[0]?.trim() || normalized;
    return sentence.length > 80 ? `${sentence.slice(0, 77)}...` : sentence;
  };

  const getActionText = (action?: string) =>
    action?.trim() ? action : "Manual review required";

  const getDepartmentText = (department?: string) =>
    department?.trim() ? department : "Department review required";

  const getRiskText = (risk?: string) => (risk?.trim() ? risk : "Unknown");

  const highRiskCount = cases.filter(
    (caseItem) => (caseItem.action_plan?.risk || "").toLowerCase() === "high",
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Active Cases</div>
              <div className="mt-2 text-3xl text-gray-900">{cases.length}</div>
            </div>
            <AlertCircle className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">High Risk</div>
              <div className="mt-2 text-3xl text-red-600">{highRiskCount}</div>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Completed</div>
              <div className="mt-2 text-3xl text-green-600">0</div>
            </div>
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-gray-900">Assigned Cases</h2>

        {loading ? (
          <p className="text-gray-500">Loading cases...</p>
        ) : cases.length === 0 ? (
          <p className="text-gray-500">No approved cases</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {cases.map((caseItem) => {
              const plan = caseItem.action_plan || {};
              const title = getTitleText(plan.summary);
              const summary = getSummaryText(plan.summary);
              const action = getActionText(plan.action);
              const risk = getRiskText(plan.risk);
              const department = getDepartmentText(
                caseItem.department || plan.department,
              );
              const confidence = parseConfidence(plan.confidence);
              const daysRemaining = parseDeadlineToDays(plan.deadline);
              const deadlineLabel = formatDeadlineLabel(plan.deadline);
              const riskTone = getRiskTone(risk);
              const deadlineTone = getDeadlineTone(daysRemaining);

              return (
                <div
                  key={caseItem._id}
                  className={`rounded-xl border border-gray-100 border-l-4 p-6 shadow-sm ${riskTone.card}`}
                >
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        ACTION
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        RISK
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        DEADLINE
                      </span>
                      <span className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
                        Approved
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg text-gray-900">{title}</h3>
                      <div className="mt-3 text-base font-semibold text-gray-950">
                        {"\u26a1 "}
                        {action}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3">
                        <div className="text-xs font-medium text-gray-500">
                          {"\ud83d\udcc5 Deadline"}
                        </div>
                        <div className="mt-1 text-sm text-gray-900">
                          {deadlineLabel}
                        </div>
                        <div
                          className={`mt-1 text-xs font-medium ${deadlineTone}`}
                        >
                          {daysRemaining === null
                            ? "Timeline unavailable"
                            : daysRemaining < 0
                              ? `${Math.abs(daysRemaining)} days overdue`
                              : `${daysRemaining} days remaining`}
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3">
                        <div className="text-xs font-medium text-gray-500">
                          {"\ud83d\udd34 Risk"}
                        </div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${riskTone.badge}`}
                          >
                            {risk}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3">
                        <div className="text-xs font-medium text-gray-500">
                          Department
                        </div>
                        <div className="mt-1 text-sm text-gray-900">
                          {department}
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 bg-white/80 px-4 py-3">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                          <span>AI Confidence</span>
                          <span className={riskTone.text}>{confidence}%</span>
                        </div>
                        <Progress
                          value={confidence}
                          className="mt-3 h-2.5 bg-gray-200"
                        />
                        <div
                          className={`mt-2 text-xs font-medium ${riskTone.text}`}
                        >
                          AI Confidence: {confidence}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-gray-500">
                        Case ID: {caseItem._id}
                      </div>

                      <button
                        onClick={() => handleComplete(caseItem._id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat UI (no backend) */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="text-gray-900 text-sm font-semibold">Team Chat</div>
        <div className="mt-3 max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
          {messages.map((m, idx) => (
            <div key={`${idx}-${m.from}`} className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">{m.from}:</span>{" "}
              {m.text}
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
          />
          <button
            onClick={() => {
              const trimmed = chatText.trim();
              if (!trimmed) return;
              setMessages((prev) => [...prev, { from: "You", text: trimmed }]);
              setChatText("");
            }}
            className="px-4 py-2 rounded-lg bg-[#8B0000] text-white hover:bg-[#6B0000] transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
