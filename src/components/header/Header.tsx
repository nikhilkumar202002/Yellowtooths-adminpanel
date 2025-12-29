
import "./HeaderStyles.css";
import { IoSettingsOutline } from "react-icons/io5";
import Avatar from "../../assets/avatar.jpg";

const Header = () => {
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

            <div className="header-avatar">
              <img src={Avatar} alt="User Avatar" />
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
