import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function AnalyticsDashboard() {
  const monthlyData = [
    { month: 'Jan', processed: 145, pending: 23 },
    { month: 'Feb', processed: 178, pending: 18 },
    { month: 'Mar', processed: 203, pending: 31 },
    { month: 'Apr', processed: 234, pending: 45 },
    { month: 'May', processed: 89, pending: 12 },
  ];

  const departmentData = [
    { name: 'Transport', cases: 234, color: '#8B0000' },
    { name: 'Revenue', cases: 189, color: '#2563EB' },
    { name: 'Education', cases: 156, color: '#10B981' },
    { name: 'Health', cases: 143, color: '#F59E0B' },
    { name: 'PWD', cases: 98, color: '#8B5CF6' },
  ];

  const statusData = [
    { name: 'Completed', value: 987, color: '#10B981' },
    { name: 'In Progress', value: 156, color: '#2563EB' },
    { name: 'Pending', value: 45, color: '#F59E0B' },
    { name: 'Overdue', value: 12, color: '#DC2626' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Avg. Processing Time</div>
              <div className="text-3xl mt-2 text-gray-900">4.2 days</div>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>12% faster</span>
              </div>
            </div>
            <Activity className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Cases This Month</div>
              <div className="text-3xl mt-2 text-gray-900">234</div>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>18% increase</span>
              </div>
            </div>
            <Activity className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-3xl mt-2 text-gray-900">94.3%</div>
              <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>2.1% better</span>
              </div>
            </div>
            <Activity className="w-10 h-10 text-[#8B0000]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Cases Processed Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="processed" stroke="#8B0000" strokeWidth={2} name="Processed" />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Department Workload</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="cases" name="Total Cases">
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Case Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            {departmentData.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{dept.name}</span>
                  <span className="text-gray-900">{dept.cases} cases</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(dept.cases / 234) * 100}%`,
                      backgroundColor: dept.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
