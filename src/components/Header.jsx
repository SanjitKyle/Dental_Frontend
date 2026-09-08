import React, { useState } from 'react';
import { Menu, Eye, Bell, Moon, Maximize, ChevronDown } from 'lucide-react';
import PopupModel from './logoutpop';

const Header = ({ onLogout }) => {
  const [isOpen, setOpen] = useState(false);
  function handleOpen(e) {
    setOpen(!isOpen)
  }

  return (
    <header className="h-14 glass-header relative flex items-center justify-between px-6 sticky top-0 z-20 w-full">
      <div className="flex items-center">
        <button className="text-slate-500 hover:text-blue-700 transition-colors md:hidden mr-4">
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

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-300" onClick={(e) => handleOpen(e)}>
          <div className="relative group cursor-pointer">
            <div className="relative w-9 h-9 bg-slate-100 rounded-sm flex items-center justify-center overflow-hidden border border-slate-300 hover:bg-slate-200 transition-colors">
              <span className="text-sm font-black text-slate-800">SJ</span>
            </div>
          </div>
        </div>
      </div>
      {isOpen&& <PopupModel onLogout={onLogout} />}
    </header>
  );
};

export default Header;
