import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Calendar, Video, FileText, ClipboardList, Star,
  Menu, X, Heart, ChevronRight, Bell,Stethoscope
} from "lucide-react";
import { clearSession } from "../../services/auth";
import { useUser } from "../../context/UserContext";
import { connectSocket } from "../../services/socket";

import PatientProfile from "../../Components/Patient/PatientProfile";
import PatientSmartOverview from "../../Components/Patient/PatientSmartOverview";
import VideoCall from "../../Components/Patient/VideoCall";
import AppointmentBooking from "../../Components/Patient/AppointmentBooking";
import PrescriptionAccess from "../../Components/Patient/PerscriptionAccess";
import MedicalRecords from "../../Components/Patient/MedicalRecords";
import FeedbackSystem from "../../Components/Patient/FeedbackSystem";
import ProfileDropdown from "../../Components/ProfileDropdown";
import "./PatientDashboard.css";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useUser();
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const userName = user?.fullName || localStorage.getItem("userName") || "Patient";

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

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);
    const handleIncomingCall = (data) => {
      setIncomingCallData(data);
      setActiveTab("Consultation");
    };
    socket.on("incoming-call", handleIncomingCall);
    return () => { socket.off("incoming-call", handleIncomingCall); };
  }, [user]);

  const handleLogout = () => {
    clearSession();
    if (logoutUser) logoutUser();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setActiveTab("Profile");
  };

  const menuItems = [
  { id: "Overview", icon: <ClipboardList size={20} />, label: "Dashboard Overview" },
{ id: "Profile", icon: <User size={20} />, label: "My Profile" },
{ id: "Appointments", icon: <Calendar size={20} />, label: "Book Appointment" },
{ id: "Consultation", icon: <Video size={20} />, label: "Video Consultation" },
{ id: "Prescriptions", icon: <FileText size={20} />, label: "My Prescriptions" },
  ];

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="pd-page">
      {isMobile && sidebarOpen && <div className="pd-overlay active" onClick={() => setSidebarOpen(false)} />}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`pd-sidebar ${!sidebarOpen ? 'closed' : ''}`}>
        {/* Brand */}
        <div className="pd-brand">
          <div className="pd-brand-icon"><Stethoscope size={20} color="#fff" /></div>
          <span className="pd-brand-name">Telemedicine</span>
        </div>



        {/* Nav */}
        <nav className="pd-nav">
          {/* <div className="pd-nav-label">MENU</div> */}
          {menuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }}
                className={`pd-nav-item ${active ? 'active' : ''}`}
              >
                <div className="pd-nav-icon-text">
                  {item.icon}
                  <span className="pd-nav-item-label">{item.label}</span>
                </div>
                {active && <ChevronRight size={16} color="#16a34a" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className={`pd-main ${isMobile && !sidebarOpen ? 'sidebar-closed' : ''} ${!isMobile && !sidebarOpen ? 'collapsed' : ''}`}>
        {/* Header */}
        <header className="pd-header">
          <div className="pd-header-left">
            <button className="pd-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <div className="pd-greeting">{greeting} 👋</div>
              <div className="pd-greeting-name">{userName}</div>
            </div>
          </div>

          <div className="pd-header-right">
            <ProfileDropdown
              userName={userName}
              userRole="Patient"
              onLogout={handleLogout}
              onProfile={handleProfileClick}
              avatarIcon={<User size={18} color="#fff" />}
            />
          </div>
        </header>

        {/* Content */}
        <main className="pd-content">
          <div className="pd-content-card">
            {activeTab === "Overview" && <PatientSmartOverview />}
            {activeTab === "Profile" && <PatientProfile />}
            {activeTab === "Appointments" && <AppointmentBooking />}
            {activeTab === "Consultation" && (
              <VideoCall incomingCallData={incomingCallData} onCallHandled={() => setIncomingCallData(null)} />
            )}
            {activeTab === "Prescriptions" && <PrescriptionAccess />}
            {activeTab === "Records" && <MedicalRecords />}
            {activeTab === "Feedback" && <FeedbackSystem />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
