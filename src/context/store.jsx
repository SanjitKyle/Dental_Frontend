import { createContext, useContext, useEffect, useState } from "react";
import { CreatePatient, getPatients, EditPatients, DeletePatient } from "../services/patients";
import { AddDoctor, getDoctors } from "../services/doctor";
import { createAppointment, getAppointments, updateAppointment, deleteAppointment } from "../services/appointments";
import { axiosInstance } from "../services/axiosInstance";
export const ContextProvider = createContext();

function StoreManagement({ children }) {
    const userString = localStorage.getItem("user");
    const userdata = userString ? JSON.parse(userString) : null;
    const token = userdata?.token || userdata?.data?.token || userdata?.accessToken || userdata?.data?.accessToken;

    const [user, setUser] = useState(userString);
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!token);
    const [Patients, setPatients] = useState([]);
    const [Doctors, setDoctors] = useState([]);
    const [Appointments, setAppointments] = useState([]);
    const [isEditClick, setIsEditClick] = useState(false);
    const [selectedPatientData, setSelectedPatientData] = useState(null);
    async function getAllPatience() {
        try {

            const res = await getPatients(token);
            console.log('response', res);
            setPatients(res.data.data)


        } catch (error) {
            throw error;
        }


    }

    async function getAllDoctor() {
        try {
            const getalldoctor = await getDoctors(token);
            console.log('getting all doctor', getalldoctor);
            setDoctors(getalldoctor)

        } catch (error) {
            console.log('error', error)
        }
    }

    async function getAllAppointments() {
        try {
            const res = await getAppointments(token);
            console.log('getting all appointments', res);
            setAppointments(res.data || res); // Adapt based on actual API response structure
        } catch (error) {
            console.log('error getting appointments', error);
        }
    }

    async function PatientCreate(formData) {
        try {
            const res = await CreatePatient(formData, token);
            await getAllPatience(); // <--- Fix: Call the local function that actually updates the React state

        } catch (error) {
            throw error
        }
    }
    async function PatientEdit(id, formData) {
        try {
            const res = await EditPatients(token, id, formData);
            await getAllPatience();
        } catch (error) {
            throw error;
        }
    }
    async function CreateDoctor(formData) {
        try {

            const response = await AddDoctor(token, formData);
            console.log('response to create doctor', response)
            await getAllDoctor()

        } catch (err) {
            throw err;
        }
    }

    async function AppointmentCreate(formData) {
        try {
            const response = await createAppointment(token, formData);
            console.log('response to create appointment', response);
            await getAllAppointments();
            return response;
        } catch (err) {
            throw err;
        }
    }

    async function AppointmentUpdate(fomdata, id) {
        try {
            const res = await updateAppointment(token, id, fomdata)
            await getAllAppointments();
            return res;
        } catch (error) {
            console.log('error', error)
        }
    }

    async function AppointmentDelete(id) {
        try {
            const res = await deleteAppointment(token, id);
            await getAllAppointments();
            return res;
        } catch (error) {
            console.log('error deleting appointment', error);
            throw error;
        }
    }

    async function PatientDelete(id) {
        try {
            await DeletePatient(token, id);
            await getAllPatience();
        } catch (error) {
            console.log('error deleting patient', error);
            throw error;
        }
    }

    async function DoctorEdit(id, formData) {
        try {
            const finaldata = {
                ...formData,
                working_days: typeof formData.working_days === 'string' ? formData.working_days.split(',').map(day => day.trim()) : formData.working_days
            };
            const res = await axiosInstance.post(`/doctors/${id}`, finaldata, {
                headers: { authorization: `Bearer ${token}` }
            });
            await getAllDoctor();
            return res.data;
        } catch (error) {
            console.log('error editing doctor', error);
            throw error;
        }
    }

    async function DoctorDelete(id) {
        try {
            await axiosInstance.post(`/doctors/delete/${id}`, {}, {
                headers: { authorization: `Bearer ${token}` }
            });
            await getAllDoctor();
        } catch (error) {
            console.log('error deleting doctor', error);
            throw error;
        }
    }

    useEffect(() => {
        getAllPatience();
        getAllDoctor();
        getAllAppointments();

    }, [])
    useEffect(() => {
        console.log('res to get patients', Patients)
    }, [Patients])
    return (
        <ContextProvider value={{
            user, setUser, token,
            selectedPatientData, setSelectedPatientData,
            Patients, PatientCreate, PatientEdit, PatientDelete,
            CreateDoctor, Doctors, DoctorEdit, DoctorDelete,
            Appointments, AppointmentCreate, getAllAppointments,
            setIsEditClick, isEditClick, AppointmentUpdate, AppointmentDelete,setIsAuthenticated,isAuthenticated
        }}>
            {children}
        </ContextProvider>
    )
}
export default StoreManagement
