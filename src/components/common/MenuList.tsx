import React from 'react';
import { NavLink } from 'react-router-dom';
// Import Icons
import { RxDashboard } from "react-icons/rx";
import { RiImageAiLine } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { MdOutlineWorkOutline } from "react-icons/md";

const MenuList = () => {
  // Define menu items configuration
  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <RxDashboard />,
    },
    {
      name: "Film Poster",
      path: "/Allposters", // Matches the route in App.tsx
      icon: <RiImageAiLine />,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <GrUserWorker />,
    },
    {
      name: "Career",
      path: "/career",
      icon: <MdOutlineWorkOutline />,
    },
  ];

  return (
    <>
      {menus.map((menu, index) => (
        <NavLink
          key={index}
          to={menu.path}
          className={({ isActive }) =>
            `sidebar-menu-item ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-menu-icon">{menu.icon}</span>
          <span className="sidebar-menu-text">{menu.name}</span>
        </NavLink>
      ))}
    </>
  );
};

export default MenuList;