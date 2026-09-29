import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Users, Plus, Search, Clock, CheckCircle2, AlertTriangle, 
  Stethoscope, Volume2, Printer, ArrowRight, Sparkles, Filter, 
  X, RefreshCw, ChevronRight, UserCheck, ShieldAlert, Play, Check, 
  RotateCcw, Trash2, LayoutGrid, List, Bell, Activity, Phone, User,
  Tv, Monitor, ArrowUpRight, CheckCircle, Calendar, Hash, Tag
} from 'lucide-react';
import { ContextProvider } from '../../context/store';
import { 
  loadQueueFromStorage, 
  saveQueueToStorage, 
  sortQueueByPriority, 
  PRIORITY_LEVELS, 
  QUEUE_STATUS, 
  playClinicChime 
} from '../../services/queueStorage';
import { IssueTokenModal } from '../queue/IssueTokenModal';
import { TokenSlipModal } from '../queue/TokenSlipModal';

export const PatientQueue = () => {
  const { Doctors } = useContext(ContextProvider);

  const [queue, setQueue] = useState([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedTokenSlip, setSelectedTokenSlip] = useState(null);
  const [isTvDisplayOpen, setIsTvDisplayOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'cards'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Load initial queue
  useEffect(() => {
    const loaded = loadQueueFromStorage();
    setQueue(sortQueueByPriority(loaded));

    const handleStorageChange = () => {
      setQueue(sortQueueByPriority(loadQueueFromStorage()));
    };
    window.addEventListener('clinicQueueUpdated', handleStorageChange);
    return () => window.removeEventListener('clinicQueueUpdated', handleStorageChange);
  }, []);

  const updateQueue = (newQueue) => {
    const sorted = sortQueueByPriority(newQueue);
    setQueue(sorted);
    saveQueueToStorage(sorted);
  };

  const safeDoctors = useMemo(() => {
    let list = [];
    if (Array.isArray(Doctors)) list = Doctors;
    else if (Array.isArray(Doctors?.data)) list = Doctors.data;
    else if (Array.isArray(Doctors?.doctors)) list = Doctors.doctors;
    else if (Array.isArray(Doctors?.data?.data)) list = Doctors.data.data;
    return list;
  }, [Doctors]);

  // Derived metrics
  const activeServing = useMemo(() => {
    return queue.find((q) => q.status === QUEUE_STATUS.IN_CONSULTATION) || null;
  }, [queue]);

  const waitingList = useMemo(() => {
    return queue.filter((q) => q.status === QUEUE_STATUS.WAITING);
  }, [queue]);

  const nextPatient = waitingList[0] || null;

  const completedList = useMemo(() => {
    return queue.filter((q) => q.status === QUEUE_STATUS.COMPLETED);
  }, [queue]);

  const estimatedWaitMins = waitingList.length * 12;

  // Actions
  const handleTokenCreated = (newToken) => {
    const updated = [newToken, ...queue];
    updateQueue(updated);
    setSelectedTokenSlip(newToken);
  };

  const handleCallNext = () => {
    if (!nextPatient) return;

    const updated = queue.map((item) => {
      if (item.status === QUEUE_STATUS.IN_CONSULTATION) {
        return {
          ...item,
          status: QUEUE_STATUS.COMPLETED,
          consultationEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      if (item.id === nextPatient.id) {
        return {
          ...item,
          status: QUEUE_STATUS.IN_CONSULTATION,
          consultationStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return item;
    });

    updateQueue(updated);
    if (soundEnabled) playClinicChime();
  };

  const handleStartConsultation = (tokenId) => {
    const updated = queue.map((item) => {
      if (item.id === tokenId) {
        return {
          ...item,
          status: QUEUE_STATUS.IN_CONSULTATION,
          consultationStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      if (item.status === QUEUE_STATUS.IN_CONSULTATION && item.id !== tokenId) {
        return {
          ...item,
          status: QUEUE_STATUS.COMPLETED,
          consultationEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return item;
    });

    updateQueue(updated);
    if (soundEnabled) playClinicChime();
  };

  const handleMarkComplete = (tokenId) => {
    const updated = queue.map((item) => {
      if (item.id === tokenId) {
        return {
          ...item,
          status: QUEUE_STATUS.COMPLETED,
          consultationEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return item;
    });
    updateQueue(updated);
  };

  const handleSkipToken = (tokenId) => {
    const updated = queue.map((item) => {
      if (item.id === tokenId) {
        return { ...item, status: QUEUE_STATUS.SKIPPED };
      }
      return item;
    });
    updateQueue(updated);
  };

  const handleRequeueToken = (tokenId) => {
    const updated = queue.map((item) => {
      if (item.id === tokenId) {
        return { ...item, status: QUEUE_STATUS.WAITING };
      }
      return item;
    });
    updateQueue(updated);
  };

  const handleCancelToken = (tokenId) => {
    const updated = queue.filter((item) => item.id !== tokenId);
    updateQueue(updated);
  };

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        (item.patientName || '').toLowerCase().includes(q) ||
        (item.tokenCode || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q) ||
        (item.service || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesDoctor = doctorFilter === 'ALL' || item.doctorName === doctorFilter;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [queue, searchQuery, statusFilter, doctorFilter]);

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* ── Modals ── */}
      <IssueTokenModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onTokenCreated={handleTokenCreated}
        currentQueue={queue}
      />

      {selectedTokenSlip && (
        <TokenSlipModal
          tokenData={selectedTokenSlip}
          onClose={() => setSelectedTokenSlip(null)}
        />
      )}

      {/* ── Public Waiting Room / TV Display Modal ── */}
      {isTvDisplayOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 sm:p-10 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30">
                🦷
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">DentalClinic Healthcare</h1>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Outpatient Token Display</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-2xl sm:text-3xl font-mono font-black text-indigo-300">{currentTime}</span>
              <button 
                onClick={() => setIsTvDisplayOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
              >
                Close Display
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 my-auto py-8">
            {/* Left Big Spotlight: NOW CALLING */}
            <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 rounded-3xl p-8 border-2 border-indigo-500/50 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-widest animate-pulse">
                🔔 Now Calling • Cabin 1
              </span>

              {activeServing ? (
                <div className="mt-6 space-y-4">
                  <div className="text-8xl sm:text-9xl font-black font-mono text-white tracking-tight drop-shadow-md">
                    {activeServing.tokenCode}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-indigo-200">
                    {activeServing.patientName}
                  </h2>
                  <p className="text-base text-slate-300 font-semibold">
                    Consultation with <span className="text-white font-bold">{activeServing.doctorName}</span>
                  </p>
                </div>
              ) : (
                <div className="mt-8 text-center text-slate-400 space-y-2">
                  <p className="text-5xl font-mono">--</p>
                  <p className="text-lg">Please wait for the next token call</p>
                </div>
              )}
            </div>

            {/* Right: Upcoming Tokens Queue */}
            <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Next In Line</span>
                <span className="text-xs font-bold text-amber-400">{waitingList.length} Waiting</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {waitingList.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono font-black text-xl flex items-center justify-center">
                        {item.tokenCode}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{item.patientName}</p>
                        <p className="text-xs text-slate-400">{item.doctorName} • {item.service}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">#{i + 1} in queue</span>
                  </div>
                ))}
                {waitingList.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No other patients waiting currently
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header Master Control Banner ── */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-indigo-600 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-600/25 shrink-0 ring-4 ring-indigo-50">
            🎟️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Patient Queue &amp; OPD Tokens
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live OPD Desk
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Priority triage order for walk-ins &amp; scheduled visits •{' '}
              <span className="font-bold text-slate-700">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          {/* Waiting Room TV */}
          <button
            onClick={() => setIsTvDisplayOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
            title="Open Fullscreen Waiting Room TV Display"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Waiting Room TV</span>
          </button>

          {/* Sound chime button */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playClinicChime();
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Call Next Button */}
          <button
            onClick={handleCallNext}
            disabled={!nextPatient}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-sm shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Call Next {nextPatient ? `(${nextPatient.tokenCode})` : ''}</span>
          </button>

          {/* Issue Token Button (Clean single plus) */}
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Token</span>
          </button>
        </div>
      </div>

      {/* ── Spotlight Stage: Cabin #1 vs Next Patient in Line ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor Cabin #1 Card */}
        <div className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
          activeServing 
            ? 'bg-white border-indigo-200 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/10' 
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Doctor Cabin #1</span>
                <h3 className="text-sm font-black text-slate-800">Currently in Consultation</h3>
              </div>
            </div>

            {activeServing ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                Cabin Ready
              </span>
            )}
          </div>

          {activeServing ? (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-mono font-black text-xl shadow-md shadow-indigo-600/30 shrink-0 ring-4 ring-indigo-50">
                  {activeServing.tokenCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{activeServing.patientName}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activeServing.isNewPatient ? 'New Walk-in' : 'Registered'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    👨‍⚕️ {activeServing.doctorName} • {activeServing.service}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Consultation started at {activeServing.consultationStartTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTokenSlip(activeServing)}
                  className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border border-slate-200"
                  title="Print Token Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMarkComplete(activeServing.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-4 h-4" /> Finish Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-4 bg-slate-50/60 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-semibold">
                Doctor cabin is free and ready for the next patient.
              </p>
              {nextPatient && (
                <button
                  onClick={handleCallNext}
                  className="mt-2 text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  Call next patient ({nextPatient.patientName}) &rarr;
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next Up Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200/70">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Queue Priority #1</span>
                <h3 className="text-sm font-black text-slate-800">Next Patient in Line</h3>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
              {waitingList.length} Waiting in Lounge
            </span>
          </div>

          {nextPatient ? (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-black text-xl border border-slate-300 shrink-0">
                  {nextPatient.tokenCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{nextPatient.patientName}</h4>
                    {PRIORITY_LEVELS[nextPatient.priority] && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${PRIORITY_LEVELS[nextPatient.priority].badgeClass}`}>
                        {PRIORITY_LEVELS[nextPatient.priority].iconText} {PRIORITY_LEVELS[nextPatient.priority].label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Assigned: {nextPatient.doctorName} • {nextPatient.service}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Waiting since {nextPatient.issuedTime}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartConsultation(nextPatient.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Call In Cabin
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center py-4 bg-slate-50/60 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-xs text-slate-600 font-bold">
                Waiting lounge is clear!
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Issue a token when a walk-in arrives to add them to the queue.
              </p>
            </div>
          )}
        </div>
      </div>


      {/* ── KPI Counter Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tokens Today</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{queue.length}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">All issued tokens</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Currently Waiting</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{waitingList.length}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Est. ~{estimatedWaitMins} mins wait</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultations Done</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedList.length}</h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Checked by doctor</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High Priority Cases</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">
              {queue.filter(q => q.priority === 'EMERGENCY' || q.priority === 'URGENT').length}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Emergency &amp; Urgent</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Search, Filters & View Toggle ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by token #, patient name, mobile or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Doctor Filter */}
        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 shadow-xs"
        >
          <option value="ALL">All Doctors</option>
          {safeDoctors.map((doc) => {
            const name = doc.full_name || doc.name;
            return <option key={name} value={name}>{name}</option>;
          })}
        </select>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Tokens' },
            { id: QUEUE_STATUS.WAITING, label: `Waiting (${waitingList.length})` },
            { id: QUEUE_STATUS.IN_CONSULTATION, label: 'In Cabin' },
            { id: QUEUE_STATUS.COMPLETED, label: 'Completed' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === pill.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Priority Legend Info Pill ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200/60 overflow-x-auto gap-4">
        <span className="font-extrabold text-slate-700 shrink-0">Priority Order:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(PRIORITY_LEVELS).map((lvl) => (
            <span key={lvl.key} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${lvl.badgeClass}`}>
              <span>{lvl.iconText}</span>
              <span>{lvl.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── QUEUE LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-2xs">
                🎟️
              </div>
              <h4 className="text-sm font-bold text-slate-800">No patients in this queue view</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No tokens match your search or filter. Click &ldquo;Issue Token&rdquo; to add a new walk-in patient.
              </p>
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Issue Walk-in Token
              </button>
            </div>
          ) : (
            filteredQueue.map((item, idx) => {
              const priorityMeta = PRIORITY_LEVELS[item.priority] || PRIORITY_LEVELS.NORMAL;
              const isServing = item.status === QUEUE_STATUS.IN_CONSULTATION;
              const isWaiting = item.status === QUEUE_STATUS.WAITING;
              const isCompleted = item.status === QUEUE_STATUS.COMPLETED;
              const isSkipped = item.status === QUEUE_STATUS.SKIPPED;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs hover:shadow-md hover:border-indigo-200 group ${
                    isServing
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50/50 via-white to-white ring-2 ring-indigo-500/20 shadow-indigo-500/5'
                      : isCompleted
                      ? 'border-slate-200/70 opacity-80'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Left Block: Token & Priority Badge */}
                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-lg shadow-sm shrink-0 transition-all ${
                      isServing
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white ring-4 ring-indigo-100 shadow-indigo-600/30'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50/40 group-hover:text-indigo-700'
                    }`}>
                      <span className="leading-none">{item.tokenCode}</span>
                      <span className="text-[9px] font-sans font-bold uppercase mt-1 opacity-70">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${priorityMeta.badgeClass}`}>
                        <span>{priorityMeta.iconText}</span>
                        <span>{priorityMeta.label}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Arrived {item.issuedTime}
                      </span>
                    </div>
                  </div>

                  {/* Middle Block: Patient, Doctor & Service Info */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                    {/* Patient */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {(item.patientName || 'P')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-extrabold text-slate-900 truncate">
                            {item.patientName}
                          </p>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                            item.isNewPatient ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.isNewPatient ? 'New' : 'Registered'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          📞 {item.phone || 'No Phone'} {item.age ? `• ${item.age}y` : ''} {item.gender ? `• ${item.gender}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Doctor */}
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Doctor</span>
                      <div className="flex items-center gap-1.5 mt-0.5 truncate">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {item.doctorName}
                        </span>
                      </div>
                    </div>

                    {/* Service */}
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service / Reason</span>
                      <p className="text-xs font-bold text-indigo-700 truncate mt-0.5">
                        {item.service}
                      </p>
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 truncate italic">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="shrink-0 flex items-center">
                    {isServing && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                        In Cabin #1
                      </span>
                    )}
                    {isWaiting && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Waiting Turn
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        Finished
                      </span>
                    )}
                    {isSkipped && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
                        On Hold
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    {isWaiting && (
                      <button
                        onClick={() => handleStartConsultation(item.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-indigo-600/25"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Call In
                      </button>
                    )}

                    {isServing && (
                      <button
                        onClick={() => handleMarkComplete(item.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-emerald-600/25"
                      >
                        <Check className="w-3.5 h-3.5" /> Finish
                      </button>
                    )}

                    {/* Print Slip */}
                    <button
                      onClick={() => setSelectedTokenSlip(item)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border border-slate-200/90"
                      title="Print Token Ticket Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Hold / Skip */}
                    {isWaiting && (
                      <button
                        onClick={() => handleSkipToken(item.id)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer border border-slate-200/80"
                        title="Put On Hold"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    {isSkipped && (
                      <button
                        onClick={() => handleRequeueToken(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-200"
                        title="Recall back to active queue"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Recall
                      </button>
                    )}

                    {/* Cancel */}
                    <button
                      onClick={() => handleCancelToken(item.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Cancel Token"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── QUEUE CARDS / GRID VIEW ── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQueue.map((item, idx) => {
            const priorityMeta = PRIORITY_LEVELS[item.priority] || PRIORITY_LEVELS.NORMAL;
            const isServing = item.status === QUEUE_STATUS.IN_CONSULTATION;
            const isWaiting = item.status === QUEUE_STATUS.WAITING;
            const isCompleted = item.status === QUEUE_STATUS.COMPLETED;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all hover:shadow-lg shadow-xs ${
                  isServing 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/40 to-white' 
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-base shadow-xs ${
                        isServing ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {item.tokenCode}
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${priorityMeta.badgeClass}`}>
                          <span>{priorityMeta.iconText}</span>
                          <span>{priorityMeta.label}</span>
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">
                          Queue position #{idx + 1}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTokenSlip(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Patient Info */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">{item.patientName}</h4>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                        item.isNewPatient ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.isNewPatient ? 'New' : 'Reg'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      📞 {item.phone || 'No Phone'} {item.age ? `• ${item.age} yrs` : ''}
                    </p>
                  </div>

                  {/* Service & Doctor */}
                  <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold truncate">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{item.doctorName}</span>
                    </div>
                    <p className="text-[11px] text-indigo-700 font-semibold truncate">
                      {item.service}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {isServing && (
                      <span className="text-[11px] font-black text-indigo-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /> In Cabin
                      </span>
                    )}
                    {isWaiting && (
                      <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Waiting
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Finished
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isWaiting && (
                      <button
                        onClick={() => handleStartConsultation(item.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                      >
                        Call In
                      </button>
                    )}
                    {isServing && (
                      <button
                        onClick={() => handleMarkComplete(item.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
