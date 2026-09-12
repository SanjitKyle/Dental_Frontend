import React, { useContext, useEffect, useState } from "react";
import { ContextProvider } from "../context/store";
import { X, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { updateAppointment } from "../services/appointments";

function AppointmentForm({ setClick, isFollowUp = false }) {
    const { Patients, Doctors, setIsEditClick, AppointmentCreate, selectedPatientData, AppointmentUpdate } = useContext(ContextProvider);
    const [isLoading, setIsLoading] = useState(false);


    const [formData, setFormData] = useState({
        patient: "",
        doctor: "",
        date: "",
        start_time: "",
        end_time: "",
        service: "",
        visit_type: "",
        reasonForVisit: "",
        status: "Scheduled"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = selectedPatientData ? await AppointmentUpdate(formData, selectedPatientData?._id) : await AppointmentCreate(formData);
            setIsEditClick(false);
        } catch (error) {
            console.error('Failed to create appointment:', error);
            // Error handling can be added here
        } finally {
            setIsLoading(false);
        }
    };

    const onClose = () => {
        setIsEditClick(false);
        setClick(false);
    }
    useEffect(() => {
        if (selectedPatientData) {
            // Helper to ensure time is HH:mm format
            const formatTime = (timeStr) => {
                if (!timeStr) return "";
                // If it's already HH:mm, return it
                if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
                // If it has seconds (HH:mm:ss), truncate it
                if (/^\d{2}:\d{2}:\d{2}/.test(timeStr)) return timeStr.substring(0, 5);
                return timeStr;
            };

            setFormData({
                patient: selectedPatientData.patient || "",
                doctor: selectedPatientData.doctor?._id || selectedPatientData.doctor || "",
                date: selectedPatientData.date ? selectedPatientData.date.split('T')[0] : "",
                start_time: formatTime(selectedPatientData.start_time || selectedPatientData.starttime),
                end_time: formatTime(selectedPatientData.end_time || selectedPatientData.endtime),
                service: selectedPatientData.service || "",
                visit_type: selectedPatientData.visit_type || "",
                reasonForVisit: selectedPatientData.reasonForVisit || "",
                status: selectedPatientData.status || "Scheduled"
            });
        }
    }, [selectedPatientData]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white/90 backdrop-blur-xl border border-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        {selectedPatientData ? 'Edit Appointment' : isFollowUp ? 'Add New Follow-Up' : 'Book Appointment'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto">
                    <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Participants */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-500" />
                                Participants
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Patient *</label>
                                    <select
                                        name="patient"
                                        value={formData.patient}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                                    >
                                        <option value="">Select Patient</option>
                                        {(Array.isArray(Patients?.data) ? Patients.data : Array.isArray(Patients) ? Patients : []).map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor *</label>
                                    <select
                                        name="doctor"
                                        value={formData.doctor}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                                    >
                                        <option value="">Select Doctor</option>
                                        {(Array.isArray(Doctors?.data) ? Doctors.data : Array.isArray(Doctors) ? Doctors : []).map((d) => (
                                            <option key={d._id} value={d._id}>
                                                {d.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Scheduling */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                Scheduling
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time *</label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visit Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-indigo-500" />
                                Visit Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Visit Type *</label>
                                    <select
                                        name="visit_type"
                                        value={formData.visit_type}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                                    >
                                        <option value="">Select Option</option>
                                        <option value="Consultation">Consultation</option>
                                        <option value="Follow-up">Follow-up</option>
                                        <option value="Routine Checkup">Routine Checkup</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Telehealth/Online">Telehealth/Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Service</label>
                                    <input
                                        type="text"
                                        name="service"
                                        value={formData.service}
                                        onChange={handleChange}
                                        placeholder="e.g. Dental Cleaning"
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Reason For Visit</label>
                                    <textarea
                                        name="reasonForVisit"
                                        value={formData.reasonForVisit}
                                        onChange={handleChange}
                                        placeholder="Briefly describe the reason for the visit..."
                                        rows="2"
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-700"
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Follow-up">Follow-up</option>
                                    </select>
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
                    <button type="submit" form="appointment-form" disabled={isLoading} className="premium-button px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-70">
                        {isLoading ? 'Saving...' : (selectedPatientData ? 'Edit Appointment' : isFollowUp ? 'Add Follow-Up' : 'Add Appointment')}                    </button>
                </div>
            </div>
        </div>
    );
}

export default AppointmentForm;
