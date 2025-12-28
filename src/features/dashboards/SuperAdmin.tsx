import React from "react";

const SuperAdmin = () => {
  return (
    <main className="superadmin">

      {/* Page Header */}
      <div className="pb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          System-wide overview & controls
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">

        <div className="stat-card">
          <h4>Total Users</h4>
          <p className="stat-number">1,284</p>
        </div>

        <div className="stat-card">
          <h4>Admins</h4>
          <p className="stat-number">12</p>
        </div>

        <div className="stat-card">
          <h4>Employees</h4>
          <p className="stat-number">248</p>
        </div>

        <div className="stat-card highlight">
          <h4>System Status</h4>
          <p className="stat-number">Stable</p>
        </div>

      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6 py-8">

        {/* Left Panel */}
        <div className="panel col-span-2">
          <h3>Recent Activities</h3>

          <ul className="activity-list">
            <li>New admin created</li>
            <li>Employee data updated</li>
            <li>New poster module added</li>
            <li>System backup completed</li>
          </ul>
        </div>

        {/* Right Panel */}
        <div className="panel">
          <h3>Quick Actions</h3>

          <div className="quick-actions">
            <button>Add Admin</button>
            <button>Manage Roles</button>
            <button>System Logs</button>
          </div>
        </div>

      </div>

    </main>
  );
};

export default SuperAdmin;
