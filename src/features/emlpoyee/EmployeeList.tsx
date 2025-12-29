import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// 1. Import deleteEmployee service
import { getAllEmployees, deleteEmployee, Employee, PaginatedResponse } from '../../services/AllServices';
// 2. Import Toast utilities
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';
import { LuEye, LuSearch, LuPlus, LuTrash2, LuPen } from "react-icons/lu";

const EmployeeList = () => {
  const [pagination, setPagination] = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Track current page
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchEmployees(1);
  }, []);

  const fetchEmployees = async (page: number) => {
    if (!pagination) setLoading(true); 

    try {
      const data = await getAllEmployees(page, searchTerm);
      setPagination(data);
      setCurrentPage(data.current_page);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      // Only show error state if we have no data at all
      if (!pagination) setError('Failed to load employee list.');
      setLoading(false);
    }
  };

  // --- 3. Handle Delete Logic ---
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      
      // Start Loading Toast
      const toastId = showLoading("Deleting employee...");

      try {
        await deleteEmployee(id);
        
        // On Success
        dismissToast(toastId);
        showSuccess("Employee deleted successfully!");

        // Refresh List Logic
        // If this was the last item on the page and we are not on page 1, go back a page
        if (employees.length === 1 && currentPage > 1) {
            fetchEmployees(currentPage - 1);
        } else {
            // Otherwise just refresh current page to fill the gap
            fetchEmployees(currentPage);
        }

      } catch (err) {
        // On Error
        console.error("Delete failed:", err);
        dismissToast(toastId);
        showError("Failed to delete employee. Please try again.");
      }
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        fetchEmployees(1);
    }
  };

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get('page');
      if (pageParam) {
        fetchEmployees(parseInt(pageParam));
      }
    } catch (e) {
      console.error("Invalid pagination URL", e);
    }
  };

  const employees = pagination?.data || [];

  if (loading && !pagination) {
    return (
       <div className="flex items-center justify-center h-64 text-yellow-500 animate-pulse">
         Loading Employees...
       </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/20">{error}</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="text-gray-500" />
            </div>
            <input 
                type="text" 
                placeholder="Search by name..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch} 
            />
        </div>

        <Link 
            to="/employee/create" 
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
        >
            <LuPlus size={18} /> Add Employee
        </Link>
      </div>

      {/* Table */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
              <tr>
                <th className="px-6 py-4 w-20">Photo</th>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {employees.length > 0 ? (
                  employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-yellow-500/5 transition-colors group">
                      
                      {/* Photo Column */}
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
                          {employee.photo ? (
                            <img src={employee.photo} alt={employee.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-white text-base group-hover:text-yellow-400 transition-colors">
                            {employee.name}
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="px-6 py-4">
                        <span className="text-gray-300">
                            {employee.designation || 'N/A'}
                        </span>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500">#{employee.position_number}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {employee.status === "1" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <button className="text-gray-400 hover:text-white transition-colors" title="Edit">
                                <LuPen size={18} />
                            </button>
                            
                            {/* Delete Button */}
                            <button 
                                onClick={() => handleDelete(employee.id)}
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
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <p className="text-lg font-medium">No employees found</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.links.length > 3 && (
          <div className="bg-[#1a1a1a] border-t border-gray-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{pagination.from || 0}</span> to <span className="text-white font-medium">{pagination.to || 0}</span> of <span className="text-white font-medium">{pagination.total}</span> results
            </span>
            
            <div className="flex flex-wrap items-center gap-1">
              {pagination.links.map((link, index) => {
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
    </div>
  )
}

export default EmployeeList;