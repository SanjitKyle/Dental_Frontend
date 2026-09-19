import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarDays, Stethoscope, MessageSquare,
  UsersRound, Settings, Globe, Pill, Activity, X, Shield, Clock
} from 'lucide-react';
import { ContextProvider } from '../context/store';
import { canAccessRoute, ROLE_DETAILS, ROLES } from '../utils/rbac';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { userRole, currentUser } = useContext(ContextProvider);

  const rawMenuItems = [
    { id: 'dashboard', label: userRole === ROLES.PATIENT ? 'My Dashboard' : 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/doctors' },
    { id: 'appointments', label: userRole === ROLES.PATIENT ? 'My Appointments' : 'Appointments', icon: CalendarDays, path: '/appointments' },
    { id: 'odontograms', label: 'Odontograms', icon: Activity, path: '/odontograms' },
    { id: 'prescriptions', label: userRole === ROLES.PATIENT ? 'My Prescriptions' : 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { id: 'follow up', label: 'Follow Up', icon: Clock, path: '/follow-up' },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, path: '/enquiries' },
  ];

  const rawManagementItems = [
    { id: 'staff', label: 'Staff & Roles', icon: UsersRound, path: '/staff' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'website', label: 'Website', icon: Globe, path: '/website' },
  ];

  // Filter based on active user role permissions
  const menuItems = rawMenuItems.filter((item) => canAccessRoute(item.path, userRole));
  const managementItems = rawManagementItems.filter((item) => canAccessRoute(item.path, userRole));

  const roleMeta = ROLE_DETAILS[userRole] || { label: userRole || 'User', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' };

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
    <div className="flex-1 flex flex-col justify-between overflow-y-auto py-5 px-3 space-y-6 relative z-10">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">Main Menu</p>
          {renderNav(menuItems)}
        </div>
        {managementItems.length > 0 && (
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">Management</p>
            {renderNav(managementItems)}
          </div>
        )}
      </div>

      {/* Role Indicator Footer Card */}
      <div className="p-3 bg-slate-800/70 border border-slate-700/80 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-black text-xs text-white uppercase">
            {(currentUser?.name || currentUser?.fullName || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate capitalize">
              {currentUser?.name || currentUser?.fullName || 'User'}
            </p>
            <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md border mt-0.5 ${roleMeta.badgeClass}`}>
              {roleMeta.label}
            </span>
          </div>
        </div>
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
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={onCloseMobile}
          />

          <div className="relative w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-50 animate-[slideInLeft_0.25s_ease-out]">
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
