import React, { useContext, useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PopupModel from './logoutpop';
import { ContextProvider } from '../context/store';
import { ROLES } from '../utils/rbac';

const Header = ({ onLogout, onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useContext(ContextProvider);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role details with distinct colors and glowing status dots
  const ROLE_CONFIG = {
    [ROLES.ADMIN]: {
      label: 'Admin',
      sublabel: 'System Administrator',
      badgeClass: 'bg-violet-50 text-violet-700 border-violet-200/80',
      dotClass: 'bg-violet-500 shadow-sm shadow-violet-500/50',
    },
    [ROLES.DOCTOR]: {
      label: 'Doctor',
      sublabel: 'Specialist Physician',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotClass: 'bg-emerald-500 shadow-sm shadow-emerald-500/50',
    },
    [ROLES.STAFF]: {
      label: 'Staff',
      sublabel: 'Clinic Operations',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
      dotClass: 'bg-sky-500 shadow-sm shadow-sky-500/50',
    },
    [ROLES.PATIENT]: {
      label: 'Patient',
      sublabel: 'Patient Portal',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dotClass: 'bg-indigo-500 shadow-sm shadow-indigo-500/50',
    },
  };

  const roleMeta = ROLE_CONFIG[userRole] || {
    label: userRole || 'User',
    sublabel: 'Member',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  };

  const displayName = currentUser?.name || currentUser?.fullName || 'Clinic User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 px-4 sm:px-6 sticky top-0 z-30 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
      {/* ========================================================================= */}
      {/* LEFT: Mobile Toggle + Modern Brand Logo                                    */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all md:hidden cursor-pointer border border-transparent hover:border-indigo-100"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Mark */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none pr-3 sm:pr-6 border-r border-slate-200/80 h-9"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-600/40">
              {/* Dental Tooth SVG Vector */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.8 2 6.5 4.3 6.5 7.5c0 2.8 1.4 5.3 2.5 8.2.8 2.2 1.4 4.3 2.2 4.3.9 0 1.5-2.1 2.2-4.3 1.1-2.9 2.6-5.4 2.6-8.2C17.5 4.3 15.2 2 12 2zm0 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm2 10.5c-.7 1.8-1.3 3.3-1.8 3.5-.5-.2-1.1-1.7-1.8-3.5-.9-2.3-2.1-4.4-2.1-6.5 0-2.2 1.6-3.8 3.7-3.8s3.7 1.6 3.7 3.8c0 2.1-1.2 4.2-2.1 6.5z"/>
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
              Dental<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Clinic</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-none mt-1">
              Healthcare Suite
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT: Elevated User Profile Card                                          */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div ref={profileContainerRef} className="relative">
          <div 
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 sm:pl-3 sm:pr-2 rounded-2xl hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all duration-200 cursor-pointer select-none group shadow-xs"
          >
            {/* Distinct Role Badge */}
            <div className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider border ${roleMeta.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dotClass}`} />
              {roleMeta.label}
            </div>

            {/* User Name & Details */}
            <div className="flex flex-col text-right hidden md:block leading-tight">
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[130px] capitalize">
                {displayName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 capitalize">
                {roleMeta.sublabel}
              </span>
            </div>

            {/* Avatar with Online Pulse */}
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-600/20 ring-2 ring-white">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* Smooth Chevron Indicator */}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* User Profile Modal Drawer */}
          {isProfileOpen && (
            <PopupModel onLogout={onLogout} onClose={() => setIsProfileOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
