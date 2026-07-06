import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Heart,
  Lock,
  Menu,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { clearSession } from "../../services/auth";
import { useUser } from "../../context/UserContext";

import AdminProfile from "../../Components/Admin/AdminProfile";
import UserManagement from "../../Components/Admin/UserManagement";
import SystemMonitoring from "../../Components/Admin/SystemMonitoring";
import SecurityPrivacy from "../../Components/Admin/SecurityPrivacy";
import ReportsAnalytics from "../../Components/Admin/ReportsAnalytics";
import ProfileDropdown from "../../Components/ProfileDropdown";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useUser();
  const [activeTab, setActiveTab] = useState("Admin Profile");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const adminName = user?.fullName || localStorage.getItem("userName") || "Administrator";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    clearSession();
    if (logoutUser) logoutUser();
    navigate("/login");
  };

  const menuItems = useMemo(
    () => [
      { id: "Admin Profile", icon: <UserCog size={18} />, label: "Admin Profile" },
      { id: "User Management", icon: <Users size={18} />, label: "User Management" },
      { id: "System Monitoring", icon: <Activity size={18} />, label: "System Activity" },
      { id: "Security & Privacy", icon: <Lock size={18} />, label: "Security & Privacy" },
      { id: "Reports & Analytics", icon: <BarChart3 size={18} />, label: "Reports & Analytics" },
    ],
    []
  );

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="admin-shell">
      {isMobile && sidebarOpen && <button className="admin-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              <Heart size={18} fill="currentColor" />
            </div>
            <div className="admin-brand-text">
              <strong>Telemedicine</strong>
              <span>Admin control center</span>
            </div>
          </div>
        </div>

        {/* <div className="admin-identity-card"> */}
          {/* <div className="admin-avatar">{adminInitial}</div> */}
          {/* <div>
            <div className="admin-identity-name">{adminName}</div>
            <div className="admin-identity-role">Admin</div>
          </div> */}
        {/* </div> */}

        <nav className="admin-nav">
          {/* <div className="admin-nav-label">MANAGEMENT</div> */}
          {menuItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`admin-nav-item ${active ? "active" : ""}`}
              >
                <span className="admin-nav-item-left">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {active && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button type="button" className="admin-menu-btn" onClick={() => setSidebarOpen((prev) => !prev)} aria-label="Toggle menu">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <div className="admin-greeting">{greeting} 👋</div>
              <div className="admin-greeting-name">{adminName}</div>
            </div>
          </div>

          <div className="admin-topbar-right">
            <ProfileDropdown
              userName={adminName}
              userRole="Admin"
              onLogout={handleLogout}
              onProfile={() => setActiveTab("Admin Profile")}
              avatarIcon={<ShieldCheck size={18} color="#fff" />}
            />
          </div>
        </header>

        <main className="admin-content">
          <section className="admin-panel-shell">
            <div className="admin-panel-header">
              <div className="admin-panel-kicker">Dashboard</div>
              <div className="admin-panel-title">{activeTab}</div>
            </div>
            <div className="admin-panel-card">
              {activeTab === "Admin Profile" && <AdminProfile />}
              {activeTab === "User Management" && <UserManagement />}
              {activeTab === "System Monitoring" && <SystemMonitoring />}
              {activeTab === "Security & Privacy" && <SecurityPrivacy />}
              {activeTab === "Reports & Analytics" && <ReportsAnalytics />}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
