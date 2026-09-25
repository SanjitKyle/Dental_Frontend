import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope, MessageSquare,
  UsersRound, Pill, Activity, X, Clock, LogOut, ChevronRight,
  Receipt
} from 'lucide-react';
import { ContextProvider } from '../context/store';
import { canAccessRoute, ROLE_DETAILS, ROLES } from '../utils/rbac';

const Sidebar = ({ isMobileOpen, onCloseMobile, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, currentUser } = useContext(ContextProvider);

  // Structured menu items with nested sub-items (Follow Up under Appointments, Enquiry follow up under Enquiries)
  const rawMenuItems = [
    { 
      id: 'dashboard', 
      label: userRole === ROLES.PATIENT ? 'My Dashboard' : 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard' 
    },
    { 
      id: 'patients', 
      label: 'Patients', 
      icon: Users, 
      path: '/patients' 
    },
    { 
      id: 'doctors', 
      label: userRole === ROLES.PATIENT ? 'Our Doctors' : 'Doctors', 
      icon: Stethoscope, 
      path: '/doctors' 
    },
    { 
      id: 'appointments', 
      label: userRole === ROLES.PATIENT ? 'My Appointments' : 'Appointments', 
      icon: CalendarDays, 
      path: '/appointments',
      children: [
        { id: 'follow-up', label: 'Follow Up', icon: Clock, path: '/follow-up' }
      ]
    },
    { 
      id: 'odontograms', 
      label: userRole === ROLES.PATIENT ? 'My Dental Chart' : 'Odontograms', 
      icon: Activity, 
      path: '/odontograms' 
    },
    { 
      id: 'prescriptions', 
      label: userRole === ROLES.PATIENT ? 'My Prescriptions' : 'Prescriptions', 
      icon: Pill, 
      path: '/prescriptions' 
    },
    { 
      id: 'billing', 
      label: userRole === ROLES.PATIENT ? 'My Invoices' : 'Billing & Invoices', 
      icon: Receipt, 
      path: '/billing' 
    },
    { 
      id: 'enquiries', 
      label: userRole === ROLES.PATIENT ? 'Help & Enquiries' : 'Enquiries', 
      icon: MessageSquare, 
      path: '/enquiries',
      children: [
        { id: 'enquiry-follow-up', label: 'Enquiry follow up', icon: Clock, path: '/enquiry-follow-up' }
      ]
    },
  ];

  const rawManagementItems = [
    { id: 'staff', label: 'Staff & Roles', icon: UsersRound, path: '/staff' },
  ];

  // Filter based on active user role permissions:
  // If a parent item has accessible children, it should be kept visible
  // and clicking it will route to the first accessible child if the parent route itself is restricted.
  const filterMenuItems = (items) => {
    return items
      .map((item) => {
        const accessibleChildren = item.children
          ? item.children.filter((child) => canAccessRoute(child.path, userRole, currentUser))
          : [];
        const isParentDirectlyAccessible = canAccessRoute(item.path, userRole, currentUser);

        // If neither the parent nor any child is accessible, hide the menu
        if (!isParentDirectlyAccessible && accessibleChildren.length === 0) {
          return null;
        }

        const targetPath = isParentDirectlyAccessible
          ? item.path
          : (accessibleChildren[0]?.path || item.path);

        return {
          ...item,
          targetPath,
          isParentDirectlyAccessible,
          children: accessibleChildren,
        };
      })
      .filter(Boolean);
  };

  const menuItems = filterMenuItems(rawMenuItems);
  const managementItems = filterMenuItems(rawManagementItems);

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
    <nav className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isParentActive = location.pathname === item.path || (!hasChildren && item.targetPath && location.pathname === item.targetPath);
        const isAnyChildActive = hasChildren && item.children.some((c) => location.pathname === c.path);

        return (
          <div key={item.id} className="space-y-1">
            {/* Top-Level Item */}
            <NavLink
              to={item.targetPath || item.path}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={({ isActive }) => {
                const active = isActive || location.pathname === item.path || (!hasChildren && item.targetPath && location.pathname === item.targetPath);
                return `relative flex items-center justify-between px-3.5 py-2.5 transition-all duration-200 group rounded-xl ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 ring-1 ring-white/10'
                    : isAnyChildActive
                    ? 'bg-slate-800/70 text-indigo-300 font-semibold border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white font-medium'
                }`;
              }}
            >
              {({ isActive }) => {
                const active = isActive || location.pathname === item.path || (!hasChildren && item.targetPath && location.pathname === item.targetPath);
                return (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Glowing vertical pill on active */}
                      {active && (
                        <span className="w-1 h-5 rounded-full bg-white absolute left-1 shadow-sm" />
                      )}
                      <Icon className={`w-4.5 h-4.5 transition-all duration-200 shrink-0 ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400 group-hover:scale-105'
                      }`} />
                      <span className="text-sm tracking-wide truncate">{item.label}</span>
                    </div>

                    {/* Sub-item Indicator */}
                    {hasChildren && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors ${
                        active 
                          ? 'bg-white/20 text-white' 
                          : isAnyChildActive
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                      }`}>
                        {item.children.length}
                      </span>
                    )}
                  </>
                );
              }}
            </NavLink>

            {/* Elegant Tree Connected Sub-Items */}
            {hasChildren && (
              <div className="relative ml-5 pl-3.5 border-l-2 border-slate-800 space-y-1 py-0.5 my-1">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  return (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      onClick={() => {
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={({ isActive }) => `relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 group ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-200 font-bold border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium'
                      }`}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Horizontal connector tick to tree line */}
                          <span className={`absolute -left-[16px] top-1/2 -translate-y-1/2 w-2.5 h-px transition-colors ${
                            isActive ? 'bg-indigo-400' : 'bg-slate-700/80 group-hover:bg-indigo-400/80'
                          }`} />

                          {/* Branch Connector active dot */}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute -left-[18px] top-1/2 -translate-y-1/2 shadow-xs shadow-indigo-400" />
                          )}

                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800/70 text-slate-500 group-hover:text-indigo-400'
                            }`}>
                              <ChildIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{child.label}</span>
                          </div>

                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-2" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0B132B] overflow-y-auto relative">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="space-y-6 relative z-10">
        <div>
          <div className="px-3.5 mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500/90">
              {userRole === ROLES.PATIENT ? 'Patient Portal' : 'Main Menu'}
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
          </div>
          {renderNav(menuItems)}
        </div>

        {managementItems.length > 0 && (
          <div>
            <div className="px-3.5 mb-2.5 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500/90">Management</p>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
            </div>
            {renderNav(managementItems)}
          </div>
        )}
      </div>

      {/* User Card & Logout Button (Only in Mobile Drawer, hidden on desktop/large screens) */}
      <div className="md:hidden mt-6 pt-4 border-t border-slate-800/80 shrink-0 relative z-10">
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
      <aside className="hidden md:flex w-64 glass-panel h-full flex-col z-10 relative bg-slate-900 border-r border-slate-800/90 text-slate-100 shrink-0">
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-50">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C8.8 2 6.5 4.3 6.5 7.5c0 2.8 1.4 5.3 2.5 8.2.8 2.2 1.4 4.3 2.2 4.3.9 0 1.5-2.1 2.2-4.3 1.1-2.9 2.6-5.4 2.6-8.2C17.5 4.3 15.2 2 12 2zm0 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm2 10.5c-.7 1.8-1.3 3.3-1.8 3.5-.5-.2-1.1-1.7-1.8-3.5-.9-2.3-2.1-4.4-2.1-6.5 0-2.2 1.6-3.8 3.7-3.8s3.7 1.6 3.7 3.8c0 2.1-1.2 4.2-2.1 6.5z"/>
                  </svg>
                </div>
                <div>
                  <span className="font-black text-white text-base tracking-tight block leading-tight">DentalClinic</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Healthcare Suite
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
