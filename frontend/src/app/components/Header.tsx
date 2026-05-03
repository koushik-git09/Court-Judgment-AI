import { Search, User, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export function Header({ title, userName, userRole, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">{title}</h1>
          <div className="text-xs text-gray-500 mt-1">
            Govt. of Karnataka | Court Monitoring System
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          <div className="flex items-center gap-3 p-2 border-l border-gray-200 pl-4">
            <div className="w-8 h-8 bg-[#8B0000] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-900">{userName}</div>
              <div className="text-xs text-gray-500 capitalize">{userRole}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
