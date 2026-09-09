import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  Search, ChevronDown, CheckCircle2, Clock, Package, FileText, 
  Plus, Printer, Edit2, Trash2, Eye, Pill, Stethoscope, User, 
  Calendar, AlertCircle, RefreshCw, Filter, MoreVertical, ArrowRight
} from 'lucide-react';
import { AppointmentKpi } from './SharedKpis';
import { ContextProvider } from '../../context/store';
import { 
  createPrescription, 
  updatePrescription, 
  deletePrescription, 
  updatePrescriptionStatus,
  PRESCRIPTION_STATUSES 
} from '../../services/prescriptions';
import { axiosInstance } from '../../services/axiosInstance';
import { PrescriptionModal } from '../prescriptions/PrescriptionModal';
import { PrescriptionPrintModal } from '../prescriptions/PrescriptionPrintModal';
import { PrescriptionViewModal } from '../prescriptions/PrescriptionViewModal';

export const Prescriptions = () => {
  const { user, Patients, Doctors } = useContext(ContextProvider);

  const token = useMemo(() => {
    if (!user) return null;
    try {
      const parsed = typeof user === 'string' ? JSON.parse(user) : user;
      return parsed?.token || parsed?.data?.token || parsed?.accessToken || parsed?.data?.accessToken || null;
    } catch {
      return null;
    }
  }, [user]);

  // Safe array normalization for Doctors & Patients from context
  const safeDoctors = useMemo(() => {
    if (Array.isArray(Doctors)) return Doctors;
    if (Array.isArray(Doctors?.data)) return Doctors.data;
    if (Array.isArray(Doctors?.doctors)) return Doctors.doctors;
    if (Array.isArray(Doctors?.data?.data)) return Doctors.data.data;
    return [];
  }, [Doctors]);

  const safePatients = useMemo(() => {
    if (Array.isArray(Patients)) return Patients;
    if (Array.isArray(Patients?.data)) return Patients.data;
    if (Array.isArray(Patients?.patients)) return Patients.patients;
    if (Array.isArray(Patients?.data?.data)) return Patients.data.data;
    return [];
  }, [Patients]);

  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPrescriptionForEdit, setSelectedPrescriptionForEdit] = useState(null);
  
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrescriptionForPrint, setSelectedPrescriptionForPrint] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPrescriptionForView, setSelectedPrescriptionForView] = useState(null);

  // Helper to resolve Patient Details (matches string ID with safePatients)
  const resolvePatient = (rx) => {
    if (!rx) return { name: 'Patient', phone: '', age: '', gender: '', blood: '' };
    const pId = typeof rx.patientId === 'object' ? (rx.patientId?._id || rx.patientId?.id) : rx.patientId;
    const found = safePatients.find((p) => String(p._id || p.id) === String(pId));
    return {
      name: found?.full_name || found?.name || (typeof rx.patientId === 'object' ? (rx.patientId?.full_name || rx.patientId?.name) : '') || rx.patientName || 'Patient',
      phone: found?.phone || (typeof rx.patientId === 'object' ? rx.patientId?.phone : '') || rx.patientPhone || '',
      age: found?.age || (typeof rx.patientId === 'object' ? rx.patientId?.age : '') || rx.patientAge || '',
      gender: found?.gender || (typeof rx.patientId === 'object' ? rx.patientId?.gender : '') || rx.patientGender || '',
      blood: found?.blood_group || (typeof rx.patientId === 'object' ? rx.patientId?.blood_group : '') || rx.patientBloodGroup || '',
      raw: found || (typeof rx.patientId === 'object' ? rx.patientId : null)
    };
  };

  // Helper to resolve Doctor Details (matches string ID with safeDoctors)
  const resolveDoctor = (rx) => {
    if (!rx) return { name: 'Dr. Assigned', spec: 'Dental Surgeon & Specialist' };
    const dId = typeof rx.doctorId === 'object' ? (rx.doctorId?._id || rx.doctorId?.id) : rx.doctorId;
    const found = safeDoctors.find((d) => String(d._id || d.id) === String(dId));
    return {
      name: found?.full_name || found?.name || (typeof rx.doctorId === 'object' ? (rx.doctorId?.full_name || rx.doctorId?.name) : '') || rx.doctorName || 'Dr. Assigned',
      spec: found?.specialization || found?.department || (typeof rx.doctorId === 'object' ? (rx.doctorId?.specialization || rx.doctorId?.department) : '') || rx.doctorSpec || 'Dental Surgeon & Specialist',
      raw: found || (typeof rx.doctorId === 'object' ? rx.doctorId : null)
    };
  };

  // Fetch all prescriptions
  const fetchPrescriptions = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // 1. Try generic list endpoint
      const res = await axiosInstance.get('/prescriptions', {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || res.data?.prescriptions || res.data || [];
      setPrescriptionsList(Array.isArray(data) ? data : []);
    } catch (error) {
      // 2. If generic route is not mounted (404), fetch by doctors in safeDoctors
      let foundList = [];
      if (safeDoctors.length > 0) {
        for (const doc of safeDoctors.slice(0, 5)) {
          const docId = doc._id || doc.id;
          if (!docId) continue;
          try {
            const res = await axiosInstance.get(`/prescriptions/doctor/${docId}`, {
              headers: { authorization: `Bearer ${token}` }
            });
            const data = res.data?.data || res.data?.prescriptions || res.data || [];
            if (Array.isArray(data) && data.length > 0) {
              foundList = [...foundList, ...data];
            }
          } catch {
            // Ignore sub-route misses
          }
        }
      }
      setPrescriptionsList(foundList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [token, safeDoctors.length]);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      await deletePrescription(token, id);
      setPrescriptionsList((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Failed to delete prescription:', err);
      alert('Could not delete prescription. Please try again.');
    }
  };

  // Handle Quick Status Update (e.g. Mark as Dispensed)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePrescriptionStatus(token, id, newStatus);
      setPrescriptionsList((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filtered List with accurate name resolution
  const filteredPrescriptions = useMemo(() => {
    if (!Array.isArray(prescriptionsList)) return [];

    return prescriptionsList.filter((item) => {
      if (!item) return false;

      const pInfo = resolvePatient(item);
      const patientName = (pInfo.name || '').toLowerCase();
      
      const dInfo = resolveDoctor(item);
      const doctorName = (dInfo.name || '').toLowerCase();

      const rxNumber = (item.prescriptionNumber || '').toLowerCase();
      const medNames = (item.medications || []).map((m) => (m?.medicineName || '').toLowerCase()).join(' ');

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchLower ||
        patientName.includes(searchLower) ||
        doctorName.includes(searchLower) ||
        rxNumber.includes(searchLower) ||
        medNames.includes(searchLower);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const dId = typeof item.doctorId === 'object' ? (item.doctorId?._id || item.doctorId?.id) : item.doctorId;
      const matchesDoctor = doctorFilter === 'ALL' || String(dId) === String(doctorFilter);

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [prescriptionsList, safePatients, safeDoctors, searchTerm, statusFilter, doctorFilter]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const safeList = Array.isArray(prescriptionsList) ? prescriptionsList : [];
    const total = safeList.length;
    const active = safeList.filter((p) => p?.status === 'active').length;
    const dispensed = safeList.filter((p) => p?.status === 'dispensed').length;
    const draft = safeList.filter((p) => p?.status === 'draft').length;
    return { total, active, dispensed, draft };
  }, [prescriptionsList]);

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
            <span>Prescriptions</span>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
              Rx Management
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage electronic dental prescriptions, medication dosages, and printable Rx orders.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchPrescriptions}
            disabled={isLoading}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold shadow-xs transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setSelectedPrescriptionForEdit(null);
              setIsFormModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        </div>
      </div>

      {/* KPI Cards (2-cols on mobile, 4-cols on desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AppointmentKpi title="Total Prescriptions" value={String(kpiStats.total)} subtext="All time records" icon={FileText} />
        <AppointmentKpi title="Active Rx" value={String(kpiStats.active)} subtext="Ongoing treatments" icon={CheckCircle2} />
        <AppointmentKpi title="Dispensed" value={String(kpiStats.dispensed)} subtext="At pharmacy" icon={Package} />
        <AppointmentKpi title="Drafts / Pending" value={String(kpiStats.draft)} subtext="Doctor review" icon={Clock} />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col min-h-[450px]">
        
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50/40">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Rx#, patient, doctor, or medication..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              {PRESCRIPTION_STATUSES.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>

            {/* Doctor Filter */}
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-2xs"
            >
              <option value="ALL">All Doctors</option>
              {safeDoctors.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.full_name || d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Prescriptions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'No prescriptions match your current search or status filter.' 
                  : 'Get started by creating the first patient prescription.'}
              </p>
              <button
                onClick={() => {
                  setSelectedPrescriptionForEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Prescription
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Rx Number</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Doctor</th>
                  <th className="py-3.5 px-4">Diagnosis / Teeth</th>
                  <th className="py-3.5 px-4">Medications</th>
                  <th className="py-3.5 px-4">Date & Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrescriptions.map((rx) => {
                  const pInfo = resolvePatient(rx);
                  const dInfo = resolveDoctor(rx);

                  const rxNum = rx.prescriptionNumber || `RX-${(rx._id || '').slice(-6).toUpperCase()}`;
                  const rxDate = rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

                  const statusColors = {
                    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    dispensed: 'bg-blue-50 text-blue-700 border-blue-200',
                    draft: 'bg-amber-50 text-amber-700 border-amber-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                    expired: 'bg-slate-100 text-slate-600 border-slate-200'
                  };

                  return (
                    <tr key={rx._id || rx.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Rx Number */}
                      <td className="py-4 px-4 font-black text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>{rxNum}</span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900">{pInfo.name}</div>
                        <div className="text-xs text-slate-400 font-medium">
                          {pInfo.phone || 'No phone'}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                          <span>{dInfo.name}</span>
                        </div>
                      </td>

                      {/* Diagnosis & Teeth */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-900 truncate">
                          {Array.isArray(rx.diagnosis) ? rx.diagnosis.join(', ') : (rx.diagnosis || '—')}
                        </div>
                        {rx.toothNumbers && rx.toothNumbers.length > 0 && (
                          <div className="text-[11px] font-bold text-blue-700 mt-0.5">
                            Teeth (FDI): #{rx.toothNumbers.join(', #')}
                          </div>
                        )}
                      </td>

                      {/* Medications Badges */}
                      <td className="py-4 px-4 max-w-[240px]">
                        <div className="flex flex-wrap gap-1">
                          {(rx.medications || []).slice(0, 2).map((m, mIdx) => (
                            <span 
                              key={mIdx} 
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[11px] border border-slate-200"
                            >
                              {m.medicineName} ({m.frequency})
                            </span>
                          ))}
                          {(rx.medications || []).length > 2 && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-black rounded-md text-[10px]">
                              +{(rx.medications || []).length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-500 mb-1">{rxDate}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusColors[rx.status] || statusColors.active}`}>
                          {(rx.status || 'active').toUpperCase()}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW DETAILS (Eye Icon) */}
                          <button
                            onClick={() => {
                              setSelectedPrescriptionForView(rx);
                              setIsViewModalOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="View Full Prescription Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print / Letterhead */}
                          <button
                            onClick={() => {
                              setSelectedPrescriptionForPrint(rx);
                              setIsPrintModalOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="Print / View Rx"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelectedPrescriptionForEdit(rx);
                              setIsFormModalOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit Prescription"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(rx._id || rx.id)}
                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Prescription"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: Create / Edit Prescription Form */}
      <PrescriptionModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedPrescriptionForEdit(null);
        }}
        initialData={selectedPrescriptionForEdit}
        onSuccess={() => {
          fetchPrescriptions();
        }}
      />

      {/* MODAL 2: Full Structured View Details Modal */}
      <PrescriptionViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPrescriptionForView(null);
        }}
        prescription={selectedPrescriptionForView}
        onOpenPrint={() => {
          setSelectedPrescriptionForPrint(selectedPrescriptionForView);
          setIsViewModalOpen(false);
          setIsPrintModalOpen(true);
        }}
      />

      {/* MODAL 3: Printable Electronic Rx Preview */}
      <PrescriptionPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedPrescriptionForPrint(null);
        }}
        prescription={selectedPrescriptionForPrint}
      />
    </div>
  );
};
