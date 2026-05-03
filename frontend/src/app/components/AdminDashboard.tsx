import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UploadModal } from "./UploadModal";

import { useAuth } from "../context/AuthContext";

type CaseItem = {
  _id: string;
  category?: string;
  court_name?: string;
  status?: string;
};

export function AdminDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();

  const fetchCases = async () => {
    try {
      const res = await authFetch("http://127.0.0.1:8000/cases");
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error("Failed to fetch cases", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const stats = [
    {
      label: "Total Cases",
      value: String(cases.length),
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Pending Verification",
      value: String(
        cases.filter((caseItem) => caseItem.status === "pending_verification")
          .length,
      ),
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "Approved Cases",
      value: String(
        cases.filter((caseItem) => caseItem.status === "approved").length,
      ),
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Completed Cases",
      value: String(
        cases.filter((caseItem) => caseItem.status === "completed").length,
      ),
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => status.replace(/_/g, " ");

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-3xl mt-2 text-gray-900">
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-gray-900">Recent Cases</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#8B0000] text-white px-6 py-2.5 rounded-lg hover:bg-[#6B0000] transition-colors flex items-center gap-2 shadow-md"
        >
          <Upload className="w-4 h-4" />
          Upload Judgment PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-8 text-sm text-gray-500">
              Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="px-6 py-8 text-sm text-gray-500">
              No cases available
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Court
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr
                    key={caseItem._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{caseItem._id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.category || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {caseItem.court_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(caseItem.status || "")}`}
                      >
                        {formatStatus(caseItem.status || "unknown")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={async () => {
            setShowUploadModal(false);
            setLoading(true);
            await fetchCases();
          }}
        />
      )}
    </div>
  );
}
