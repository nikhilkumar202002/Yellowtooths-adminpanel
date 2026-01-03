import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllUsers as fetchAllUsers } from '../../services/authService';
import { type PaginatedResponse } from '../../services/AllServices'; 
import { LuSearch, LuPlus, LuPen, LuLoader, LuTrash2, LuEye, LuShield, LuUser } from "react-icons/lu";

// Components
import UserCreate from './UserCreate';
import UserSingle from './UserSingle';

// Define Interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;          // admin or user
  phone_number: string;
  country_code: string;
  country: string;
  created_at?: string;
}

const UserList = () => {
  const [pagination, setPagination] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  // URL & Search State
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const isFirstRender = useRef(true);
  const prevSearchTerm = useRef(searchTerm);

  // --- Fetch Data ---
  const fetchUsers = useCallback(async (page: number) => {
    if (!pagination) setLoading(true);

    try {
      const response = await fetchAllUsers(page, searchTerm);
      let data: PaginatedResponse<User>;

      // Handle response structure
      if (Array.isArray(response)) {
        data = {
            data: response,
            current_page: 1,
            links: [], 
            total: response.length,
            from: 1,
            to: response.length,
            last_page: 1,
            path: '',
            per_page: response.length,
            first_page_url: '',
            last_page_url: '',
            next_page_url: null,
            prev_page_url: null
        };
      } else {
        data = response;
      }
      setPagination(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
        setLoading(false);
    }
  }, [searchTerm]);

  // --- Search Debounce ---
  useEffect(() => {
    if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
    }
    const hasSearchChanged = searchTerm !== prevSearchTerm.current;
    prevSearchTerm.current = searchTerm;

    if (!hasSearchChanged) return;

    const timer = setTimeout(() => {
        if (currentPage !== 1) {
            setSearchParams({ page: '1' });
        } else {
            fetchUsers(1);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, setSearchParams, fetchUsers]);

  // --- Page Change ---
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get('page');
      if (pageParam) {
        setSearchParams({ page: pageParam });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) { console.error(e); }
  };

  const users = pagination?.data || [];

  if (loading && !pagination) {
    return <div className="flex justify-center h-64 items-center text-yellow-500 animate-pulse"><LuLoader className="animate-spin mr-2"/> Loading...</div>;
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LuSearch className="text-gray-500" /></div>
            <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="flex items-center gap-3">
            {/* --- NEW: Total Users Count --- */}
            {pagination && (
                <div className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    {pagination.total} USERS
                </div>
            )}

            <button 
                onClick={() => setShowCreateModal(true)} 
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
            >
                <LuPlus size={18} /> Add User
            </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
              <tr>
                {/* --- NEW: Sl. No Column Header --- */}
                <th className="px-6 py-4 w-16">#</th> 
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-yellow-500/5 transition-colors group">
                      
                      {/* --- NEW: Sl. No Calculation --- */}
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                         {(pagination?.from || 1) + index}
                      </td>

                      {/* Name & Date */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-white text-base">{user.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="text-gray-300 mb-0.5">{user.email}</div>
                        <div className="text-xs text-gray-500 font-mono">
                            {user.country_code} {user.phone_number}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                                <LuShield size={12} /> Admin
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-300 border border-gray-700 uppercase tracking-wide">
                                <LuUser size={12} /> User
                            </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <span className="text-gray-400">{user.country || 'N/A'}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setViewId(user.id)}
                                className="text-gray-400 hover:text-yellow-500 transition-colors" 
                                title="View Details"
                            >
                                <LuEye size={18} />
                            </button>
                            <button 
                                className="text-gray-400 hover:text-white transition-colors" 
                                title="Edit"
                            >
                                <LuPen size={18} />
                            </button>
                            <button 
                                className="text-gray-400 hover:text-red-500 transition-colors" 
                                title="Delete"
                            >
                                <LuTrash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><p className="text-lg font-medium">No users found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Corrected --- */}
        {pagination && pagination.links && pagination.links.length > 3 && (
          <div className="bg-[#1a1a1a] border-t border-gray-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{pagination.from || 0}</span> to <span className="text-white font-medium">{pagination.to || 0}</span> of <span className="text-white font-medium">{pagination.total}</span> results
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {pagination.links.map((link, index) => {
                 // Replace HTML entities for cleaner rendering
                 const label = link.label
                    .replace('&laquo; Previous', '← Prev')
                    .replace('Next &raquo;', 'Next →');
                 
                 return (
                  <button
                    key={index}
                    disabled={!link.url || link.active}
                    onClick={() => handlePageChange(link.url)}
                    className={`
                        px-3 py-1.5 text-xs font-medium rounded transition-all
                        ${link.active 
                            ? 'bg-yellow-500 text-black border border-yellow-500 shadow-lg shadow-yellow-500/20' 
                            : 'bg-[#121212] text-gray-400 border border-gray-700 hover:bg-gray-800 hover:text-white'
                        }
                        ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span dangerouslySetInnerHTML={{ __html: label }} />
                  </button>
                 );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      <UserCreate 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={() => fetchUsers(currentPage)}
      />

      <UserSingle 
        isOpen={!!viewId} 
        id={viewId} 
        onClose={() => setViewId(null)} 
      />

    </div>
  );
}

export default UserList;