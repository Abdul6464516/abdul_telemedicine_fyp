import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck, Users, Calendar, Video, ClipboardList, Settings,
  Menu, X, FileText, Bell, Heart, ChevronRight, Stethoscope,
} from "lucide-react";
import { clearSession } from "../../services/auth";
import { useUser } from "../../context/UserContext";
import { getUnreadCount } from "../../services/doctorAction";
import "./DoctorDashboard.css";

import DoctorProfile from "../../Components/Doctor/DoctorProfile";
import AppointmentManagement from "../../Components/Doctor/AppointmentManagement";
import ConsultationInterface from "../../Components/Doctor/ConsultationInterface";
import PatientHistory from "../../Components/Doctor/PatientHistory";
import PrescriptionGeneration from "../../Components/Doctor/PrescriptionGeneration";
import MedicalReports from "../../Components/Doctor/MedicalReports";
import NotificationCenter from "../../Components/Doctor/NotificationCenter";
import DoctorSettings from "../../Components/Doctor/DoctorSettings";
import DoctorSmartOverview from "../../Components/Doctor/DoctorSmartOverview";
import ProfileDropdown from "../../Components/ProfileDropdown";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useUser();
  const drName = user?.fullName || "Specialist";

  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch unread notification count from DB
  const refreshUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadNotifications(data.count);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshUnreadCount();
    }, 0);
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    logoutUser();
    navigate("/");
  };

  const handleProfileClick = () => {
    setActiveTab("Profile");
  };

  const menuItems = [
{ id: "Overview", icon: <ClipboardList size={20} />, label: "Dashboard Overview" },
{ id: "Profile", icon: <UserCheck size={20} />, label: "Doctor Profile" },
{ id: "Appointments", icon: <Calendar size={20} />, label: "Appointment Schedule" },
{ id: "Patients", icon: <Users size={20} />, label: "Patient Records" },
{ id: "Consultation", icon: <Video size={20} />, label: "Video Consultation" },
{ id: "Prescription", icon: <FileText size={20} />, label: "e-Prescriptions" },

  ];

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="doctor-dashboard-page">
      {isMobile && sidebarOpen && <div className="doctor-dashboard-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`doctor-dashboard-sidebar ${!sidebarOpen ? "closed" : ""}`}>
        <div className="doctor-dashboard-brand">
          <div className="doctor-dashboard-brand-icon"><Stethoscope size={20} color="#fff" /></div>
          <span className="doctor-dashboard-brand-name">Telemedicine</span>
        </div>
        <nav className="doctor-dashboard-nav">
          {/* <div className="doctor-dashboard-nav-label">MENU</div> */}
          {menuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }}
                className={`doctor-dashboard-nav-item ${active ? "active" : ""}`}
              >
                <div className="doctor-dashboard-nav-item-content">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight size={16} color="#16a34a" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className={`doctor-dashboard-main ${isMobile && !sidebarOpen ? "sidebar-closed" : ""} ${!isMobile && !sidebarOpen ? "collapsed" : ""}`}>
        <header className="doctor-dashboard-header">
          <div className="doctor-dashboard-header-left">
            <button className="doctor-dashboard-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <p className="doctor-dashboard-greeting">{greeting} 👋</p>
              <p className="doctor-dashboard-greeting-name">Dr. {drName.split(/[0-9]/)[0]}</p>
            </div>
          </div>

          <div className="doctor-dashboard-header-right">
            {/* Notification bell */}
            <button
              className="doctor-dashboard-notif-btn"
              onClick={() => setActiveTab("Notifications")}
              title="Notifications"
            >
              <Bell size={21} color="#4b5563" />
              {unreadNotifications > 0 && <span className="doctor-dashboard-badge">{unreadNotifications}</span>}
            </button>
            <ProfileDropdown
              userName={`Dr. ${drName.split(/[0-9]/)[0]}`}
              userRole="Doctor"
              onLogout={handleLogout}
              onProfile={handleProfileClick}
              avatarIcon={<Stethoscope size={18} color="#fff" />}
            />
          </div>
        </header>

        <main className="doctor-dashboard-content-area">
          <div className="doctor-dashboard-content-card">
            {activeTab === "Overview" && <DoctorSmartOverview />}
            {activeTab === "Profile" && <DoctorProfile />}
            {activeTab === "Appointments" && <AppointmentManagement />}
            {activeTab === "Patients" && <PatientHistory />}
            {activeTab === "Consultation" && <ConsultationInterface />}
            {activeTab === "Prescription" && <PrescriptionGeneration />}
            {activeTab === "Reports" && <MedicalReports />}
            {activeTab === "Settings" && <DoctorSettings />}
            {activeTab === "Notifications" && (
              <NotificationCenter
                onCountChange={refreshUnreadCount}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
