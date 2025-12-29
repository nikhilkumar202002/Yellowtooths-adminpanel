// 1. Removed unused 'React' import
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// 2. Added 'type' keyword for interfaces
import { getAllPosters, deletePoster, type FilmPoster, type PaginatedResponse } from '../../services/AllServices';
import { LuEye, LuSearch, LuPlus, LuFilter, LuTrash2 } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

const PosterList = () => {
  const [pagination, setPagination] = useState<PaginatedResponse<FilmPoster> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  
  // Track current page for refreshing after delete
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchPosters(1);
  }, []);

  useEffect(() => {
    fetchPosters(1);
  }, [selectedYear]); 

  const fetchPosters = async (page: number) => {
    // Only show full loading state if we don't have data yet (initial load)
    if (!pagination) setLoading(true);

    try {
      const data = await getAllPosters(page, searchTerm, selectedYear);
      setPagination(data);
      setCurrentPage(data.current_page); 
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch posters:", err);
      if (!pagination) setError('Failed to load film posters.');
      setLoading(false);
    }
  };

  // Handle Delete Logic with Toast & Refresh
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this poster? This action cannot be undone.")) {
      
      const toastId = showLoading("Deleting poster...");

      try {
        await deletePoster(id);
        
        dismissToast(toastId);
        showSuccess("Poster deleted successfully");

        // Refresh logic: go back a page if last item deleted, else refresh current
        if (pagination?.data.length === 1 && currentPage > 1) {
            fetchPosters(currentPage - 1);
        } else {
            fetchPosters(currentPage);
        }

      } catch (err) {
        dismissToast(toastId);
        console.error("Delete failed:", err);
        showError("Failed to delete the poster.");
      }
    }
  };

  const handleSearch = () => {
    fetchPosters(1);
  };

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    try {
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get('page');
      if (pageParam) {
        fetchPosters(parseInt(pageParam));
      }
    } catch (e) {
      console.error("Invalid pagination URL", e);
    }
  };

  const posters = pagination?.data || [];

  if (loading && !pagination) {
    return (
       <div className="flex items-center justify-center h-64 text-yellow-500 animate-pulse">
         Loading Data...
       </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/20">{error}</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* --- Filter & Action Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LuSearch className="text-gray-500" />
            </div>
            <input 
                type="text" 
                placeholder="Search films..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
        </div>

        <div className="flex items-center gap-3">
            {/* Year Filter */}
            <div className="relative min-w-[140px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LuFilter className="text-gray-500" size={14} />
                </div>
                <select 
                    className="w-full pl-9 pr-8 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="All">All Years</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            <Link 
                to="/poster/create" 
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
            >
                <LuPlus size={18} />
                Add Poster
            </Link>
        </div>
      </div>

      {/* --- Table Container --- */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
              <tr>
                <th className="px-6 py-4 w-20">Poster</th>
                <th className="px-6 py-4">Film Details</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {posters.length > 0 ? (
                  posters.map((poster) => (
                    <tr key={poster.id} className="hover:bg-yellow-500/5 transition-colors group">
                      
                      {/* Image Column */}
                      <td className="px-6 py-4">
                        <div className="h-16 w-12 rounded overflow-hidden bg-gray-800 border border-gray-700">
                          <img src={poster.main_image} alt={poster.film_name} className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* Film Name & Meta */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-white text-base group-hover:text-yellow-400 transition-colors">{poster.film_name}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-700">{poster.year}</span>
                          <span className="text-gray-500">•</span>
                          <span>{poster.language}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4"><span className="text-gray-300">{poster.genre}</span></td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 border border-yellow-500/20 font-bold text-xs">
                          ★ {poster.imdb_rating}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {poster.status === "1" ? (
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
                            <Link 
                                to={`/poster/${poster.id}`} 
                                className="text-gray-400 hover:text-yellow-400 transition-colors"
                                title="View Details"
                            >
                                <LuEye size={20} />
                            </Link>
                            
                            <a 
                                href={poster.trailer_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-yellow-400 transition-colors"
                                title="Watch Trailer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </a>

                            <button 
                              onClick={() => handleDelete(poster.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors" 
                              title="Delete"
                            >
                                <LuTrash2 size={18} />
                            </button>

                            <Link 
                                to={`/poster/edit/${poster.id}`}
                                className="text-gray-400 hover:text-white transition-colors" 
                                title="Edit"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                              </Link>
                        </div>
                      </td>

                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <p className="text-lg font-medium">No posters found</p>
                          <p className="text-sm mt-1">Try adjusting your search filters.</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Controls --- */}
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

export default PosterList;