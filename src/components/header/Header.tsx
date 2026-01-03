import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderStyles.css";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLogOut, LuUser } from "react-icons/lu";
// REMOVED: Avatar import
import { logout, checkAuth } from "../../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for Logged-in User
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // 1. Fetch User Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await checkAuth();
        // Handle response structure (data.user or data directly)
        const userData = data.user || data;
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    };

    fetchUserData();
  }, []);

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
              {user && (
                <div className="hidden md:block text-right mr-2">
                    <p className="text-xl font-semibold text-white leading-none">{user.name}</p>
                </div>
            )}
          </div>

          {/* Right */}
          <div className="header-right-icons">

            {/* Display User Name in Main Header */}
          

            <button className="header-icon-button">
              <IoSettingsOutline />
            </button>

            {/* Profile Dropdown Container */}
            <div className="header-profile-wrapper" ref={dropdownRef}>
              <div 
                className="header-avatar flex items-center justify-center bg-[#1a1a1a] text-yellow-500" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* Replaced Image with Icon */}
                <LuUser size={24} />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="header-dropdown">
                  <div className="header-dropdown-header">
                    {/* Dynamic Name & Role */}
                    <p className="user-name">{user?.name || 'Guest User'}</p>
                    <p className="user-role capitalize">{user?.role || 'User'}</p>
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