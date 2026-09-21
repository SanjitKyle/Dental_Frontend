import React, { useContext, useState } from 'react';
import { Menu } from 'lucide-react';
import PopupModel from './logoutpop';
import { ContextProvider } from '../context/store';
import { ROLE_DETAILS } from '../utils/rbac';

const Header = ({ onLogout, onToggleMobileSidebar }) => {
  const [isOpen, setOpen] = useState(false);
  const { currentUser, userRole } = useContext(ContextProvider);

  const roleMeta = ROLE_DETAILS[userRole] || { label: userRole || 'User', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  const displayName = currentUser?.name || currentUser?.fullName || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 glass-header relative flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center">
        <button 
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all md:hidden mr-2 cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo Section */}
        <div className="flex items-center gap-3 pr-6 border-r border-slate-300 h-8">
          <div className="w-8 h-8 bg-blue-800 rounded-sm flex items-center justify-center">
            <span className="text-white font-black text-xl leading-none">C</span>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">Dental Clinic</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${roleMeta.badgeClass}`}>
          {roleMeta.label}
        </span>

        {/* Avatar and user button */}
        <div 
          className="flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer select-none"
          onClick={() => setOpen(!isOpen)}
        >
          <div className="flex flex-col text-right hidden md:block">
            <span className="text-xs font-bold text-slate-800 leading-tight capitalize">{displayName}</span>
            <span className="text-[10px] font-medium text-slate-400 capitalize">{roleMeta.label}</span>
          </div>
          <div className="relative group">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl flex items-center justify-center font-black text-xs hover:bg-indigo-100 transition-colors shadow-xs">
              {initials}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998] cursor-default" 
            onClick={() => setOpen(false)} 
          />
          <PopupModel onLogout={onLogout} onClose={() => setOpen(false)} />
        </>
      )}
    </header>
  );
};

export default Header;
