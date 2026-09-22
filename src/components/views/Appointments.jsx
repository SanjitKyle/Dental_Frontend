import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Clock, CheckCircle2, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { AppointmentKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';
import AppointmentForm from '../AppointmentForm';
import { DataPageSkeleton } from '../DataPageSkeleton';

export const Appointments = () => {
  const navigate = useNavigate();
  const { setIsEditClick, isEditClick, Appointments: AppointmentsData, Patients, Doctors, setSelectedPatientData, selectedPatientData, AppointmentDelete, loading, hasPermission } = useContext(ContextProvider);

  const canCreateAppointment = hasPermission ? hasPermission('CREATE_APPOINTMENT') : true;
  const canEditAppointment = hasPermission ? hasPermission('EDIT_APPOINTMENT') : true;
  const canCancelAppointment = hasPermission ? hasPermission('CANCEL_APPOINTMENT') : true;

  const [searchValue, setSearchValue] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  if (loading?.appointments) return <DataPageSkeleton kpis={3} />;

  // Safely extract arrays from context (handling both direct arrays or { data: [...] } objects)
  const allAppointments = Array.isArray(AppointmentsData?.data) ? AppointmentsData.data : Array.isArray(AppointmentsData) ? AppointmentsData : [];
  const patientsList = Array.isArray(Patients?.data) ? Patients.data : Array.isArray(Patients) ? Patients : [];
  const doctorsList = Array.isArray(Doctors?.data) ? Doctors.data : Array.isArray(Doctors) ? Doctors : [];

  // Exclude all follow-up appointments so they only appear in the dedicated Follow-Up tab
  const appointmentsList = allAppointments.filter(apt => {
    const vType = (apt.visit_type || '').toLowerCase().trim();
    const sType = (apt.status || '').toLowerCase().trim();
    const isFollowUp = sType === 'follow-up' ;
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

  const doctorOptions = [...new Map(doctorsList.map((doctor) => [String(doctor._id || doctor.id), doctor])).values()];
  const appointmentStatuses = [...new Set(appointmentsList.map((appointment) => appointment.status || 'Scheduled'))].sort();
  const filteredAppointments = appointmentsList.filter((appointment) => {
    const patientName = getPatientName(appointment.patient).toLowerCase();
    const doctorName = getDoctorName(appointment.doctor).toLowerCase();
    const service = String(appointment.service || appointment.visit_type || '').toLowerCase();
    const search = searchValue.toLowerCase().trim();
    const doctorId = typeof appointment.doctor === 'object' ? appointment.doctor?._id || appointment.doctor?.id : appointment.doctor;
    const appointmentDate = appointment.date ? new Date(appointment.date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchesDate = dateFilter === 'ALL' || (appointmentDate && (
      (dateFilter === 'TODAY' && appointmentDate.toDateString() === today.toDateString()) ||
      (dateFilter === 'UPCOMING' && appointmentDate >= today) ||
      (dateFilter === 'PAST' && appointmentDate < today)
    ));
    return (!search || patientName.includes(search) || doctorName.includes(search) || service.includes(search)) &&
      (doctorFilter === 'ALL' || String(doctorId) === doctorFilter) &&
      matchesDate &&
      (statusFilter === 'ALL' || String(appointment.status || 'Scheduled') === statusFilter);
  });

  return (
    <>
      <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-amber-500">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Appointments</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Manage patient appointments and overall scheduling.</p>
          </div>
          {canCreateAppointment && (
            <button 
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs shadow-indigo-600/20 text-center cursor-pointer whitespace-nowrap"
              onClick={() => { setIsEditClick(true); setSelectedPatientData(null); }}
            >
              Book appointment
            </button>
          )}
        </div>

        {/* KPI Cards (3-cols on all screens including mobile) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <AppointmentKpi title="Total" value={total.toString()} subtext="Appts" icon={Clock} />
          <AppointmentKpi title="Completed" value={completed.toString()} subtext="Done" icon={CheckCircle2} />
          <AppointmentKpi title="Pending" value={pending.toString()} subtext="Waiting" icon={Clock} />
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col min-h-[400px] ring-1 ring-slate-100/70">
          {/* Toolbar */}
          <div className="p-3 sm:p-4 border-b border-slate-200/80 flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between bg-slate-50/80">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient or doctor..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider shadow-xs whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="ALL">All Doctors</option>{doctorOptions.map((doctor) => <option key={doctor._id || doctor.id} value={doctor._id || doctor.id}>{doctor.full_name || doctor.name}</option>)}</select>
              <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider shadow-xs whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="ALL">All Dates</option><option value="TODAY">Today</option><option value="UPCOMING">Upcoming</option><option value="PAST">Past</option></select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider shadow-xs whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="ALL">All Statuses</option>{appointmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            </div>
          </div>

          {/* 1. Mobile List (< 768px) - Clean List with Avatar, Patient Name, Subtitle & Chevron */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => {
                const patName = getPatientName(apt.patient);
                const docName = getDoctorName(apt.doctor);
                const initials = patName ? patName.substring(0, 2).toUpperCase() : "AP";
                const dateStr = apt.date ? new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                const timeStr = apt.start_time || apt.starttime || '';

                return (
                  <div
                    key={apt._id || Math.random()}
                    onClick={() => navigate(`/appointments/${apt._id || apt.id}`, { state: { appointment: apt } })}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 active:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm capitalize truncate group-hover:text-indigo-600 transition-colors">
                          {patName}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Dr. {docName} {dateStr && `• ${dateStr}`} {timeStr && `• ${timeStr}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center p-4">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">No appointments found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">There are no appointments scheduled yet.</p>
                <button 
                  onClick={() => { setIsEditClick(true); setSelectedPatientData(null); }} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Book appointment
                </button>
              </div>
            )}
          </div>

          {/* 2. Desktop Table Header & Body (Hidden on mobile < 768px, visible on md+) */}
          <div className="hidden md:block overflow-x-auto flex-1">
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
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => {
                    const patName = getPatientName(apt.patient);
                    const initials = patName ? patName.substring(0, 2).toUpperCase() : 'AP';

                    return (
                      <tr key={apt._id || Math.random()} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" /></td>
                        <td className="py-4 px-2">
                          <div 
                            className="flex items-center gap-2.5 cursor-pointer group/item"
                            onClick={() => navigate(`/appointments/${apt._id || apt.id}`, { state: { appointment: apt } })}
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-800 group-hover/item:text-indigo-600 transition-colors capitalize">{patName}</span>
                          </div>
                        </td>
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
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100">
                            <button 
                              className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors rounded-lg cursor-pointer"
                              title="View Appointment Details"
                              onClick={() => navigate(`/appointments/${apt._id || apt.id}`, { state: { appointment: apt } })}
                            >
                              <Eye className="w-4 h-4 text-indigo-600" />
                            </button>
                            {canEditAppointment && (
                              <button 
                                className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors rounded-lg cursor-pointer"
                                title="Edit Appointment"
                                onClick={() => { setIsEditClick(true); setSelectedPatientData(apt); }}
                              >
                                <Edit className="w-4 h-4 text-indigo-600" />
                              </button>
                            )}
                            {canCancelAppointment && (
                              <button 
                                className="p-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors rounded-lg cursor-pointer"
                                title="Delete Appointment"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this appointment?")) {
                                    AppointmentDelete(apt._id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
export default Appointments;
