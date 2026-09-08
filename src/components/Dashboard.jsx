import React, { useContext } from 'react';
import { Calendar, Users, DollarSign, AlertTriangle, FileText, Wallet, ArrowRight, CalendarDays, UsersRound, Activity, Stethoscope } from 'lucide-react';
import { ContextProvider } from '../context/store';

const KpiCard = ({ title, value, subtext, icon: Icon, percentage, trendUp, barColor, isMoney, iconBg }) => (
  <div className="bg-white border border-slate-300 p-5 flex flex-col justify-between group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-baseline gap-1">
          {isMoney && <span className="text-sm text-slate-500 font-semibold">$</span>}
          {value}
        </h3>
      </div>
      <div className={`p-2 border ${iconBg || 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    
    <div>
      {percentage && barColor ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">{subtext}</span>
            <span className={trendUp ? 'text-blue-700' : 'text-emerald-700'}>{percentage}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 overflow-hidden">
            <div className={`h-1.5 ${barColor}`} style={{ width: percentage }}></div>
          </div>
        </div>
      ) : (
        <p className="text-xs font-semibold text-slate-500">{subtext}</p>
      )}
    </div>
  </div>
);

const EmptyBox = ({ title, icon: Icon, message }) => (
  <div className="bg-white border border-slate-300 p-4 flex flex-col h-48">
    <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <button className="text-[10px] font-bold text-blue-700 flex items-center gap-1 hover:text-blue-800 uppercase tracking-wider">
        View All <ArrowRight className="w-3 h-3" />
      </button>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
      {Icon && (
        <div className="w-8 h-8 bg-slate-100 flex items-center justify-center border border-slate-200">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
      )}
      <p className="text-xs font-medium">{message}</p>
    </div>
  </div>
);

const ChartPlaceholder = ({ title, subtitle, rightElement, height = 'h-48' }) => (
  <div className="bg-white border border-slate-300 p-4">
    <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-2">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{subtitle}</p>}
      </div>
      {rightElement}
    </div>
    <div className={`${height} flex items-end pb-4 px-2 relative bg-slate-50 border border-dashed border-slate-300`}>
      {title.includes('Activity') && (
        <div className="absolute bottom-2 left-0 w-full flex justify-between text-[9px] font-bold text-slate-400 px-6 uppercase">
          <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span>
          <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
        </div>
      )}
      {title.includes('Activity') && (
         <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-[9px] font-bold text-slate-400 py-4">
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Welcome Section */}
      <div className="bg-white border border-slate-300 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Good Morning, Dr. Smith
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mt-1">Here's what's happening at your clinic today.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={onAddDoctor} className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
            Add Doctor
          </button>
          <button onClick={() => { setSelectedPatientData(null); onAddPatient(); }} className="px-4 py-2 bg-blue-700 border border-blue-800 text-white hover:bg-blue-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
            Add Patient
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="TOTAL REVENUE" value="0.00" subtext="No revenue yet" icon={DollarSign} isMoney={true} iconBg="bg-emerald-50 text-emerald-700 border-emerald-200" />
        <KpiCard title="TOTAL EXPENSES" value="0.00" subtext="No expenses yet" icon={Wallet} isMoney={true} iconBg="bg-rose-50 text-rose-700 border-rose-200" />
        <KpiCard title="NET INCOME" value="0.00" subtext="Net balance" icon={DollarSign} isMoney={true} iconBg="bg-blue-50 text-blue-700 border-blue-200" />
        <KpiCard title="OUTSTANDING INVOICES" value="0" subtext="No unpaid invoices" icon={AlertTriangle} iconBg="bg-amber-50 text-amber-700 border-amber-200" />
        
        <KpiCard title="DOCTORS" value={totalDoctors} subtext="Active medical staff" icon={Stethoscope} percentage="100%" trendUp={true} barColor="bg-blue-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
        <KpiCard title="PRESCRIPTIONS" value="0" subtext="Prescription fill rate" icon={FileText} percentage="0%" trendUp={true} barColor="bg-purple-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
        <KpiCard title="APPOINTMENTS" value={totalAppointments} subtext="Attendance rate" icon={Calendar} percentage="100%" trendUp={true} barColor="bg-teal-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
        <KpiCard title="PATIENTS" value={totalPatients} subtext="Total registered patients" icon={Users} percentage="100%" trendUp={true} barColor="bg-indigo-600" iconBg="bg-slate-50 text-slate-700 border-slate-200" />
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
