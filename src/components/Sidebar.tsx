import React from 'react';
import { User } from '../services/api';
import { 
  LayoutDashboard, 
  Activity, 
  Calendar, 
  TrendingUp, 
  LogOut, 
  Users, 
  Heart, 
  Pill,
  User as UserIcon
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const isClinician = user.role === 'clinician';

  // Navigation Items setup
  const items = isClinician 
    ? [
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'health_data', label: 'Health Data', icon: Activity },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'risk_history', label: 'Risk History', icon: TrendingUp },
      ];

  const displayName = user.email.split('@')[0];
  const capLabel = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen shrink-0 font-sans shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-2.5">
        <div className="bg-rose-50 p-2 rounded-xl flex items-center justify-center border border-rose-100">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <span className="text-lg font-bold text-gray-900 tracking-tight block">Salama AI</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            {isClinician ? 'Clinician Suite' : 'Patient Portal'}
          </span>
        </div>
      </div>

      {/* User Information Area */}
      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-inner">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{capLabel}</p>
          <p className="text-xs text-slate-400 truncate font-medium">{user.email}</p>
        </div>
      </div>

      {/* Navigation Items list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? isClinician 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                    : 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              <span>{item.label}</span>
              
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/20">
        <button
          id="logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-200 group text-left"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
