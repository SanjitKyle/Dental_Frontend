import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, RotateCcw, AlertTriangle, CheckCircle2, 
  DollarSign, Activity, FileText, Printer, Stethoscope, 
  Trash2, User, HelpCircle, Layers, Loader2, RefreshCw,
  Sparkles, ShieldCheck, Tag, Info
} from 'lucide-react';
import { DentalChart } from './DentalChart';
import { CONDITION_COLORS } from './Tooth';
import { 
  getPatientOdontogram, 
  createOdontogram, 
  updatePatientOdontogram, 
  updateTooth, 
  addProcedure, 
  resetTooth, 
  getSummary 
} from '../../services/odontogram';

// Common dental procedures with preset standard pricing matching Swagger schema
const PROCEDURE_PRESETS = [
  { name: 'Composite Restoration', material: 'composite', code: 'D2391', defaultCost: 150, defaultStatus: 'caries' },
  { name: 'Amalgam Restoration', material: 'amalgam', code: 'D2140', defaultCost: 120, defaultStatus: 'caries' },
  { name: 'Ceramic Crown', material: 'ceramic', code: 'D2740', defaultCost: 850, defaultStatus: 'crown' },
  { name: 'Porcelain Fused to Metal Crown', material: 'porcelain_fused_to_metal', code: 'D2750', defaultCost: 700, defaultStatus: 'crown' },
  { name: 'Root Canal Therapy (Molar)', material: 'other', code: 'D3330', defaultCost: 750, defaultStatus: 'root_canal' },
  { name: 'Simple Extraction', material: 'other', code: 'D7140', defaultCost: 150, defaultStatus: 'extracted' },
  { name: 'Surgical Implant Placement', material: 'zirconia', code: 'D6010', defaultCost: 1800, defaultStatus: 'implant' },
  { name: 'Tooth Fracture Repair / Bonding', material: 'composite', code: 'D2999', defaultCost: 200, defaultStatus: 'fracture' },
  { name: 'Porcelain Veneer', material: 'ceramic', code: 'D2962', defaultCost: 950, defaultStatus: 'veneer' },
];

export const OdontogramModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSave,
  patientsList = [],
  doctorsList = [],
  token = null,
}) => {
  // 1. Safe Array normalization
  const safePatients = useMemo(() => {
    if (Array.isArray(patientsList)) return patientsList;
    if (Array.isArray(patientsList?.data)) return patientsList.data;
    return [];
  }, [patientsList]);

  const safeDoctors = useMemo(() => {
    if (Array.isArray(doctorsList)) return doctorsList;
    if (Array.isArray(doctorsList?.data)) return doctorsList.data;
    return [];
  }, [doctorsList]);

  // State management
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [dentitionType, setDentitionType] = useState('permanent');
  const [notation, setNotation] = useState('universal');
  const [activeTool, setActiveTool] = useState('caries');
  const [selectedSurfaces, setSelectedSurfaces] = useState(['occlusal']);
  const [selectedToothFdi, setSelectedToothFdi] = useState(null);
  const [teethData, setTeethData] = useState({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverSummary, setServerSummary] = useState(null);

  // Selected patient details
  const activePatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return safePatients.find((p) => String(p?._id || p?.id) === String(selectedPatientId)) || null;
  }, [safePatients, selectedPatientId]);

  // Calculate treated teeth list
  const treatedTeethList = useMemo(() => {
    if (!teethData || typeof teethData !== 'object') return [];
    return Object.values(teethData).filter((t) => t && typeof t === 'object' && t.status && t.status !== 'sound' && t.status !== 'healthy');
  }, [teethData]);

  const totalCost = treatedTeethList.reduce((acc, curr) => acc + (Number(curr?.cost) || 0), 0);
  const completedCount = treatedTeethList.filter((t) => t?.treatmentStatus === 'completed').length;
  const diagnosedCount = treatedTeethList.filter((t) => t?.treatmentStatus === 'diagnosed' || t?.treatmentStatus === 'planned').length;

  // Helper to convert backend array of teeth into frontend map
  const transformBackendTeethToMap = (backendTeeth = []) => {
    const map = {};
    if (Array.isArray(backendTeeth)) {
      backendTeeth.forEach((t) => {
        if (!t) return;
        const key = t.toothNumber;
        map[key] = {
          toothNumber: t.toothNumber,
          condition: t.condition || 'sound',
          status: t.condition || 'sound',
          surfaces: Array.isArray(t.surfaces) ? t.surfaces.map((s) => (typeof s === 'string' ? s : s?.surface || '')).filter(Boolean) : [],
          procedure: t.procedure || (t.condition === 'caries' ? 'Composite Restoration' : ''),
          cost: t.cost || (t.condition === 'caries' ? 150 : t.condition === 'root_canal' ? 750 : t.condition === 'crown' ? 850 : 0),
          treatmentStatus: t.treatmentStatus || (t.condition === 'sound' ? 'completed' : 'diagnosed'),
          notes: t.notes || '',
          mobility: t.mobility || 0,
          isMissing: t.isMissing || t.condition === 'missing' || t.condition === 'extracted',
          hasRootCanal: t.hasRootCanal || t.condition === 'root_canal',
          hasCrown: t.hasCrown || t.condition === 'crown',
          hasImplant: t.hasImplant || t.condition === 'implant',
        };
      });
    }
    return map;
  };

  // Helper to transform frontend map back to backend Tooth array
  const transformMapToBackendTeeth = (mapObj = {}) => {
    return Object.values(mapObj).map((t) => {
      const condition = t.status || t.condition || 'sound';
      return {
        toothNumber: Number(t.toothNumber),
        condition: condition,
        surfaces: (t.surfaces || []).map((s) => ({
          surface: s,
          condition: condition,
          material: t.material || 'composite',
          status: t.treatmentStatus === 'completed' ? 'completed' : 'diagnosed',
        })),
        mobility: Number(t.mobility) || 0,
        isMissing: condition === 'missing' || condition === 'extracted' || !!t.isMissing,
        hasRootCanal: condition === 'root_canal' || !!t.hasRootCanal,
        hasCrown: condition === 'crown' || !!t.hasCrown,
        hasImplant: condition === 'implant' || !!t.hasImplant,
        notes: t.notes || '',
      };
    });
  };

  // Fetch patient odontogram from backend API when patient changes
  const fetchBackendOdontogram = async (patientId, dType) => {
    if (!token || !patientId) return;
    setIsLoading(true);
    try {
      const res = await getPatientOdontogram(token, patientId, dType);
      const data = res?.data || res;
      if (data) {
        if (data.teeth && Array.isArray(data.teeth)) {
          setTeethData(transformBackendTeethToMap(data.teeth));
        } else if (data.teeth && typeof data.teeth === 'object') {
          setTeethData(data.teeth);
        }
        if (data.generalNotes) setGeneralNotes(data.generalNotes);
        if (data.doctorId) setSelectedDoctorId(data.doctorId);
        if (data.dentitionType) setDentitionType(data.dentitionType);
      }
      
      try {
        const sumRes = await getSummary(token, patientId);
        setServerSummary(sumRes?.data || sumRes);
      } catch (sumErr) {
        console.log('Summary note:', sumErr);
      }
    } catch (err) {
      console.log('Using local chart buffer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize or fetch when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const pid = initialData.patientId || initialData.patient_id || '';
      setSelectedPatientId(pid);
      setCustomPatientName(initialData.patientName || '');
      setSelectedDoctorId(initialData.doctorId || '');
      setDentitionType(initialData.dentitionType || (initialData.chartType === 'pediatric' ? 'deciduous' : 'permanent'));
      setNotation(initialData.notation || 'universal');
      
      if (initialData.teeth) {
        if (Array.isArray(initialData.teeth)) {
          setTeethData(transformBackendTeethToMap(initialData.teeth));
        } else {
          setTeethData(initialData.teeth);
        }
      }
      setGeneralNotes(initialData.generalNotes || '');

      if (pid && token) {
        fetchBackendOdontogram(pid, initialData.dentitionType || 'permanent');
      }
    } else {
      const defaultPid = safePatients[0]?._id || safePatients[0]?.id || '';
      setSelectedPatientId(defaultPid);
      setCustomPatientName('');
      setSelectedDoctorId(safeDoctors[0]?._id || safeDoctors[0]?.id || '');
      setDentitionType('permanent');
      setTeethData({});
      setGeneralNotes('');
      setSelectedToothFdi(null);

      if (defaultPid && token) {
        fetchBackendOdontogram(defaultPid, 'permanent');
      }
    }
  }, [initialData, isOpen, token]);

  // Handle selecting a tooth (receives FDI number and Universal number)
  const handleSelectTooth = (fdiNum, universalNum) => {
    const toothKey = fdiNum;
    setSelectedToothFdi(toothKey);

    if (activeTool === 'sound' || activeTool === 'healthy') {
      const updated = { ...teethData };
      delete updated[toothKey];
      setTeethData(updated);

      if (token && selectedPatientId) {
        resetTooth(token, selectedPatientId, toothKey).catch((e) => console.log('Reset tooth error:', e));
      }
      return;
    }

    const matchingPreset = PROCEDURE_PRESETS.find((p) => p.defaultStatus === activeTool);
    const existing = teethData[toothKey] || {};

    const newToothData = {
      toothNumber: toothKey,
      universalNumber: universalNum,
      status: activeTool,
      condition: activeTool,
      surfaces: (activeTool === 'caries' || activeTool === 'filled') ? [...selectedSurfaces] : [],
      procedure: existing.procedure || matchingPreset?.name || 'Dental Procedure',
      material: existing.material || matchingPreset?.material || 'composite',
      cost: existing.cost !== undefined ? existing.cost : (matchingPreset?.defaultCost || 150),
      treatmentStatus: existing.treatmentStatus || 'diagnosed',
      notes: existing.notes || '',
      isMissing: activeTool === 'missing' || activeTool === 'extracted',
      hasRootCanal: activeTool === 'root_canal',
      hasCrown: activeTool === 'crown',
      hasImplant: activeTool === 'implant',
    };

    setTeethData({
      ...teethData,
      [toothKey]: newToothData,
    });

    if (token && selectedPatientId) {
      updateTooth(token, selectedPatientId, toothKey, {
        toothNumber: toothKey,
        condition: activeTool,
        surfaces: newToothData.surfaces.map((s) => ({
          surface: s,
          condition: activeTool,
          material: newToothData.material,
          status: 'diagnosed',
        })),
        isMissing: newToothData.isMissing,
        hasRootCanal: newToothData.hasRootCanal,
        hasCrown: newToothData.hasCrown,
        hasImplant: newToothData.hasImplant,
        notes: newToothData.notes,
      }).catch((e) => console.log('Live patch tooth note:', e));
    }
  };

  // Handle clicking a specific surface on a tooth
  const handleSurfaceClick = (fdiNum, surfaceName, universalNum) => {
    const toothKey = fdiNum;
    setSelectedToothFdi(toothKey);
    const current = teethData[toothKey] || {
      toothNumber: toothKey,
      universalNumber: universalNum,
      status: activeTool === 'sound' ? 'caries' : activeTool,
      condition: activeTool === 'sound' ? 'caries' : activeTool,
      surfaces: [],
      procedure: 'Composite Restoration',
      material: 'composite',
      cost: 150,
      treatmentStatus: 'diagnosed',
      notes: '',
    };

    let updatedSurfaces = Array.isArray(current.surfaces) ? current.surfaces : [];
    if (updatedSurfaces.includes(surfaceName)) {
      updatedSurfaces = updatedSurfaces.filter((s) => s !== surfaceName);
    } else {
      updatedSurfaces = [...updatedSurfaces, surfaceName];
    }

    setTeethData({
      ...teethData,
      [toothKey]: {
        ...current,
        status: (current.status === 'sound' || current.status === 'healthy') ? 'caries' : current.status,
        condition: (current.condition === 'sound' || current.condition === 'healthy') ? 'caries' : current.condition,
        surfaces: updatedSurfaces,
      },
    });
  };

  // Toggle surface selection in palette
  const toggleSurface = (surface) => {
    if (selectedSurfaces.includes(surface)) {
      setSelectedSurfaces(selectedSurfaces.filter((s) => s !== surface));
    } else {
      setSelectedSurfaces([...selectedSurfaces, surface]);
    }
  };

  // Update specific property on a tooth
  const updateToothProp = (toothKey, key, value) => {
    if (!teethData[toothKey]) return;
    setTeethData({
      ...teethData,
      [toothKey]: {
        ...teethData[toothKey],
        [key]: value,
      },
    });
  };

  // Remove a tooth from treatment plan
  const removeTooth = (toothKey) => {
    const updated = { ...teethData };
    delete updated[toothKey];
    setTeethData(updated);
    if (selectedToothFdi === toothKey) setSelectedToothFdi(null);

    if (token && selectedPatientId) {
      resetTooth(token, selectedPatientId, toothKey).catch((e) => console.log('Reset tooth error:', e));
    }
  };

  // Handle Save to Backend & State
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const patientName = activePatient?.full_name || customPatientName || initialData?.patientName || 'Walk-in Patient';
    const doctorObj = safeDoctors.find((d) => String(d?._id || d?.id) === String(selectedDoctorId));
    const doctorName = doctorObj?.full_name || doctorObj?.name || initialData?.doctorName || 'Dr. Assigned';

    const backendTeethPayload = transformMapToBackendTeeth(teethData);

    const fullPayload = {
      patientId: selectedPatientId || initialData?.patientId,
      doctorId: selectedDoctorId || initialData?.doctorId,
      dentitionType,
      generalNotes,
      teeth: backendTeethPayload,
    };

    if (token && selectedPatientId) {
      try {
        await updatePatientOdontogram(token, selectedPatientId, fullPayload);
      } catch (err) {
        console.log('Update fallback to createOdontogram:', err);
        try {
          await createOdontogram(token, fullPayload);
        } catch (createErr) {
          console.error('Backend save error:', createErr);
        }
      }
    }

    const record = {
      _id: initialData?._id || `odonto_${Date.now()}`,
      patientId: selectedPatientId,
      patientName,
      patientPhone: activePatient?.phone || initialData?.patientPhone || '',
      patientAge: activePatient?.age || 35,
      doctorId: selectedDoctorId,
      doctorName,
      chartType: dentitionType === 'deciduous' ? 'pediatric' : 'adult',
      dentitionType,
      notation,
      teeth: teethData,
      affectedCount: treatedTeethList.length,
      completedCount,
      plannedCount: diagnosedCount,
      totalCost,
      generalNotes,
      status: treatedTeethList.length === 0 ? 'Normal' : completedCount === treatedTeethList.length ? 'Completed' : 'In Progress',
      updatedAt: new Date().toISOString(),
    };

    if (onSave) onSave(record);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-[fadeIn_0.25s_ease-out]">
      <div className="bg-white w-full max-w-[1580px] h-[96vh] sm:h-auto sm:max-h-[94vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
        
        {/* CLEAN MODAL HEADER */}
        <div className="p-3.5 sm:px-6 sm:py-4 md:px-8 border-b border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {initialData ? `Dental Chart: ${initialData.patientName || 'Patient'}` : 'Dental Odontogram Chart'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  Click any tooth to diagnose conditions.
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer md:hidden shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TOGGLE CONTROLS */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Dentition Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold shadow-inner flex-1 sm:flex-none justify-center">
              <button
                type="button"
                onClick={() => {
                  setDentitionType('permanent');
                  if (selectedPatientId) fetchBackendOdontogram(selectedPatientId, 'permanent');
                }}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                  dentitionType === 'permanent' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Permanent (32T)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDentitionType('deciduous');
                  if (selectedPatientId) fetchBackendOdontogram(selectedPatientId, 'deciduous');
                }}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                  dentitionType === 'deciduous' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deciduous (20T)
              </button>
            </div>

            {/* Notation Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold shadow-inner flex-1 sm:flex-none justify-center">
              <button
                type="button"
                onClick={() => setNotation('universal')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                  notation === 'universal' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Universal (1–32)
              </button>
              <button
                type="button"
                onClick={() => setNotation('fdi')}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                  notation === 'fdi' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FDI (11–48)
              </button>
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden md:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PATIENT CONTEXT BAR */}
        <div className="p-3 sm:px-6 sm:py-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 text-xs shrink-0">
          {/* Patient Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <div className="p-1 rounded-lg bg-white border border-slate-200 text-blue-700 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] shrink-0">Patient:</span>
            {safePatients.length > 0 ? (
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setSelectedPatientId(pid);
                  if (pid) fetchBackendOdontogram(pid, dentitionType);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none cursor-pointer shadow-2xs w-full truncate"
              >
                <option value="">-- Select Patient --</option>
                {safePatients.map((p) => (
                  <option key={p?._id || p?.id || Math.random()} value={p?._id || p?.id}>
                    {p?.full_name || 'Patient'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customPatientName}
                onChange={(e) => setCustomPatientName(e.target.value)}
                placeholder="Enter patient name..."
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none shadow-2xs w-full"
              />
            )}

            {selectedPatientId && token && (
              <button
                type="button"
                onClick={() => fetchBackendOdontogram(selectedPatientId, dentitionType)}
                title="Sync from backend"
                className="p-1.5 bg-white border border-slate-300 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* DMFT Summary Index */}
          {serverSummary && (
            <div className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto">
              <span className="font-black text-blue-900 text-[11px] uppercase tracking-wider">DMFT:</span>
              <span className="font-black text-blue-700 text-xs">{serverSummary?.dmftIndex || 0}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 text-[10px] sm:text-[11px]">D: <b className="text-red-600">{serverSummary?.decayedTeeth || 0}</b></span>
              <span className="text-slate-600 text-[10px] sm:text-[11px]">M: <b className="text-slate-700">{serverSummary?.missingTeeth || 0}</b></span>
              <span className="text-slate-600 text-[10px] sm:text-[11px]">F: <b className="text-blue-600">{serverSummary?.filledTeeth || 0}</b></span>
            </div>
          )}

          {/* Doctor Selector */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] shrink-0">Dentist:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none cursor-pointer shadow-2xs w-full sm:w-auto truncate"
            >
              <option value="">-- Select Dentist --</option>
              {safeDoctors.map((d) => (
                <option key={d?._id || d?.id || Math.random()} value={d?._id || d?.id}>
                  Dr. {d?.full_name || d?.name || 'Doctor'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MODAL BODY (LEFT CHART CANVAS + RIGHT PROCEDURE PANEL) */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* MAIN CHART AREA */}
          <div className="flex-1 p-3 sm:p-5 md:p-6 flex flex-col gap-3.5 sm:gap-5 overflow-x-hidden overflow-y-auto bg-slate-50/30">
            
            {/* MODERN TOOL PALETTE (VIBRANT CLINICAL BRUSH) */}
            <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-3 sm:mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Diagnostic Tool Brush
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  Select diagnosis/condition, then tap any tooth
                </span>
              </div>

              {/* Tool Pills Grid */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: 'caries', label: 'Caries (Decay)', bg: 'bg-red-500', active: 'bg-red-500 text-white shadow-red-500/25 border-red-600', dot: 'bg-red-500' },
                  { id: 'filled', label: 'Filled / Restored', bg: 'bg-blue-600', active: 'bg-blue-600 text-white shadow-blue-500/25 border-blue-700', dot: 'bg-blue-600' },
                  { id: 'crown', label: 'Crown / Cap', bg: 'bg-amber-500', active: 'bg-amber-500 text-white shadow-amber-500/25 border-amber-600', dot: 'bg-amber-500' },
                  { id: 'root_canal', label: 'Root Canal (RCT)', bg: 'bg-orange-500', active: 'bg-orange-500 text-white shadow-orange-500/25 border-orange-600', dot: 'bg-orange-500' },
                  { id: 'extracted', label: 'Extracted / Missing', bg: 'bg-slate-500', active: 'bg-slate-600 text-white shadow-slate-500/25 border-slate-700', dot: 'bg-slate-500' },
                  { id: 'implant', label: 'Dental Implant', bg: 'bg-purple-600', active: 'bg-purple-600 text-white shadow-purple-500/25 border-purple-700', dot: 'bg-purple-600' },
                  { id: 'fracture', label: 'Fracture / Chip', bg: 'bg-pink-500', active: 'bg-pink-500 text-white shadow-pink-500/25 border-pink-600', dot: 'bg-pink-500' },
                  { id: 'veneer', label: 'Veneer', bg: 'bg-cyan-500', active: 'bg-cyan-500 text-white shadow-cyan-500/25 border-cyan-600', dot: 'bg-cyan-500' },
                  { id: 'sound', label: 'Sound / Clear', bg: 'bg-emerald-500', active: 'bg-slate-900 text-white shadow-slate-900/25 border-slate-900', dot: 'bg-emerald-500' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold sm:font-black transition-all cursor-pointer border shadow-2xs ${
                      activeTool === tool.id
                        ? `${tool.active} shadow-md scale-105`
                        : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${activeTool === tool.id ? 'bg-white ring-2 ring-white/30' : tool.dot}`} />
                    {tool.label}
                  </button>
                ))}
              </div>

              {/* Surface multi-selector for caries/filled */}
              {(activeTool === 'caries' || activeTool === 'filled') && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px]">Surfaces:</span>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {[
                      { key: 'occlusal', label: 'O (Occ)' },
                      { key: 'mesial', label: 'M (Mes)' },
                      { key: 'distal', label: 'D (Dist)' },
                      { key: 'buccal', label: 'B (Bucc)' },
                      { key: 'lingual', label: 'L (Ling)' },
                    ].map((surf) => (
                      <button
                        key={surf.key}
                        type="button"
                        onClick={() => toggleSurface(surf.key)}
                        className={`px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer ${
                          selectedSurfaces.includes(surf.key)
                            ? 'bg-blue-700 text-white border-blue-800 shadow-sm shadow-blue-500/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {surf.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DENTAL CHART */}
            <DentalChart
              teethData={teethData}
              selectedTooth={selectedToothFdi}
              notation={notation}
              chartType={dentitionType === 'deciduous' ? 'pediatric' : 'adult'}
              onSelectTooth={handleSelectTooth}
              onSurfaceClick={handleSurfaceClick}
            />

            {/* QUICK ACTIONS & RESET */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] sm:text-[11px]">Condition Key:</span>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs"><span className="w-2.5 h-2.5 bg-red-500 rounded-md shadow-2xs" /> Caries</div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs"><span className="w-2.5 h-2.5 bg-blue-600 rounded-md shadow-2xs" /> Filled</div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs"><span className="w-2.5 h-2.5 bg-amber-400 rounded-md shadow-2xs" /> Crown</div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs"><span className="w-2.5 h-2.5 bg-orange-500 rounded-md shadow-2xs" /> Root Canal</div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs"><span className="w-2.5 h-2.5 bg-purple-600 rounded-md shadow-2xs" /> Implant</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all teeth on this chart?')) setTeethData({});
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer border border-slate-200 w-full sm:w-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Entire Chart
              </button>
            </div>
          </div>

          {/* TREATMENT PLAN & PROCEDURES PANEL (RIGHT SIDEBAR) */}
          <div className="w-full lg:w-[460px] xl:w-[480px] bg-slate-50/80 p-3.5 sm:p-5 md:p-6 flex flex-col justify-between overflow-y-auto">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200/90 mb-3.5 sm:mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Procedures & Treatments
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    {treatedTeethList.length} teeth diagnosed
                  </p>
                </div>
                <div className="text-right bg-white px-3 py-1.5 rounded-2xl border border-blue-100 shadow-2xs">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Total Fee</span>
                  <div className="text-lg sm:text-xl font-black text-blue-700">${totalCost.toLocaleString()}</div>
                </div>
              </div>

              {/* Teeth Treatment Cards List */}
              {treatedTeethList.length === 0 ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 p-6 sm:p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 sm:mb-3">
                    <Activity className="w-5 sm:w-6 h-5 sm:h-6" />
                  </div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">No teeth marked</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-xs font-medium">
                    Select a tool brush and click on any tooth in the chart to record findings and planned procedures.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] sm:max-h-[440px] overflow-y-auto pr-1">
                  {treatedTeethList.map((tooth) => {
                    const condKey = tooth.condition || tooth.status || 'sound';
                    const meta = CONDITION_COLORS[condKey] || CONDITION_COLORS.sound;
                    return (
                      <div
                        key={tooth.toothNumber}
                        className={`bg-white p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border transition-all relative overflow-hidden ${
                          selectedToothFdi === tooth.toothNumber
                            ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        {/* Left Condition Color Accent Line */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: meta.bg }}
                        />

                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-2 pl-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-black text-[11px] sm:text-xs shadow-2xs">
                              Tooth #{tooth.toothNumber}
                            </span>
                            <span
                              className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${meta.bg}15`, color: meta.border }}
                            >
                              {meta.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-1.5">
                            {/* Status Selector */}
                            <select
                              value={tooth.treatmentStatus || 'diagnosed'}
                              onChange={(e) => updateToothProp(tooth.toothNumber, 'treatmentStatus', e.target.value)}
                              className={`text-[10px] sm:text-[11px] font-black rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                                tooth.treatmentStatus === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              <option value="diagnosed">Diagnosed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => removeTooth(tooth.toothNumber)}
                              className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Procedure Name & Cost */}
                        <div className="grid grid-cols-3 gap-2 mt-2 pl-1">
                          <div className="col-span-2">
                            <label className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Procedure</label>
                            <input
                              type="text"
                              value={tooth.procedure || ''}
                              onChange={(e) => updateToothProp(tooth.toothNumber, 'procedure', e.target.value)}
                              placeholder="e.g. Composite Restoration"
                              className="w-full text-xs font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fee ($)</label>
                            <input
                              type="number"
                              value={tooth.cost !== undefined ? tooth.cost : ''}
                              onChange={(e) => updateToothProp(tooth.toothNumber, 'cost', Number(e.target.value))}
                              className="w-full text-xs font-black px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Surfaces */}
                        {Array.isArray(tooth.surfaces) && tooth.surfaces.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 pl-1">
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Surfaces:</span>
                            {tooth.surfaces.map((s) => (
                              <span key={s} className="text-[9px] sm:text-[10px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md uppercase border border-blue-100">
                                {s[0]}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        <input
                          type="text"
                          value={tooth.notes || ''}
                          onChange={(e) => updateToothProp(tooth.toothNumber, 'notes', e.target.value)}
                          placeholder="Clinical tooth notes..."
                          className="w-full text-xs text-slate-600 px-2.5 py-1.5 mt-2 pl-1 bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* General Clinical Notes */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/90">
                <label className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  General Chart Notes & Recommendations
                </label>
                <textarea
                  rows="2"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="e.g. Advised routine oral hygiene, scheduled recall in 6 months..."
                  className="w-full text-xs font-semibold p-2.5 sm:p-3.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800 shadow-2xs"
                />
              </div>
            </div>

            {/* ACTION BUTTONS (STICKY FOOTER) */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200/90 flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-300 bg-white text-slate-700 font-extrabold text-[11px] sm:text-xs hover:bg-slate-100 transition-colors uppercase tracking-wider cursor-pointer shadow-2xs disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveForm}
                disabled={isSaving}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-[11px] sm:text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-wider cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving...' : 'Save Odontogram'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
