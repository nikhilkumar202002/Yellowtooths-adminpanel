import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Removed deletePosterImage to prevent accidental usage
import { getPosterById, updatePoster, FilmPoster } from '../../services/AllServices';
import { 
  FiArrowLeft, FiSave, FiPlus, FiMinus, FiCheck, FiImage, FiLoader, FiUpload 
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
  // stores { type: 'existing' | 'new', idOrIndex: number } to track selection
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
        
        // Auto-detect current main image to check the box
        // We compare file paths to see which one is currently active
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
      // Optional: 2MB Limit Check
      const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024);
      const previews = validFiles.map(file => URL.createObjectURL(file));

      setNewFiles(prev => [...prev, ...validFiles]);
      setNewPreviews(prev => [...prev, ...previews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveNewImage = (index: number) => {
    // We allow removing NEW (unsaved) images
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Clear selection if we removed the active new image
    if (activeMainImage?.type === 'new' && activeMainImage.idOrIndex === index) {
        setActiveMainImage(null);
    } 
    else if (activeMainImage?.type === 'new' && activeMainImage.idOrIndex > index) {
        // Shift index if we deleted an image above it
        setActiveMainImage({ ...activeMainImage, idOrIndex: activeMainImage.idOrIndex - 1 });
    }
  };

  // --- Unified "Set Featured" Handler ---
  const handleSetFeatured = (type: 'existing' | 'new', idOrIndex: number) => {
    // Toggle off if clicking the same one, otherwise set new
    if (activeMainImage?.type === type && activeMainImage.idOrIndex === idOrIndex) {
        setActiveMainImage(null); 
    } else {
        setActiveMainImage({ type, idOrIndex });
    }
  };

  // --- Submit Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSubmitting(true);
    const toastId = showLoading("Updating poster...");

    try {
      const data = new FormData();

      // 1. Text Fields
      Object.keys(formData).forEach(key => {
        const val = formData[key as keyof typeof formData];
        if (val !== null && val !== undefined) data.append(key, val);
      });

      // 2. New Images
      newFiles.forEach((file) => {
        data.append('images[]', file);
      });

      // 3. Featured Image Logic
      if (activeMainImage) {
          if (activeMainImage.type === 'existing') {
              // Tell backend: "Use this EXISTING image ID as main"
              data.append('active_main_image_id', activeMainImage.idOrIndex.toString());
          } 
          else if (activeMainImage.type === 'new') {
              // Tell backend: "Use the NEW file at this index as main"
              data.append('main_image_index', activeMainImage.idOrIndex.toString());
              
              // Explicitly attach the main file if backend needs 'main_image' key specifically
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      
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
        
        {/* LEFT COLUMN: All Text Fields (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Basic Info */}
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

          {/* Card 2: Settings & Meta (Restored) */}
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

        {/* RIGHT COLUMN: Images (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 sticky top-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><FiImage /> Media</h3>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-yellow-500 hover:bg-yellow-500/10 px-3 py-1.5 rounded-lg text-sm font-bold border border-yellow-500/30 flex items-center gap-2">
                    <FiPlus /> Add New
                </button>
            </div>
            <input type="file" hidden multiple accept="image/*" ref={fileInputRef} onChange={handleAddImage} />

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* 1. NEW UPLOADS */}
                {newPreviews.map((src, index) => {
                    const isFeatured = activeMainImage?.type === 'new' && activeMainImage.idOrIndex === index;
                    return (
                        <div key={`new-${index}`} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${isFeatured ? 'border-yellow-500 bg-yellow-500/5' : 'border-gray-800 bg-[#121212]'}`}>
                            <img src={src} alt="New" className="h-16 w-12 object-cover rounded bg-black" />
                            <div className="flex-1">
                                <p className="text-xs text-green-400 mb-1 font-bold">New Upload</p>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFeatured ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600'}`}>
                                        {isFeatured && <FiCheck size={14} className="text-black" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isFeatured} onChange={() => handleSetFeatured('new', index)} />
                                    <span className={`text-sm font-medium ${isFeatured ? 'text-yellow-500' : 'text-gray-300'}`}>
                                        {isFeatured ? 'Featured Image' : 'Set as Featured'}
                                    </span>
                                </label>
                            </div>
                            <button type="button" onClick={() => handleRemoveNewImage(index)} className="p-2 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg">
                                <FiMinus size={18} />
                            </button>
                        </div>
                    );
                })}

                {/* 2. EXISTING IMAGES (No Delete Option) */}
                {existingImages.length > 0 && (
                    <div className="pt-4 border-t border-gray-800">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-3">Saved Images</p>
                        {existingImages.map((img) => {
                             const isFeatured = activeMainImage?.type === 'existing' && activeMainImage.idOrIndex === img.id;
                             return (
                                <div key={img.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${isFeatured ? 'border-yellow-500 bg-yellow-500/5' : 'border-gray-800 bg-[#121212]'}`}>
                                    <img src={img.file_path} alt="Existing" className="h-16 w-12 object-cover rounded bg-black" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">ID: {img.id}</p>
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFeatured ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600'}`}>
                                                {isFeatured && <FiCheck size={14} className="text-black" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={isFeatured} onChange={() => handleSetFeatured('existing', img.id)} />
                                            <span className={`text-sm font-medium ${isFeatured ? 'text-yellow-500' : 'text-gray-300'}`}>
                                                {isFeatured ? 'Featured Image' : 'Set as Featured'}
                                            </span>
                                        </label>
                                    </div>
                                    {/* DELETE BUTTON REMOVED to prevent accidents */}
                                </div>
                             );
                        })}
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