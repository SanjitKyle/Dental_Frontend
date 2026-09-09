import React, { useContext } from 'react';
import { Calendar, Users, DollarSign, AlertTriangle, FileText, Wallet, ArrowRight, CalendarDays, UsersRound, Activity, Stethoscope } from 'lucide-react';
import { ContextProvider } from '../context/store';

const KpiCard = ({ title, value, subtext, icon: Icon, percentage, trendUp, barColor, isMoney, iconBg }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group shadow-xs hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{title}</p>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-baseline gap-1 truncate">
          {isMoney && <span className="text-xs sm:text-sm text-slate-500 font-semibold">$</span>}
          {value}
        </h3>
      </div>
      <div className={`p-2 rounded-xl border shrink-0 ${iconBg || 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
    
    <div>
      {percentage && barColor ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-slate-500 truncate">{subtext}</span>
            <span className={trendUp ? 'text-blue-700 font-extrabold' : 'text-emerald-700 font-extrabold'}>{percentage}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: percentage }}></div>
          </div>
        </div>
      ) : (
        <p className="text-[11px] font-semibold text-slate-500 truncate">{subtext}</p>
      )}
    </div>
  </div>
);

const EmptyBox = ({ title, icon: Icon, message }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col h-44 sm:h-48 shadow-xs">
    <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h3>
      <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 uppercase tracking-wider">
        View All <ArrowRight className="w-3 h-3" />
      </button>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
      {Icon && (
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200/80">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
      )}
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  </div>
);

const ChartPlaceholder = ({ title, subtitle, rightElement, height = 'h-48' }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
    <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{subtitle}</p>}
      </div>
      {rightElement}
    </div>
    <div className={`${height} flex items-end pb-4 px-2 relative bg-slate-50/50 rounded-xl border border-dashed border-slate-200 overflow-hidden`}>
      {title.includes('Activity') && (
        <div className="absolute bottom-2 left-0 w-full flex justify-between text-[8px] sm:text-[9px] font-bold text-slate-400 px-3 sm:px-6 uppercase">
          <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span>
          <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
        </div>
      )}
      {title.includes('Activity') && (
         <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-[8px] sm:text-[9px] font-bold text-slate-400 py-3 sm:py-4">
          <span>4</span><span>3</span><span>2</span><span>1</span><span>0</span>
        </div>
      )}
    </div>
  </div>
);

const Dashboard = ({ onAddPatient, onAddDoctor }) => {
  const { Patients, Doctors, Appointments, setSelectedPatientData } = useContext(ContextProvider);

  const patientsList = Array.isArray(Patients) ? Patients : (Patients?.data || []);
  const doctorsList = Array.isArray(Doctors) ? Doctors : (Doctors?.data || []);
  const appointmentsList = Array.isArray(Appointments) ? Appointments : (Appointments?.data || []);

  const totalPatients = patientsList.length;
  const totalDoctors = doctorsList.length;
  const totalAppointments = appointmentsList.length;

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Welcome Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Good Morning, Dr. Smith
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Here's what's happening at your clinic today.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={onAddDoctor} className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider transition-all shadow-xs text-center cursor-pointer">
            Add Doctor
          </button>
          <button onClick={() => { setSelectedPatientData(null); onAddPatient(); }} className="flex-1 sm:flex-none px-3.5 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs shadow-indigo-600/20 text-center cursor-pointer">
            Add Patient
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard title="DOCTORS" value={totalDoctors} subtext="Active staff" icon={Stethoscope} percentage="100%" trendUp={true} barColor="bg-blue-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
        <KpiCard title="PRESCRIPTIONS" value="0" subtext="Fill rate" icon={FileText} percentage="0%" trendUp={true} barColor="bg-purple-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
        <KpiCard title="APPOINTMENTS" value={totalAppointments} subtext="Attendance" icon={Calendar} percentage="100%" trendUp={true} barColor="bg-teal-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
        <KpiCard title="PATIENTS" value={totalPatients} subtext="Registered" icon={Users} percentage="100%" trendUp={true} barColor="bg-indigo-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder 
          title="Revenue Overview" 
          subtitle="Monthly revenue (paid invoices)"
          rightElement={<button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors">View Details</button>}
          height="h-40"
        />
        <ChartPlaceholder 
          title="Appointment Status" 
          subtitle="Distribution of appointment statuses."
          height="h-40"
        />
      </div>

      {/* Bottom Row Activity Chart */}
      <div>
        <ChartPlaceholder 
          title="Activity (Appointments)" 
          subtitle="Appointments per month — last 12 months."
          height="h-48"
        />
      </div>

      {/* Bottom Row Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EmptyBox title="Recent Appointments" icon={CalendarDays} message="No appointments yet." />
        <EmptyBox title="Recent Patients" icon={UsersRound} message="No patients yet." />
        <EmptyBox title="Recent Unpaid Invoices" message="No unpaid invoices" />
      </div>
    </div>
  );
};

export default Dashboard;
