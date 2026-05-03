import { Search, Filter, Download, Eye } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

type BackendCase = {
  _id: string;
  category: string;
  court_name: string;
  extracted_text: string;
  status: string;
  created_at: string;
};

export function AllCasesPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { authFetch } = useAuth();

  const [cases, setCases] = useState<BackendCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const totalCases = cases.length;
  const pendingCount = cases.filter((c) =>
    c.status?.toLowerCase().includes("pending"),
  ).length;
  const inProgressCount = cases.filter((c) =>
    c.status?.toLowerCase().includes("progress"),
  ).length;
  const approvedCount = cases.filter((c) =>
    c.status?.toLowerCase().includes("approved"),
  ).length;
  const completedCount = cases.filter((c) =>
    c.status?.toLowerCase().includes("completed"),
  ).length;

  useEffect(() => {
    const controller = new AbortController();

    const loadCases = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await authFetch("http://127.0.0.1:8000/cases", {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch cases: ${res.status}`);
        }
        const data = (await res.json()) as BackendCase[];
        setCases(Array.isArray(data) ? data : []);
      } catch (e) {
        if ((e as { name?: string }).name !== "AbortError") {
          setHasError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();

    return () => {
      controller.abort();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Verification":
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getTitleFromExtractedText = (text: string) => {
    const words = (text || "").trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 5).join(" ");
  };

  const formatCaseDate = (createdAt: string) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return createdAt;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">All Cases</h2>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all court judgment cases
          </p>
        </div>
        <button className="bg-[#8B0000] text-white px-6 py-2.5 rounded-lg hover:bg-[#6B0000] transition-colors flex items-center gap-2 shadow-md">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Total Cases</div>
          <div className="text-3xl mt-2 text-gray-900">{totalCases}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-3xl mt-2 text-yellow-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-3xl mt-2 text-blue-600">{inProgressCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-3xl mt-2 text-green-600">{approvedCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-3xl mt-2 text-gray-900">{completedCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by case ID, title, or department..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === "all"
                    ? "bg-[#8B0000] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === "pending"
                    ? "bg-[#8B0000] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedFilter("approved")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === "approved"
                    ? "bg-[#8B0000] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Verifier
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-sm text-gray-600">
                    Loading cases...
                  </td>
                </tr>
              ) : hasError ? (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-sm text-gray-600">
                    Failed to load cases
                  </td>
                </tr>
              ) : (
                cases.map((caseItem) => (
                  <tr
                    key={caseItem._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caseItem._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTitleFromExtractedText(caseItem.extracted_text)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.court_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCaseDate(caseItem.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${getPriorityColor("Medium")}`}>
                        Medium
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusColor(caseItem.status)}`}
                      >
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Unassigned
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-[#2563EB] hover:text-[#1E40AF] flex items-center gap-1 text-sm">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {totalCases > 0 ? 1 : 0}-{totalCases} of {totalCases} cases
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000] transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
