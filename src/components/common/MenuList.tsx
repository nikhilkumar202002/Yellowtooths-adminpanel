import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RxDashboard } from "react-icons/rx";
import { RiImageAiLine } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { MdOutlineWorkOutline } from "react-icons/md";
import { LuChevronDown } from "react-icons/lu"; // Removed LuDot from import

const MenuList = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <RxDashboard />,
    },
    {
      name: "Film Poster",
      icon: <RiImageAiLine />,
      children: [
        { name: "Poster List", path: "/Allposters" },
        { name: "Poster Arrangement", path: "/Poster/sorting" }
      ]
    },
    {
      name: "Employees",
      path: "/AllEmployees",
      icon: <GrUserWorker />,
    },
    {
      name: "Career",
      path: "/career",
      icon: <MdOutlineWorkOutline />,
    },
  ];

  // Auto-expand logic
  useEffect(() => {
    menus.forEach(menu => {
      if (menu.children) {
        if (menu.children.some(child => location.pathname === child.path)) {
          setOpenMenu(menu.name);
        }
      }
    });
  }, [location.pathname]);

  const handleToggle = (name: string) => {
    setOpenMenu(prev => (prev === name ? null : name));
  };

  return (
    <>
      {menus.map((menu, index) => {
        // --- RENDER PARENT WITH SUBMENU ---
        if (menu.children) {
          const isActiveParent = menu.children.some(child => location.pathname === child.path);
          const isOpen = openMenu === menu.name;

          return (
            <div key={index} className="flex flex-col mb-1">
              {/* Parent Item */}
              <div 
                className={`sidebar-menu-item cursor-pointer flex justify-between items-center ${isActiveParent ? "active" : ""}`}
                onClick={() => handleToggle(menu.name)}
              >
                <div className="flex items-center gap-3">
                    <span className="sidebar-menu-icon">{menu.icon}</span>
                    <span className="sidebar-menu-text">{menu.name}</span>
                </div>
                {/* Arrow with Smooth Rotation */}
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <LuChevronDown />
                </span>
              </div>

              {/* Submenu Container - Smooth Animation */}
              <div 
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                {/* Submenu Items Design */}
                <div className="flex flex-col mt-1 ml-6 pl-4 border-l border-gray-700 space-y-1">
                  {menu.children.map((child, childIndex) => (
                    <NavLink
                      key={childIndex}
                      to={child.path}
                      className={({ isActive }) =>
                        `block py-2 px-3 rounded-md text-sm transition-all duration-200
                         ${isActive 
                           ? "text-yellow-500 font-medium bg-yellow-500/10 translate-x-1" 
                           : "text-gray-400 hover:text-gray-200 hover:translate-x-1"
                         }`
                      }
                    >
                      <span>{child.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // --- RENDER STANDARD ITEM ---
        return (
          <NavLink
            key={index}
            to={menu.path!}
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-menu-icon">{menu.icon}</span>
            <span className="sidebar-menu-text">{menu.name}</span>
          </NavLink>
        );
      })}
    </>
  );
};

export default MenuList;