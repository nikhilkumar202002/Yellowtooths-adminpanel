// Removed unused 'React' import
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Added 'type' keyword for FilmPoster interface
import { getPosterById, type FilmPoster } from '../../services/AllServices';
import { 
  FiArrowLeft, FiCalendar, FiGlobe, FiStar, FiPlay, 
  FiCheckCircle, FiXCircle, FiMaximize2, FiX 
} from 'react-icons/fi';

const PosterSingle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [poster, setPoster] = useState<FilmPoster | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // State for Active Image and Lightbox
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchPosterDetails(id);
    }
  }, [id]);

  const fetchPosterDetails = async (posterId: string) => {
    try {
      const data = await getPosterById(posterId);
      setPoster(data);
      setActiveImage(data.main_image);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch poster details:", err);
      setError('Failed to load film details.');
      setLoading(false);
    }
  };

  // Handler to open image in Lightbox
  const openLightbox = (imageSrc: string) => {
    setActiveImage(imageSrc);
    setIsLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-yellow-500 animate-pulse">
        Loading Details...
      </div>
    );
  }

  if (error || !poster) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft /> Back
        </button>
        <div className="text-red-500 p-4 bg-red-500/10 rounded border border-red-500/20">
          {error || 'Poster not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors"
        >
          <FiArrowLeft /> Back to List
        </button>

        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            {poster.status === "1" ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <FiCheckCircle size={12} /> Active
                </span>
            ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    <FiXCircle size={12} /> Inactive
                </span>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Main Poster Image */}
        <div className="lg:col-span-1">
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#0b0b0b] shadow-[0_0_30px_rgba(0,0,0,0.5)] group relative">
            <img 
              src={poster.main_image} 
              alt={poster.film_name} 
              className="w-full h-auto object-cover"
            />
            {/* View Button Overlay */}
            <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => openLightbox(poster.main_image)}
            >
                <button className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 hover:bg-yellow-500 hover:text-black transition-colors">
                    <FiMaximize2 /> View Fullscreen
                </button>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{poster.film_name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
               <div className="flex items-center gap-1.5">
                 <FiCalendar className="text-yellow-500" />
                 <span>{poster.year}</span>
               </div>
               <div className="h-4 w-[1px] bg-gray-700"></div>
               <div className="flex items-center gap-1.5">
                 <FiGlobe className="text-yellow-500" />
                 <span>{poster.language}</span>
               </div>
               <div className="h-4 w-[1px] bg-gray-700"></div>
               <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                 {poster.genre}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                <FiStar className="text-yellow-500 fill-yellow-500" size={20} />
                <div>
                    <span className="block text-lg font-bold text-white leading-none">{poster.imdb_rating}</span>
                    <span className="text-[10px] uppercase text-yellow-500/70 font-bold">IMDb Rating</span>
                </div>
             </div>
             
             {poster.trailer_link && (
                <a 
                  href={poster.trailer_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
                >
                  <FiPlay fill="currentColor" /> Watch Trailer
                </a>
             )}
          </div>

          <div className="bg-[#121212] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
            <p className="text-gray-400 leading-relaxed">
              {poster.description}
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section - Masonry Grid */}
      <div className="pt-8 border-t border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-6">Poster Gallery</h3>
        
        {poster.images && poster.images.length > 0 ? (
          /* Masonry Layout using Columns */
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
            
            {/* Include Main Image in Gallery */}
            <div className="break-inside-avoid mb-4">
                 <div 
                    onClick={() => openLightbox(poster.main_image)}
                    className="group relative rounded-lg overflow-hidden border border-gray-800 bg-[#0b0b0b] cursor-zoom-in"
                 >
                    <img 
                        src={poster.main_image} 
                        alt="Main Poster" 
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiMaximize2 className="text-white text-2xl" />
                    </div>
                 </div>
            </div>

            {/* Map extra images */}
            {poster.images.map((img) => (
              <div key={img.id} className="break-inside-avoid mb-4">
                <div 
                    onClick={() => openLightbox(img.file_path)}
                    className="group relative rounded-lg overflow-hidden border border-gray-800 bg-[#0b0b0b] cursor-zoom-in"
                >
                    <img 
                      src={img.file_path} 
                      alt={`Poster ${img.position}`} 
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center">
                            <FiMaximize2 className="text-white text-2xl mx-auto mb-1" />
                            <span className="text-white text-xs font-bold bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
                                Pos: {img.position}
                            </span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No additional images available.</p>
        )}
      </div>

      {/* Lightbox / Modal */}
      {isLightboxOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setIsLightboxOpen(false)} // Close on background click
        >
            {/* Close Button */}
            <button 
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full hover:bg-red-500/50 transition-all z-50"
            >
                <FiX size={32} />
            </button>

            {/* Image Container */}
            <div 
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            >
                <img 
                    src={activeImage} 
                    alt="Full View" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                />
            </div>
        </div>
      )}

    </div>
  );
};

export default PosterSingle;