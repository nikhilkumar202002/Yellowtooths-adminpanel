import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoster } from '../../services/AllServices';
import { 
  FiArrowLeft, FiSave, FiAlertCircle, FiPlus, FiMinus, FiCheck, FiUpload, FiImage
} from 'react-icons/fi';

const PosterCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Form Text State ---
  const [formData, setFormData] = useState({
    film_name: '',
    year: new Date().getFullYear().toString(),
    language: 'Malayalam',
    genre: '',
    imdb_rating: '',
    trailer_link: '',
    description: '',
    status: '1',    
    type: 'Movie',  
    // position_number removed from state
  });

  // --- Image Logic State ---
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Add Image
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => file.size <= 2 * 1024 * 1024);
      
      if (validFiles.length !== newFiles.length) {
         alert("Some files were skipped because they exceed 2MB.");
      }

      const newPreviews = validFiles.map(file => URL.createObjectURL(file));

      setImageFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      
      if (imageFiles.length === 0 && validFiles.length > 0) {
        setMainImageIndex(0);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 2. Remove Image
  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(previews[indexToRemove]);

    const newFiles = imageFiles.filter((_, i) => i !== indexToRemove);
    const newPreviews = previews.filter((_, i) => i !== indexToRemove);

    setImageFiles(newFiles);
    setPreviews(newPreviews);

    if (indexToRemove === mainImageIndex) {
      setMainImageIndex(0);
    } else if (indexToRemove < mainImageIndex) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  // 3. Set Featured
  const handleSetFeatured = (index: number) => {
    setMainImageIndex(index);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      
      // 1. Append Text Fields
      data.append('film_name', formData.film_name);
      data.append('year', formData.year);
      data.append('language', formData.language);
      data.append('genre', formData.genre);
      data.append('type', formData.type);
      data.append('status', formData.status);
      data.append('main_image_index', mainImageIndex.toString());

      // 2. Fix: Append Main Image File
      if (imageFiles[mainImageIndex]) {
        data.append('main_image', imageFiles[mainImageIndex]);
      }

      // 3. Optional Fields
      if (formData.description?.trim()) data.append('description', formData.description);
      if (formData.trailer_link?.trim()) data.append('trailer_link', formData.trailer_link);
      
      if (formData.imdb_rating && !isNaN(Number(formData.imdb_rating))) {
          data.append('imdb_rating', formData.imdb_rating);
      }

      // 4. Append All Images
      if (imageFiles.length === 0) {
        throw new Error("Please select at least one image.");
      }
      
      imageFiles.forEach((file) => {
        data.append('images[]', file);
      });

      await createPoster(data);
      navigate('/Allposters');
      
    } catch (err: any) {
      console.error("Upload Failed:", err);
      if (err.response && err.response.data) {
          const serverData = err.response.data;
          let displayMsg = "Validation Failed.";
          if (serverData.errors) {
              displayMsg = Object.values(serverData.errors).flat().join(', ');
          } else if (serverData.message) {
              displayMsg = serverData.message;
          }
          setError(`Server Error: ${displayMsg}`);
      } else if (err.message) {
          setError(err.message);
      } else {
          setError("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Poster</h1>
            <p className="text-sm text-gray-400">Add details and upload assets</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: Form Fields (8 cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span> 
                Basic Information
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Film Name <span className="text-red-500">*</span></label>
                    <input 
                        name="film_name" 
                        required 
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-gray-600" 
                        placeholder="Enter unique film name"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Release Year <span className="text-red-500">*</span></label>
                    <input 
                        name="year" 
                        type="number" 
                        required 
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                        defaultValue={new Date().getFullYear()}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Language <span className="text-red-500">*</span></label>
                    <input 
                        name="language" 
                        required 
                        value={formData.language} // Corrected binding
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                        placeholder="e.g. English, Malayalam"
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Genre <span className="text-red-500">*</span></label>
                    <input 
                        name="genre" 
                        required 
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                        placeholder="e.g. Sci-Fi, Thriller"
                        onChange={handleChange}
                    />
                </div>
             </div>

             <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea 
                    name="description" 
                    rows={4}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-gray-600 resize-none" 
                    placeholder="Brief synopsis of the film..."
                    onChange={handleChange}
                />
             </div>
          </div>

          {/* Section 2: Details & Status */}
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span> 
                Settings & Meta
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Content Type <span className="text-red-500">*</span></label>
                    <select 
                        name="type" 
                        required
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none cursor-pointer appearance-none"
                        onChange={handleChange}
                    >
                        <option value="Movie">Movie</option>
                        <option value="Web Series">Web Series</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">IMDb Rating (0-10)</label>
                    <input 
                        name="imdb_rating" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="10"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                        placeholder="e.g. 8.5"
                        onChange={handleChange}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Status <span className="text-red-500">*</span></label>
                    <select 
                        name="status" 
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none cursor-pointer appearance-none"
                        onChange={handleChange}
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                 </div>
                 {/* Position Number Field Removed Here */}
             </div>

             <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-gray-400">Trailer Link</label>
                <input 
                    name="trailer_link" 
                    type="url" 
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all placeholder-gray-600" 
                    placeholder="https://youtube.com/watch?v=..."
                    onChange={handleChange}
                />
             </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Image Upload Logic (4 cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FiImage /> Images <span className="text-red-500">*</span>
                </h3>
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-yellow-500 hover:text-black hover:bg-yellow-500 text-sm font-bold border border-yellow-500/30 px-3 py-1.5 rounded-lg transition-all"
                  title="Add Images"
                >
                    <FiPlus size={16} /> Add
                </button>
            </div>

            <input 
                type="file" 
                hidden 
                multiple 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAddImage}
            />

            {previews.length === 0 && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/5 transition-all group"
                >
                    <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-500/20 group-hover:text-yellow-500 transition-colors">
                        <FiUpload size={20} />
                    </div>
                    <p className="text-sm text-gray-400">Click to upload images</p>
                    <p className="text-xs text-gray-600 mt-1">Max 2MB per file</p>
                </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {previews.map((src, index) => (
                    <div 
                        key={index} 
                        className={`relative flex gap-3 p-3 rounded-xl border transition-all ${
                            mainImageIndex === index 
                            ? 'border-yellow-500 bg-yellow-500/5' 
                            : 'border-gray-800 bg-[#121212]'
                        }`}
                    >
                        <div className="h-20 w-14 flex-shrink-0 bg-black rounded overflow-hidden border border-gray-700">
                            <img src={src} alt="Upload" className="h-full w-full object-cover" />
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-mono text-gray-500 uppercase">Index: {index}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                    title="Remove Image"
                                >
                                    <FiMinus size={16} />
                                </button>
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer group select-none mt-2">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                    mainImageIndex === index 
                                    ? 'bg-yellow-500 border-yellow-500' 
                                    : 'border-gray-600 group-hover:border-gray-400 bg-transparent'
                                }`}>
                                    {mainImageIndex === index && <FiCheck size={14} className="text-black" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={mainImageIndex === index}
                                    onChange={() => handleSetFeatured(index)}
                                />
                                <span className={`text-xs font-bold uppercase tracking-wide ${mainImageIndex === index ? 'text-yellow-500' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                    {mainImageIndex === index ? 'Featured' : 'Set Featured'}
                                </span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 mt-2 border-t border-gray-800">
                <button 
                  type="submit"
                  disabled={loading || previews.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-yellow-500/40"
                >
                  {loading ? (
                      <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                      </span>
                  ) : (
                    <>
                      <FiSave size={20} /> Publish Design
                    </>
                  )}
                </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}

export default PosterCreate;