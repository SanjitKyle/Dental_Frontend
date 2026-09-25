import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Edit,
  Eye,
  KeyRound,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import { getStaff, createStaff, updateStaff, deleteStaff } from "../../services/staff";
import { toast } from "react-toastify";
import { ContextProvider } from "../../context/store";

// ─── Token helper ─────────────────────────────────────────────────────────────
const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return (
      user?.token ||
      user?.data?.token ||
      user?.accessToken ||
      user?.data?.accessToken ||
      ""
    );
  } catch {
    return "";
  }
};

// ─── Schema enums (exact values from backend) ─────────────────────────────────
const EMPLOYMENT_ROLES = ["NURSE", "RECEPTIONIST", "ADMIN", "TECHNICIAN", "BILLING"];
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT"];
const STATUS_OPTIONS   = ["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"];

const PERMISSION_GROUPS = [
  {
    label: "Patients",
    perms: ["VIEW_PATIENT", "CREATE_PATIENT", "EDIT_PATIENT", "DELETE_PATIENT"],
  },
  {
    label: "Appointments",
    perms: [
      "VIEW_APPOINTMENT",
      "CREATE_APPOINTMENT",
      "EDIT_APPOINTMENT",
      "CANCEL_APPOINTMENT",
    ],
  },
  {
    label: "Admin & Billing",
    perms: ["PROCESS_BILLING", "VIEW_REPORTS", "MANAGE_INVENTORY", "MANAGE_STAFF"],
  },
  {
    label: "Enquiries",
    perms: ["VIEW_ENQUIRY", "MANAGE_ENQUIRY", "EDIT_ENQUIRY", "DELETE_ENQUIRY"],
  },
  {
    label: "Follow-ups",
    perms: ["MANAGE_FOLLOW_UP", "EDIT_FOLLOW_UP", "DELETE_FOLLOW_UP"],
  },
  {
    label: "Odontogram",
    perms: [
      "VIEW_ODONTOGRAM",
      "CREATE_ODONTOGRAM",
      "EDIT_ODONTOGRAM",
      "DELETE_ODONTOGRAM",
    ],
  },
];

// ─── Style maps ───────────────────────────────────────────────────────────────
const statusStyle = {
  ACTIVE:     "border-emerald-200 bg-emerald-50 text-emerald-700",
  ON_LEAVE:   "border-amber-200 bg-amber-50 text-amber-700",
  SUSPENDED:  "border-red-200 bg-red-50 text-red-700",
  TERMINATED: "border-slate-200 bg-slate-100 text-slate-500",
};

const employmentStyle = {
  NURSE:        "border-teal-200 bg-teal-50 text-teal-700",
  RECEPTIONIST: "border-sky-200 bg-sky-50 text-sky-700",
  ADMIN:        "border-violet-200 bg-violet-50 text-violet-700",
  TECHNICIAN:   "border-amber-200 bg-amber-50 text-amber-700",
  BILLING:      "border-slate-200 bg-slate-100 text-slate-700",
};

// ─── Blank form ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  fullName:        "",
  email:           "",
  phoneNumber:     "",
  employment:      "",
  designation:     "",
  department:      "",
  employmentType:  "FULL_TIME",
  dateOfJoining:   "",
  status:          "ACTIVE",
  permissions:     [],
  emergencyContact: { name: "", relation: "", phone: "" },
};

// ─── Permissions checkbox panel ───────────────────────────────────────────────
const PermissionSelector = ({ selected, onChange }) => {
  const toggle = (perm) => {
    if (selected.includes(perm)) {
      onChange(selected.filter((p) => p !== perm));
    } else {
      onChange([...selected, perm]);
    }
  };

  const toggleGroup = (perms) => {
    const allChecked = perms.every((p) => selected.includes(p));
    if (allChecked) {
      onChange(selected.filter((p) => !perms.includes(p)));
    } else {
      const merged = [...new Set([...selected, ...perms])];
      onChange(merged);
    }
  };

  return (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((group) => {
        const allChecked = group.perms.every((p) => selected.includes(p));
        const someChecked = group.perms.some((p) => selected.includes(p));
        return (
          <div key={group.label} className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Group header */}
            <label className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                onChange={() => toggleGroup(group.perms)}
                className="w-4 h-4 rounded border-slate-300 text-cyan-600 accent-cyan-600"
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {group.label}
              </span>
              <span className="ml-auto text-[10px] font-semibold text-slate-400">
                {group.perms.filter((p) => selected.includes(p)).length}/{group.perms.length}
              </span>
            </label>
            {/* Individual permissions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-slate-100 border-t border-slate-200">
              {group.perms.map((perm) => (
                <label
                  key={perm}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-cyan-50/60 transition-colors ${
                    selected.includes(perm) ? "bg-cyan-50/40" : "bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(perm)}
                    onChange={() => toggle(perm)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 accent-cyan-600"
                  />
                  <span className="text-[11px] font-semibold text-slate-600 leading-tight">
                    {perm.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Staff Form Modal ─────────────────────────────────────────────────────────
const StaffModal = ({ isOpen, onClose, onSave, initial }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        ...EMPTY_FORM,
        ...initial,
        permissions: Array.isArray(initial.permissions) ? initial.permissions : [],
        emergencyContact: initial.emergencyContact || { name: "", relation: "", phone: "" },
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setEC = (field, value) =>
    setForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(form);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-all animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[88vh] sm:max-h-[92vh] flex flex-col overflow-hidden border-t sm:border border-slate-200/90 animate-slide-up sm:animate-[fadeIn_0.2s_ease-out]">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex justify-between items-center shrink-0 bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {initial ? "Edit Staff Member" : "Add Staff Member"}
            </h2>
            <p className="text-[11px] font-medium text-slate-500">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5">
          <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">

            {/* ── Personal Info ── */}
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Maya Kapoor" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="staff@clinic.com" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                  <input required value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder="+91 98765 00000" className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Emergency Contact ── */}
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                  <input value={form.emergencyContact.name} onChange={(e) => setEC("name", e.target.value)} placeholder="Jane Doe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Relation</label>
                  <input value={form.emergencyContact.relation} onChange={(e) => setEC("relation", e.target.value)} placeholder="Spouse" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input value={form.emergencyContact.phone} onChange={(e) => setEC("phone", e.target.value)} placeholder="+91 98765 00001" className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Employment ── */}
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employment Role *</label>
                  <select required value={form.employment} onChange={(e) => set("employment", e.target.value)} className={inputCls}>
                    <option value="">Select role...</option>
                    {EMPLOYMENT_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inputCls}>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
                  <input value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. Senior Dental Assistant" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department *</label>
                  <input required value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Operations" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Joining</label>
                  <input type="date" value={form.dateOfJoining ? form.dateOfJoining.slice(0, 10) : ""} onChange={(e) => set("dateOfJoining", e.target.value)} className={inputCls + " text-slate-600"} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Permissions ── */}
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">
                Permissions
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Select the modules this staff member can access.
                {form.permissions.length > 0 && (
                  <span className="ml-1 font-semibold text-cyan-600">{form.permissions.length} selected</span>
                )}
              </p>
              <PermissionSelector
                selected={form.permissions}
                onChange={(perms) => set("permissions", perms)}
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0 bg-white">
          <p className="hidden sm:block text-[11px] font-medium text-slate-500">Fields marked * are required</p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="staff-form"
              disabled={saving}
              className="w-1/2 sm:w-auto px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-cyan-700 disabled:opacity-70 transition-colors shadow-xs shadow-cyan-600/20 cursor-pointer text-center"
            >
              {saving ? "Saving..." : initial ? "Save Changes" : "Add Staff"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Staff Page ──────────────────────────────────────────────────────────
export const Staff = () => {
  const navigate = useNavigate();
  const { syncStaffPermissions } = useContext(ContextProvider);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const token = getToken();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff(token);
      const list = Array.isArray(data) ? data : data?.data || data?.staff || [];
      setStaffList(list);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSave = async (payload) => {
    if (editTarget) {
      await updateStaff(token, editTarget._id, payload);
      toast.success("Staff member updated!");
    } else {
      await createStaff(token, payload);
      toast.success("Staff member added!");
    }
    await fetchStaff();
    if (syncStaffPermissions) {
      syncStaffPermissions();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await deleteStaff(token, id);
      toast.success("Staff member deleted.");
      await fetchStaff();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete staff.");
    }
  };

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (person) => { setEditTarget(person); setModalOpen(true); };

  const statuses = ["ALL", ...new Set(staffList.map((s) => s.status).filter(Boolean))];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return staffList.filter((s) => {
      const fields = [
        s.fullName, s.email, s.phoneNumber,
        s.employment, s.designation, s.department, s.employmentType,
        ...(s.permissions || []),
      ];
      const matchSearch  = !term || fields.some((f) => f?.toLowerCase().includes(term));
      const matchStatus  = statusFilter === "ALL" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [staffList, query, statusFilter]);

  const activeCount = staffList.filter((s) => s.status === "ACTIVE").length;
  const adminCount  = staffList.filter((s) => s.employment === "ADMIN").length;

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">

      {/* Header */}
      <section className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-cyan-600">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">Staff & Access</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage clinic workforce, roles, and permissions.</p>
        </div>
        <button onClick={openAdd} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 border border-cyan-700 rounded-xl text-white hover:bg-cyan-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Metric title="Team Members" value={loading ? "—" : staffList.length} caption="Total staff records"     icon={UsersRound}  color="text-cyan-600" />
        <Metric title="Active Staff"  value={loading ? "—" : activeCount}      caption="Currently active"        icon={UserCheck}   color="text-emerald-600" />
        <Metric title="Admin Roles"   value={loading ? "—" : adminCount}        caption="Administrative access"   icon={ShieldCheck} color="text-violet-600" />
      </div>

      {/* Table Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs ring-1 ring-slate-100/70">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 bg-slate-50/80 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, role, department, permission..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 outline-none shadow-xs focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20">
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
            <span className="text-sm font-medium">Loading staff...</span>
          </div>
        ) : (
          <>
            {/* 1. Mobile List (< 768px) - Clean List with Name & Chevron */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-slate-500">
                  {staffList.length === 0
                    ? "No staff members found. Add your first staff member."
                    : "No staff members match your search."}
                </div>
              ) : (
                filtered.map((person) => {
                  const initials = person.fullName
                    ? person.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                    : "?";
                  return (
                    <div
                      key={person._id}
                      onClick={() => navigate(`/staff/${person._id}`, { state: { staff: person } })}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 active:bg-cyan-50/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-xs font-black text-cyan-800 shrink-0 group-hover:scale-105 transition-transform">
                          {initials}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-cyan-600 transition-colors">
                          {person.fullName}
                        </h4>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 group-hover:text-cyan-600 group-hover:bg-cyan-50 transition-all shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 2. Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Staff Member</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Role / Type</th>
                    <th className="px-5 py-3.5">Permissions</th>
                    <th className="px-5 py-3.5">Date Joined</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-16 text-center text-sm font-medium text-slate-500">
                        {staffList.length === 0
                          ? "No staff members found. Add your first staff member."
                          : "No staff members match your search."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((person) => {
                      const initials = person.fullName
                        ? person.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                        : "?";
                      const joinedDate = person.dateOfJoining
                        ? new Date(person.dateOfJoining).toLocaleDateString()
                        : "—";
                      return (
                        <tr key={person._id} className="hover:bg-cyan-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <div 
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() => navigate(`/staff/${person._id}`, { state: { staff: person } })}
                            >
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-xs font-black text-cyan-800 shrink-0">{initials}</div>
                              <div>
                                <p className="font-bold text-slate-900 hover:text-cyan-600 transition-colors">{person.fullName}</p>
                                <p className="text-xs font-medium text-slate-500">{person.designation || "—"}</p>
                                <p className="text-[11px] text-slate-400">{person.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{person.department || "—"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${employmentStyle[person.employment] || "border-slate-200 bg-slate-100 text-slate-700"}`}>
                              <KeyRound className="w-3 h-3" />{person.employment || "—"}
                            </span>
                            {person.employmentType && (
                              <p className="text-[10px] text-slate-400 mt-1">{person.employmentType.replace(/_/g, " ")}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex max-w-[220px] flex-wrap gap-1">
                              {person.permissions?.length > 0 ? (
                                person.permissions.slice(0, 4).map((perm) => (
                                  <span key={perm} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    {perm.replace(/_/g, " ")}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                              {person.permissions?.length > 4 && (
                                <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-600">
                                  +{person.permissions.length - 4} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-600">{joinedDate}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[person.status] || "border-slate-200 bg-slate-100 text-slate-500"}`}>
                              {person.status?.replace(/_/g, " ") || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => navigate(`/staff/${person._id}`, { state: { staff: person } })}
                                title="View Staff Details"
                                className="p-1.5 border border-slate-200 bg-white hover:bg-slate-100 transition-colors rounded-lg cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-cyan-600" />
                              </button>
                              <button onClick={() => openEdit(person)} title="Edit Staff" className="p-1.5 border border-slate-200 bg-white hover:bg-slate-100 transition-colors rounded-lg cursor-pointer">
                                <Edit className="w-4 h-4 text-cyan-600" />
                              </button>
                              <button onClick={() => handleDelete(person._id)} title="Delete Staff" className="p-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors rounded-lg cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer count */}
        {!loading && (
          <div className="p-3 sm:p-4 border-t border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
            Showing {filtered.length} of {staffList.length} staff members
          </div>
        )}
      </section>

      {/* Modal */}
      <StaffModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTarget}
      />
    </div>
  );
};

// ─── Metric card ──────────────────────────────────────────────────────────────
const Metric = ({ title, value, caption, icon: Icon, color }) => (
  <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
    <p className="mt-1 text-xs font-medium text-slate-500">{caption}</p>
  </section>
);
