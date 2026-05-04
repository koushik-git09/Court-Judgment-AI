import { UserPlus, Search, Edit, Trash2, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

type BackendUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string | null;
  created_at?: string;
  last_login?: string;
};

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRole(role?: string) {
  if (!role) return "—";
  if (role === "admin") return "Admin";
  if (role === "verifier") return "Verifier";
  if (role === "department") return "Department User";
  return role;
}

export function UserManagement() {
  const [showAddUser, setShowAddUser] = useState(false);
  const { authFetch, apiBaseUrl } = useAuth();

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await authFetch(`${apiBaseUrl}/auth/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to load users");
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err: any) {
      setUsers([]);
      setUsersError(err?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadPending = async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const res = await authFetch(`${apiBaseUrl}/auth/pending-users`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.detail || "Failed to load pending users");
      setPendingUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err: any) {
      setPendingUsers([]);
      setPendingError(err?.message || "Failed to load pending users");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id: string) => {
    try {
      const res = await authFetch(`${apiBaseUrl}/auth/approve-user/${id}`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Approve failed");
      await loadUsers();
      await loadPending();
    } catch (err: any) {
      alert(err?.message || "Approve failed");
    }
  };

  const totalUsers = users.length + pendingUsers.length;
  const activeUsers = users.length;
  const pendingRequests = pendingUsers.length;
  const inactiveUsers = 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage system users and access requests
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-[#8B0000] text-white px-6 py-2.5 rounded-lg hover:bg-[#6B0000] transition-colors flex items-center gap-2 shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-3xl mt-2 text-gray-900">{totalUsers}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Active Users</div>
          <div className="text-3xl mt-2 text-green-600">{activeUsers}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Pending Requests</div>
          <div className="text-3xl mt-2 text-yellow-600">{pendingRequests}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-sm text-gray-500">Inactive Users</div>
          <div className="text-3xl mt-2 text-red-600">{inactiveUsers}</div>
        </div>
      </div>

      {(pendingLoading || pendingUsers.length > 0 || pendingError) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Pending Access Requests</h3>
          {pendingError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              {pendingError}
            </div>
          )}
          {pendingLoading ? (
            <div className="text-sm text-gray-600">
              Loading pending users...
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-sm text-gray-600">No pending requests.</div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{request.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {request.email} • {String(request.role)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Requested:{" "}
                      {request.created_at
                        ? String(request.created_at).slice(0, 10)
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approve(request._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">All Users</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              />
            </div>
          </div>
        </div>

        {(usersLoading || usersError) && (
          <div className="px-6 pt-4">
            {usersError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                {usersError}
              </div>
            )}
            {usersLoading && (
              <div className="text-sm text-gray-600">Loading users...</div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    —
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatRole(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.department || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDateTime(user.last_login)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="text-[#2563EB] hover:text-[#1E40AF]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
