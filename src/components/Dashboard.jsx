import React, { useContext, useMemo, useState } from 'react';
import { Calendar, FileText, UsersRound, Stethoscope, Clock, ShieldCheck, HeartPulse } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ContextProvider } from '../context/store';
import { ROLES } from '../utils/rbac';

const asList = (value) => Array.isArray(value?.data) ? value.data : Array.isArray(value) ? value : [];
const formatDate = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date unavailable';
const dateParts = (value) => { 
  const date = value && !Number.isNaN(new Date(value).getTime()) ? new Date(value) : null; 
  return date ? { day: date.getDate(), month: date.toLocaleDateString(undefined, { month: 'short' }) } : { day: '--', month: 'TBA' }; 
};
const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;

const KpiCard = ({ title, value, subtext, icon: Icon, loading, iconBg }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs min-h-[132px]">
    <div className="flex justify-between items-start gap-2">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        {loading ? <Skeleton className="h-8 w-16 mt-2" /> : <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>}
      </div>
      <div className={`p-2 rounded-xl border shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {loading ? <Skeleton className="h-3 w-24 mt-5" /> : <p className="text-[11px] font-semibold text-slate-500 mt-4 truncate">{subtext}</p>}
  </div>
);

const Panel = ({ title, children, loading }) => (
  <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
    <h2 className="text-sm font-bold text-slate-900 pb-3 mb-3 border-b border-slate-100">{title}</h2>
    {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</div> : children}
  </section>
);

const AppointmentRows = ({ appointments, patients, doctors, resolveName, emptyMessage }) => appointments.length ? (
  <div className="space-y-2">
    {appointments.map((item) => {
      const date = dateParts(item.date);
      return (
        <div key={item._id || item.id} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
          <div className="w-11 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-white text-center shadow-xs">
            <p className="bg-indigo-600 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">{date.month}</p>
            <p className="py-1 text-base font-black leading-none text-indigo-700">{date.day}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{resolveName(item.patient, patients, 'Unknown patient')}</p>
            <div className="mt-1 flex items-center gap-1.5 min-w-0">
              <span className="truncate text-[11px] font-medium text-slate-500">Dr. {resolveName(item.doctor, doctors, 'Unknown doctor')}</span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
              <span className="truncate rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">{item.service || item.visit_type || 'Consultation'}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-black text-slate-700">{item.start_time || item.starttime || 'TBA'}</p>
            <p className="mt-1 text-[10px] font-semibold text-indigo-600">{item.status || 'Scheduled'}</p>
          </div>
        </div>
      );
    })}
  </div>
) : (
  <p className="py-10 text-center text-sm text-slate-500">{emptyMessage}</p>
);

const Dashboard = ({ onAddPatient, onAddDoctor }) => {
  const { Patients, Doctors, Appointments, Prescriptions, dashboardLoading, setSelectedPatientData, userRole, currentUser } = useContext(ContextProvider);
  const [appointmentTab, setAppointmentTab] = useState('upcoming');

  const patients = asList(Patients);
  const doctors = asList(Doctors);
  const appointments = asList(Appointments);
  const prescriptions = asList(Prescriptions);

  const resolveName = (value, list, fallback) => {
    if (typeof value === 'object' && value) return value.full_name || value.name || fallback;
    return list.find((item) => String(item._id || item.id) === String(value))?.full_name || fallback;
  };

  const dashboard = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const futureAppointments = appointments
      .filter((item) => new Date(item.date || item.createdAt) >= startOfToday && String(item.status || '').toLowerCase() !== 'cancelled')
      .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));

    const isFollowUp = (item) => String(item.status || '').toLowerCase() === 'follow-up' || String(item.visit_type || '').toLowerCase() === 'follow-up';
    const upcoming = appointments
      .filter((item) => {
        const status = String(item.status || 'Scheduled').toLowerCase();
        const aptDate = new Date(item.date || item.createdAt);
        const isUpcoming = aptDate >= startOfToday; // only today or future
        return !isFollowUp(item) && isUpcoming && (status === 'scheduled' || status === 'pending');
      })
      .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
      .slice(0, 4);

    const completed = appointments
      .filter((item) => String(item.status || '').toLowerCase() === 'completed')
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 4);
    const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
    const statuses = appointments.reduce((result, item) => {
      const status = item.status || 'Scheduled';
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {});

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
      return { label: date.toLocaleDateString(undefined, { month: 'short' }), count: 0, key: `${date.getFullYear()}-${date.getMonth()}` };
    });

    appointments.forEach((item) => {
      const date = new Date(item.date || item.createdAt);
      const month = months.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (month) month.count += 1;
    });

    return { upcoming, completed, recentPatients, statuses, months };
  }, [appointments, patients]);

  const totalStatus = Math.max(appointments.length, 1);

  // Role customized headers and configurations
  const roleConfig = useMemo(() => {
    switch (userRole) {
      case ROLES.DOCTOR:
        return {
          title: `Doctor Workspace`,
          subtitle: `Welcome Dr. ${currentUser?.name || ''}. Here is your schedule and patient queue.`,
          canAddDoctor: false,
          canAddPatient: true,
          kpi1: { title: 'Assigned Patients', value: patients.length, subtext: 'Registered under clinic', icon: UsersRound, iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          kpi2: { title: 'Prescriptions Issued', value: prescriptions.length, subtext: 'Active clinical records', icon: FileText, iconBg: 'bg-purple-50 text-purple-700 border-purple-100' },
          kpi3: { title: 'Appointments Today', value: dashboard.upcoming.length, subtext: 'Scheduled consultations', icon: Calendar, iconBg: 'bg-teal-50 text-teal-700 border-teal-100' },
          kpi4: { title: 'Completed', value: dashboard.completed.length, subtext: 'Completed appointments', icon: Clock, iconBg: 'bg-amber-50 text-amber-700 border-amber-100' },
        };
      case ROLES.STAFF:
        return {
          title: `Front Desk & Operations`,
          subtitle: `Clinic operations, patient check-ins, and appointments overview.`,
          canAddDoctor: false,
          canAddPatient: true,
          kpi1: { title: 'Total Patients', value: patients.length, subtext: 'Registered clinic patients', icon: UsersRound, iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          kpi2: { title: 'Prescriptions Active', value: prescriptions.length, subtext: 'Issued medications', icon: FileText, iconBg: 'bg-purple-50 text-purple-700 border-purple-100' },
          kpi3: { title: 'Appointments', value: appointments.length, subtext: `${dashboard.upcoming.length} upcoming`, icon: Calendar, iconBg: 'bg-teal-50 text-teal-700 border-teal-100' },
          kpi4: { title: 'Completed', value: dashboard.completed.length, subtext: 'Completed appointments', icon: Clock, iconBg: 'bg-amber-50 text-amber-700 border-amber-100' },
        };
      case ROLES.PATIENT:
        return {
          title: `Patient Health Portal`,
          subtitle: `Welcome back, ${currentUser?.name || 'Patient'}! Manage your clinic visits and prescriptions.`,
          canAddDoctor: false,
          canAddPatient: false,
          kpi1: { title: 'My Appointments', value: appointments.length, subtext: 'Scheduled consultations', icon: Calendar, iconBg: 'bg-teal-50 text-teal-700 border-teal-100' },
          kpi2: { title: 'My Prescriptions', value: prescriptions.length, subtext: 'Prescribed medications', icon: FileText, iconBg: 'bg-purple-50 text-purple-700 border-purple-100' },
          kpi3: { title: 'Clinic Doctors', value: doctors.length, subtext: 'Available specialists', icon: Stethoscope, iconBg: 'bg-slate-50 text-slate-700 border-slate-200' },
          kpi4: { title: 'Care Status', value: 'Active', subtext: 'Healthcare coverage verified', icon: ShieldCheck, iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        };
      case ROLES.ADMIN:
      default:
        return {
          title: `Clinic Dashboard`,
          subtitle: `A live administrative view of your clinic records, doctors, and schedule.`,
          canAddDoctor: true,
          canAddPatient: true,
          kpi1: { title: 'Doctors', value: doctors.length, subtext: 'Registered medical staff', icon: Stethoscope, iconBg: 'bg-slate-50 text-slate-700 border-slate-200' },
          kpi2: { title: 'Prescriptions', value: prescriptions.length, subtext: 'All prescription records', icon: FileText, iconBg: 'bg-purple-50 text-purple-700 border-purple-100' },
          kpi3: { title: 'Appointments', value: appointments.length, subtext: `${dashboard.statuses.Scheduled || 0} scheduled`, icon: Calendar, iconBg: 'bg-teal-50 text-teal-700 border-teal-100' },
          kpi4: { title: 'Patients', value: patients.length, subtext: 'Registered patients', icon: UsersRound, iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
        };
    }
  }, [userRole, currentUser, doctors.length, prescriptions.length, appointments.length, patients.length, dashboard]);

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header with dynamic role-based controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {roleConfig.title}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            {roleConfig.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {roleConfig.canAddDoctor && (
            <button 
              onClick={onAddDoctor} 
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            >
              Add Doctor
            </button>
          )}
          {roleConfig.canAddPatient && (
            <button 
              onClick={() => { setSelectedPatientData(null); onAddPatient(); }} 
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-xs shadow-indigo-600/20"
            >
              Add Patient
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards adapted for the role */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard title={roleConfig.kpi1.title} value={roleConfig.kpi1.value} subtext={roleConfig.kpi1.subtext} icon={roleConfig.kpi1.icon} loading={dashboardLoading} iconBg={roleConfig.kpi1.iconBg} />
        <KpiCard title={roleConfig.kpi2.title} value={roleConfig.kpi2.value} subtext={roleConfig.kpi2.subtext} icon={roleConfig.kpi2.icon} loading={dashboardLoading} iconBg={roleConfig.kpi2.iconBg} />
        <KpiCard title={roleConfig.kpi3.title} value={roleConfig.kpi3.value} subtext={roleConfig.kpi3.subtext} icon={roleConfig.kpi3.icon} loading={dashboardLoading} iconBg={roleConfig.kpi3.iconBg} />
        <KpiCard title={roleConfig.kpi4.title} value={roleConfig.kpi4.value} subtext={roleConfig.kpi4.subtext} icon={roleConfig.kpi4.icon} loading={dashboardLoading} iconBg={roleConfig.kpi4.iconBg} />
      </div>

      {/* Activity and Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Appointment Status" loading={dashboardLoading}>
          {Object.keys(dashboard.statuses).length ? (
            <div className="space-y-4">
              {Object.entries(dashboard.statuses).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(count / totalStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No appointment statuses yet.</p>
          )}
        </Panel>

        <Panel title="Appointment Trends" loading={dashboardLoading}>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.months} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="appointmentActivityFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip cursor={{ stroke: '#0d9488', strokeWidth: 1 }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(value) => [value, 'Appointments']} />
                <Area type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2.5} fill="url(#appointmentActivityFill)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Appointment Tab List and Recent Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
            <h2 className="text-sm font-bold text-slate-900">Appointments</h2>
            <div className="flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Appointments">
              <button 
                type="button" 
                role="tab" 
                aria-selected={appointmentTab === 'upcoming'} 
                onClick={() => setAppointmentTab('upcoming')} 
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${appointmentTab === 'upcoming' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Upcoming ({dashboard.upcoming.length})
              </button>
              <button 
                type="button" 
                role="tab" 
                aria-selected={appointmentTab === 'completed'} 
                onClick={() => setAppointmentTab('completed')} 
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${appointmentTab === 'completed' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Completed ({dashboard.completed.length})
              </button>
            </div>
          </div>
          {dashboardLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
          ) : (
            <AppointmentRows 
              appointments={appointmentTab === 'upcoming' ? dashboard.upcoming : dashboard.completed} 
              patients={patients} 
              doctors={doctors} 
              resolveName={resolveName} 
              emptyMessage={appointmentTab === 'upcoming' ? 'No upcoming appointments.' : 'No completed appointments.'} 
            />
          )}
        </section>

        <Panel title="Recent Patients" loading={dashboardLoading}>
          {dashboard.recentPatients.length ? (
            <div className="space-y-2">
              {dashboard.recentPatients.map((patient, index) => (
                <div key={patient._id || patient.id} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black ring-2 ring-white shadow-xs ${index % 2 ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {(patient.full_name || 'P').split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.full_name || 'Unnamed patient'}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500 truncate">{patient.phone || 'No phone number'}</p>
                  </div>
                  <div className="shrink-0 rounded-lg bg-white px-2 py-1 text-right border border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Added</p>
                    <p className="text-[11px] font-black text-slate-600">{formatDate(patient.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">No patients registered yet.</p>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;
