import React from 'react';

export const PatientKpi = ({ title, value, subtext, icon: Icon, percentage, trendUp }) => (
  <div className="saas-card p-6 flex flex-col justify-between relative group">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-white/0 to-indigo-100/40 rounded-full blur-xl group-hover:bg-indigo-100/60 transition-colors duration-500" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{value}</h3>
      <div className="flex justify-between items-end">
        <p className="text-xs font-semibold text-slate-500">{subtext}</p>
        {percentage && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
            {trendUp ? '↑' : ''} {percentage}%
          </span>
        )}
      </div>
    </div>
  </div>
);

export const AppointmentKpi = ({ title, value, subtext, icon: Icon }) => (
  <div className="saas-card p-6 flex flex-col justify-between relative group">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-white/0 to-indigo-100/40 rounded-full blur-xl group-hover:bg-indigo-100/60 transition-colors duration-500" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{value}</h3>
      <p className="text-xs font-semibold text-slate-500">{subtext}</p>
    </div>
  </div>
);
