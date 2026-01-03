import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderStyles.css";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut, LuUser } from "react-icons/lu";
import Avatar from "../../assets/avatar.jpg";
import { logout } from "../../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed on server, clearing local session anyway.");
    } finally {
      // Always clear token and redirect
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-flex">

          {/* Left */}
          <div className="header-left-content">
            <h2>Admin Panel</h2>
          </div>

          {/* Right */}
          <div className="header-right-icons">

            <button className="header-icon-button">
              <IoSettingsOutline />
            </button>

            {/* Profile Dropdown Container */}
            <div className="header-profile-wrapper" ref={dropdownRef}>
              <div 
                className="header-avatar" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img src={Avatar} alt="User Avatar" />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="header-dropdown">
                  <div className="header-dropdown-header">
                    <p className="user-name">Admin User</p>
                    <p className="user-role">Super Admin</p>
                  </div>
                  
                  <ul className="header-dropdown-list">
                    <li className="header-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <LuUser size={16} /> Profile
                    </li>
                    <li className="header-dropdown-item text-red" onClick={handleLogout}>
                      <LuLogOut size={16} /> Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;