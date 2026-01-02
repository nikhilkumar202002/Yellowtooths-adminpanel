import React, { useState, useRef } from 'react';
import { createClient } from '../../services/AllServices';
import { LuX, LuUpload, LuLoader, LuSave, LuImage } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

interface ClientCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ClientCreate = ({ isOpen, onClose, onSuccess }: ClientCreateProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [status, setStatus] = useState('1');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        showError("File size must be less than 2MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logoFile) {
        showError("Please provide a client name and logo.");
        return;
    }

    setSubmitting(true);
    const toastId = showLoading("Creating client...");

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      formData.append('logo', logoFile); // Ensure this key matches your backend ('logo' or 'client_logo')

      await createClient(formData);

      dismissToast(toastId);
      showSuccess("Client created successfully!");
      
      // Reset & Close
      setName('');
      setLogoFile(null);
      setLogoPreview(null);
      onSuccess(); // Refresh parent list
      onClose();   // Close modal

    } catch (err: any) {
      console.error(err);
      dismissToast(toastId);
      showError(err.response?.data?.message || "Failed to create client.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      {/* Modal Container */}
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Add New Client</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Client Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-all"
            />
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none cursor-pointer"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Client Logo <span className="text-red-500">*</span></label>
            <input 
                type="file" 
                hidden 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
            />
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all"
            >
                {logoPreview ? (
                    <div className="relative w-full h-32 flex items-center justify-center">
                        <img src={logoPreview} alt="Preview" className="h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <LuUpload className="text-white" size={24} />
                        </div>
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <div className="bg-[#1a1a1a] p-3 rounded-full inline-flex text-yellow-500 mb-2">
                            <LuImage size={24} />
                        </div>
                        <p className="text-sm text-gray-400">Click to upload logo</p>
                        <p className="text-xs text-gray-600 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                    </div>
                )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? <LuLoader className="animate-spin" /> : <LuSave />} 
              Create Client
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ClientCreate;