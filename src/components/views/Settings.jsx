import React from 'react';

export const Settings = () => {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Clinic Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your clinic profile and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-md border-l-4 border-blue-600">Clinic Profile</button>
          <button className="w-full text-left px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-md">Staff Management</button>
          <button className="w-full text-left px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-md">Notifications</button>
          <button className="w-full text-left px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-md">Security</button>
        </div>
        
        <div className="md:col-span-2 saas-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">General Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
              <input type="text" defaultValue="Lumina Dental Care" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" defaultValue="contact@luminadental.com" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="tel" defaultValue="(555) 123-9999" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
