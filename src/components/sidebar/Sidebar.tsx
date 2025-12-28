import React from "react";
import Logo from "../../assets/logo_full_size.svg";
import { RxDashboard } from "react-icons/rx";
import { RiImageAiLine } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { MdOutlineWorkOutline } from "react-icons/md";
import "./SidebarStyles.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-container">

        {/* Logo */}
        <div className="sidebar-logo">
          <img src={Logo} alt="Yellowtooths Logo" />
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">

          <a className="sidebar-menu-item active" href="#">
            <span className="sidebar-menu-icon">
              <RxDashboard />
            </span>
            <span className="sidebar-menu-text">Dashboard</span>
          </a>

          <a className="sidebar-menu-item" href="#">
            <span className="sidebar-menu-icon">
              <RiImageAiLine />
            </span>
            <span className="sidebar-menu-text">Film Poster</span>
          </a>

          <a className="sidebar-menu-item" href="#">
            <span className="sidebar-menu-icon">
              <GrUserWorker />
            </span>
            <span className="sidebar-menu-text">Employees</span>
          </a>

          <a className="sidebar-menu-item" href="#">
            <span className="sidebar-menu-icon">
              <MdOutlineWorkOutline />
            </span>
            <span className="sidebar-menu-text">Career</span>
          </a>

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
