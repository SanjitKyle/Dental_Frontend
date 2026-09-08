import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Stethoscope, Receipt, Package, UsersRound, Settings, Globe, FileText, Pill, Activity } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/doctors' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays, path: '/appointments' },
    { id: 'odontograms', label: 'Odontograms', icon: Activity, path: '/odontograms' },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { id: 'follow up', label: 'Follow Up', icon: CalendarDays, path: '/follow-up' },
  ];

  const managementItems = [
    { id: 'billing', label: 'Billing', icon: Receipt, path: '/billing' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
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
            className={({ isActive }) => `relative flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 group ${
              isActive 
                ? 'bg-blue-900/40 text-white font-bold border-l-4 border-blue-500' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium border-l-4 border-transparent'
            }`}
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="w-64 glass-panel h-full flex flex-col z-10 relative">
      <div className="flex-1 overflow-y-auto py-5 space-y-8 relative z-10">
        <div>
          <p className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main</p>
          {renderNav(menuItems)}
        </div>
        <div>
          <p className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Management</p>
          {renderNav(managementItems)}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
