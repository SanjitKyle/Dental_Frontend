import React, { useContext, useEffect, useState } from 'react';
import { Form, X } from 'lucide-react';
import { CreatePatient } from '../services/patients';
import { ContextProvider } from '../context/store';

const PatientFormModal = ({ isOpen, onClose }) => {
  const { user, PatientCreate, PatientEdit, Doctors, Patients, selectedPatientData } = useContext(ContextProvider);
  const [isLoading, setisLoading] = useState(false)
  const [FormData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    height: "",
    weight: "",
    emergency_contact_name: "",
    emergencty_contact_phone: "",
    relation: "",
    age: "",
    assigned_doctor_id:"",
    assigned_doctor_name:""
  });

  useEffect(() => {
    if (isOpen && selectedPatientData) {
      setFormData(selectedPatientData);
    } else if (isOpen && !selectedPatientData) {
      // Reset form if opening in "Add" mode
      setFormData({
        full_name: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        phone: "",
        email: "",
        address: "",
        note: "",
        height: "",
        weight: "",
        emergency_contact_name: "",
        emergencty_contact_phone: "",
        relation: "",
        assigned_doctor_id: "",
        assigned_doctor_name: "",
        age: ""
      });
    }
  }, [isOpen, selectedPatientData]);

  if (!isOpen) return null;

  function handleChange(e) {
    setFormData({
      ...FormData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setisLoading(true);
      // Get "user" key and parse the JSON string into an object
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      // The API response might have the token nested under 'data' or named 'accessToken'
      const token = user?.token || user?.data?.token || user?.accessToken || user?.data?.accessToken;

      console.log('Parsed user object from localStorage:', user);
      console.log('Extracted token:', token);

      if (!token) {
        throw new Error("No token found in localStorage! Check the console logs.");
      }

      const response = selectedPatientData 
        ? await PatientEdit(selectedPatientData._id, FormData) 
        : await PatientCreate(FormData);
      
      setisLoading(false);
      console.log("response while saving patient", response);

      // Fix: Close the modal automatically!
      if (onClose) onClose();

    } catch (error) {
      setisLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Add New Patient</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" name="full_name" value={FormData.full_name} onChange={handleChange} required className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={FormData.date_of_birth} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                  <select name="gender" value={FormData.gender} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                  <select name="blood_group" value={FormData.blood_group} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600">
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Height (cm)</label>
                    <input type="number" name="height" value={FormData.height} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="175" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input type="number" name="weight" value={FormData.weight} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="70" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Doctor Assign</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Doctor</label>
                  <select name="assigned_doctor_id" value={FormData.assigned_doctor_id || ""} onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedDoc = Doctors?.data?.find(d => d._id === selectedId);
                    setFormData({
                      ...FormData,
                      assigned_doctor_id: selectedId,
                      assigned_doctor_name: selectedDoc ? selectedDoc.full_name : ""
                    });
                  }} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600">
                    <option value="">Select...</option>
                    {Doctors?.data && Doctors?.data?.length > 0 ? Doctors?.data?.map((d, idx) => (
                      <option key={d._id || idx} value={d._id}>
                        {d.full_name}
                      </option>
                    )) : null}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input type="tel" name="phone" value={FormData.phone} onChange={handleChange} required className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="(555) 000-0000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" name="email" value={FormData.email} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" name="address" value={FormData.address} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="123 Dental Way, Suite 100" />
                </div>
              </div>
            </div>


            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" name="emergency_contact_name" value={FormData.emergency_contact_name} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" name="emergencty_contact_phone" value={FormData.emergencty_contact_phone} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="(555) 111-2222" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Relation</label>
                  <input type="text" name="relation" value={FormData.relation} onChange={handleChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Spouse" />
                </div>
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Medical Notes</h3>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Allergies or Existing Conditions</label>
                <textarea name="note" value={FormData.note} onChange={handleChange} rows="3" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" placeholder="e.g. Allergic to Penicillin..."></textarea>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="patient-form" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            {isLoading ? 'Saving ...' : 'Save Patient'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientFormModal;
