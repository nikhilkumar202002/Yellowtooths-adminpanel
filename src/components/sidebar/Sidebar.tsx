
import Logo from "../../assets/logo_full_size.svg";
import MenuList from "../common/MenuList"; // Import your new component
import "./SidebarStyles.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-container">

        {/* Logo */}
        <div className="sidebar-logo">
          <img src={Logo} alt="Yellowtooths Logo" />
        </div>

        {/* Menu Area */}
        <nav className="sidebar-menu">
          {/* Call the menu list here */}
          <MenuList />
        </nav>
        
      </div>
    </aside>
  );
};

export default Sidebar;