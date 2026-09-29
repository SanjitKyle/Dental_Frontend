import React, { useState, useEffect, useContext } from 'react';
import {
  Package, Plus, Search, Filter, Calendar, Clock, CheckCircle2,
  AlertCircle, Truck, Building2, User, Sparkles, ChevronRight,
  MoreVertical, Edit2, Trash2, ArrowUpRight, X, Phone, Tag,
  Check, ArrowRight, ShieldCheck, MessageSquare, ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ContextProvider } from '../../context/store';

const PIPELINE_STAGES = [
  { key: 'Impression Taken', label: '1. Impression', short: 'Impression', icon: '🦷' },
  { key: 'Sent to Lab', label: '2. Sent to Lab', short: 'Dispatched', icon: '📦' },
  { key: 'In Fabrication', label: '3. In Fabrication', short: 'Fabrication', icon: '⚙️' },
  { key: 'Received at Clinic', label: '4. Ready at Clinic', short: 'Delivered', icon: '🏥' },
  { key: 'Fitted in Mouth', label: '5. Fitted in Mouth', short: 'Fitted', icon: '✨' },
];

const STAGE_INDEX = {
  'Impression Taken': 0,
  'Sent to Lab': 1,
  'In Fabrication': 2,
  'Received at Clinic': 3,
  'Fitted in Mouth': 4
};

const LAB_STATUS_META = {
  'Impression Taken': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dot: 'bg-purple-500',
    glow: 'shadow-purple-500/10'
  },
  'Sent to Lab': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
    glow: 'shadow-blue-500/10'
  },
  'In Fabrication': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/10'
  },
  'Received at Clinic': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/10'
  },
  'Fitted in Mouth': {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    glow: 'shadow-slate-500/10'
  },
};

const PROSTHETIC_TYPES = [
  'Zirconia Crown (Monolithic / Multilayer)',
  'PFM Crown (Porcelain Fused to Metal)',
  'E-Max All Ceramic Veneer / Crown',
  'Dental Implant Custom Abutment & Crown',
  'Complete Acrylic Denture (Upper / Lower)',
  'Cast Partial Denture (CPD)',
  'Clear Aligner Set (Stage 1-10)',
  'Orthodontic Retainer (Hawley / Essix)',
  'Night Guard / Occlusal Splint',
  'Dental Bridge (3-4 Units)'
];

const SHADE_GUIDES = ['A1', 'A2', 'A3', 'A3.5', 'B1', 'B2', 'C1', 'C2', 'BL1 (Bleach)', 'BL2', 'Custom Shade'];

const LAB_PARTNERS = [
  { name: 'Dentcare Dental Labs', contact: '+91 98450 11223', city: 'Mumbai Hub' },
  { name: 'Illusion Dental Laboratory', contact: '+91 99887 44556', city: 'Pune Center' },
  { name: 'Katana High-Precision Zirconia Lab', contact: '+91 97654 33221', city: 'Bangalore' },
  { name: 'In-House Rapid Milling Lab', contact: 'Internal Ext: 104', city: 'Clinic Floor 1' }
];

const INITIAL_MOCK_ORDERS = [
  {
    id: 'LAB-2026-081',
    patientName: 'Rahul Verma',
    patientPhone: '+91 98765 43210',
    doctorName: 'Dr. Testing3',
    labName: 'Dentcare Dental Labs',
    prostheticType: 'Zirconia Crown (Monolithic / Multilayer)',
    teethInvolved: '#36 (Lower Left First Molar)',
    shade: 'A2',
    impressionDate: '2026-09-24',
    sentDate: '2026-09-25',
    expectedDelivery: '2026-09-30',
    fittingDate: '2026-10-02',
    labCost: 2800,
    patientPrice: 8500,
    status: 'In Fabrication',
    notes: 'Require tight distal contact with #37. Occlusal clearance 1.5mm.'
  },
  {
    id: 'LAB-2026-082',
    patientName: 'Priya Sharma',
    patientPhone: '+91 99887 66554',
    doctorName: 'Dr. Testing3',
    labName: 'Illusion Dental Laboratory',
    prostheticType: 'E-Max All Ceramic Veneer / Crown',
    teethInvolved: '#11, #21 (Upper Central Incisors)',
    shade: 'BL2',
    impressionDate: '2026-09-22',
    sentDate: '2026-09-23',
    expectedDelivery: '2026-09-28',
    fittingDate: '2026-09-29',
    labCost: 6500,
    patientPrice: 18000,
    status: 'Received at Clinic',
    notes: 'High aesthetic case. Natural translucency on incisal edge.'
  },
  {
    id: 'LAB-2026-083',
    patientName: 'Amit Patel',
    patientPhone: '+91 91234 56789',
    doctorName: 'Dr. Testing3',
    labName: 'Dentcare Dental Labs',
    prostheticType: 'Dental Implant Custom Abutment & Crown',
    teethInvolved: '#46 (Lower Right Molar)',
    shade: 'A3',
    impressionDate: '2026-09-27',
    sentDate: '2026-09-28',
    expectedDelivery: '2026-10-04',
    fittingDate: '2026-10-06',
    labCost: 4500,
    patientPrice: 15000,
    status: 'Sent to Lab',
    notes: 'Screw-retained crown. Osstem 4.5mm platform.'
  }
];

export const LabTracker = () => {
  const { Patients } = useContext(ContextProvider) || {};
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('dental_lab_orders');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_ORDERS;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    doctorName: 'Dr. Testing3',
    labName: 'Dentcare Dental Labs',
    prostheticType: 'Zirconia Crown (Monolithic / Multilayer)',
    teethInvolved: '#36',
    shade: 'A2',
    impressionDate: new Date().toISOString().split('T')[0],
    expectedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    fittingDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    labCost: 3000,
    patientPrice: 9000,
    status: 'Sent to Lab',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('dental_lab_orders', JSON.stringify(orders));
  }, [orders]);

  const handleOpenAdd = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      doctorName: 'Dr. Testing3',
      labName: 'Dentcare Dental Labs',
      prostheticType: 'Zirconia Crown (Monolithic / Multilayer)',
      teethInvolved: '#36',
      shade: 'A2',
      impressionDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      fittingDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      labCost: 3000,
      patientPrice: 9000,
      status: 'Sent to Lab',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSetStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Case updated to: ${newStatus}`);
  };

  const handleAdvanceNextStage = (order) => {
    const currentIndex = STAGE_INDEX[order.status] ?? 0;
    if (currentIndex < PIPELINE_STAGES.length - 1) {
      const nextStage = PIPELINE_STAGES[currentIndex + 1].key;
      handleSetStatus(order.id, nextStage);
    }
  };

  const handleNotifyPatient = (order) => {
    toast.info(`WhatsApp alert sent to ${order.patientName}: Your crown/prosthetic is ready!`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName) {
      toast.error('Please enter patient name');
      return;
    }

    const newOrder = {
      ...formData,
      id: `LAB-2026-${String(Math.floor(100 + Math.random() * 900))}`
    };
    setOrders(prev => [newOrder, ...prev]);
    toast.success('New Dental Lab Order dispatched!');
    setIsModalOpen(false);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.prostheticType.toLowerCase().includes(search.toLowerCase()) ||
      o.teethInvolved.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.labName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const kpis = {
    total: orders.length,
    inLab: orders.filter(o => o.status === 'In Fabrication' || o.status === 'Sent to Lab').length,
    readyToFit: orders.filter(o => o.status === 'Received at Clinic').length,
    completed: orders.filter(o => o.status === 'Fitted in Mouth').length,
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* 1. Header with Modern SaaS Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Dental Lab Work &amp; Prosthetics Pipeline
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage custom crowns, ceramic veneers, implant abutments, and clear aligners sent to lab partners.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Send Work to Lab
        </button>
      </div>

      {/* 2. KPI Cards (Glassmorphic Elevated Design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Prosthetics</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 font-mono">{kpis.total}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">All active restoration orders</p>
        </div>

        {/* In Fabrication */}
        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-2xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">In Lab Fabrication</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-700 mt-2 font-mono">{kpis.inLab}</p>
          <p className="text-xs text-blue-600/80 mt-1 font-medium">With external technicians</p>
        </div>

        {/* Ready at Clinic */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Delivered &bull; Ready</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-2 font-mono">{kpis.readyToFit}</p>
          <p className="text-xs text-emerald-600/80 mt-1 font-medium">Ready for patient fitting</p>
        </div>

        {/* Fitted */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Successfully Fitted</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2 font-mono">{kpis.completed}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Completed cases</p>
        </div>
      </div>

      {/* 3. Search and Segmented Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, tooth #, crown type, lab..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100/80 rounded-2xl">
          {[
            { id: 'ALL', label: 'All Cases', count: orders.length },
            { id: 'Sent to Lab', label: 'Dispatched', count: orders.filter(o => o.status === 'Sent to Lab').length },
            { id: 'In Fabrication', label: 'In Lab', count: orders.filter(o => o.status === 'In Fabrication').length },
            { id: 'Received at Clinic', label: 'Ready at Clinic', count: orders.filter(o => o.status === 'Received at Clinic').length },
            { id: 'Fitted in Mouth', label: 'Fitted', count: orders.filter(o => o.status === 'Fitted in Mouth').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Luxury Order Pipeline Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Dental Lab Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no orders matching your current filter criteria. Click "Send Work to Lab" to dispatch a new case.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const currentIdx = STAGE_INDEX[order.status] ?? 0;
            const statusMeta = LAB_STATUS_META[order.status] || LAB_STATUS_META['In Fabrication'];

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* 1. Card Top Banner: Clean Single-Line Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                      {order.id}
                    </span>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      {order.prostheticType}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                      🦷 {order.teethInvolved.split('(')[0].trim()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Shade: {order.shade}
                    </span>
                  </div>

                  {/* Status Badge & Stepper Button */}
                  <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${statusMeta.badge}`}>
                      <span className={`w-2 h-2 rounded-full ${statusMeta.dot} ${order.status !== 'Fitted in Mouth' ? 'animate-pulse' : ''}`} />
                      {order.status}
                    </span>

                    {currentIdx < PIPELINE_STAGES.length - 1 && (
                      <button
                        onClick={() => handleAdvanceNextStage(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Advance to next clinical stage"
                      >
                        <span>Next: {PIPELINE_STAGES[currentIdx + 1].short}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Seamless 5-Stage Stepper Pipeline */}
                <div className="px-6 py-5 bg-white border-b border-slate-100">
                  <div className="relative max-w-4xl mx-auto">
                    {/* Background Track */}
                    <div className="absolute top-4 left-8 right-8 h-1 bg-slate-100 rounded-full hidden sm:block -z-0" />
                    {/* Active Track */}
                    <div
                      className="absolute top-4 left-8 h-1 bg-blue-600 rounded-full transition-all duration-300 hidden sm:block -z-0"
                      style={{
                        width: `${(currentIdx / (PIPELINE_STAGES.length - 1)) * 92}%`
                      }}
                    />

                    {/* Stage Nodes */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                      {PIPELINE_STAGES.map((st, sIdx) => {
                        const isPast = sIdx < currentIdx;
                        const isCurrent = sIdx === currentIdx;

                        return (
                          <div
                            key={st.key}
                            onClick={() => handleSetStatus(order.id, st.key)}
                            className="flex sm:flex-col items-center gap-2 sm:gap-1.5 transition-all cursor-pointer text-left sm:text-center group"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                              isPast
                                ? 'bg-blue-600 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-105'
                                : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-slate-300'
                            }`}>
                              {isPast ? <Check className="w-4 h-4" /> : st.icon}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[11px] font-black tracking-tight ${
                                isCurrent ? 'text-blue-700' : isPast ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                {st.short}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                                {isPast ? 'Completed' : isCurrent ? 'Active Now' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Unified Case Information Matrix (No Nested Box Fatigue) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-white text-xs">
                  {/* Patient Info */}
                  <div className="p-4 sm:px-6 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Patient</span>
                    <p className="font-extrabold text-slate-900 text-sm truncate">{order.patientName}</p>
                    <p className="text-slate-500 font-medium">📞 {order.patientPhone}</p>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-4 sm:px-6 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prescribing Clinician</span>
                    <p className="font-extrabold text-slate-900 text-sm truncate">{order.doctorName}</p>
                    <p className="text-blue-700 font-bold">Dental Surgeon</p>
                  </div>

                  {/* Lab Partner Info */}
                  <div className="p-4 sm:px-6 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lab Partner</span>
                    <p className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.labName}</span>
                    </p>
                    <p className="text-slate-500 font-medium">Professional Milling Hub</p>
                  </div>

                  {/* Key Dates */}
                  <div className="p-4 sm:px-6 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Timeline</span>
                    <p className="text-slate-600 font-medium">
                      Delivery: <strong className="text-slate-900">{order.expectedDelivery}</strong>
                    </p>
                    <p className="text-indigo-700 font-bold">
                      Fitting: {order.fittingDate}
                    </p>
                  </div>
                </div>

                {/* 4. Technician Memo & Aligned Action Footer */}
                <div className="px-4 py-3 sm:px-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-md shrink-0">
                      🔬 Lab Memo
                    </span>
                    <span className="text-xs text-slate-600 font-medium truncate">
                      {order.notes || 'Standard manufacturing and anatomical contouring specifications.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleNotifyPatient(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Patient</span>
                    </button>

                    <select
                      value={order.status}
                      onChange={e => handleSetStatus(order.id, e.target.value)}
                      className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer shadow-2xs hover:border-slate-300"
                    >
                      {PIPELINE_STAGES.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Lab Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-auto border border-slate-100 flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black">Dispatch Work to Dental Lab</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={formData.patientName}
                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.patientPhone}
                    onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prosthetic / Restoration Type *</label>
                <select
                  value={formData.prostheticType}
                  onChange={e => setFormData({ ...formData, prostheticType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                >
                  {PROSTHETIC_TYPES.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tooth Involved *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. #36, #11"
                    value={formData.teethInvolved}
                    onChange={e => setFormData({ ...formData, teethInvolved: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shade Guide *</label>
                  <select
                    value={formData.shade}
                    onChange={e => setFormData({ ...formData, shade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {SHADE_GUIDES.map(sh => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dental Lab Partner *</label>
                  <select
                    value={formData.labName}
                    onChange={e => setFormData({ ...formData, labName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {LAB_PARTNERS.map(lp => (
                      <option key={lp.name} value={lp.name}>{lp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Lab Delivery Date</label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={e => setFormData({ ...formData, expectedDelivery: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Fitting Appointment Due</label>
                  <input
                    type="date"
                    value={formData.fittingDate}
                    onChange={e => setFormData({ ...formData, fittingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Technician Special Instructions</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Tight contacts, high translucency on incisal edge, 1.5mm occlusal reduction..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
