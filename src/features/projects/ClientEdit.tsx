import React, { useState, useEffect, useRef } from 'react';
import { getClientById, updateClient } from '../../services/AllServices';
import { LuX, LuUpload, LuLoader, LuSave } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

interface ClientEditProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id: number | null;
}

const ClientEdit = ({ isOpen, onClose, onSuccess, id }: ClientEditProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [status, setStatus] = useState('1');
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);

  // --- Fetch Data on Open ---
  useEffect(() => {
    if (isOpen && id) {
      fetchData(id);
    } else {
        // Reset form
        setName('');
        setStatus('1');
        setCurrentLogo(null);
        setNewLogoFile(null);
        setNewLogoPreview(null);
    }
  }, [isOpen, id]);

  const fetchData = async (clientId: number) => {
    setLoadingData(true);
    try {
        const data = await getClientById(clientId);
        setName(data.name);
        setStatus(data.status);
        setCurrentLogo(data.logo_path);
    } catch (err) {
        console.error(err);
        showError("Failed to fetch client data");
        onClose();
    } finally {
        setLoadingData(false);
    }
  };

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        showError("File size must be less than 2MB");
        return;
      }
      setNewLogoFile(file);
      setNewLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name) {
        showError("Client name is required.");
        return;
    }

    setSubmitting(true);
    const toastId = showLoading("Updating client...");

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      
      // Only append logo if a new one was selected
      if (newLogoFile) {
        formData.append('logo', newLogoFile); 
      }

      await updateClient(id, formData); // Calls the service which adds _method: PUT

      dismissToast(toastId);
      showSuccess("Client updated successfully!");
      
      onSuccess(); // Refresh list
      onClose();   // Close modal

    } catch (err: any) {
      console.error(err);
      dismissToast(toastId);
      showError(err.response?.data?.message || "Failed to update client.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Edit Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <LuX size={24} />
          </button>
        </div>

        {loadingData ? (
             <div className="p-12 flex justify-center text-yellow-500"><LuLoader className="animate-spin" size={32}/></div>
        ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Name Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Client Name <span className="text-red-500">*</span></label>
                <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                <label className="text-sm font-medium text-gray-400">Client Logo <span className="text-xs text-gray-600">(Leave empty to keep current)</span></label>
                <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                <div className="flex items-center gap-4">
                    {/* Preview Box */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 w-24 rounded-xl border border-gray-700 bg-black flex items-center justify-center cursor-pointer hover:border-yellow-500 overflow-hidden relative group"
                    >
                        <img 
                            src={newLogoPreview || currentLogo || ''} 
                            alt="Preview" 
                            className="h-full w-full object-contain p-1" 
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <LuUpload className="text-white" size={20} />
                        </div>
                    </div>

                    {/* Text / Button */}
                    <div className="flex-1">
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm bg-[#1a1a1a] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                        >
                            Change Logo
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Max 2MB. Supported: JPG, PNG, SVG</p>
                    </div>
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
                Save Changes
                </button>
            </div>

            </form>
        )}
      </div>
    </div>
  );
}

export default ClientEdit;