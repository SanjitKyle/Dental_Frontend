import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Stethoscope, UserCheck, Activity, Clock, Eye } from 'lucide-react';
import { PatientKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';
import { DataPageSkeleton } from '../DataPageSkeleton';
import { ROLES } from '../../utils/rbac';

export const Doctors = ({ onAddDoctor }) => {
  const navigate = useNavigate();
  const { Doctors, setIsEditClick, setSelectedPatientData, DoctorDelete, loading, userRole } = useContext(ContextProvider);
  const [searchValue, setSearchValue] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    console.log('doctors', Doctors);
  }, [Doctors]);

  if (loading?.doctors) return <DataPageSkeleton />;
  
  const doctorsList = Array.isArray(Doctors?.data) ? Doctors.data : Array.isArray(Doctors) ? Doctors : [];
  const specializations = [...new Set(doctorsList.map((doctor) => doctor?.specialization).filter(Boolean))].sort();
  const activeDoctors = doctorsList.filter((doctor) => String(doctor?.status || '').toLowerCase() === 'active');
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time) => {
    if (!time || !/^\d{1,2}:\d{2}/.test(time)) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  const onShiftDoctors = activeDoctors.filter((doctor) => {
    const start = toMinutes(doctor.shift_start_time);
    const end = toMinutes(doctor.shift_end_time);
    if (start === null || end === null) return false;
    return start <= end ? currentMinutes >= start && currentMinutes <= end : currentMinutes >= start || currentMinutes <= end;
  });
  const doctorsWithExperience = doctorsList.filter((doctor) => Number.isFinite(Number(doctor?.experience_years)));
  const averageExperience = doctorsWithExperience.length
    ? Math.round(doctorsWithExperience.reduce((total, doctor) => total + Number(doctor.experience_years), 0) / doctorsWithExperience.length)
    : '—';
  const filteredDoctors = doctorsList.filter((d) => {
    const searchLower = searchValue.toLowerCase();
    const nameMatch = d?.full_name?.toLowerCase()?.includes(searchLower);
    const specMatch = d?.specialization?.toLowerCase()?.includes(searchLower);
    const phoneMatch = String(d?.phone || '').includes(searchValue);
    const emailMatch = d?.email?.toLowerCase()?.includes(searchLower);
    const matchesSearch = !searchValue || nameMatch || specMatch || phoneMatch || emailMatch;
    const matchesSpecialization = specializationFilter === 'ALL' || d?.specialization === specializationFilter;
    const matchesStatus = statusFilter === 'ALL' || String(d?.status || 'Unknown') === statusFilter;
    
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-teal-600">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Doctors Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Manage medical staff, specializations, and schedules.</p>
        </div>
        {userRole === ROLES.ADMIN && (
          <button 
            onClick={onAddDoctor} 
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs shadow-indigo-600/20 text-center cursor-pointer whitespace-nowrap"
          >
            Add Doctor
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <PatientKpi title="Total Doctors" value={doctorsList.length} subtext="Registered staff" icon={Stethoscope} />
        <PatientKpi title="Active Doctors" value={activeDoctors.length} subtext="Current active status" icon={UserCheck} />
        <PatientKpi title="On Shift" value={onShiftDoctors.length} subtext="Working right now" icon={Activity} />
        <PatientKpi title="Avg Exp." value={averageExperience} subtext={doctorsWithExperience.length ? "Years of experience" : "Experience not available"} icon={Clock} />
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-xs overflow-hidden ring-1 ring-slate-100/70">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between bg-slate-50/80">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, specialization..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <select value={specializationFilter} onChange={(event) => setSpecializationFilter(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="ALL">All Specializations</option>
              {specializations.map((specialization) => <option key={specialization} value={specialization}>{specialization}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* 1. Mobile List (< 768px) - Clean List with Name & Chevron */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredDoctors && filteredDoctors.length > 0 ? (
            filteredDoctors.map((item) => {
              const initials = item?.full_name ? item.full_name.substring(0, 2).toUpperCase() : "DR";

              return (
                <div
                  key={item._id || Math.random()}
                  onClick={() => navigate(`/doctors/${item._id || item.id}`, { state: { doctor: item } })}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 active:bg-indigo-50/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {initials}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm capitalize truncate group-hover:text-indigo-600 transition-colors">
                      Dr. {item?.full_name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500 bg-slate-50/50 p-4">
              <Stethoscope className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">No doctors found {searchValue ? `for "${searchValue}"` : ""}</span>
            </div>
          )}
        </div>

        {/* 2. Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse saas-table">
            <thead>
              <tr>
                <th className="w-12"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" /></th>
                <th>Doctor</th>
                <th>Contact</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Status</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors && filteredDoctors.length > 0 ? filteredDoctors.map((item) => {
                const initials = item?.full_name ? item.full_name.substring(0, 2).toUpperCase() : "DR";

                return (
                  <tr key={item._id || Math.random()} className="group">
                    <td><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" /></td>
                    <td>
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(`/doctors/${item._id || item.id}`, { state: { doctor: item } })}
                      >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {initials}
                        </div>
                        <span className="font-extrabold text-slate-900 capitalize group-hover:text-indigo-600 transition-colors">Dr. {item?.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{item?.phone || "No phone"}</span>
                        <span className="text-slate-400 text-xs font-medium">{item?.email || "No email"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg text-xs">{item?.specialization}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-700">{item?.experience_years ? `${item.experience_years} yrs` : '—'}</span>
                    </td>
                    <td>
                      {item?.status === 'Active' ? (
                        <span className="status-badge active">{item.status}</span>
                      ) : (
                        <span className="status-badge pending">{item?.status || "Unknown"}</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100">
                        <button 
                          className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors rounded-lg cursor-pointer"
                          title="View Doctor Details"
                          onClick={() => navigate(`/doctors/${item._id || item.id}`, { state: { doctor: item } })}
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </button>
                        {userRole === ROLES.ADMIN && (
                          <>
                            <button 
                              className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors rounded-lg cursor-pointer"
                              title="Edit Doctor"
                              onClick={() => { setIsEditClick(true); setSelectedPatientData(item); if (onAddDoctor) onAddDoctor(); }}>
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </button>
                            <button 
                              className="p-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors rounded-lg cursor-pointer"
                              title="Delete Doctor"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this doctor?")) {
                                  DoctorDelete(item._id);
                                }
                              }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {searchValue ? `No doctors found for "${searchValue}"` : "No doctors found. Create one to get started!"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive Pagination */}
        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
          <div>Showing 1-{filteredDoctors.length} of {filteredDoctors.length}</div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              Rows
              <button className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs">
                10 <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              Page 1 of 1
              <div className="flex items-center gap-1 ml-1">
                <button className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs" disabled><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs" disabled><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Doctors;
