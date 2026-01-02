import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getAllClients, 
  type Client, 
  type PaginatedResponse 
} from '../../services/AllServices';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';
import { LuSearch, LuPlus, LuPen, LuTrash2, LuLoader } from "react-icons/lu";

// Import the new Modal Component
import ClientCreate from './ClientCreate';

const ClientsList = () => {
  const [pagination, setPagination] = useState<PaginatedResponse<Client> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // --- Modal State ---
  const [showCreateModal, setShowCreateModal] = useState(false);

  // URL Params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const isFirstRender = useRef(true);
  const prevSearchTerm = useRef(searchTerm);

  // --- Fetch Data ---
  const fetchClients = useCallback(async (page: number) => {
    if (!pagination) setLoading(true);
    try {
      const response = await getAllClients(page, searchTerm);
      let data: PaginatedResponse<Client>;

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
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      if (!pagination) setError('Failed to load client list.');
      setLoading(false);
    }
  }, [pagination, searchTerm]);

  // --- Effects ---
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
            fetchClients(1);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, setSearchParams, fetchClients]);

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage, fetchClients]);

  // // --- Handlers ---
  // const handleDelete = async (id: number) => {
  //   if (window.confirm("Are you sure you want to delete this client?")) {
  //     const toastId = showLoading("Deleting client...");
  //     try {
  //       await deleteClient(id);
  //       dismissToast(toastId);
  //       showSuccess("Client deleted successfully");
  //       if (pagination?.data.length === 1 && currentPage > 1) {
  //           setSearchParams({ page: (currentPage - 1).toString() });
  //       } else {
  //           fetchClients(currentPage);
  //       }
  //     } catch (err) {
  //       dismissToast(toastId);
  //       console.error("Delete failed:", err);
  //       showError("Failed to delete client.");
  //     }
  //   }
  // };

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

  const clients = pagination?.data || [];

  if (loading && !pagination) {
    return <div className="flex justify-center h-64 items-center text-yellow-500 animate-pulse"><LuLoader className="animate-spin mr-2"/> Loading...</div>;
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LuSearch className="text-gray-500" /></div>
            <input type="text" placeholder="Search clients..." className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Change Link to Button to open Modal */}
        <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
        >
            <LuPlus size={18} /> Add Client
        </button>
      </div>

      {/* Table Container */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
              <tr>
                <th className="px-6 py-4 w-20">Logo</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-yellow-500/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-black border border-gray-700 flex items-center justify-center p-1">
                          {client.logo_path ? <img src={client.logo_path} alt={client.name} className="h-full w-full object-contain" /> : <div className="text-xs text-gray-400 font-bold">{(client.name || 'NA').substring(0,2).toUpperCase()}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{client.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: #{client.id}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {client.status === "1" ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Active</span> : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Inactive</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <button className="text-gray-400 hover:text-white" title="Edit"><LuPen size={18} /></button>
                            {/* <button onClick={() => handleDelete(client.id)} className="text-gray-400 hover:text-red-500" title="Delete"><LuTrash2 size={18} /></button> */}
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500"><p className="text-lg font-medium">No clients found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.links && pagination.links.length > 3 && (
          <div className="bg-[#1a1a1a] border-t border-gray-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">Showing <span className="text-white font-medium">{pagination.from || 0}</span> to <span className="text-white font-medium">{pagination.to || 0}</span> of <span className="text-white font-medium">{pagination.total}</span> results</span>
            <div className="flex flex-wrap items-center gap-1">
              {pagination.links.map((link, index) => {
                 const label = link.label.replace('&laquo; Previous', '← Prev').replace('Next &raquo;', 'Next →');
                 return (
                  <button key={index} disabled={!link.url || link.active} onClick={() => handlePageChange(link.url)} className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${link.active ? 'bg-yellow-500 text-black border border-yellow-500' : 'bg-[#121212] text-gray-400 border border-gray-700 hover:bg-gray-800'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span dangerouslySetInnerHTML={{ __html: label }} />
                  </button>
                 );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- RENDER MODAL --- */}
      <ClientCreate 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchClients(currentPage)} 
      />

    </div>
  );
}

export default ClientsList;