import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { CreatePatient, getPatients, EditPatients, DeletePatient } from "../services/patients";
import { AddDoctor, getDoctors } from "../services/doctor";
import { createAppointment, getAppointments, updateAppointment, deleteAppointment } from "../services/appointments";
import { getPrescriptions } from "../services/prescriptions";
import { getStaff } from "../services/staff";
import { axiosInstance } from "../services/axiosInstance";
import { normalizeRole, canAccessRoute, hasPermission as rbacHasPermission } from "../utils/rbac";

export const ContextProvider = createContext();
export const useAuth = () => useContext(ContextProvider);

function StoreManagement({ children }) {
    const userString = localStorage.getItem("user");
    const userdata = userString ? JSON.parse(userString) : null;
    const token = userdata?.token || userdata?.data?.token || userdata?.accessToken || userdata?.data?.accessToken;

    const [user, setUser] = useState(userString);
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!token);
    const [Patients, setPatients] = useState([]);
    const [Doctors, setDoctors] = useState([]);
    const [Appointments, setAppointments] = useState([]);
    const [Prescriptions, setPrescriptions] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [loading, setLoading] = useState({ patients: true, doctors: true, appointments: true, prescriptions: true });
    const [isEditClick, setIsEditClick] = useState(false);
    const [selectedPatientData, setSelectedPatientData] = useState(null);

    // Dynamic permissions state for staff members
    const [staffPermissions, setStaffPermissions] = useState(() => {
        try {
            const raw = userString || localStorage.getItem("user");
            if (!raw) return [];
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            const u = parsed?.data?.user || parsed?.user || parsed?.data?.staff || parsed?.staff || parsed?.data || parsed;
            return Array.isArray(u?.permissions) ? u.permissions : [];
        } catch {
            return [];
        }
    });

    // Parse current logged-in user and role dynamically
    const currentUser = useMemo(() => {
        try {
            const raw = user || localStorage.getItem("user");
            if (!raw) return null;
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            const baseUser = parsed?.data?.user || parsed?.user || parsed?.data?.patient || parsed?.patient || parsed?.data?.doctor || parsed?.doctor || parsed?.data?.staff || parsed?.staff || parsed?.data || parsed;
            if (!baseUser) return null;

            const perms = (Array.isArray(staffPermissions) && staffPermissions.length > 0)
                ? staffPermissions
                : (Array.isArray(baseUser.permissions) ? baseUser.permissions : []);

            return {
                ...baseUser,
                permissions: perms,
            };
        } catch {
            return null;
        }
    }, [user, staffPermissions]);

    const userRole = useMemo(() => {
        const rawRole = currentUser?.role || currentUser?.employment || currentUser?.type || currentUser?.accountType || (currentUser?.patient ? 'patient' : null) || "admin";
        return normalizeRole(rawRole);
    }, [currentUser]);

    const canAccess = (path) => canAccessRoute(path, userRole, currentUser);
    const hasPermission = (permission) => rbacHasPermission(permission, currentUser);

    async function getAllPatience() {
        setLoading((current) => ({ ...current, patients: true }));
        try {
            const res = await getPatients(token);
            console.log('response', res);
            setPatients(res.data.data);
        } catch (error) {
            throw error;
        } finally {
            setLoading((current) => ({ ...current, patients: false }));
        }
    }

    async function getAllDoctor() {
        setLoading((current) => ({ ...current, doctors: true }));
        try {
            const getalldoctor = await getDoctors(token);
            console.log('getting all doctor', getalldoctor);
            setDoctors(getalldoctor);
        } catch (error) {
            console.log('error', error);
        } finally {
            setLoading((current) => ({ ...current, doctors: false }));
        }
    }

    async function getAllAppointments() {
        setLoading((current) => ({ ...current, appointments: true }));
        try {
            const res = await getAppointments(token);
            console.log('getting all appointments', res);
            setAppointments(res.data || res);
        } catch (error) {
            console.log('error getting appointments', error);
        } finally {
            setLoading((current) => ({ ...current, appointments: false }));
        }
    }

    async function getAllPrescriptions() {
        setLoading((current) => ({ ...current, prescriptions: true }));
        try {
            const res = await getPrescriptions(token);
            const prescriptions = res?.data || res?.prescriptions || res || [];
            setPrescriptions(Array.isArray(prescriptions) ? prescriptions : []);
        } catch (error) {
            console.log('error getting prescriptions', error);
            setPrescriptions([]);
        } finally {
            setLoading((current) => ({ ...current, prescriptions: false }));
        }
    }

    async function PatientCreate(formData) {
        try {
            const res = await CreatePatient(formData, token);
            await getAllPatience();
            return res;
        } catch (error) {
            throw error;
        }
    }

    async function PatientEdit(id, formData) {
        try {
            const res = await EditPatients(token, id, formData);
            await getAllPatience();
            return res;
        } catch (error) {
            throw error;
        }
    }

    async function CreateDoctor(formData) {
        try {
            const response = await AddDoctor(token, formData);
            console.log('response to create doctor', response);
            await getAllDoctor();
            return response;
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
            const res = await updateAppointment(token, id, fomdata);
            await getAllAppointments();
            return res;
        } catch (error) {
            console.log('error', error);
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

    const syncStaffPermissions = useCallback(async () => {
        if (!token) return;
        try {
            const res = await getStaff(token);
            const staffList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            if (!staffList.length) return;

            const raw = localStorage.getItem('user');
            const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
            const cu = parsed?.data?.user || parsed?.user || parsed?.data?.staff || parsed?.staff || parsed?.data || parsed;

            const email = (cu?.email || '').toLowerCase().trim();
            const uid = String(cu?._id || cu?.id || '');
            const name = (cu?.name || cu?.fullName || '').toLowerCase().trim();

            const matched = staffList.find((s) => {
                const sEmail = (s.email || '').toLowerCase().trim();
                const sEmpId = String(s.employeeuserId || '');
                const sId = String(s._id || s.id || '');
                const sName = (s.fullName || s.name || '').toLowerCase().trim();

                return (
                    (email && sEmail && sEmail === email) ||
                    (uid && sEmpId && sEmpId === uid) ||
                    (uid && sId && sId === uid) ||
                    (name && sName && sName === name)
                );
            });

            if (matched && Array.isArray(matched.permissions)) {
                // Prevent state update if permissions are identical
                setStaffPermissions((prev) => {
                    if (
                        Array.isArray(prev) &&
                        prev.length === matched.permissions.length &&
                        prev.every((val, idx) => val === matched.permissions[idx])
                    ) {
                        return prev;
                    }
                    return matched.permissions;
                });

                // Update localStorage so rbac.js getCurrentUser() picks it up immediately
                try {
                    if (raw) {
                        const parsedUser = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        const applyUpdate = (target) => {
                            if (target && typeof target === 'object') {
                                target.permissions = matched.permissions;
                                if (matched.employment) target.employment = matched.employment;
                                if (matched.designation) target.designation = matched.designation;
                            }
                        };

                        if (parsedUser.data?.user) applyUpdate(parsedUser.data.user);
                        if (parsedUser.user) applyUpdate(parsedUser.user);
                        if (parsedUser.data?.staff) applyUpdate(parsedUser.data.staff);
                        if (parsedUser.staff) applyUpdate(parsedUser.staff);
                        if (parsedUser.data && !parsedUser.data.user) applyUpdate(parsedUser.data);

                        localStorage.setItem('user', JSON.stringify(parsedUser));
                    }
                } catch (e) {
                    console.error('Error saving updated permissions to localStorage:', e);
                }
            }
        } catch (error) {
            console.warn('Could not sync staff permissions:', error);
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            setDashboardLoading(false);
            return;
        }

        setDashboardLoading(true);
        Promise.allSettled([
            getAllPatience(),
            getAllDoctor(),
            getAllAppointments(),
            getAllPrescriptions(),
            syncStaffPermissions()
        ]).finally(() => setDashboardLoading(false));
    }, [token]);

    return (
        <ContextProvider.Provider value={{
            user, setUser, token, currentUser, userRole, canAccess, hasPermission,
            selectedPatientData, setSelectedPatientData,
            Patients, PatientCreate, PatientEdit, PatientDelete,
            CreateDoctor, Doctors, DoctorEdit, DoctorDelete,
            Appointments, AppointmentCreate, getAllAppointments,
            Prescriptions, getAllPrescriptions, dashboardLoading, loading,
            setIsEditClick, isEditClick, AppointmentUpdate, AppointmentDelete,
            setIsAuthenticated, isAuthenticated,
            syncStaffPermissions, staffPermissions
        }}>
            {children}
        </ContextProvider.Provider>
    );
}

export default StoreManagement;
