import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  UsersRound,
  Phone,
  PhoneCall,
  Mail,
  MailCheck,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Building,
  Briefcase,
  KeyRound,
  CheckCircle2,
  Edit,
  Trash2,
  Clock,
  Loader2
} from 'lucide-react';
import { getStaff, deleteStaff } from '../../services/staff';
import { toast } from 'react-toastify';

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

const statusStyle = {
  ACTIVE:     "border-emerald-200 bg-emerald-50 text-emerald-700",
  ON_LEAVE:   "border-amber-200 bg-amber-50 text-amber-700",
  SUSPENDED:  "border-red-200 bg-red-50 text-red-700",
  TERMINATED: "border-slate-200 bg-slate-100 text-slate-500",
};

export const StaffDetail = ({ onEditStaff }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [staff, setStaff] = useState(location.state?.staff || null);
  const [loading, setLoading] = useState(!staff);

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.token || user?.data?.token || user?.accessToken || user?.data?.accessToken || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!staff || String(staff._id) !== String(id)) {
      const token = getToken();
      if (!token) return;
      setLoading(true);
      getStaff(token)
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          const found = list.find((s) => String(s._id) === String(id));
          if (found) setStaff(found);
        })
        .catch((err) => {
          console.error('Failed to load staff details', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, staff]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        <span className="text-sm font-medium">Loading staff details...</span>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/staff')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-cyan-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Staff & Access
        </button>
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <UsersRound className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">Staff Member Not Found</h3>
          <p className="text-xs text-slate-500 mb-4">The staff records could not be found or have been deleted.</p>
          <button
            onClick={() => navigate('/staff')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-cyan-700 transition-all cursor-pointer"
          >
            Return to Staff List
          </button>
        </div>
      </div>
    );
  }

  const initials = staff.fullName
    ? staff.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  const joinedDate = staff.dateOfJoining && !Number.isNaN(new Date(staff.dateOfJoining).getTime())
    ? new Date(staff.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const activePermissions = Array.isArray(staff.permissions) ? staff.permissions : [];

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete staff member ${staff.fullName}?`)) return;
    try {
      const token = getToken();
      await deleteStaff(token, staff._id);
      toast.success("Staff member deleted.");
      navigate('/staff');
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete staff.");
    }
  };

  const handleEdit = () => {
    if (onEditStaff) {
      onEditStaff(staff);
    } else {
      navigate('/staff', { state: { editTarget: staff } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 md:pb-12">
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/staff')}
          className="flex items-center gap-1.5 text-slate-700 hover:text-cyan-600 font-bold text-xs cursor-pointer transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Staff</span>
          <span className="sm:hidden">Back</span>
        </button>

        <h1 className="text-sm font-black text-slate-900 tracking-tight">Staff Profile</h1>

        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          #{(staff._id || '').slice(-6)}
        </span>
      </div>

      <div className="p-3.5 sm:p-5 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5">
        {/* Mobile-First Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-md shadow-cyan-500/10">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight capitalize truncate">
                    {staff.fullName}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-100">
                    {staff.designation || 'Staff'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusStyle[staff.status] || "border-slate-200 bg-slate-100 text-slate-700"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {staff.status?.replace(/_/g, ' ') || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {joinedDate && (
              <p className="text-[11px] text-slate-400 font-medium sm:ml-auto">
                Joined {joinedDate}
              </p>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-slate-100">
            <button
              onClick={handleEdit}
              className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-cyan-600/20 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Staff
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Role */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-cyan-600" /> Role
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
              {staff.employment || '—'}
            </p>
          </div>

          {/* Department */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-cyan-600" /> Department
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
              {staff.department || 'General'}
            </p>
          </div>

          {/* Employment Type */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-cyan-600" /> Type
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
              {staff.employmentType?.replace(/_/g, ' ') || 'Full Time'}
            </p>
          </div>

          {/* Permissions */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Permissions
            </div>
            <p className="text-base sm:text-xl font-black text-slate-900 mt-1">
              {activePermissions.length}
            </p>
          </div>
        </div>

        {/* Section: Contact Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Contact Details</h3>
            <Phone className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Phone */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Phone</p>
                  <p className="font-extrabold text-slate-800 text-sm truncate">{staff.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              {staff.phoneNumber && (
                <a
                  href={`tel:${staff.phoneNumber}`}
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
                  <p className="font-extrabold text-slate-800 text-sm truncate">{staff.email || 'Not provided'}</p>
                </div>
              </div>
              {staff.email && (
                <a
                  href={`mailto:${staff.email}`}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <MailCheck className="w-3.5 h-3.5" /> Email
                </a>
              )}
            </div>

            {/* Designation & Department */}
            <div className="p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Work Area</p>
                <p className="font-semibold text-slate-800 text-xs mt-0.5 leading-relaxed">
                  {staff.designation || 'Staff Member'} — {staff.department || 'General'}
                </p>
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
                  {staff.emergencyContact?.name || '—'}
                  {staff.emergencyContact?.relation && (
                    <span className="text-xs text-slate-500 font-medium ml-1.5">
                      ({staff.emergencyContact.relation})
                    </span>
                  )}
                </p>
              </div>

              {staff.emergencyContact?.phone && (
                <a
                  href={`tel:${staff.emergencyContact.phone}`}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call
                </a>
              )}
            </div>

            {staff.emergencyContact?.phone && (
              <p className="text-[11px] font-semibold text-slate-500">Phone: {staff.emergencyContact.phone}</p>
            )}
          </div>
        </div>

        {/* Section: Granted Permissions Matrix */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> System Permissions
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Assigned privileges for this account</p>
            </div>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full">
              {activePermissions.length} enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERMISSION_GROUPS.map((group) => {
              const grantedInGroup = group.perms.filter((p) => activePermissions.includes(p));
              return (
                <div key={group.label} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                  <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                      {group.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      grantedInGroup.length > 0 ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {grantedInGroup.length}/{group.perms.length}
                    </span>
                  </div>

                  <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white">
                    {group.perms.map((perm) => {
                      const hasPerm = activePermissions.includes(perm);
                      return (
                        <div
                          key={perm}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border text-[11px] ${
                            hasPerm
                              ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900 font-bold'
                              : 'bg-slate-50/40 border-slate-100 text-slate-400 font-medium'
                          }`}
                        >
                          {hasPerm ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{perm.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StaffDetail;

