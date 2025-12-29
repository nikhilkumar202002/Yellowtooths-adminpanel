import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../../services/AllServices';
import { 
  LuArrowLeft, LuSave, LuImage, LuUpload, LuX 
} from 'react-icons/lu';
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

const EmployeeCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading State
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    status: '1',
    position_number: '',
  });

  // Image State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError("File size must be less than 2MB");
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.designation) {
        showError("Please fill in all required fields.");
        return;
    }
    if (!photoFile) {
        showError("Please upload an employee photo.");
        return;
    }

    setSubmitting(true);
    const toastId = showLoading("Creating employee...");

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('designation', formData.designation);
      data.append('status', formData.status);
      data.append('position_number', formData.position_number);
      data.append('photo', photoFile); // API expects 'photo'

      await createEmployee(data);

      dismissToast(toastId);
      showSuccess("Employee created successfully!");
      navigate('/AllEmployees'); // Redirect to list
      
    } catch (err: any) {
      console.error(err);
      dismissToast(toastId);
      const msg = err.response?.data?.message || "Failed to create employee.";
      showError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <LuArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Employee</h1>
            <p className="text-sm text-gray-400">Create a new team member profile</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Left Column: Details --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-6 border-l-4 border-yellow-500 pl-3">
                Employee Details
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Full Name <span className="text-red-500">*</span></label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Aneesh Gopal"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors" 
                    />
                </div>

                {/* Designation */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Designation <span className="text-red-500">*</span></label>
                    <input 
                        name="designation" 
                        value={formData.designation} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Director"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors" 
                    />
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Status</label>
                    <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange} 
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none cursor-pointer"
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>

                {/* Position Number */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Position / Sort Order</label>
                    <input 
                        name="position_number" 
                        type="number"
                        value={formData.position_number} 
                        onChange={handleChange} 
                        placeholder="e.g. 1"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-colors" 
                    />
                </div>
             </div>
          </div>
        </div>

        {/* --- Right Column: Photo Upload --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LuImage /> Profile Photo
            </h3>
            
            <input 
                type="file" 
                hidden 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
            />

            <div className="space-y-4">
                {photoPreview ? (
                    // Preview State
                    <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-yellow-500/50 group">
                        <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm"
                                title="Change Photo"
                             >
                                <LuUpload size={20} />
                             </button>
                             <button 
                                type="button"
                                onClick={handleRemovePhoto}
                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm"
                                title="Remove Photo"
                             >
                                <LuX size={20} />
                             </button>
                        </div>
                    </div>
                ) : (
                    // Upload State
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-700 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-500 gap-3"
                    >
                        <div className="p-4 bg-[#121212] rounded-full border border-gray-800 text-yellow-500">
                            <LuUpload size={24} />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-300">Click to upload</p>
                            <p className="text-xs text-gray-600 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 mt-6 border-t border-gray-800">
                <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>
                            <LuLoader2 className="animate-spin" size={20} /> Creating...
                        </>
                    ) : (
                        <>
                            <LuSave size={20} /> Save Employee
                        </>
                    )}
                </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
};

export default EmployeeCreate;