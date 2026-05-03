import { LayoutDashboard, BarChart3, Settings, Scale, Users, FileText } from 'lucide-react';

interface AdminSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function AdminSidebar({ activeView, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-cases', label: 'All Cases', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-[#8B0000] to-[#6B0000] text-white flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
            <Scale className="w-7 h-7 text-[#8B0000]" />
          </div>
          <div>
            <div className="text-sm">Administrator</div>
            <div className="text-xs opacity-75">Court Monitoring</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full px-6 py-3 flex items-center gap-3 transition-all ${
                isActive
                  ? 'bg-[#FFD700] text-[#8B0000] shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="text-xs opacity-75 text-center">
          v1.0.0 | Admin Panel
        </div>
      </div>
    </aside>
  );
}
