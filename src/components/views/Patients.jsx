import React, { useContext, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Activity,
  Clock,
} from "lucide-react";
import { PatientKpi } from "./SharedKpis";
import { ContextProvider } from "../../context/store";
import PatientFormModal from "../PatientFormModal";
import { DataPageSkeleton } from "../DataPageSkeleton";

export const Patients = ({ onAddPatient }) => {
  const {
    Patients,
    setIsEditClick,
    setSelectedPatientData,
    PatientDelete,
    loading,
  } = useContext(ContextProvider);

  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading?.patients) return <DataPageSkeleton />;

  const patientsList = Array.isArray(Patients?.data)
    ? Patients.data
    : Array.isArray(Patients)
    ? Patients
    : [];

  const patientAges = patientsList
    .map((patient) => {
      if (!patient?.date_of_birth) return null;
      const birthDate = new Date(patient.date_of_birth);
      if (Number.isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const birthdayHasPassed =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());
      if (!birthdayHasPassed) age -= 1;
      return age >= 0 ? age : null;
    })
    .filter((age) => age !== null);

  const averageAge = patientAges.length
    ? Math.round(
        patientAges.reduce((total, age) => total + age, 0) / patientAges.length
      )
    : "—";

  const filteredPatients = patientsList.filter((p) => {
    const searchLower = searchValue.toLowerCase();
    const nameMatch = p?.full_name?.toLowerCase()?.includes(searchLower);
    const phoneMatch = String(p?.phone || "").includes(searchValue);
    const matchesSearch = !searchValue || nameMatch || phoneMatch;

    const matchesType =
      typeFilter === "all" || p?.gender?.toLowerCase() === typeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "assigned" && p?.assigned_doctor_name) ||
      (statusFilter === "unassigned" && !p?.assigned_doctor_name);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-indigo-600">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Patients
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage patient records and clinical history.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedPatientData(null);
            onAddPatient();
          }}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs shadow-indigo-600/20 text-center cursor-pointer whitespace-nowrap"
        >
          Add Patient
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <PatientKpi
          title="Total Patients"
          value={patientsList.length || 0}
          subtext="vs last month"
          icon={Users}
          percentage="100"
          trendUp={true}
        />
        <PatientKpi
          title="New This Month"
          value="1"
          subtext="vs 0 last month"
          icon={UserPlus}
          percentage="100"
          trendUp={true}
        />
        <PatientKpi
          title="Active Patients"
          value="1"
          subtext="Recently active"
          icon={Activity}
        />
        <PatientKpi
          title="Avg Age"
          value={averageAge}
          subtext={patientAges.length ? "Years old" : "Birth dates unavailable"}
          icon={Clock}
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-xs overflow-hidden ring-1 ring-slate-100/70">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between bg-slate-50/80">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {/* ALL TYPES — filters by gender */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* ALL STATUS — filters by assigned doctor */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Card List (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredPatients && filteredPatients.length > 0 ? (
            filteredPatients.map((item) => {
              let age = "N/A";
              if (item?.date_of_birth) {
                const birthDate = new Date(item.date_of_birth);
                const difference = Date.now() - birthDate.getTime();
                age =
                  Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25)) +
                  " yrs";
              }
              const joinedDate = item?.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "N/A";
              const initials = item?.full_name
                ? item.full_name.substring(0, 2).toUpperCase()
                : "NA";

              return (
                <div
                  key={item._id || Math.random()}
                  className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm capitalize truncate">
                          {item?.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {item?.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    {item?.blood_group ? (
                      <span className="status-badge active shrink-0">
                        {item.blood_group}
                      </span>
                    ) : (
                      <span className="status-badge inactive shrink-0">-</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">
                        Age / Joined
                      </span>
                      <span className="font-semibold text-slate-700">
                        {age} • {joinedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">
                        Doctor
                      </span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {item?.assigned_doctor_name || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      onClick={() => {
                        setIsEditClick(true);
                        onAddPatient();
                        setSelectedPatientData(item);
                      }}
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-600" /> Edit
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this patient?"
                          )
                        ) {
                          PatientDelete(item._id);
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
              <Search className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">
                No patients found{" "}
                {searchValue ? `for "${searchValue}"` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse saas-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    className="border-slate-300 text-indigo-600 rounded-sm"
                  />
                </th>
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
              {filteredPatients && filteredPatients.length > 0 ? (
                filteredPatients.map((item) => {
                  let age = "N/A";
                  if (item?.date_of_birth) {
                    const birthDate = new Date(item.date_of_birth);
                    const difference = Date.now() - birthDate.getTime();
                    age =
                      Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25)) +
                      " yrs";
                  }
                  const joinedDate = item?.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "N/A";
                  const initials = item?.full_name
                    ? item.full_name.substring(0, 2).toUpperCase()
                    : "NA";

                  return (
                    <tr key={item._id || Math.random()} className="group">
                      <td>
                        <input
                          type="checkbox"
                          className="border-slate-300 text-indigo-600 rounded-sm"
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                          <span className="font-bold text-slate-900 capitalize">
                            {item?.full_name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">
                            {item?.phone || "No phone"}
                          </span>
                          <span className="text-slate-500 text-xs font-medium">
                            {item?.email || "No email"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">
                            {age}
                          </span>
                          <span className="text-slate-500 text-xs font-medium mt-0.5">
                            Joined {joinedDate}
                          </span>
                        </div>
                      </td>
                      <td>
                        {item?.blood_group ? (
                          <span className="status-badge active">
                            {item.blood_group}
                          </span>
                        ) : (
                          <span className="status-badge inactive">-</span>
                        )}
                      </td>
                      <td className="font-semibold text-slate-500">
                        {item?.last_visit
                          ? item?.last_visit
                          : new Date().toLocaleDateString()}
                      </td>
                      <td className="font-bold text-slate-500">
                        {item?.assigned_doctor_name || "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100">
                          <button
                            className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors rounded-lg cursor-pointer"
                            onClick={() => {
                              setIsEditClick(true);
                              onAddPatient();
                              setSelectedPatientData(item);
                            }}
                          >
                            <Edit className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            className="p-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors rounded-lg cursor-pointer"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this patient?"
                                )
                              ) {
                                PatientDelete(item._id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-12 text-slate-500 bg-slate-50"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-6 h-6 text-slate-400" />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        No patients found{" "}
                        {searchValue ? `for "${searchValue}"` : ""}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
          <div>
            Showing 1-{filteredPatients.length} of {filteredPatients.length}
          </div>
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
                <button
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
                  disabled
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs"
                  disabled
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
