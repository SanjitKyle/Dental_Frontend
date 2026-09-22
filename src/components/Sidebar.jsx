import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarDays, Stethoscope, MessageSquare,
  UsersRound, Pill, Activity, X, Clock, LogOut
} from 'lucide-react';
import { ContextProvider } from '../context/store';
import { canAccessRoute, ROLE_DETAILS, ROLES } from '../utils/rbac';

const Sidebar = ({ isMobileOpen, onCloseMobile, onLogout }) => {
  const navigate = useNavigate();
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
  ];

  // Filter based on active user role permissions
  const menuItems = rawMenuItems.filter((item) => canAccessRoute(item.path, userRole, currentUser));
  const managementItems = rawManagementItems.filter((item) => canAccessRoute(item.path, userRole, currentUser));

  const roleMeta = ROLE_DETAILS[userRole] || { label: userRole || 'User', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' };

  // Theme-tailored dark badge styles for the sidebar
  const DARK_ROLE_BADGES = {
    [ROLES.ADMIN]: { badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
    [ROLES.DOCTOR]: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    [ROLES.STAFF]: { badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', dot: 'bg-sky-400' },
    [ROLES.PATIENT]: { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400' },
  };
  const currentDarkBadge = DARK_ROLE_BADGES[userRole] || { badge: 'bg-slate-700/60 text-slate-300 border-slate-600', dot: 'bg-slate-400' };

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("user");
    }
    navigate('/login');
  };

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
            className={({ isActive }) => `relative flex items-center gap-3 px-3.5 py-2.5 transition-all duration-200 group rounded-xl ${
              isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white font-medium'
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
    <div className="flex flex-col h-full justify-between p-4 bg-slate-900 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
          {renderNav(menuItems)}
        </div>
        {managementItems.length > 0 && (
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Management</p>
            {renderNav(managementItems)}
          </div>
        )}
      </div>

      {/* User Card & Logout Button (Only in Mobile Drawer, hidden on desktop/large screens) */}
      <div className="md:hidden mt-6 pt-4 border-t border-slate-800/80 shrink-0">
        <div className="relative overflow-hidden p-3.5 bg-gradient-to-b from-slate-800/90 via-slate-800/60 to-slate-900/95 border border-slate-700/70 rounded-2xl shadow-xl shadow-black/25 ring-1 ring-white/5">
          {/* Subtle decorative glow */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-md shadow-indigo-500/25">
                <div className="w-full h-full bg-slate-900/80 rounded-[10px] flex items-center justify-center font-black text-xs text-white backdrop-blur-xs tracking-wider">
                  {(currentUser?.name || currentUser?.fullName || 'U').slice(0, 2).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate capitalize tracking-tight leading-tight">
                {currentUser?.name || currentUser?.fullName || 'User'}
              </p>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentDarkBadge.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentDarkBadge.dot} animate-pulse`} />
                  {roleMeta.label}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Drawer Logout Button */}
          <button
            onClick={handleLogout}
            className="group relative w-full mt-3 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500/20 via-rose-500/15 to-red-500/20 hover:from-rose-600 hover:via-rose-600 hover:to-red-600 active:scale-[0.98] border border-rose-500/35 hover:border-transparent text-rose-200 hover:text-white flex items-center justify-center gap-2.5 font-bold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-rose-950/50"
          >
            <div className="w-5 h-5 rounded-md bg-rose-500/20 group-hover:bg-white/20 flex items-center justify-center text-rose-300 group-hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-bold">Log Out</span>
          </button>
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

          <div className="relative w-72 max-w-[82vw] h-full bg-slate-900 border-r border-slate-800/90 shadow-2xl flex flex-col z-50 animate-slide-left">
            <div className="p-4 border-b border-slate-800/90 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
                  C
                </div>
                <div>
                  <span className="font-black text-white text-base tracking-tight block leading-tight">Dental Clinic</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Health Portal
                  </span>
                </div>
              </div>
              <button 
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/60"
                title="Close Menu"
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

