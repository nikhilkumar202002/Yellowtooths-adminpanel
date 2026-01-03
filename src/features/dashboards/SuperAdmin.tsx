
import { 
  FiUsers, 
  FiShield, 
  FiBriefcase, 
  FiActivity, 
  FiClock, 
  FiUserPlus, 
  FiSettings, 
  FiDatabase, 
  FiFileText,
  FiArrowRight
} from "react-icons/fi";

const SuperAdmin = () => {
  return (
    <main className="space-y-6">

      {/* Page Header */}
      <div className="flex items-end justify-between pb-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            System-wide overview & controls
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-neutral-500 border border-neutral-800 rounded px-3 py-1 bg-[#0b0b0b]">
            <FiClock />
            {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Users */}
        <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-neutral-800 hover:border-yellow-500/30 transition-colors shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                <FiUsers size={22} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-800 text-neutral-400">+12%</span>
          </div>
          <h4 className="text-sm font-medium text-neutral-400 mb-1">Total Users</h4>
          <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">1,284</p>
        </div>

        {/* Card 2: Admins */}
        <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-neutral-800 hover:border-yellow-500/30 transition-colors shadow-sm group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                <FiShield size={22} />
            </div>
          </div>
          <h4 className="text-sm font-medium text-neutral-400 mb-1">Admins</h4>
          <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">12</p>
        </div>

        {/* Card 3: Employees */}
        <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-neutral-800 hover:border-yellow-500/30 transition-colors shadow-sm group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                <FiBriefcase size={22} />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-800 text-neutral-400">+5 new</span>
          </div>
          <h4 className="text-sm font-medium text-neutral-400 mb-1">Employees</h4>
          <p className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors">248</p>
        </div>

        {/* Card 4: System Status */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0b0b0b] to-yellow-900/10 border border-yellow-500/30 shadow-[0_0_30px_rgba(255,193,7,0.05)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
                <FiActivity size={22} />
            </div>
            <span className="flex h-3 w-3 mt-1.5">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <h4 className="text-sm font-medium text-yellow-500/80 mb-1">System Status</h4>
          <p className="text-3xl font-bold text-white">Stable</p>
        </div>

      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Panel: Recent Activities */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0b0b0b] border border-neutral-800 overflow-hidden">
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiClock className="text-neutral-500" /> Recent Activities
            </h3>
            <button className="text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
                View All <FiArrowRight />
            </button>
          </div>
          
          <ul className="divide-y divide-neutral-800">
            {[
              { text: "New admin created", time: "2 mins ago", type: "Admin", icon: <FiShield /> },
              { text: "Employee data updated", time: "1 hour ago", type: "Edit", icon: <FiUsers /> },
              { text: "New poster module added", time: "3 hours ago", type: "System", icon: <FiDatabase /> },
              { text: "System backup completed", time: "5 hours ago", type: "Success", icon: <FiActivity /> }
            ].map((item, index) => (
               <li key={index} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:border-yellow-500/30 group-hover:text-yellow-500 transition-colors">
                        {item.icon}
                     </div>
                     <span className="text-sm text-neutral-300">{item.text}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 hidden sm:block">{item.type}</span>
                     <span className="text-xs text-neutral-600">{item.time}</span>
                  </div>
               </li>
            ))}
          </ul>
        </div>

        {/* Right Panel: Quick Actions */}
        <div className="rounded-2xl bg-[#0b0b0b] border border-neutral-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>

          <div className="space-y-3">
            <button className="w-full py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all font-medium text-sm flex items-center justify-center gap-3 group">
              <FiUserPlus className="group-hover:scale-110 transition-transform" /> 
              Add New User
            </button>
            <button className="w-full py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all font-medium text-sm flex items-center justify-center gap-3">
              <FiSettings /> 
              Manage Roles
            </button>
            <button className="w-full py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all font-medium text-sm flex items-center justify-center gap-3">
              <FiFileText /> 
              View System Logs
            </button>
            <button className="w-full py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all font-medium text-sm flex items-center justify-center gap-3">
              <FiDatabase /> 
              Database Backup
            </button>
          </div>
        </div>

      </div>

    </main>
  );
};

export default SuperAdmin;