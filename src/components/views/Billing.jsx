import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/store';
import {
  Receipt, Plus, Search, FileText, Download, Eye,
  CheckCircle2, Clock, AlertCircle, TrendingUp, DollarSign,
  Calendar, User, Filter, ChevronDown, MoreVertical,
  CreditCard, ArrowUpRight, Banknote, X
} from 'lucide-react';

const STATUS_CONFIG = {
  Paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    badge: 'bg-emerald-100 text-emerald-800',
  },
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    icon: Clock,
    badge: 'bg-amber-100 text-amber-800',
  },
  Overdue: {
    label: 'Overdue',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: AlertCircle,
    badge: 'bg-red-100 text-red-800',
  },
};

const SAMPLE_INVOICES = [
  { id: 'INV-2023-001', patient: 'Michael Chen', date: 'Oct 24, 2023', amount: 450.00, status: 'Paid', service: 'Root Canal Treatment', doctor: 'Dr. Priya Sharma' },
  { id: 'INV-2023-002', patient: 'Sarah Jenkins', date: 'Oct 23, 2023', amount: 1240.00, status: 'Pending', service: 'Dental Implant', doctor: 'Dr. Rajan Mehta' },
  { id: 'INV-2023-003', patient: 'Emily Davis', date: 'Oct 20, 2023', amount: 120.00, status: 'Overdue', service: 'Teeth Cleaning', doctor: 'Dr. Priya Sharma' },
  { id: 'INV-2023-004', patient: 'James Wilson', date: 'Oct 18, 2023', amount: 320.00, status: 'Paid', service: 'Orthodontic Consultation', doctor: 'Dr. Anita Rao' },
  { id: 'INV-2023-005', patient: 'Lisa Turner', date: 'Oct 15, 2023', amount: 780.00, status: 'Pending', service: 'Crown Placement', doctor: 'Dr. Rajan Mehta' },
];

function formatCurrency(val) {
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function KpiCard({ title, value, sub, icon: Icon, colorClass, bgClass, trend }) {
  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col gap-3 group hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass} shrink-0`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{title}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export const Billing = () => {
  const { hasPermission } = useAuth();
  const canProcessBilling = hasPermission ? hasPermission('PROCESS_BILLING') : true;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoices = SAMPLE_INVOICES;

  // KPI totals
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
  const totalCount = invoices.length;

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.patient.toLowerCase().includes(q) ||
        inv.service.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Billing &amp; Invoices</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Track patient payments, collections &amp; outstanding dues.</p>
          </div>
        </div>
        {canProcessBilling && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub={`${invoices.filter(i => i.status === 'Paid').length} paid invoices`}
          icon={DollarSign}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          trend="+12%"
        />
        <KpiCard
          title="Pending Amount"
          value={formatCurrency(totalPending)}
          sub={`${invoices.filter(i => i.status === 'Pending').length} awaiting payment`}
          icon={Clock}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <KpiCard
          title="Overdue"
          value={formatCurrency(totalOverdue)}
          sub={`${invoices.filter(i => i.status === 'Overdue').length} overdue invoices`}
          icon={AlertCircle}
          colorClass="text-red-500"
          bgClass="bg-red-50"
        />
        <KpiCard
          title="Total Invoices"
          value={totalCount}
          sub="This month"
          icon={FileText}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice ID, patient or service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'Paid', 'Pending', 'Overdue'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border
                ${statusFilter === s
                  ? s === 'ALL' ? 'bg-slate-800 text-white border-slate-800'
                    : s === 'Paid' ? 'bg-emerald-600 text-white border-emerald-600'
                    : s === 'Pending' ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1.2fr_1.5fr_1.2fr_1.1fr_1fr_1fr_0.6fr] px-5 py-3 bg-slate-50 border-b border-slate-100">
          {['Invoice ID', 'Patient', 'Service', 'Doctor', 'Date', 'Amount', 'Status', ''].map((h, i) => (
            <span key={i} className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No invoices found</p>
              <p className="text-xs text-slate-400">Try adjusting your search or filter.</p>
            </div>
          ) : (
            filtered.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG['Pending'];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={inv.id}
                  className="group flex flex-col sm:grid sm:grid-cols-[1.2fr_1.5fr_1.2fr_1.1fr_1fr_1fr_0.6fr] items-start sm:items-center px-4 sm:px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer gap-2 sm:gap-0"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  {/* Invoice ID */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-mono">{inv.id}</span>
                  </div>

                  {/* Patient */}
                  <div className="flex items-center gap-2 sm:pl-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {inv.patient.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{inv.patient}</span>
                  </div>

                  {/* Service */}
                  <span className="text-xs text-slate-500 font-medium sm:block hidden">{inv.service}</span>

                  {/* Doctor */}
                  <span className="text-xs text-slate-500 font-medium sm:block hidden">{inv.doctor}</span>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 sm:block">
                    <Calendar className="w-3 h-3 text-slate-400 sm:hidden" />
                    <span className="text-xs text-slate-500">{inv.date}</span>
                  </div>

                  {/* Amount */}
                  <span className="text-sm font-extrabold text-slate-900">{formatCurrency(inv.amount)}</span>

                  {/* Status */}
                  <StatusBadge status={inv.status} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{filtered.length}</span> of <span className="font-bold text-slate-700">{invoices.length}</span> invoices
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Total: {formatCurrency(filtered.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>
        )}
      </div>

      {/* ── Invoice Detail Modal ── */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold opacity-80">Invoice</p>
                    <p className="text-lg font-extrabold font-mono">{selectedInvoice.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedInvoice.status} />
                <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(selectedInvoice.amount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Patient', value: selectedInvoice.patient, icon: User },
                  { label: 'Doctor', value: selectedInvoice.doctor, icon: Banknote },
                  { label: 'Service', value: selectedInvoice.service, icon: CreditCard },
                  { label: 'Date Issued', value: selectedInvoice.date, icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Icon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 pb-5 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer">
                <Eye className="w-4 h-4" /> View PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm shadow-emerald-600/20">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
