import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosters, FilmPoster } from '../../services/AllServices';
import { LuEye, LuSearch, LuPlus, LuFilter } from "react-icons/lu";

const PosterList = () => {
  // Data State
  const [posters, setPosters] = useState<FilmPoster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPosters();
  }, []);

  const fetchPosters = async () => {
    try {
      const data = await getAllPosters();
      setPosters(Array.isArray(data) ? data : (data as any).data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch posters:", err);
      setError('Failed to load film posters.');
      setLoading(false);
    }
  };

  // --- Derived Data (Filtering) ---
  
  // 1. Extract unique years for the dropdown
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(posters.map(p => p.year))).sort((a, b) => Number(b) - Number(a));
    return ['All', ...uniqueYears];
  }, [posters]);

  // 2. Filter the posters based on Search and Year
  const filteredPosters = useMemo(() => {
    return posters.filter(poster => {
      // Search Logic (Case insensitive check on name or genre)
      const matchesSearch = 
        poster.film_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poster.genre.toLowerCase().includes(searchTerm.toLowerCase());

      // Year Logic
      const matchesYear = selectedYear === 'All' || poster.year === selectedYear;

      return matchesSearch && matchesYear;
    });
  }, [posters, searchTerm, selectedYear]);

  // 3. Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear]);

  // --- Pagination Logic (Applied to filtered results) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPosters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosters.length / itemsPerPage);

  // Handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Skeleton Loading State
  if (loading) {
    return (
       <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex justify-between h-10 animate-pulse bg-gray-900 rounded-lg"></div>
        {/* Table Skeleton */}
        <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212] flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-200">
                <tr>
                    {/* Simplified Header for skeleton */}
                   <th className="px-6 py-4">Loading...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 animate-pulse">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-16 w-full bg-gray-800/50 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                placeholder="Search films or genres..." 
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    {years.map(year => (
                        <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                    ))}
                </select>
                {/* Custom dropdown arrow */}
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
              {currentItems.length > 0 ? (
                  currentItems.map((poster) => (
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
                            <button className="text-gray-400 hover:text-white transition-colors" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                        </div>
                      </td>

                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <p className="text-lg font-medium">No posters found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredPosters.length > 0 && (
          <div className="bg-[#1a1a1a] border-t border-gray-800 px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{indexOfFirstItem + 1}</span> to <span className="text-white font-medium">{Math.min(indexOfLastItem, filteredPosters.length)}</span> of <span className="text-white font-medium">{filteredPosters.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 transition-colors">Previous</button>
              <div className="flex items-center gap-1">
                 <span className="text-sm text-yellow-500 font-medium px-2">Page {currentPage} of {totalPages}</span>
              </div>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PosterList;