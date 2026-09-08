import React from 'react';
import { User, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PopupModel({ onLogout }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };
  return (
    <div className="absolute right-[20px] top-12 w-64 bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden z-[9999] transition-all duration-300 ease-out">
      {/* User Header Info */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            US
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">User Name</span>
            <span className="text-xs text-gray-500 font-medium">admin@hospital.com</span>
          </div>
        </div>
      </div>

      <div className="p-2 flex flex-col gap-1">
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50/80 group transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-100/50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <User size={16} strokeWidth={2.5} />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors text-sm">View Profile</span>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </button>

        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-purple-50/80 group transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-purple-100/50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Settings size={16} strokeWidth={2.5} />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors text-sm">Settings</span>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
        </button>
      </div>
      
      <div className="p-2 border-t border-gray-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 group transition-all duration-200 cursor-pointer">
          <div className="p-1.5 rounded-lg bg-red-100/50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
             <LogOut size={16} strokeWidth={2.5} />
          </div>
          <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default PopupModel;
