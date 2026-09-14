import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import { Patients } from "./components/views/Patients";
import { Doctors } from "./components/views/Doctors";
import { Appointments } from "./components/views/Appointments";
import { Treatments } from "./components/views/Treatments";
import { Billing } from "./components/views/Billing";
import { Settings } from "./components/views/Settings";
import { EmptyView } from "./components/views/EmptyView";
import { Odontograms } from "./components/views/Odontograms";
import { Prescriptions } from "./components/views/Prescriptions";
import PatientFormModal from "./components/PatientFormModal";
import DoctorFormModal from "./components/DoctorFormModal";
import Login from "./components/Login";
import Register from "./components/register";
import StoreManagement from "./context/store";
import { ContextProvider } from "./context/store";
import FollowUp from "./components/views/follow-ip";
import { Staff } from "./components/views/Staff";
import { Enquiries } from "./components/views/Enquiries";
import MobileBottomNav from "./components/MobileBottomNav";

// ============================================================================
// 1. MAIN APPLICATION LAYOUT
// Acts as an Outlet for authenticated routes.
// ============================================================================
const MainLayout = ({ isPatientModalOpen, closePatientModal, isDoctorModalOpen, closeDoctorModal, onLogout }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden w-full relative bg-slate-50/50 selection:bg-indigo-500/30">
      {/* Aesthetic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-white/50 -z-10" />
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

      {/* Top Navigation Header */}
      <Header
        onLogout={onLogout}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Body (Sidebar + Content Area) */}
      <div className="flex flex-1 overflow-hidden w-full relative">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto w-full relative pb-20 md:pb-6">
          {/* Outlet renders the matched child route component */}
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Reusable Modals */}
      <PatientFormModal isOpen={isPatientModalOpen} onClose={closePatientModal} />
      <DoctorFormModal isOpen={isDoctorModalOpen} onClose={closeDoctorModal} />
    </div>
  );
};

// ============================================================================
// 2. PROTECTED ROUTE WRAPPER
// Redirects to /login if the user is not authenticated.
// ============================================================================
const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// ============================================================================
// 3. ROOT COMPONENT
// Configures the Router and all application routes.
// ============================================================================
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = localStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;
    const token =
      parsed?.token ||
      parsed?.data?.token ||
      parsed?.accessToken ||
      parsed?.data?.accessToken;
    return !!token;
  });

  // Global Modal State lifted to App so we can pass it to Routes
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const openPatientModal = () => setIsPatientModalOpen(true);
  const closePatientModal = () => setIsPatientModalOpen(false);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const openDoctorModal = () => setIsDoctorModalOpen(true);
  const closeDoctorModal = () => setIsDoctorModalOpen(false);

  return (
    <StoreManagement>
      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={() => setIsAuthenticated(true)} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route
              element={
                <MainLayout
                  isPatientModalOpen={isPatientModalOpen}
                  closePatientModal={closePatientModal}
                  isDoctorModalOpen={isDoctorModalOpen}
                  closeDoctorModal={closeDoctorModal}
                  onLogout={() => {
                    localStorage.removeItem("user");
                    setIsAuthenticated(false);
                  }}
                />
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard onAddPatient={openPatientModal} onAddDoctor={openDoctorModal} />} />
              <Route path="/patients" element={<Patients onAddPatient={openPatientModal} />} />
              <Route path="/doctors" element={<Doctors onAddDoctor={openDoctorModal} />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/odontograms" element={<Odontograms />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/test-reports" element={<EmptyView title="Test Reports" />} />
              <Route path="/billing" element={<EmptyView title="Billing" />} />
              <Route path="/inventory" element={<EmptyView title="Inventory" />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/settings" element={<EmptyView title="Settings" />} />
              <Route path="/website" element={<EmptyView title="Website Management" />} />
              <Route path="/follow-up" element={<FollowUp />} />
              <Route path="/enquiries" element={<Enquiries />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreManagement>
  );
}

export default App;
