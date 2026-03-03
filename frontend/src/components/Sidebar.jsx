import React, { useState, useEffect } from "react";
import Logo from "../assets/church-logo-fi.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineLogout,
} from "react-icons/md";
import { GrCertificate } from "react-icons/gr";
import { BsCalendarWeek } from "react-icons/bs";
import { PiChurchBold } from "react-icons/pi";
import { FaWpforms, FaBars, FaUsers, FaReceipt, FaFileInvoiceDollar } from "react-icons/fa";
import { HiX } from "react-icons/hi";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "../components/sidebar.css";

const Sidebar = ({ children, setIsAuthenticated }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isMargin, setMargin] = useState(true);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setMargin(window.innerWidth > 968);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setMargin((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login");
  };

  const checklogout = () => setShowPopup(true);

  const handleLinkClick = () => {
    if (window.innerWidth < 968) setMargin(false);
  };

  const menuItem = [
    { path: "/", name: "Dashboard", icon: <MdDashboard /> },
    {
      name: "Certificate Management",
      icon: <GrCertificate />,
      submenu: [
        { path: "/baptism", name: "Baptism Certificates" },
        { path: "/marriage", name: "Marriage Certificates" },
        { path: "/confirmation", name: "Confirmation Certificates" },
        { path: "/death", name: "Burial Certificates" },
        { path: "/objection", name: "No Objection Letters" },
      ],
    },
    { path: "/announcements", name: "Weekly Announcement", icon: <BsCalendarWeek /> },
    { path: "/intentions", name: "Mass Intention Booking", icon: <PiChurchBold /> },
    { path: "/requests", name: "Parish Request Form", icon: <FaWpforms /> },
    { path: "/family", name: "Family Registration", icon: <FaUsers /> },
    { path: "/receipt", name: "Receipt", icon: <FaReceipt /> },
    { path: "/voucher", name: "Voucher", icon: <FaFileInvoiceDollar /> },
  ];

  return (
    <div className="container1">
      {/* Logout Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Are you sure you want to logout?</h3>
            <button className="pop-btn pop-btn-no" onClick={() => setShowPopup(false)}>No</button>
            <button className="pop-btn pop-btn-yes" onClick={handleLogout}>Yes</button>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="Navbar-mobile-responsive">
        <div className="menu-bar" onClick={toggleSidebar}>
          <FaBars size={24} color="white" />
        </div>
      </div>

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          marginLeft: isMargin ? "0" : "-280px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div className="close-button-icons">
          <HiX size={30} onClick={handleLinkClick} />
        </div>

        {/* Logo */}
        <div className="top-section">
          <h1 className="logo">
            <img src={Logo} alt="Logo" height="70" />
          </h1>
        </div>

        {/* Menu Items */}
        {menuItem.map((item, index) =>
          item.submenu ? (
            <div key={index}>
              <div
                className="link"
                onClick={() => setIsCertOpen(!isCertOpen)}
                style={{ cursor: "pointer" }}
              >
                <div className="icon">{item.icon}</div>
                <div className="link_text">{item.name}</div>
              </div>
              {isCertOpen && (
                <div className="submenu">
                  {item.submenu.map((subItem, subIndex) => (
                    <NavLink
                      to={subItem.path}
                      key={subIndex}
                      className={({ isActive }) => `link sublink ${isActive ? "active" : ""}`}
                      onClick={handleLinkClick}
                    >
                      <div className="link_text">{subItem.name}</div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to={item.path}
              key={index}
              end={item.path === "/"}
              className={({ isActive }) => `link ${isActive ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <div className="icon">{item.icon}</div>
              <div className="link_text">{item.name}</div>
            </NavLink>
          )
        )}

        {/* Logout */}
        <div className="link" onClick={checklogout} style={{ cursor: "pointer" }}>
          <div className="icon">
            <MdOutlineLogout />
          </div>
          <div className="link_text">Log Out</div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ marginLeft: isMargin && window.innerWidth > 968 ? "280px" : "0" }}>
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
