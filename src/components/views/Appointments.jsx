import React, { useContext } from 'react';
import { Search, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { AppointmentKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';
import AppointmentForm from '../AppointmentForm';

export const Appointments = () => {
  const { setIsEditClick, isEditClick, Appointments: AppointmentsData, Patients, Doctors, setSelectedPatientData, selectedPatientData, AppointmentDelete } = useContext(ContextProvider)

  // Safely extract arrays from context (handling both direct arrays or { data: [...] } objects)
  const allAppointments = Array.isArray(AppointmentsData?.data) ? AppointmentsData.data : Array.isArray(AppointmentsData) ? AppointmentsData : [];
  const patientsList = Array.isArray(Patients?.data) ? Patients.data : Array.isArray(Patients) ? Patients : [];
  const doctorsList = Array.isArray(Doctors?.data) ? Doctors.data : Array.isArray(Doctors) ? Doctors : [];

  // Exclude all follow-up appointments so they only appear in the dedicated Follow-Up tab
  const appointmentsList = allAppointments.filter(apt => {
    const vType = (apt.visit_type || '').toLowerCase().trim();
    const sType = (apt.service || '').toLowerCase().trim();
    const isFollowUp = vType === 'follow-up' || vType === 'followup' || sType.includes('follow-up') || sType.includes('follow up');
    return !isFollowUp;
  });

  // KPI Calculations
  const total = appointmentsList.length;
  const completed = appointmentsList.filter(a => a.status === 'Completed').length;
  const pending = appointmentsList.filter(a => a.status === 'Scheduled' || a.status === 'Pending').length;

  // Name resolution helpers
  const getPatientName = (patientId) => {
    if (typeof patientId === 'object' && patientId !== null) return patientId.full_name || patientId.name || "Unknown Patient";
    const p = patientsList.find(p => p._id === patientId);
    return p ? p.full_name : patientId || 'Unknown Patient';
  };

  const getDoctorName = (doctorId) => {
    if (typeof doctorId === 'object' && doctorId !== null) return doctorId.full_name || doctorId.name || "Unknown Doctor";
    const d = doctorsList.find(d => d._id === doctorId);
    return d ? d.full_name : doctorId || 'Unknown Doctor';
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointments</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage patient appointments and overall scheduling.</p>
          </div>
          <button className="premium-button px-6 py-3 rounded-xl text-sm font-bold" onClick={() => { setIsEditClick(true); setSelectedPatientData(null); }}>
            Book appointment
          </button>
        </div>

        {/* KPI Cards (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AppointmentKpi title="Total" value={total.toString()} subtext="Appointments" icon={Clock} />
          <AppointmentKpi title="Completed" value={completed.toString()} subtext="Completed" icon={CheckCircle2} />
          <AppointmentKpi title="Pending" value={pending.toString()} subtext="Waiting pending" icon={Clock} />
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient or doctor..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                All doctors <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                All dates <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                All statuses <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Table Header & Body */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6 w-12"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" /></th>
                  <th className="py-4 px-2">Patient</th>
                  <th className="py-4 px-2">Date</th>
                  <th className="py-4 px-2">Time</th>
                  <th className="py-4 px-2">Doctor</th>
                  <th className="py-4 px-2">SERVICE</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsList.length > 0 ? (
                  appointmentsList.map((apt) => (
                    <tr key={apt._id || Math.random()} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" /></td>
                      <td className="py-4 px-2 font-bold text-slate-800">{getPatientName(apt.patient)}</td>
                      <td className="py-4 px-2 text-sm font-medium text-slate-600">
                        {apt.date ? new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-4 px-2 text-sm font-medium text-slate-600">
                        {apt.start_time || apt.starttime || 'N/A'} {(apt.end_time || apt.endtime) ? `- ${apt.end_time || apt.endtime}` : ''}
                      </td>
                      <td className="py-4 px-2 font-bold text-slate-800">Dr. {getDoctorName(apt.doctor)}</td>
                      <td className="py-4 px-2">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          {apt.service || apt.visit_type || 'Consultation'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                          {apt.status || 'Scheduled'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right flex justify-end gap-2 opacity-100">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors" onClick={() => {setIsEditClick(true), setSelectedPatientData(apt)}}>
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this appointment?")) {
                              AppointmentDelete(apt._id);
                            }
                          }}
                          className="text-white ml-5 hover:text-white text-sm font-bold bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                          <Clock className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">No appointments found</h3>
                        <p className="text-sm text-slate-500 max-w-sm">There are no appointments scheduled yet. Book a new appointment to get started.</p>
                        <button onClick={() => { setIsEditClick(true); setSelectedPatientData(null); }} className="mt-6 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm">
                          Book first appointment
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isEditClick && <AppointmentForm />}

      </div>
    </>
  );
};

