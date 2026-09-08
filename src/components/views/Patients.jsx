import React, { useContext, useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Users, UserPlus, Activity, Clock } from 'lucide-react';
import { PatientKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';
import PatientFormModal from '../PatientFormModal';

export const Patients = ({ onAddPatient }) => {
  const { Patients, setIsEditClick, isEditClick, setSelectedPatientData, PatientDelete } = useContext(ContextProvider);
  const [searchValue, setSearchValue] = useState("");
  
  const filteredPatients = Array.isArray(Patients) ? Patients.filter((p) => {
    if (!searchValue) return true;
    
    const searchLower = searchValue.toLowerCase();
    const nameMatch = p?.full_name?.toLowerCase()?.includes(searchLower);
    const phoneMatch = String(p?.phone || "")?.includes(searchValue);
    
    return nameMatch || phoneMatch;
  }) : [];

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-300 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patients</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage patient records and clinical history.</p>
        </div>
        <button onClick={() => { setSelectedPatientData(null); onAddPatient(); }} className="px-4 py-2 bg-blue-700 border border-blue-800 text-white hover:bg-blue-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
          Add Patient
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PatientKpi title="Total Patients" value={Patients?.length || 0} subtext="vs last month" icon={Users} percentage="100%" trendUp={true} />
        <PatientKpi title="New This Month" value="1" subtext="vs 0 last month" icon={UserPlus} percentage="100%" trendUp={true} />
        <PatientKpi title="Active Patients" value="1" subtext="Recently active" icon={Activity} />
        <PatientKpi title="Avg Age" value="0" subtext="Years old" icon={Clock} />
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-300 flex flex-col shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-none text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-none text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
              All types <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-none text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
              All status <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse saas-table">
            <thead>
              <tr>
                <th className="w-12"><input type="checkbox" className="border-slate-300 text-blue-700 rounded-sm" /></th>
                <th>Patient</th>
                <th>Contact</th>
                <th>Age</th>
                <th>BLOOD</th>
                <th>LAST VISIT</th>
                <th>DOCTOR</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients && filteredPatients.length > 0 ? filteredPatients.map((item) => {
                let age = "N/A";
                if (item?.date_of_birth) {
                  const birthDate = new Date(item.date_of_birth);
                  const difference = Date.now() - birthDate.getTime();
                  age = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
                }

                const joinedDate = item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A";
                const initials = item?.full_name ? item.full_name.substring(0, 2).toUpperCase() : "NA";

                return (
                  <tr key={item._id || Math.random()} className="group">
                    <td><input type="checkbox" className="border-slate-300 text-blue-700 rounded-sm" /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs">
                          {initials}
                        </div>
                        <span className="font-bold text-slate-900 capitalize">{item?.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{item?.phone || "No phone"}</span>
                        <span className="text-slate-500 text-xs font-medium">{item?.email || "No email"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{age}</span>
                        <span className="text-slate-500 text-xs font-medium mt-0.5">Joined {joinedDate}</span>
                      </div>
                    </td>
                    <td>
                      {item?.blood_group ? (
                        <span className="status-badge active">{item.blood_group}</span>
                      ) : (
                        <span className="status-badge inactive">-</span>
                      )}
                    </td>
                    <td className="font-semibold text-slate-500">{item?.last_visit ? item?.last_visit : new Date().toLocaleDateString()}</td>
                    <td className="font-bold text-slate-500">{item?.assigned_doctor_name}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100">
                        <button 
                          className="p-1.5 border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 transition-colors rounded-sm" 
                          onClick={() => { setIsEditClick(true); onAddPatient(); setSelectedPatientData(item); }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-colors rounded-sm"
                          onClick={() => {
                            if(window.confirm("Are you sure you want to delete this patient?")) {
                                PatientDelete(item._id);
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
                  <td colSpan="8" className="text-center py-12 text-slate-500 bg-slate-50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-6 h-6 text-slate-400" />
                      <span className="text-sm font-bold uppercase tracking-wider">No patients found {searchValue ? `for "${searchValue}"` : ""}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
          <div>Showing 1-1 of 1</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              Rows per page
              <button className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 transition-colors rounded-sm">
                10 <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              Page 1 of 1
              <div className="flex items-center gap-1 ml-2">
                <button className="p-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-colors rounded-sm" disabled><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-colors rounded-sm" disabled><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
