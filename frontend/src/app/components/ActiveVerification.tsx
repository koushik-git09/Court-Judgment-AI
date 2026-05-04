import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "../context/AuthContext";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Gavel,
  PencilLine,
  Scale,
  Save,
  Sparkles,
  TextQuote,
  Undo2,
  XCircle,
} from "lucide-react";

export function ActiveVerification() {
  type BackendCase = {
    _id: string;
    category: string;
    court_name: string;
    extracted_text: string;
    status: string;
    created_at: string;
    case_number?: string | null;
    order_date?: string | null;
    parties?: string | null;
  };

  type Analysis = {
    summary: string;
    action: string;
    deadline: string;
    department: string;
    risk: string;
    confidence: number;
    parties?: string | null;
    order_date?: string | null;
    case_number?: string | null;
    reasoning: string[];
    evidence: string[];
    extraction_engine?: string | null;
    spacy_model?: string | null;
    spacy_ran?: boolean | null;
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch, apiBaseUrl } = useAuth();

  const caseData = location.state as BackendCase | null | undefined;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<
    Pick<Analysis, "summary" | "action" | "deadline" | "department" | "risk">
  >({
    summary: "",
    action: "",
    deadline: "",
    department: "",
    risk: "",
  });

  const startEdit = () => {
    if (!analysis) return;
    setEditDraft({
      summary: analysis.summary || "",
      action: analysis.action || "",
      deadline: analysis.deadline || "",
      department: analysis.department || "",
      risk: analysis.risk || "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!analysis) return;

    const next = {
      summary: editDraft.summary.trim(),
      action: editDraft.action.trim(),
      deadline: editDraft.deadline.trim(),
      department: editDraft.department.trim(),
      risk: editDraft.risk.trim(),
    };

    setAnalysis((prev) => (prev ? { ...prev, ...next } : prev));
    setIsEditing(false);

    // Optional persistence: if backend supports editing action plan fields.
    // This is best-effort and does not block verifier decisions.
    try {
      if (!caseData?._id) return;
      const res = await authFetch(
        `${apiBaseUrl}/cases/${encodeURIComponent(caseData._id)}/action-plan`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(next),
        },
      );

      // Avoid surfacing noisy alerts; log for debugging if a proxy/base URL is misconfigured.
      if (!res.ok) {
        const text = await res.text();
        console.warn("Failed to persist edits:", text);
      }
    } catch (err) {
      console.warn("Failed to persist edits:", err);
    }
  };

  const renderHighlightedText = (text: string) => {
    const pattern = /(\bappeal\b|\bcomply\b|\b\d+\s*days?\b|\bdays?\b)/gi;
    const parts = text.split(pattern);

    return parts.map((part, idx) => {
      const key = `${idx}-${part}`;
      const lower = part.toLowerCase();

      if (lower === "appeal") {
        return (
          <span
            key={key}
            className="inline-flex items-center rounded-md bg-red-100 text-red-900 px-1.5 py-0.5 text-xs font-medium ring-1 ring-red-200 align-baseline"
          >
            {part}
          </span>
        );
      }

      if (lower === "comply") {
        return (
          <span key={key} className="bg-green-100 text-green-900 rounded px-1">
            {part}
          </span>
        );
      }

      if (lower.includes("day")) {
        return (
          <span
            key={key}
            className="bg-yellow-100 text-yellow-900 rounded px-1"
          >
            {part}
          </span>
        );
      }

      return <span key={key}>{part}</span>;
    });
  };

  const riskBadgeClass = (risk?: string) => {
    const r = (risk || "").toLowerCase();
    if (r === "high") return "bg-red-100 text-red-800 border-red-200";
    if (r === "medium")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (r === "low") return "bg-green-100 text-green-800 border-green-200";
    return "";
  };

  const actionBadgeClass = (action?: string) => {
    const a = (action || "").toLowerCase();
    if (a.includes("compliance"))
      return "bg-red-100 text-red-800 border-red-200";
    if (a.includes("appeal"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (a.includes("payment"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (a.includes("review"))
      return "bg-gray-100 text-gray-800 border-gray-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const confidenceValue = analysis
    ? Math.max(0, Math.min(100, analysis.confidence))
    : 0;

  const buildDetailedActionPlan = (a: Analysis) => {
    const department = (a.department || "").trim() || "the relevant department";
    const action = (a.action || "").trim() || "take necessary action";
    const deadline = (a.deadline || "").trim() || "the specified deadline";

    return `The ${department} is required to comply with the court order by ${action.toLowerCase()} within ${deadline}. Ensure all procedural steps are completed and documented before the deadline. Any delay may lead to escalation and legal consequences.`;
  };

  const Field = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
  }) => (
    <div className="flex gap-3">
      {icon ? (
        <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      ) : null}
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <div className="text-sm font-semibold text-gray-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );

  // 🔥 AI ANALYSIS CALL
  useEffect(() => {
    if (!caseData) return;

    const analyzeData = async () => {
      setLoading(true);

      try {
        const res = await fetch("http://127.0.0.1:8000/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extracted_text: caseData.extracted_text,
          }),
        });

        const data = await res.json();
        setAnalysis(data);
      } catch (err) {
        console.error("Analysis failed:", err);
      }

      setLoading(false);
    };

    analyzeData();
  }, [caseData]);

  // 🔥 VERIFY FUNCTION
  const handleVerify = async (status: "approved" | "rejected") => {
    try {
      setVerifying(true);
      await authFetch("http://127.0.0.1:8000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_id: caseData?._id,
          status: status,
        }),
      });

      alert(`Case ${status}`);
      navigate("/verifier/queue");
    } catch (err) {
      console.error("Verification failed", err);
    } finally {
      setVerifying(false);
    }
  };

  if (!caseData) {
    return (
      <div className="p-6 h-full">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-900 font-semibold">No case selected</p>
          <p className="text-sm text-gray-500 mt-1">
            Go back to the queue and select a case to verify.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="w-full max-w-none flex flex-col gap-6">
        {/* Extracted Text (Full Width) */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white/70">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <FileText className="size-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-lg leading-tight">
                    Extracted Text
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Review highlighted keywords before taking action.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-800 border-red-100"
                >
                  appeal
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-800 border-yellow-100"
                >
                  days
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-800 border-green-100"
                >
                  comply
                </Badge>
              </div>
            </div>
          </div>

          <div className="max-h-[70vh]">
            <ScrollArea className="h-[70vh]" type="always">
              <div className="p-6 sm:p-8 text-[15px] sm:text-[16px] text-gray-900 whitespace-pre-wrap leading-8">
                {renderHighlightedText(caseData.extracted_text)}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Case Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Gavel className="size-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-base">
                  Case Details
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Reference information for verification.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-gray-900">
              {caseData.status}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field
              label="Case ID"
              value={<span className="font-mono text-xs">{caseData._id}</span>}
              icon={<Scale className="size-4" />}
            />
            <Field
              label="Case Number"
              value={analysis?.case_number || caseData.case_number || "—"}
              icon={<TextQuote className="size-4" />}
            />
            <Field
              label="Court"
              value={caseData.court_name}
              icon={<Gavel className="size-4" />}
            />
            <Field
              label="Category"
              value={caseData.category}
              icon={<Sparkles className="size-4" />}
            />
            <Field
              label="Order Date"
              value={analysis?.order_date || caseData.order_date || "—"}
              icon={<CalendarClock className="size-4" />}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field
                label="Parties"
                value={analysis?.parties || caseData.parties || "—"}
                icon={<Scale className="size-4" />}
              />
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Sparkles className="size-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-base">
                  AI Analysis
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Structured summary for government verification workflow.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {analysis?.extraction_engine ? (
                <Badge variant="outline" className="text-gray-700">
                  {analysis.extraction_engine}
                </Badge>
              ) : null}
            </div>
          </div>

          {loading && (
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Analyzing case…</p>
              <div className="mt-3">
                <Progress value={35} className="h-2" />
              </div>
            </div>
          )}

          {analysis && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Summary
                </p>
                {!isEditing ? (
                  <p className="mt-2 text-sm text-gray-900 leading-7">
                    {analysis.summary}
                  </p>
                ) : (
                  <Textarea
                    value={editDraft.summary}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, summary: e.target.value }))
                    }
                    className="mt-2 min-h-28 bg-white"
                  />
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 font-medium">
                    Confidence
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {Math.round(confidenceValue)}%
                  </p>
                </div>
                <div className="mt-3">
                  <Progress value={confidenceValue} className="h-2" />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      Action
                    </p>
                    {!isEditing ? (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={actionBadgeClass(analysis.action)}
                        >
                          {analysis.action}
                        </Badge>
                      </div>
                    ) : (
                      <Input
                        value={editDraft.action}
                        onChange={(e) =>
                          setEditDraft((d) => ({
                            ...d,
                            action: e.target.value,
                          }))
                        }
                        className="mt-2 bg-white"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">
                      Risk
                    </p>
                    {!isEditing ? (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={riskBadgeClass(analysis.risk)}
                        >
                          {analysis.risk}
                        </Badge>
                      </div>
                    ) : (
                      <select
                        value={editDraft.risk}
                        onChange={(e) =>
                          setEditDraft((d) => ({ ...d, risk: e.target.value }))
                        }
                        className="mt-2 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select risk</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarClock className="size-4 text-gray-400 mt-0.5" />
                    <div className="w-full">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Deadline
                      </p>
                      {!isEditing ? (
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {analysis.deadline}
                        </p>
                      ) : (
                        <Input
                          value={editDraft.deadline}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              deadline: e.target.value,
                            }))
                          }
                          className="mt-2 bg-white"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2Fallback />
                    <div className="w-full">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Department
                      </p>
                      {!isEditing ? (
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {analysis.department}
                        </p>
                      ) : (
                        <Input
                          value={editDraft.department}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              department: e.target.value,
                            }))
                          }
                          className="mt-2 bg-white"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasoning & Evidence */}
              <div className="lg:col-span-3 rounded-xl border border-gray-100 bg-primary/5 p-6">
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-center">
                    <TextQuote className="size-5 text-gray-700" />
                  </div>
                  <h4 className="text-gray-900 font-bold">
                    Why AI Suggested This
                  </h4>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/70 border border-gray-100 p-4 border-l-4 border-l-primary">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-gray-600" />
                      <p className="text-sm font-semibold text-gray-900">
                        Reasoning
                      </p>
                    </div>
                    {analysis.reasoning?.length ? (
                      <ul className="mt-3 list-disc pl-5 text-sm text-gray-800 space-y-1">
                        {analysis.reasoning.map((item, i) => (
                          <li key={`reason-${i}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-600">
                        No reasoning provided.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-white/70 border border-gray-100 p-4 border-l-4 border-l-primary">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-gray-600" />
                      <p className="text-sm font-semibold text-gray-900">
                        Evidence
                      </p>
                    </div>
                    {analysis.evidence?.length ? (
                      <ul className="mt-3 list-disc pl-5 text-sm text-gray-800 space-y-1">
                        {analysis.evidence.map((item, i) => (
                          <li key={`evidence-${i}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-gray-600">
                        No evidence extracted.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!analysis && !loading && (
            <p className="mt-5 text-sm text-gray-500">Waiting for analysis…</p>
          )}
        </div>

        {/* Detailed Action Plan */}
        {analysis ? (
          <div className="rounded-xl shadow-sm border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-base">
                  Detailed Action Plan
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Auto-generated guidance based on AI fields.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-800 leading-7">
              {buildDetailedActionPlan({
                ...analysis,
                ...(isEditing ? editDraft : {}),
              })}
            </p>
          </div>
        ) : null}

        {/* Verification Actions */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-gray-900 font-bold text-base">
                Verification Actions
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Approve, edit fields for accuracy, or reject.
              </p>
            </div>
            {isEditing ? (
              <Badge
                variant="outline"
                className="text-blue-700 border-blue-200 bg-blue-50"
              >
                Edit mode
              </Badge>
            ) : null}
          </div>

          {!isEditing ? (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => handleVerify("approved")}
                className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={verifying}
              >
                <CheckCircle2 className="size-5" />
                Approve
              </Button>
              <Button
                type="button"
                onClick={startEdit}
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!analysis || loading}
              >
                <PencilLine className="size-5" />
                Edit
              </Button>
              <Button
                onClick={() => handleVerify("rejected")}
                className="h-12 w-full"
                variant="destructive"
                disabled={verifying}
              >
                <XCircle className="size-5" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={saveEdit}
                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="size-5" />
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                className="h-12 w-full"
              >
                <Undo2 className="size-5" />
                Cancel
              </Button>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Approve/Reject updates the case status immediately. Edits update the
            action plan fields used for approval.
          </p>
        </div>
      </div>
    </div>
  );
}

function Building2Fallback() {
  // Avoid importing another icon in the main bundle if not needed.
  // Keeps a consistent minimal visual marker for Department.
  return (
    <div className="size-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" className="size-4">
        <path
          d="M4 21V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 21h20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 7h.01M8 11h.01M8 15h.01M12 7h.01M12 11h.01M12 15h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
