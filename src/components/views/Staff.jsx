import React, { useMemo, useState } from 'react';
import { BriefcaseBusiness, KeyRound, Search, ShieldCheck, UserCheck, UsersRound } from 'lucide-react';

const DEMO_STAFF = [
  { id: 1, name: 'Maya Kapoor', role: 'Clinic Administrator', department: 'Operations', phone: '+91 98765 21001', email: 'maya.kapoor@clinic.test', status: 'Active', shift: '09:00 - 18:00', access: 'Administrator', permissions: ['Staff & roles', 'Doctors', 'Appointments', 'Reports'] },
  { id: 2, name: 'Rohan Mehta', role: 'Senior Dental Assistant', department: 'Clinical', phone: '+91 98765 21002', email: 'rohan.mehta@clinic.test', status: 'Active', shift: '10:00 - 19:00', access: 'Clinical', permissions: ['Patients', 'Appointments', 'Odontograms'] },
  { id: 3, name: 'Priya Shah', role: 'Front Desk Executive', department: 'Reception', phone: '+91 98765 21003', email: 'priya.shah@clinic.test', status: 'Active', shift: '08:30 - 17:30', access: 'Reception', permissions: ['Patients', 'Appointments', 'Follow-ups'] },
  { id: 4, name: 'Arjun Nair', role: 'Dental Lab Technician', department: 'Laboratory', phone: '+91 98765 21004', email: 'arjun.nair@clinic.test', status: 'On Leave', shift: '09:00 - 18:00', access: 'Limited Clinical', permissions: ['Odontograms', 'Treatment plans'] },
  { id: 5, name: 'Neha Singh', role: 'Accounts Coordinator', department: 'Accounts', phone: '+91 98765 21005', email: 'neha.singh@clinic.test', status: 'Active', shift: '09:30 - 18:30', access: 'Accounts', permissions: ['Patient records', 'Reports'] }
];

const accessTone = {
  Administrator: 'border-violet-200 bg-violet-50 text-violet-700',
  Clinical: 'border-teal-200 bg-teal-50 text-teal-700',
  Reception: 'border-sky-200 bg-sky-50 text-sky-700',
  'Limited Clinical': 'border-amber-200 bg-amber-50 text-amber-700',
  Accounts: 'border-slate-200 bg-slate-100 text-slate-700'
};

export const Staff = () => {
  const [query, setQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState('ALL');
  const accessLevels = [...new Set(DEMO_STAFF.map((person) => person.access))];
  const filteredStaff = useMemo(() => {
    const term = query.trim().toLowerCase();
    return DEMO_STAFF.filter((person) => {
      const matchesSearch = !term || [person.name, person.role, person.department, person.phone, person.email, person.access, ...person.permissions].some((value) => value.toLowerCase().includes(term));
      return matchesSearch && (accessFilter === 'ALL' || person.access === accessFilter);
    });
  }, [query, accessFilter]);
  const activeCount = DEMO_STAFF.filter((person) => person.status === 'Active').length;
  const privilegedCount = DEMO_STAFF.filter((person) => person.access === 'Administrator' || person.access === 'Clinical').length;

  return <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
    <section className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-cyan-600"><div><h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">Staff & Access</h1><p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Demo clinic workforce, shift coverage, and role permissions.</p></div><span className="inline-flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800"><BriefcaseBusiness className="w-4 h-4" /> Demo data</span></section>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"><Metric title="Team members" value={DEMO_STAFF.length} caption="Listed demo records" icon={UsersRound} color="text-cyan-600" /><Metric title="Active staff" value={activeCount} caption="Available team members" icon={UserCheck} color="text-emerald-600" /><Metric title="Clinical access" value={privilegedCount} caption="Admin or clinical roles" icon={ShieldCheck} color="text-violet-600" /></div>
    <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs ring-1 ring-slate-100/70"><div className="p-3 sm:p-4 border-b border-slate-200/80 bg-slate-50/80 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"><div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff, role, access, or permission..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none shadow-xs focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20" /></div><select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20"><option value="ALL">All access levels</option>{accessLevels.map((level) => <option key={level} value={level}>{level}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3.5">Staff member</th><th className="px-5 py-3.5">Department</th><th className="px-5 py-3.5">Shift</th><th className="px-5 py-3.5">Access level</th><th className="px-5 py-3.5">Key permissions</th><th className="px-5 py-3.5">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStaff.map((person) => <tr key={person.id} className="hover:bg-cyan-50/30"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-xs font-black text-cyan-800">{person.name.split(' ').map((part) => part[0]).join('')}</div><div><p className="font-bold text-slate-900">{person.name}</p><p className="text-xs font-medium text-slate-500">{person.role}</p><p className="text-[11px] text-slate-400">{person.email}</p></div></div></td><td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{person.department}</span></td><td className="px-5 py-4"><p className="text-sm font-bold text-slate-700">{person.shift}</p><p className="text-[11px] font-medium text-slate-400">Clinic local time</p></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${accessTone[person.access]}`}><KeyRound className="w-3 h-3" />{person.access}</span></td><td className="px-5 py-4"><div className="flex max-w-[250px] flex-wrap gap-1">{person.permissions.map((permission) => <span key={permission} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">{permission}</span>)}</div></td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${person.status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{person.status}</span></td></tr>)}{filteredStaff.length === 0 && <tr><td colSpan="6" className="px-5 py-14 text-center text-sm font-medium text-slate-500">No staff members match this search or access level.</td></tr>}</tbody></table></div></section>
  </div>;
};

const Metric = ({ title, value, caption, icon: Icon, color }) => <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p><Icon className={`w-5 h-5 ${color}`} /></div><p className="mt-4 text-3xl font-black text-slate-900">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{caption}</p></section>;
