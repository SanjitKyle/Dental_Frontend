import React, { useContext, useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Stethoscope, UserCheck, Star, Clock } from 'lucide-react';
import { PatientKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';

export const Doctors = ({ onAddDoctor }) => {
  const { Doctors, setIsEditClick, setSelectedPatientData, DoctorDelete } = useContext(ContextProvider)
  const [searchValue, setSearchValue] = useState("");
  
  const filteredDoctors = Array.isArray(Doctors?.data) ? Doctors.data.filter((d) => {
    if (!searchValue) return true;
    
    const searchLower = searchValue.toLowerCase();
    const nameMatch = d?.full_name?.toLowerCase()?.includes(searchLower);
    const specMatch = d?.specialization?.toLowerCase()?.includes(searchLower);
    
    return nameMatch || specMatch;
  }) : [];

  useEffect(()=>{
    console.log('doctors',Doctors);
  },[Doctors])
  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Doctors Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Manage medical staff, specializations, and schedules.</p>
        </div>
        <button 
          onClick={onAddDoctor} 
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs shadow-indigo-600/20 text-center cursor-pointer whitespace-nowrap"
        >
          Add Doctor
        </button>
      </div>

      {/* KPI Cards (2-cols on mobile, 4-cols on desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <PatientKpi title="Total Doctors" value={Array.isArray(Doctors?.data) ? Doctors.data.length : 0} subtext="Active staff" icon={Stethoscope} percentage="100" trendUp={true} />
        <PatientKpi title="Available Now" value="1" subtext="On shift" icon={UserCheck} percentage="50" trendUp={true} />
        <PatientKpi title="Top Rated" value="4.9" subtext="Avg rating" icon={Star} />
        <PatientKpi title="Avg Exp." value="10" subtext="Years" icon={Clock} />
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between bg-slate-50/50">
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
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap">
              All Specializations <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-xs whitespace-nowrap">
              Status <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 1. Mobile Card List (Visible only on mobile screens < 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredDoctors && filteredDoctors.length > 0 ? (
            filteredDoctors.map((item) => {
              const initials = item?.full_name ? item.full_name.substring(0, 2).toUpperCase() : "DR";

              return (
                <div key={item._id || Math.random()} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm capitalize truncate">Dr. {item?.full_name}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{item?.phone || "No phone"}</p>
                      </div>
                    </div>
                    {item?.status === 'Active' ? (
                      <span className="status-badge active shrink-0">{item.status}</span>
                    ) : (
                      <span className="status-badge pending shrink-0">{item?.status || "Unknown"}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Specialization</span>
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block text-[11px] mt-0.5">
                        {item?.specialization || "General"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Experience</span>
                      <span className="font-semibold text-slate-700">{item?.experience_years ? `${item.experience_years} yrs` : "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      onClick={() => { setIsEditClick(true); setSelectedPatientData(item); if (onAddDoctor) onAddDoctor(); }}
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-600" /> Edit
                    </button>
                    <button 
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this doctor?")) {
                          DoctorDelete(item._id);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
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

        {/* 2. Desktop Table (Hidden on mobile < 768px, visible on md+) */}
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
                      <div className="flex items-center gap-3">
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
                      <span className="font-semibold text-slate-700">{item?.experience_years}</span>
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
                          onClick={() => { setIsEditClick(true); setSelectedPatientData(item); if (onAddDoctor) onAddDoctor(); }}>
                          <Edit className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button 
                          className="p-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors rounded-lg cursor-pointer"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this doctor?")) {
                              DoctorDelete(item._id);
                            }
                          }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
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
