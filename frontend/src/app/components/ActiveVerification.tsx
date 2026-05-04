import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";

import { useAuth } from "../context/AuthContext";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Gavel,
  Scale,
  Sparkles,
  TextQuote,
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
  const { authFetch } = useAuth();

  const caseData = location.state as BackendCase | null | undefined;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

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

    return `The ${department} is required to comply with the court order by ${action.toLowerCase()} within ${deadline}. Ensure all procedural steps are completed and documented before the deadline to avoid legal consequences.`;
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
    <div className="p-6 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* LEFT (60%) */}
        <div className="lg:col-span-7">
          <div className="h-[calc(100vh-250px)] min-h-0 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white/60">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <FileText className="size-4 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold leading-tight">
                      Extracted Text
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Review highlighted terms before approving.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
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

            <ScrollArea className="flex-1 min-h-0" type="always">
              <div className="p-6 text-[13px] text-gray-800 whitespace-pre-wrap leading-7">
                {renderHighlightedText(caseData.extracted_text)}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* RIGHT (40%) */}
        <div className="lg:col-span-5">
          <div className="h-[calc(100vh-250px)] min-h-0 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
              {/* Case Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Gavel className="size-4 text-gray-700" />
                    </div>
                    <h3 className="text-gray-900 font-semibold">
                      Case Details
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-gray-900">
                    {caseData.status}
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Case ID"
                    value={caseData._id}
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
                  <div className="sm:col-span-2">
                    <Field
                      label="Parties"
                      value={analysis?.parties || caseData.parties || "—"}
                      icon={<Scale className="size-4" />}
                    />
                  </div>
                  <Field
                    label="Order Date"
                    value={analysis?.order_date || caseData.order_date || "—"}
                    icon={<CalendarClock className="size-4" />}
                  />
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="size-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Sparkles className="size-4 text-gray-700" />
                  </div>
                  <h3 className="text-gray-900 font-semibold">AI Analysis</h3>
                  <div className="ml-auto">
                    {analysis?.extraction_engine ? (
                      <Badge variant="outline" className="text-gray-700">
                        {analysis.extraction_engine}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {loading && (
                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Analyzing case…</p>
                    <div className="mt-3">
                      <Progress value={35} className="h-2" />
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        Summary
                      </p>
                      <p className="mt-2 text-sm text-gray-900 leading-6">
                        {analysis.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Action
                        </p>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={actionBadgeClass(analysis.action)}
                          >
                            {analysis.action}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          Risk
                        </p>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={riskBadgeClass(analysis.risk)}
                          >
                            {analysis.risk}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CalendarClock className="size-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">
                            Deadline
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {analysis.deadline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building2Fallback />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">
                            Department
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {analysis.department}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
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
                    </div>
                  </div>
                )}

                {!analysis && !loading && (
                  <p className="mt-4 text-sm text-gray-500">
                    Waiting for analysis…
                  </p>
                )}
              </div>

              {/* Detailed Action Plan */}
              {analysis ? (
                <div className="rounded-2xl shadow-sm border border-gray-100 bg-primary/5 p-6">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-center">
                      <CheckCircle2 className="size-4 text-gray-700" />
                    </div>
                    <h3 className="text-gray-900 font-semibold">
                      Detailed Action Plan
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-gray-800 leading-6">
                    {buildDetailedActionPlan(analysis)}
                  </p>
                </div>
              ) : null}

              {/* Explainability */}
              <div className="rounded-2xl shadow-sm border border-gray-100 bg-primary/5 p-6">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl bg-white/70 border border-gray-100 flex items-center justify-center">
                    <TextQuote className="size-4 text-gray-700" />
                  </div>
                  <h3 className="text-gray-900 font-semibold">
                    Why AI Suggested This
                  </h3>
                </div>

                {!analysis && !loading && (
                  <p className="mt-4 text-sm text-gray-600">
                    Run analysis to view reasoning and evidence.
                  </p>
                )}

                {analysis && (
                  <div className="mt-5 space-y-4">
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
                )}
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="shrink-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <Button
                  onClick={() => handleVerify("approved")}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  disabled={verifying}
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>

                <Button
                  onClick={() => handleVerify("rejected")}
                  className="flex-1 h-11 transition-colors"
                  variant="destructive"
                  disabled={verifying}
                >
                  <XCircle className="size-4" />
                  Reject
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Verification updates the case status immediately.
              </p>
            </div>
          </div>
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
