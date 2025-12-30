import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'; // Changed useLocation to useSearchParams
import { getPosterById, updatePoster, deleteBulkPosterImages, type FilmPoster } from '../../services/AllServices';
import { 
  FiArrowLeft, FiSave, FiPlus, FiMinus, FiCheck, FiImage, FiLoader, FiTrash2 
} from 'react-icons/fi';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

const PosterEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. Get the returnPage from the URL query params
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    film_name: '',
    year: '',
    language: '',
    genre: '',
    imdb_rating: '',
    trailer_link: '',
    description: '',
    status: '1',
    type: 'Movie',
  });

  // Image Logic State
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [activeMainImage, setActiveMainImage] = useState<{ type: 'existing' | 'new', idOrIndex: number } | null>(null);

  useEffect(() => {
    if (id) fetchInitialData(id);
  }, [id]);

  const fetchInitialData = async (posterId: string) => {
    try {
      const data: FilmPoster = await getPosterById(posterId);
      setFormData({
        film_name: data.film_name || '',
        year: data.year || '',
        language: data.language || '',
        genre: data.genre || '',
        imdb_rating: data.imdb_rating || '',
        trailer_link: data.trailer_link || '',
        description: data.description || '',
        status: data.status || '1',
        type: (data as any).type || 'Movie',
      });

      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
        const mainImgMatch = data.images.find(img => img.file_path === data.main_image);
        if (mainImgMatch) {
            setActiveMainImage({ type: 'existing', idOrIndex: mainImgMatch.id });
        }
      }
      setFetching(false);
    } catch (err) {
      console.error(err);
      showError("Failed to load poster details.");
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024); 
      const previews = validFiles.map(file => URL.createObjectURL(file));

      setNewFiles(prev => [...prev, ...validFiles]);
      setNewPreviews(prev => [...prev, ...previews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetFeatured = (type: 'existing' | 'new', idOrIndex: number) => {
    if (activeMainImage?.type === type && activeMainImage.idOrIndex === idOrIndex) {
       // optional toggle off logic
    } else {
        setActiveMainImage({ type, idOrIndex });
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent, type: 'existing' | 'new', idOrIndex: number) => {
    e.stopPropagation();

    if (type === 'new') {
        URL.revokeObjectURL(newPreviews[idOrIndex]);
        setNewFiles(prev => prev.filter((_, i) => i !== idOrIndex));
        setNewPreviews(prev => prev.filter((_, i) => i !== idOrIndex));
        
        if (activeMainImage?.type === 'new' && activeMainImage.idOrIndex === idOrIndex) {
            setActiveMainImage(null);
        } else if (activeMainImage?.type === 'new' && activeMainImage.idOrIndex > idOrIndex) {
            setActiveMainImage({ ...activeMainImage, idOrIndex: activeMainImage.idOrIndex - 1 });
        }
    } 
    else {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        const toastId = showLoading("Deleting image...");
        try {
            await deleteBulkPosterImages([idOrIndex]); 
            setExistingImages(prev => prev.filter(img => img.id !== idOrIndex));

            if (activeMainImage?.type === 'existing' && activeMainImage.idOrIndex === idOrIndex) {
                setActiveMainImage(null);
            }
            dismissToast(toastId);
            showSuccess("Image deleted successfully");
        } catch (err) {
            console.error(err);
            dismissToast(toastId);
            showError("Failed to delete image.");
        }
    }
  };

  const allMediaItems = useMemo(() => {
    const newItems = newPreviews.map((src, index) => ({
        type: 'new' as const,
        idOrIndex: index,
        src: src,
        isFeatured: activeMainImage?.type === 'new' && activeMainImage.idOrIndex === index
    }));

    const existingItems = existingImages.map((img) => ({
        type: 'existing' as const,
        idOrIndex: img.id,
        src: img.file_path,
        isFeatured: activeMainImage?.type === 'existing' && activeMainImage.idOrIndex === img.id
    }));

    return [...newItems, ...existingItems];
  }, [newPreviews, existingImages, activeMainImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    const toastId = showLoading("Updating poster...");

    try {
      const data = new FormData();

      Object.keys(formData).forEach(key => {
        const val = formData[key as keyof typeof formData];
        if (val !== null && val !== undefined) data.append(key, val);
      });

      newFiles.forEach((file) => {
        data.append('images[]', file);
      });

      if (activeMainImage) {
          if (activeMainImage.type === 'existing') {
              const index = existingImages.findIndex(img => img.id === activeMainImage.idOrIndex);
              if (index !== -1) {
                data.append('main_image_index', index.toString());
              }
          } 
          else if (activeMainImage.type === 'new') {
              data.append('main_image_index', activeMainImage.idOrIndex.toString());
              if (newFiles[activeMainImage.idOrIndex]) {
                  data.append('main_image', newFiles[activeMainImage.idOrIndex]);
              }
          }
      }

      await updatePoster(id, data);
      dismissToast(toastId);
      showSuccess("Poster updated successfully!");
      
      // 2. Redirect back to the correct page using the captured returnPage
      navigate(`/Allposters?page=${returnPage}`);

    } catch (err: any) {
      console.error(err);
      dismissToast(toastId);
      let msg = err.response?.data?.message || "Failed to update.";
      if (err.response?.data?.errors) {
         msg = Object.values(err.response.data.errors).flat().join(', ');
      }
      showError(msg);
      setSubmitting(false);
    }
  };

  // 3. Helper for Back Button
  const handleBack = () => {
    navigate(`/Allposters?page=${returnPage}`);
  };

  if (fetching) return <div className="flex justify-center items-center h-96 text-yellow-500 animate-pulse">Loading Data...</div>;

  return (
    <div className="w-full mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={handleBack} 
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Poster</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-6 border-l-4 border-yellow-500 pl-3">Basic Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Film Name</label>
                    <input name="film_name" value={formData.film_name} onChange={handleChange} required className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Year</label>
                    <input name="year" type="number" value={formData.year} onChange={handleChange} required className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Language</label>
                    <input name="language" value={formData.language} onChange={handleChange} required className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Genre</label>
                    <input name="genre" value={formData.genre} onChange={handleChange} required className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
                </div>
             </div>
             <div className="mt-6 space-y-2">
                <label className="text-sm text-gray-400">Description</label>
                <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none resize-none" />
             </div>
          </div>

          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-6 border-l-4 border-yellow-500 pl-3">Settings</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white outline-none">
                        <option value="Movie">Movie</option>
                        <option value="Web Series">Web Series</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white outline-none">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">IMDb Rating</label>
                    <input name="imdb_rating" value={formData.imdb_rating} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white outline-none" />
                 </div>
             </div>
             <div className="mt-6 space-y-2">
                <label className="text-sm text-gray-400">Trailer Link</label>
                <input name="trailer_link" value={formData.trailer_link} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white outline-none" />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Images */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 sticky top-6">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><FiImage /> Gallery</h3>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-yellow-500 hover:bg-yellow-500/10 px-4 py-2 rounded-lg text-sm font-bold border border-yellow-500/30 flex items-center gap-2 transition-colors">
                    <FiPlus /> Upload
                </button>
            </div>
            <input type="file" hidden multiple accept="image/*" ref={fileInputRef} onChange={handleAddImage} />

            {/* Images Grid */}
            <div className="columns-2 gap-4 space-y-4">
                {allMediaItems.length > 0 ? (
                    allMediaItems.map((item) => (
                        <div 
                            key={`${item.type}-${item.idOrIndex}`}
                            onClick={() => handleSetFeatured(item.type, item.idOrIndex)}
                            className={`
                                relative break-inside-avoid mb-4 rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                border-2 group
                                ${item.isFeatured 
                                    ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-[1.02]' 
                                    : 'border-transparent hover:border-gray-600'
                                }
                            `}
                        >
                            <img 
                                src={item.src} 
                                alt="Poster" 
                                className={`w-full h-auto block bg-gray-900 ${!item.isFeatured ? 'opacity-80 group-hover:opacity-100' : ''}`} 
                            />

                            <button 
                                type="button" 
                                onClick={(e) => handleDeleteImage(e, item.type, item.idOrIndex)}
                                className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white hover:bg-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm"
                                title="Delete Image"
                            >
                                <FiTrash2 size={12} />
                            </button>

                            <div className={`
                                absolute bottom-0 left-0 right-0 p-3 
                                flex items-center justify-between
                                bg-gradient-to-t from-black/90 via-black/60 to-transparent
                            `}>
                                <div className="flex items-center gap-2">
                                    <div className={`
                                        w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm
                                        ${item.isFeatured 
                                            ? 'bg-yellow-500 border-yellow-500' 
                                            : 'bg-black/40 border-gray-400 group-hover:border-white'
                                        }
                                    `}>
                                        {item.isFeatured && <FiCheck size={14} className="text-black stroke-[3]" />}
                                    </div>
                                    <span className={`text-xs font-bold drop-shadow-md ${item.isFeatured ? 'text-yellow-500' : 'text-gray-300'}`}>
                                        {item.isFeatured ? 'Featured' : 'Set Main'}
                                    </span>
                                </div>
                            </div>
                            
                            {item.type === 'new' && (
                                <div className="absolute top-2 left-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none">
                                    NEW
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-10 border-2 border-dashed border-gray-800 rounded-xl text-gray-600">
                        <p className="text-sm">No images available</p>
                    </div>
                )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-800">
                <button type="submit" disabled={submitting} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex justify-center items-center gap-2">
                    {submitting ? <FiLoader className="animate-spin" /> : <FiSave />} Update Poster
                </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default PosterEdit;