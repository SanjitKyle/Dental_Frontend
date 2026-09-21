import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Droplet,
  Stethoscope,
  ShieldAlert,
  FileText,
  Activity,
  Edit,
  Trash2,
  Clock,
  CalendarDays,
  PhoneCall,
  MailCheck,
  ChevronRight
} from 'lucide-react';
import { ContextProvider } from '../../context/store';
import { DataPageSkeleton } from '../DataPageSkeleton';

export const PatientDetail = ({ onEditPatient }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    Patients,
    Appointments,
    setIsEditClick,
    setSelectedPatientData,
    PatientDelete,
    loading
  } = useContext(ContextProvider);

  const [patient, setPatient] = useState(location.state?.patient || null);

  useEffect(() => {
    if (!patient || String(patient._id || patient.id) !== String(id)) {
      const patientsList = Array.isArray(Patients?.data) ? Patients.data : Array.isArray(Patients) ? Patients : [];
      const found = patientsList.find((p) => String(p._id || p.id) === String(id));
      if (found) {
        setPatient(found);
      }
    }
  }, [id, Patients, patient]);

  if (loading?.patients && !patient) {
    return <DataPageSkeleton />;
  }

  if (!patient) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </button>
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Patient Not Found</h3>
          <p className="text-xs text-slate-500 mb-4">The patient records could not be found or have been deleted.</p>
          <button
            onClick={() => navigate('/patients')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Return to Patients List
          </button>
        </div>
      </div>
    );
  }

  const initials = patient.full_name
    ? patient.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PT';

  // Calculate age if not directly provided
  let age = patient.age;
  if (!age && patient.date_of_birth) {
    const birthDate = new Date(patient.date_of_birth);
    if (!Number.isNaN(birthDate.getTime())) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      age = calculatedAge >= 0 ? calculatedAge : null;
    }
  }

  // Calculate BMI if height and weight exist
  let bmi = null;
  let bmiCategory = null;
  if (patient.height && patient.weight) {
    const w = parseFloat(patient.weight);
    let h = parseFloat(patient.height);
    if (h > 3) h = h / 100;
    if (w > 0 && h > 0) {
      const val = w / (h * h);
      bmi = val.toFixed(1);
      if (val < 18.5) bmiCategory = { text: 'Underweight', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      else if (val < 25) bmiCategory = { text: 'Normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      else if (val < 30) bmiCategory = { text: 'Overweight', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      else bmiCategory = { text: 'Obese', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
  }

  const formattedDOB = patient.date_of_birth && !Number.isNaN(new Date(patient.date_of_birth).getTime())
    ? new Date(patient.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const formattedJoined = patient.createdAt && !Number.isNaN(new Date(patient.createdAt).getTime())
    ? new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const emergencyPhone = patient.emergency_contact_phone || patient.emergencty_contact_phone || '';

  // Find linked appointments
  const allAppointments = Array.isArray(Appointments?.data) ? Appointments.data : Array.isArray(Appointments) ? Appointments : [];
  const patientAppointments = allAppointments.filter((a) => {
    const pId = typeof a.patient === 'object' ? (a.patient?._id || a.patient?.id) : a.patient;
    return String(pId) === String(patient._id || patient.id);
  });

  const handleEdit = () => {
    setIsEditClick(true);
    setSelectedPatientData(patient);
    if (onEditPatient) onEditPatient();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete patient ${patient.full_name}?`)) {
      PatientDelete(patient._id || patient.id);
      navigate('/patients');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 md:pb-12">
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-bold text-xs cursor-pointer transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Patients</span>
          <span className="sm:hidden">Back</span>
        </button>

        <h1 className="text-sm font-black text-slate-900 tracking-tight">Patient Profile</h1>

        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          #{(patient._id || '').slice(-6)}
        </span>
      </div>

      <div className="p-3.5 sm:p-5 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5">
        {/* Mobile-First Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-md shadow-indigo-500/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight capitalize truncate">
                    {patient.full_name}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs">
                  {patient.gender && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-slate-100 text-slate-700">
                      {patient.gender}
                    </span>
                  )}
                  {patient.blood_group && (
                    <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Droplet className="w-3 h-3 fill-rose-600" />
                      {patient.blood_group}
                    </span>
                  )}
                  {age && (
                    <span className="text-slate-500 font-semibold text-[11px]">
                      • {age} yrs
                    </span>
                  )}
                </div>
              </div>
            </div>

            {formattedJoined && (
              <p className="text-[11px] text-slate-400 font-medium sm:ml-auto">
                Patient since {formattedJoined}
              </p>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-slate-100">
            <button
              onClick={handleEdit}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-indigo-600/20 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Quick Vitals & Health Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Blood Group */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Droplet className="w-3.5 h-3.5 text-rose-500" /> Blood Group
            </div>
            <p className="text-base sm:text-xl font-black text-slate-900 mt-1">
              {patient.blood_group || '—'}
            </p>
          </div>

          {/* Height & Weight */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Height / Weight
            </div>
            <p className="text-xs sm:text-base font-black text-slate-900 mt-1 truncate">
              {patient.height ? `${patient.height}cm` : '—'} / {patient.weight ? `${patient.weight}kg` : '—'}
            </p>
          </div>

          {/* Body Mass Index */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-emerald-500" /> BMI
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-base sm:text-xl font-black text-slate-900">{bmi || '—'}</span>
              {bmiCategory && (
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${bmiCategory.color}`}>
                  {bmiCategory.text}
                </span>
              )}
            </div>
          </div>

          {/* Visits */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Visits
            </div>
            <p className="text-base sm:text-xl font-black text-slate-900 mt-1">
              {patientAppointments.length}
            </p>
          </div>
        </div>

        {/* Section: Contact & Residence (Native List View) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Contact & Address</h3>
            <Phone className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Phone */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Phone</p>
                  <p className="font-extrabold text-slate-800 text-sm truncate">{patient.phone || 'Not provided'}</p>
                </div>
              </div>
              {patient.phone && (
                <a
                  href={`tel:${patient.phone}`}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call
                </a>
              )}
            </div>

            {/* Email */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                  <p className="font-extrabold text-slate-800 text-sm truncate">{patient.email || 'Not provided'}</p>
                </div>
              </div>
              {patient.email && (
                <a
                  href={`mailto:${patient.email}`}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <MailCheck className="w-3.5 h-3.5" /> Email
                </a>
              )}
            </div>

            {/* Address */}
            <div className="p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Address</p>
                <p className="font-semibold text-slate-800 text-xs mt-0.5 leading-relaxed">
                  {patient.address || 'No residential address recorded.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Clinical Care & Doctor Assignment */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Clinical Care</h3>
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Assigned Doctor */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Assigned Doctor</p>
                  <p className="font-extrabold text-slate-900 text-sm truncate">
                    {patient.assigned_doctor_name ? `Dr. ${patient.assigned_doctor_name}` : 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Visit */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Last Recorded Visit</p>
                  <p className="font-bold text-slate-700 text-xs">
                    {patient.last_visit || 'No prior visits recorded'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Emergency Contact */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Emergency Contact</h3>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>

          <div className="p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Contact Person</p>
                <p className="font-extrabold text-slate-800 text-sm">
                  {patient.emergency_contact_name || '—'}
                  {patient.relation && (
                    <span className="text-xs text-slate-500 font-medium ml-1.5">({patient.relation})</span>
                  )}
                </p>
              </div>

              {emergencyPhone && (
                <a
                  href={`tel:${emergencyPhone}`}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call
                </a>
              )}
            </div>

            {emergencyPhone && (
              <p className="text-[11px] font-semibold text-slate-500">Phone: {emergencyPhone}</p>
            )}
          </div>
        </div>

        {/* Section: Medical Notes */}
        {patient.note && (
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Medical Notes & History</h3>
              <FileText className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                {patient.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PatientDetail;
