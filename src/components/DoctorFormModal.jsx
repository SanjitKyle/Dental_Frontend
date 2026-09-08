import React, { useContext, useState } from 'react';
import { Form, X } from 'lucide-react';
import { ContextProvider } from '../context/store';

const DoctorFormModal = ({ isOpen, onClose }) => {
  const { Doctors, CreateDoctor, selectedPatientData, DoctorEdit } = useContext(ContextProvider)
  const [isLoading, setisLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    specialization: "",
    phone: "",
    email: "",
    experience_years: "",
    shift_start_time: "",
    shift_end_time: "",
    working_days: "",
    consultation_fee: "",
    status: "Active"
  });

  React.useEffect(() => {
    if (isOpen && selectedPatientData) {
      setFormData({
        ...selectedPatientData,
        working_days: Array.isArray(selectedPatientData.working_days) ? selectedPatientData.working_days.join(', ') : selectedPatientData.working_days
      });
    } else if (isOpen && !selectedPatientData) {
      setFormData({
        full_name: "",
        specialization: "",
        phone: "",
        email: "",
        experience_years: "",
        shift_start_time: "",
        shift_end_time: "",
        working_days: "",
        consultation_fee: "",
        status: "Active"
      });
    }
  }, [isOpen, selectedPatientData]);

  if (!isOpen) return null;

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setisLoading(true)
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      const token = user?.token || user?.data?.token || user?.accessToken || user?.data?.accessToken;
      
      let response;
      if (selectedPatientData) {
        response = await DoctorEdit(selectedPatientData._id, formData);
      } else {
        response = await CreateDoctor(formData);
      }
      
      console.log('changes', response);
      if (onClose) onClose()
      setisLoading(false);
      setFormData({
        full_name: "",
        specialization: "",
        phone: "",
        email: "",
        experience_years: "",
        shift_start_time: "",
        shift_end_time: "",
        working_days: "",
        consultation_fee: "",
        status: "Active"
      })

    } catch (error) {
      console.log('error', error);
      setisLoading(false)
      if (onClose) onClose()
      setFormData({
        full_name: "",
        specialization: "",
        phone: "",
        email: "",
        experience_years: "",
        shift_start_time: "",
        shift_end_time: "",
        working_days: "",
        consultation_fee: "",
        status: "Active"
      })

    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white/90 backdrop-blur-xl border border-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-extrabold text-slate-800">Add New Doctor</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="doctor-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Professional Info */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="e.g. Dr. Sarah Jenkins" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization *</label>
                  <select name="specialization" value={formData.specialization} onChange={handleChange} required className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700">
                    <option value="">Select...</option>
                    <option value="General Dentist">General Dentist</option>
                    <option value="Orthodontist">Orthodontist</option>
                    <option value="Endodontist">Endodontist</option>
                    <option value="Pediatric Dentist">Pediatric Dentist</option>
                    <option value="Oral Surgeon">Oral Surgeon</option>
                    <option value="Prosthodontist">Prosthodontist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Years of Experience</label>
                  <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fee ($)</label>
                  <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="e.g. 150" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Contact & Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="doctor@hospital.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Working Days</label>
                  <input type="text" name="working_days" value={formData.working_days} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="e.g. Mon, Wed, Fri" />
                </div>
                <div className="block">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Shift Start Time </label>
                  <input type="time" name="shift_start_time" value={formData.shift_start_time} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
                </div>
                <div className="block">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Shift End Time </label>
                  <input type="time" name="shift_end_time" value={formData.shift_end_time} onChange={handleChange} className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200/80 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors">
            Cancel
          </button>
          <button type="submit" form="doctor-form" className="premium-button px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
            {isLoading ? 'Saving ...' : 'Add Doctor'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorFormModal;
