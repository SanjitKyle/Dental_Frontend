import React, { useState, useContext, useEffect, useMemo } from 'react';
import { 
  Search, ChevronDown, DollarSign, Users, Activity, 
  Stethoscope, HeartPulse, Edit, Trash2, Plus, 
  FileText, CheckCircle2, Clock, ChevronLeft, ChevronRight,
  Filter, Eye, Sparkles
} from 'lucide-react';
import { AppointmentKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';
import { OdontogramModal } from '../odontogram/OdontogramModal';

// Sample seed data if no records exist yet
const SAMPLE_ODONTOGRAMS = [
  {
    _id: "odonto_001",
    patientId: "patient_1",
    patientName: "Eleanor Vance",
    patientPhone: "+1 (555) 234-5678",
    patientAge: 38,
    doctorName: "Dr. Sarah Jenkins",
    chartType: "adult",
    notation: "universal",
    affectedCount: 3,
    completedCount: 1,
    plannedCount: 2,
    totalCost: 1160,
    status: "In Progress",
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    teeth: {
      14: {
        toothNumber: 14,
        status: "caries",
        condition: "Caries / Cavity",
        surfaces: ["occlusal", "mesial"],
        procedure: "Composite Resin Filling (3+ Surf / MOD)",
        cost: 240,
        treatmentStatus: "diagnosed",
        notes: "Deep occlusal decay"
      },
      19: {
        toothNumber: 19,
        status: "root_canal",
        condition: "Root Canal (RCT)",
        surfaces: [],
        procedure: "Root Canal Therapy (Molar)",
        cost: 750,
        treatmentStatus: "diagnosed",
        notes: "Irreversible pulpitis"
      },
      3: {
        toothNumber: 3,
        status: "crown",
        condition: "Crown / Cap",
        surfaces: [],
        procedure: "Porcelain / Ceramic Crown",
        cost: 850,
        treatmentStatus: "completed",
        notes: "Permanent cementation completed"
      }
    },
    generalNotes: "Patient reports sensitivity to cold on lower left molar. Scheduled for RCT next week."
  },
  {
    _id: "odonto_002",
    patientId: "patient_2",
    patientName: "Michael Chen",
    patientPhone: "+1 (555) 987-6543",
    patientAge: 29,
    doctorName: "Dr. Alex Rivera",
    chartType: "adult",
    notation: "universal",
    affectedCount: 2,
    completedCount: 2,
    plannedCount: 0,
    totalCost: 320,
    status: "Completed",
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    teeth: {
      30: {
        toothNumber: 30,
        status: "filled",
        condition: "Filled / Restored",
        surfaces: ["occlusal"],
        procedure: "Composite Resin Filling (1-2 Surf)",
        cost: 160,
        treatmentStatus: "completed",
        notes: "Class I occlusal filling done"
      },
      31: {
        toothNumber: 31,
        status: "filled",
        condition: "Filled / Restored",
        surfaces: ["occlusal"],
        procedure: "Composite Resin Filling (1-2 Surf)",
        cost: 160,
        treatmentStatus: "completed",
        notes: "Preventive resin restoration done"
      }
    },
    generalNotes: "Routine recall in 6 months."
  }
];

export const Odontograms = () => {
  const { Patients = [], Doctors = [], token, hasPermission } = useContext(ContextProvider) || {};

  const canCreate = hasPermission ? hasPermission('CREATE_ODONTOGRAM') : true;
  const canEdit = hasPermission ? hasPermission('EDIT_ODONTOGRAM') : true;
  const canDelete = hasPermission ? hasPermission('DELETE_ODONTOGRAM') : true;

  // Local storage persistence
  const [odontograms, setOdontograms] = useState(() => {
    const saved = localStorage.getItem('hospital_odontograms_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SAMPLE_ODONTOGRAMS;
      }
    }
    return SAMPLE_ODONTOGRAMS;
  });

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Save to LocalStorage whenever odontograms update
  useEffect(() => {
    localStorage.setItem('hospital_odontograms_records', JSON.stringify(odontograms));
  }, [odontograms]);

  // Handler to open modal for new chart
  const handleOpenNew = () => {
    if (!canCreate) {
      alert('Permission denied: You do not have privilege to create odontograms.');
      return;
    }
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  // Handler to open modal for editing chart
  const handleOpenEdit = (record) => {
    if (!canEdit) {
      alert('Permission denied: You do not have privilege to edit odontograms.');
      return;
    }
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  // Handler to save or update an odontogram record
  const handleSaveRecord = (savedRecord) => {
    const existingIndex = odontograms.findIndex((o) => o._id === savedRecord._id);
    if (existingIndex > -1) {
      const updated = [...odontograms];
      updated[existingIndex] = savedRecord;
      setOdontograms(updated);
    } else {
      setOdontograms([savedRecord, ...odontograms]);
    }
  };

  // Handler to delete an odontogram
  const handleDeleteRecord = (id) => {
    if (!canDelete) {
      alert('Permission denied: You do not have privilege to delete odontograms.');
      return;
    }
    if (window.confirm("Are you sure you want to delete this dental record?")) {
      setOdontograms(odontograms.filter((o) => o._id !== id));
    }
  };

  // Filtered odontograms
  const filteredList = useMemo(() => {
    return odontograms.filter((item) => {
      const pName = item?.patientName || '';
      const pPhone = item?.patientPhone || '';
      const dName = item?.doctorName || '';
      const st = item?.status || 'In Progress';

      const matchesSearch = !searchQuery || 
        pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pPhone.includes(searchQuery) ||
        dName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        st.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [odontograms, searchQuery, statusFilter]);

  // Dynamic KPI Metrics calculations
  const totalChartedPatients = odontograms.length;
  
  const totalTreatmentsCount = odontograms.reduce((acc, curr) => acc + (curr.affectedCount || 0), 0);
  const totalCompletedCount = odontograms.reduce((acc, curr) => acc + (curr.completedCount || 0), 0);
  const completionRate = totalTreatmentsCount > 0 ? Math.round((totalCompletedCount / totalTreatmentsCount) * 100) : 0;
  
  const activeTreatmentsCount = odontograms.reduce((acc, curr) => acc + (curr.plannedCount || 0), 0);
  const totalRevenue = odontograms.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-rose-500">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            Odontograms
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest">
              Dental Charting
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage interactive dental records, tooth conditions, surfaces, and treatment planning.
          </p>
        </div>
        {canCreate && (
          <button 
            onClick={handleOpenNew}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 border border-indigo-700 rounded-xl text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs shadow-indigo-600/20 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Odontogram
          </button>
        )}
      </div>

      {/* KPI Metrics Cards (2-cols on mobile, 4-cols on desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AppointmentKpi 
          title="TOTAL PATIENTS" 
          value={totalChartedPatients} 
          subtext="dental records" 
          icon={Users} 
        />
        <AppointmentKpi 
          title="COMPLETION RATE" 
          value={`${completionRate}%`} 
          subtext="treatment completion" 
          icon={Activity} 
        />
        <AppointmentKpi 
          title="ACTIVE TREATMENTS" 
          value={activeTreatmentsCount} 
          subtext="in progress" 
          icon={Stethoscope} 
        />
        
        {/* Revenue KPI Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group shadow-xs hover:shadow-md transition-all min-w-0">
          <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">TOTAL REVENUE</p>
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-indigo-600 border border-slate-100 group-hover:scale-105 transition-transform shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">
              ${totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg inline-block border border-indigo-100 truncate">
              Active pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-xs overflow-hidden ring-1 ring-slate-100/70">
        
        {/* Toolbar & Filter */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/70">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search patient name, phone, or dentist..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 shadow-2xs"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 uppercase tracking-wider transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">ALL STATUS</option>
              <option value="in progress">IN PROGRESS</option>
              <option value="completed">COMPLETED</option>
              <option value="normal">NORMAL / HEALTHY</option>
            </select>
          </div>
        </div>

        {/* ODONTOGRAM TABLE WITH PROPER SPACING & WRAPPING */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input type="checkbox" className="border-slate-300 text-blue-700 rounded cursor-pointer" />
                </th>
                <th className="py-3.5 px-4 min-w-[200px]">PATIENT</th>
                <th className="py-3.5 px-4 min-w-[140px]">DENTIST</th>
                <th className="py-3.5 px-4 min-w-[130px]">CHART TYPE</th>
                <th className="py-3.5 px-4 min-w-[180px]">TEETH DIAGNOSED</th>
                <th className="py-3.5 px-4 min-w-[140px]">STATUS</th>
                <th className="py-3.5 px-4 min-w-[100px]">TOTAL FEE</th>
                <th className="py-3.5 px-4 min-w-[110px]">LAST UPDATED</th>
                <th className="py-3.5 px-4 min-w-[140px] text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const initials = item.patientName
                    ? item.patientName.substring(0, 2).toUpperCase()
                    : 'PT';
                  const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A';
                  const statusNormalized = (item.status || 'In Progress').toUpperCase();
                  const isCompleted = statusNormalized === 'COMPLETED';

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 text-center align-middle">
                        <input type="checkbox" className="border-slate-300 text-blue-700 rounded cursor-pointer" />
                      </td>

                      {/* Patient Column */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 capitalize truncate">{item.patientName}</span>
                            <span className="text-xs text-slate-400 font-medium truncate">{item.patientPhone || 'No phone'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Dentist Column */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className="font-semibold text-slate-700 text-xs">{item.doctorName || 'Dr. Assigned'}</span>
                      </td>

                      {/* Chart Type */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {item.chartType === 'pediatric' ? 'PED (20T)' : 'ADULT (32T)'}
                        </span>
                      </td>

                      {/* Teeth Diagnosed */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                            item.affectedCount > 0 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {item.affectedCount || 0} Teeth Affected
                          </span>
                          {item.completedCount > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                              ({item.completedCount} done)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase whitespace-nowrap ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.status || 'In Progress'}
                        </span>
                      </td>

                      {/* Total Fee */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 text-sm">
                          ${(item.totalCost || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <span className="font-medium text-slate-500 text-xs">
                          {dateStr}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 pr-6 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Odontogram Chart"
                              className="px-3 py-1.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors rounded-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit Chart
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteRecord(item._id)}
                              title="Delete record"
                              className="p-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors rounded-lg cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-16 bg-slate-50/50 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xs">
                        <HeartPulse className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">No Odontograms Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Create your first interactive dental chart for a patient to get started.
                      </p>
                      {canCreate && (
                        <button
                          onClick={handleOpenNew}
                          className="mt-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          + Create Odontogram
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80 gap-3">
          <div>Showing {filteredList.length} of {odontograms.length} records</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <span className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-bold text-slate-700 shadow-2xs">10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded-md transition-colors shadow-2xs" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded-md transition-colors shadow-2xs" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Odontogram Editor Modal */}
      <OdontogramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingRecord}
        onSave={handleSaveRecord}
        patientsList={Patients}
        doctorsList={Doctors}
        token={token}
      />
    </div>
  );
};
