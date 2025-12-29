import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPosterById, updatePoster, FilmPoster } from '../../services/AllServices';
import { 
  FiArrowLeft, FiSave, FiPlus, FiMinus, FiCheck, FiImage, FiLoader 
} from 'react-icons/fi';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

const PosterEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading States
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
    position_number: '',
    type: 'Movie',
  });

  // --- Image Logic ---
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  
  // Unified State for Main Image Selection
  const [activeMainImage, setActiveMainImage] = useState<{ type: 'existing' | 'new', idOrIndex: number } | null>(null);

  // Fetch Data
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
        position_number: (data as any).position_number || '', 
        type: (data as any).type || 'Movie',
      });

      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
        
        // Auto-detect current main image
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

  // --- New Image Handlers ---
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024); // 2MB Limit
      const previews = validFiles.map(file => URL.createObjectURL(file));

      setNewFiles(prev => [...prev, ...validFiles]);
      setNewPreviews(prev => [...prev, ...previews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveNewImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
    
    if (activeMainImage?.type === 'new' && activeMainImage.idOrIndex === index) {
        setActiveMainImage(null);
    } 
    else if (activeMainImage?.type === 'new' && activeMainImage.idOrIndex > index) {
        setActiveMainImage({ ...activeMainImage, idOrIndex: activeMainImage.idOrIndex - 1 });
    }
  };

  const handleSetFeatured = (type: 'existing' | 'new', idOrIndex: number) => {
    if (activeMainImage?.type === type && activeMainImage.idOrIndex === idOrIndex) {
        // Optional: Toggle off
    } else {
        setActiveMainImage({ type, idOrIndex });
    }
  };

  // --- Combine Images for Masonry Display ---
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

    // Combine them (New first, or however you prefer)
    return [...newItems, ...existingItems];
  }, [newPreviews, existingImages, activeMainImage]);


  // --- Submit Logic ---
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
              // Find the INDEX of this image in the existingImages array
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
      navigate('/Allposters');

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

  if (fetching) return <div className="flex justify-center items-center h-96 text-yellow-500 animate-pulse">Loading Data...</div>;

  return (
    <div className="w-full mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Poster</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Fields (8 Cols) */}
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
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">Position</label>
                    <input name="position_number" type="number" value={formData.position_number} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white outline-none" />
                 </div>
             </div>
             <div className="mt-6 space-y-2">
                <label className="text-sm text-gray-400">Trailer Link</label>
                <input name="trailer_link" value={formData.trailer_link} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white outline-none" />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Images (Masonry Layout) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 sticky top-6">
            
            {/* Header / Add Button */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><FiImage /> Gallery</h3>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-yellow-500 hover:bg-yellow-500/10 px-4 py-2 rounded-lg text-sm font-bold border border-yellow-500/30 flex items-center gap-2 transition-colors">
                    <FiPlus /> Upload
                </button>
            </div>
            <input type="file" hidden multiple accept="image/*" ref={fileInputRef} onChange={handleAddImage} />

            {/* --- MASONRY LAYOUT CONTAINER --- */}
            <div className="columns-2 gap-4 space-y-4">
                {allMediaItems.length > 0 ? (
                    allMediaItems.map((item, index) => (
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
                            {/* Image with Variable Height */}
                            <img 
                                src={item.src} 
                                alt="Poster" 
                                className={`w-full h-auto block bg-gray-900 ${!item.isFeatured ? 'opacity-80 group-hover:opacity-100' : ''}`} 
                            />

                            {/* Overlay Controls (Checkbox) */}
                            <div className={`
                                absolute bottom-0 left-0 right-0 p-3 
                                flex items-center justify-between
                                bg-gradient-to-t from-black/90 via-black/60 to-transparent
                            `}>
                                {/* Checkbox Logic */}
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

                                {/* Remove Button (Only for NEW images) */}
                                {item.type === 'new' && (
                                    <button 
                                        type="button" 
                                        onClick={(e) => handleRemoveNewImage(e, item.idOrIndex)} 
                                        className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors backdrop-blur-sm"
                                        title="Remove upload"
                                    >
                                        <FiMinus size={14} />
                                    </button>
                                )}
                            </div>
                            
                            {/* Badge for New Items */}
                            {item.type === 'new' && (
                                <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
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