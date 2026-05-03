import { User, Bell, Shield, Database, Mail } from 'lucide-react';

export function SettingsDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">Profile Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Full Name</label>
              <input
                type="text"
                defaultValue="Rajesh Kumar"
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Employee ID</label>
              <input
                type="text"
                defaultValue="KA-2024-5678"
                disabled
                className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              defaultValue="rajesh.kumar@karnataka.gov.in"
              className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Department</label>
            <select className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]">
              <option>Transport</option>
              <option>Revenue</option>
              <option>Education</option>
              <option>Health</option>
              <option>PWD</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">Role</label>
            <input
              type="text"
              defaultValue="Senior Verifier"
              disabled
              className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg opacity-60"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="text-sm text-gray-900">Email Notifications</div>
              <div className="text-xs text-gray-500">Receive updates via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8B0000] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="text-sm text-gray-900">Deadline Reminders</div>
              <div className="text-xs text-gray-500">Get notified 3 days before deadline</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8B0000] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm text-gray-900">New Case Assignments</div>
              <div className="text-xs text-gray-500">Notify when new cases are assigned</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8B0000] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B0000]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-gray-600" />
          <h2 className="text-gray-900">Security</h2>
        </div>

        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
            <div className="text-sm text-gray-900">Change Password</div>
            <div className="text-xs text-gray-500 mt-1">Last changed 45 days ago</div>
          </button>

          <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
            <div className="text-sm text-gray-900">Two-Factor Authentication</div>
            <div className="text-xs text-gray-500 mt-1">Add an extra layer of security</div>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2.5 bg-[#8B0000] text-white rounded-lg hover:bg-[#6B0000] transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
