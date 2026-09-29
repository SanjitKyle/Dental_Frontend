import React, { useState, useContext, useMemo } from 'react';
import { 
  X, UserPlus, Users, Search, CheckCircle2, AlertCircle, 
  Stethoscope, Sparkles, Clock, ShieldAlert, Phone, User, 
  Calendar, ArrowRight, Tag
} from 'lucide-react';
import { ContextProvider } from '../../context/store';
import { PRIORITY_LEVELS, getNextTokenNumber } from '../../services/queueStorage';

const DENTAL_SERVICES = [
  'Routine Dental Checkup & Consultation',
  'Acute / Severe Tooth Pain (Emergency)',
  'Teeth Cleaning & Scaling',
  'Root Canal Treatment (RCT)',
  'Tooth Extraction / Wisdom Tooth',
  'Dental Filling / Cavity Restoration',
  'Crown / Bridge / Veneers',
  'Orthodontic / Braces Checkup',
  'Denture Fitting & Adjustment',
  'Bleeding Gums / Periodontal Check',
  'Post-Treatment Follow-up'
];

export const IssueTokenModal = ({ isOpen, onClose, onTokenCreated, currentQueue = [] }) => {
  const { Patients, Doctors, PatientCreate } = useContext(ContextProvider);

  const [activeTab, setActiveTab] = useState('existing'); // 'existing' | 'new'

  // Existing Patient Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // New Patient Form
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    saveToDatabase: true
  });

  // Shared Token Details
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [service, setService] = useState(DENTAL_SERVICES[0]);
  const [customService, setCustomService] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Extract safe list of patients
  const safePatients = useMemo(() => {
    let list = [];
    if (Array.isArray(Patients)) list = Patients;
    else if (Array.isArray(Patients?.data)) list = Patients.data;
    else if (Array.isArray(Patients?.patients)) list = Patients.patients;
    else if (Array.isArray(Patients?.data?.data)) list = Patients.data.data;
    return list;
  }, [Patients]);

  // Extract safe list of doctors
  const safeDoctors = useMemo(() => {
    let list = [];
    if (Array.isArray(Doctors)) list = Doctors;
    else if (Array.isArray(Doctors?.data)) list = Doctors.data;
    else if (Array.isArray(Doctors?.doctors)) list = Doctors.doctors;
    else if (Array.isArray(Doctors?.data?.data)) list = Doctors.data.data;
    return list;
  }, [Doctors]);

  // Filter existing patients based on search
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return safePatients.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return safePatients.filter((p) => {
      const name = (p.full_name || p.name || '').toLowerCase();
      const phone = (p.phone || p.contact || '').toLowerCase();
      const id = String(p._id || p.id || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || id.includes(q);
    }).slice(0, 8);
  }, [safePatients, searchQuery]);

  // Next Token Preview
  const nextToken = useMemo(() => getNextTokenNumber(currentQueue), [currentQueue]);

  if (!isOpen) return null;

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchQuery(patient.full_name || patient.name || '');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    let patientName = '';
    let phone = '';
    let age = '';
    let gender = 'Male';
    let patientId = null;
    let isNew = false;

    if (activeTab === 'existing') {
      if (!selectedPatient) {
        setFormError('Please search and select an existing patient, or switch to New Patient tab.');
        return;
      }
      patientName = selectedPatient.full_name || selectedPatient.name || 'Patient';
      phone = selectedPatient.phone || '';
      age = selectedPatient.age || '';
      gender = selectedPatient.gender || 'Male';
      patientId = selectedPatient._id || selectedPatient.id || null;
      isNew = false;
    } else {
      if (!newPatient.name.trim()) {
        setFormError('Please enter the patient full name.');
        return;
      }
      if (!newPatient.phone.trim()) {
        setFormError('Please enter a contact phone number.');
        return;
      }
      patientName = newPatient.name.trim();
      phone = newPatient.phone.trim();
      age = newPatient.age ? Number(newPatient.age) : '';
      gender = newPatient.gender;
      isNew = true;

      // Optionally save into main patients directory
      if (newPatient.saveToDatabase && PatientCreate) {
        try {
          await PatientCreate({
            full_name: patientName,
            phone: phone,
            age: age,
            gender: gender,
            note: `Auto-registered via Walk-in OPD token on ${new Date().toLocaleDateString()}`
          });
        } catch (saveErr) {
          console.warn('Patient auto-save to database non-blocking error:', saveErr);
        }
      }
    }

    // Determine Doctor Name
    let doctorName = 'On-Duty Dentist';
    if (selectedDoctorId) {
      const doc = safeDoctors.find((d) => String(d._id || d.id) === String(selectedDoctorId));
      if (doc) doctorName = doc.full_name || doc.name || `Dr. ${selectedDoctorId}`;
    } else if (safeDoctors.length > 0) {
      const firstDoc = safeDoctors[0];
      doctorName = firstDoc.full_name || firstDoc.name || 'Dr. Priya Sharma';
    }

    const finalService = customService.trim() ? customService.trim() : service;

    const tokenPayload = {
      id: `TOK-${Date.now().toString().slice(-5)}`,
      tokenNumber: nextToken.tokenNumber,
      tokenCode: nextToken.tokenCode,
      patientName,
      phone,
      age,
      gender,
      isNewPatient: isNew,
      patientId,
      doctorId: selectedDoctorId || (safeDoctors[0]?._id || safeDoctors[0]?.id || 'doc-1'),
      doctorName,
      service: finalService,
      priority,
      status: 'WAITING',
      issuedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim()
    };

    setIsSubmitting(true);
    setTimeout(() => {
      onTokenCreated(tokenPayload);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* ── Modal Header with Token Badge ── */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shadow-xs ring-1 ring-white/20">
              🎟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Issue Clinic OPD Token</h2>
                <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-black uppercase tracking-wider">
                  Next: {nextToken.tokenCode}
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-semibold mt-0.5">
                Register daily walk-in &amp; assign queue priority
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Patient Mode Switcher (Existing vs New Walk-in) ── */}
        <div className="px-6 pt-5 pb-2 bg-slate-50/70 border-b border-slate-200/80">
          <div className="flex p-1 bg-slate-200/80 rounded-2xl w-full">
            <button
              type="button"
              onClick={() => { setActiveTab('existing'); setFormError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'existing'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Existing Clinic Patient
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('new'); setFormError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              New Walk-in Patient
            </button>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              {formError}
            </div>
          )}

          {/* TAB 1: EXISTING PATIENT LOOKUP */}
          {activeTab === 'existing' && (
            <div className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-600" />
                  Search Patient by Name, Phone, or ID
                </label>
                {selectedPatient && (
                  <button 
                    type="button"
                    onClick={() => { setSelectedPatient(null); setSearchQuery(''); }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Change Patient
                  </button>
                )}
              </div>

              {!selectedPatient ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type patient name or phone number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                    />
                  </div>

                  {/* Filtered suggestions list */}
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <div
                          key={p._id || p.id}
                          onClick={() => handleSelectPatient(p)}
                          className="p-2.5 flex items-center justify-between hover:bg-indigo-50/70 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                              {(p.full_name || p.name || 'P')[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {p.full_name || p.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {p.phone || 'No phone'} • {p.gender || 'Unknown'} • {p.age ? `${p.age} yrs` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Select &rarr;
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No matching patients found. Switch to "New Walk-in Patient" above to register.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Selected Patient Pill */
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center">
                      {(selectedPatient.full_name || selectedPatient.name || 'P')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {selectedPatient.full_name || selectedPatient.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          Verified Patient
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        📞 {selectedPatient.phone || 'N/A'} • {selectedPatient.gender || ''} {selectedPatient.age ? `• ${selectedPatient.age} yrs` : ''}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEW PATIENT QUICK-ENTRY */}
          {activeTab === 'new' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                New Patient Walk-in Details
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Chandra"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 35"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveToDatabase"
                  checked={newPatient.saveToDatabase}
                  onChange={(e) => setNewPatient({ ...newPatient, saveToDatabase: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="saveToDatabase" className="text-xs text-slate-600 font-semibold cursor-pointer">
                  Save as permanent patient record in Clinic Directory
                </label>
              </div>
            </div>
          )}

          {/* ── PRIORITY SELECTOR CARDS (Key Feature for User) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Queue Priority Level <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-indigo-600">
                Determines check-in order
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(PRIORITY_LEVELS).map((lvl) => {
                const isSelected = priority === lvl.key;
                return (
                  <div
                    key={lvl.key}
                    onClick={() => setPriority(lvl.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{lvl.iconText}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${lvl.badgeClass}`}>
                        Rank #{lvl.rank}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className={`text-xs font-black ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {lvl.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 line-clamp-1">
                        {lvl.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── DOCTOR & SERVICE SELECTION ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" /> Assigned Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
              >
                <option value="">Any Available Doctor (General Queue)</option>
                {safeDoctors.map((doc) => (
                  <option key={doc._id || doc.id} value={doc._id || doc.id}>
                    {doc.full_name || doc.name} ({doc.specialization || 'Dentist'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" /> Reason / Dental Service
              </label>
              <select
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  if (e.target.value !== 'Other Custom Issue') setCustomService('');
                }}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
              >
                {DENTAL_SERVICES.map((srv) => (
                  <option key={srv} value={srv}>{srv}</option>
                ))}
                <option value="Other Custom Issue">Other Custom Issue</option>
              </select>
            </div>
          </div>

          {service === 'Other Custom Issue' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom Complaint / Service</label>
              <input
                type="text"
                placeholder="Describe dental complaint..."
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Receptionist / Triage Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swelling on lower right jaw for 2 days; allergic to penicillin"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
            />
          </div>

          {/* ── Footer ── */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Issuing Token...' : `Issue Token ${nextToken.tokenCode}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
