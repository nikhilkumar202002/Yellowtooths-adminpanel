import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getAllContactEnquiries, 
  type ContactEnquiry, 
  type PaginatedResponse 
} from '../../services/AllServices';
import { LuSearch, LuLoader, LuMail, LuPhone, LuCalendar, LuMessageSquare, LuUser } from "react-icons/lu";

const ContactEnquiriesList = () => {
  const [pagination, setPagination] = useState<PaginatedResponse<ContactEnquiry> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // URL & Search State
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const isFirstRender = useRef(true);
  const prevSearchTerm = useRef(searchTerm);

  // --- Fetch Data ---
  const fetchEnquiries = useCallback(async (page: number) => {
    // Only show loading spinner on first load (when no pagination data exists)
    // This prevents flickering during the 3-second auto-refresh
    setPagination(prev => {
        if (!prev) setLoading(true);
        return prev;
    });

    try {
      const response: any = await getAllContactEnquiries(page, searchTerm);
      // console.log("API Response:", response); 

      let data: PaginatedResponse<ContactEnquiry>;

      // 1. Check for 'contact_enquiries' wrapper
      if (response.contact_enquiries) {
          data = response.contact_enquiries;
      } 
      // 2. Check for 'data' wrapper 
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          data = response.data;
      }
      // 3. Check if response ITSELF is the pagination object
      else if (response.data && Array.isArray(response.data)) {
          data = response;
      }
      // 4. Fallback: Handle raw array
      else if (Array.isArray(response)) {
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
        console.warn("Unexpected response structure", response);
        data = response;
      }
      
      setPagination(data);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
        setLoading(false);
    }
  }, [searchTerm]);

  // --- Auto Refresh (Polling) ---
  useEffect(() => {
    // Initial fetch handled by the Page Change effect below, 
    // so we just set up the interval here.
    const intervalId = setInterval(() => {
      fetchEnquiries(currentPage);
    }, 3000); // 3000 ms = 3 seconds

    // Cleanup interval on unmount or dependencies change
    return () => clearInterval(intervalId);
  }, [fetchEnquiries, currentPage]);


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
            fetchEnquiries(1);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, setSearchParams, fetchEnquiries]);

  // --- Page Change ---
  useEffect(() => {
    fetchEnquiries(currentPage);
  }, [currentPage, fetchEnquiries]);

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

  const enquiries = pagination?.data || [];

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
                placeholder="Search enquiries..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all text-sm"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="flex items-center gap-3">
             {pagination && (
                <div className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    {pagination.total} MESSAGES
                </div>
            )}
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4 w-1/4">User Details</th>
                <th className="px-6 py-4 w-1/4">Contact Info</th>
                <th className="px-6 py-4 w-1/3">Message</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {enquiries.length > 0 ? (
                  enquiries.map((enquiry, index) => (
                    <tr key={enquiry.id} className="hover:bg-yellow-500/5 transition-colors group">
                      
                      {/* Sl. No */}
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs align-top pt-5">
                         {(pagination?.from || 1) + index}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-2 bg-gray-800 rounded-lg text-gray-400">
                                <LuUser size={16} />
                            </div>
                            <div>
                                <div className="font-medium text-white text-base">{enquiry.full_name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">ID: #{enquiry.id}</div>
                            </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-gray-300">
                                <LuMail className="text-yellow-500" size={14} />
                                <span className="text-sm">{enquiry.email_address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <LuPhone className="text-yellow-500" size={14} />
                                <span className="text-xs font-mono">{enquiry.phone_number}</span>
                            </div>
                        </div>
                      </td>

                      {/* Message */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex gap-2">
                             <LuMessageSquare className="text-gray-600 mt-1 shrink-0" size={14} />
                             <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                                {enquiry.message}
                             </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-right align-top">
                        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                             <LuCalendar size={12} />
                             {new Date(enquiry.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1 mr-1">
                             {new Date(enquiry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>

                    </tr>
                  ))
              ) : (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500"><p className="text-lg font-medium">No enquiries found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Show only if there is more than 1 page */}
        {pagination && pagination.links && pagination.last_page > 1 && (
          <div className="bg-[#1a1a1a] border-t border-gray-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{pagination.from || 0}</span> to <span className="text-white font-medium">{pagination.to || 0}</span> of <span className="text-white font-medium">{pagination.total}</span> results
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {pagination.links.map((link, index) => {
                 const label = link.label.replace('&laquo; Previous', '← Prev').replace('Next &raquo;', 'Next →');
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
  );
}

export default ContactEnquiriesList;