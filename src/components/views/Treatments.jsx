import React from 'react';
import { Clock } from 'lucide-react';

export const Treatments = () => {
  const treatments = [
    { name: 'Root Canal Therapy', duration: '60-90 mins', cost: '$800 - $1500', category: 'Endodontics' },
    { name: 'Teeth Whitening', duration: '45-60 mins', cost: '$300 - $500', category: 'Cosmetic' },
    { name: 'Dental Implant', duration: '120 mins', cost: '$3000 - $4500', category: 'Surgery' },
    { name: 'Routine Cleaning', duration: '30-45 mins', cost: '$100 - $200', category: 'Preventive' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Treatment Catalog</h2>
          <p className="text-sm text-slate-500 mt-1">Standard procedures and pricing guidelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {treatments.map((t, i) => (
          <div key={i} className="saas-card p-5 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 block">{t.category}</span>
              <h3 className="font-bold text-lg text-slate-800">{t.name}</h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {t.duration}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-sm text-slate-400 font-medium mb-1">Est. Cost</span>
              <span className="font-bold text-emerald-600 text-lg">{t.cost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
