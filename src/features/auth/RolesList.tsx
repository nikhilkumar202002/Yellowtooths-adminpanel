import { useEffect, useState } from 'react';
import { getAllRoles, deleteRole } from '../../services/authService';
import { LuSearch, LuPlus, LuPen, LuLoader, LuTrash2, LuShield, LuCalendar, LuCheck, LuX } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';
import RolesCreate from './RolesCreate'; // Import the Create Component

export interface Role {
  id: number;
  name: string;
  description: string;
  status: boolean | number | string;
  created_at: string;
  updated_at: string;
}

const RolesList = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false); // Modal State
  
  // Search State
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- Fetch Data ---
  const fetchRoles = async () => {
    // Only show loading spinner on initial load or manual refresh, not quiet updates
    if (roles.length === 0) setLoading(true);
    
    try {
      const response = await getAllRoles();
      // Ensure we have an array
      const data = Array.isArray(response) ? response : (response.data || []);
      setRoles(data);
      setFilteredRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      showError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // --- Client-side Filter ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRoles(roles);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = roles.filter(role => 
        role.name.toLowerCase().includes(lowerTerm) ||
        (role.description && role.description.toLowerCase().includes(lowerTerm))
      );
      setFilteredRoles(filtered);
    }
  }, [searchTerm, roles]);

  // --- Delete Handler ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    const toastId = showLoading("Deleting role...");
    try {
      await deleteRole(id);
      dismissToast(toastId);
      showSuccess("Role deleted successfully");
      // Remove from local state immediately
      const updatedRoles = roles.filter(r => r.id !== id);
      setRoles(updatedRoles);
    } catch (err: any) {
      console.error("Delete failed:", err);
      dismissToast(toastId);
      showError(err.response?.data?.message || "Failed to delete role.");
    }
  };

  if (loading && roles.length === 0) {
    return <div className="flex justify-center h-64 items-center text-yellow-500 animate-pulse"><LuLoader className="animate-spin mr-2"/> Loading...</div>;
  }

  return (
    <div className="space-y-6 relative animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LuSearch className="text-gray-500" /></div>
            <input 
                type="text" 
                placeholder="Search roles..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="flex items-center gap-3">
            <div className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap">
                {filteredRoles.length} ROLES
            </div>
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
            >
                <LuPlus size={18} /> Add Role
            </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">Role Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <tr key={role.id} className="hover:bg-yellow-500/5 transition-colors group">
                      
                      {/* Sl. No */}
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                         {index + 1}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                <LuShield size={18} />
                            </div>
                            <span className="font-medium text-white text-base capitalize">
                                {role.name}
                            </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-xs sm:text-sm line-clamp-1">
                            {role.description || 'No description provided'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {role.status === true || role.status === 1 || role.status === '1' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                <LuCheck size={12} /> Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                <LuX size={12} /> Inactive
                            </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-right">
                         <div className="inline-flex items-center gap-2 text-gray-500 text-xs">
                            <LuCalendar size={12} />
                            {role.created_at ? new Date(role.created_at).toLocaleDateString() : 'N/A'}
                         </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                className="text-gray-400 hover:text-white transition-colors" 
                                title="Edit Role"
                            >
                                <LuPen size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(role.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors" 
                                title="Delete Role"
                            >
                                <LuTrash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><p className="text-lg font-medium">No roles found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <RolesCreate 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchRoles} 
      />

    </div>
  );
}

export default RolesList;