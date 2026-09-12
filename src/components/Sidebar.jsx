import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarDays, Stethoscope, MessageSquare,
  UsersRound, Settings, Globe, Pill, Activity, X 
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/doctors' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays, path: '/appointments' },
    { id: 'odontograms', label: 'Odontograms', icon: Activity, path: '/odontograms' },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { id: 'follow up', label: 'Follow Up', icon: CalendarDays, path: '/follow-up' },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, path: '/enquiries' },
  ];

  const managementItems = [
    { id: 'staff', label: 'Staff', icon: UsersRound, path: '/staff' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'website', label: 'Website', icon: Globe, path: '/website' },
  ];

  const renderNav = (items) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
            }}
            className={({ isActive }) => `relative flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 group rounded-xl ${
              isActive 
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 relative z-10">
      <div>
        <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">Main Menu</p>
        {renderNav(menuItems)}
      </div>
      <div>
        <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">Management</p>
        {renderNav(managementItems)}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 glass-panel h-full flex-col z-10 relative bg-slate-900 border-r border-slate-800 text-slate-100 shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Slide-Out */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-[fadeIn_0.2s_ease-out]">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={onCloseMobile}
          />

          {/* Sliding Menu */}
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-50 animate-[slideInLeft_0.25s_ease-out]">
            {/* Mobile Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                  C
                </div>
                <span className="font-extrabold text-white text-base">Dental Clinic</span>
              </div>
              <button 
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
