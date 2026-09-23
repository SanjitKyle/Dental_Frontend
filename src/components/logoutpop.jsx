import React, { useContext } from 'react';
import { User, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContextProvider } from '../context/store';
import { ROLE_DETAILS } from '../utils/rbac';

function PopupModel({ onLogout, onClose }) {
  const navigate = useNavigate();
  const { currentUser, userRole, setUser, setIsAuthenticated } = useContext(ContextProvider);

  const displayName = currentUser?.name || currentUser?.fullName || 'Clinic User';
  const email = currentUser?.email || 'user@dentalclinic.com';
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleMeta = ROLE_DETAILS[userRole] || { label: userRole || 'User', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      localStorage.removeItem("user");
      if (setUser) setUser(null);
      if (setIsAuthenticated) setIsAuthenticated(false);
      if (onLogout) onLogout();
      if (onClose) onClose();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div 
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden z-[9999] transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
    >
      {/* User Header Info */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/25 shrink-0 ring-2 ring-white">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm truncate capitalize">{displayName}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium truncate">{email}</span>
            <span className={`inline-block mt-1 w-fit text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${roleMeta.badgeClass}`}>
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2 flex flex-col gap-1">
        <button 
          onClick={() => { if (onClose) onClose(); navigate('/dashboard'); }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 group transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <User size={16} strokeWidth={2.5} />
            </div>
            <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors text-xs">Dashboard</span>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </button>

        {userRole === 'admin' && (
          <button 
            onClick={() => { if (onClose) onClose(); navigate('/settings'); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Settings size={16} strokeWidth={2.5} />
              </div>
              <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors text-xs">Clinic Settings</span>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        )}
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50/50">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 group transition-colors cursor-pointer font-bold text-xs"
        >
          <div className="p-1.5 rounded-lg bg-red-100/60 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <LogOut size={16} strokeWidth={2.5} />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default PopupModel;
