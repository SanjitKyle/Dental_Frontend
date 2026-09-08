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
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-white to-blue-50/30">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctors Directory</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage medical staff, specializations, and schedules.</p>
        </div>
        <button onClick={onAddDoctor} className="premium-button px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
          <span className="text-xl leading-none mb-[2px]">+</span> Add Doctor
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PatientKpi title="Total Doctors" value="2" subtext="Active staff" icon={Stethoscope} percentage="100%" trendUp={true} />
        <PatientKpi title="Available Now" value="1" subtext="On shift" icon={UserCheck} percentage="50%" trendUp={true} />
        <PatientKpi title="Top Rated" value="4.9" subtext="Avg rating" icon={Star} />
        <PatientKpi title="Avg Exp." value="10" subtext="Years" icon={Clock} />
      </div>

      {/* Main Table Card */}
      <div className="saas-card flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100/50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, specialization..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm whitespace-nowrap">
              All Specializations <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm whitespace-nowrap">
              Status <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 ring-2 ring-white">
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
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all"
                          onClick={() => { setIsEditClick(true); setSelectedPatientData(item); if(onAddDoctor) onAddDoctor(); }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all"
                          onClick={() => {
                            if(window.confirm("Are you sure you want to delete this doctor?")) {
                                DoctorDelete(item._id);
                            }
                          }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100/50 flex items-center justify-between text-sm text-slate-500 bg-white/50">
          <div className="font-medium">Showing 1-2 of 2</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-medium">
              Rows per page
              <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200/60 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
                10 <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 font-medium">
              Page 1 of 1
              <div className="flex items-center gap-1 ml-2">
                <button className="p-1.5 border border-slate-200/60 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors" disabled><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1.5 border border-slate-200/60 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-colors" disabled><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
