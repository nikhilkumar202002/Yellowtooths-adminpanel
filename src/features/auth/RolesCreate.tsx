import React, { useState } from 'react';
import { createRole } from '../../services/authService';
import { LuX, LuLoader, LuSave, LuShield, LuFileText, LuCheck } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

interface RolesCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RolesCreate = ({ isOpen, onClose, onSuccess }: RolesCreateProps) => {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: true, // Default to Active
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === 'status' 
      ? e.target.value === 'true' 
      : e.target.value;

    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
        showError("Role Name is required.");
        return;
    }

    setSubmitting(true);
    const toastId = showLoading("Creating role...");

    try {
      await createRole(formData);

      dismissToast(toastId);
      showSuccess("Role created successfully!");
      
      // Reset & Close
      setFormData({
        name: '',
        description: '',
        status: true,
      });
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error(err);
      dismissToast(toastId);
      showError(err.response?.data?.message || "Failed to create role.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#121212]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LuShield className="text-yellow-500" /> Create New Role
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
            <form id="create-role-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
                
                {/* Role Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Role Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <LuShield size={16} />
                        </div>
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Manager"
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-yellow-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Description</label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 text-gray-500 pointer-events-none">
                            <LuFileText size={16} />
                        </div>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Briefly describe the responsibilities..."
                            rows={3}
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-yellow-500 outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Status</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                             {formData.status ? <LuCheck size={16} className="text-green-500"/> : <LuCheck size={16} className="text-red-500"/>}
                        </div>
                        <select 
                            name="status"
                            value={formData.status.toString()}
                            onChange={handleChange}
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-yellow-500 outline-none cursor-pointer appearance-none"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

            </div>
            </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-800 bg-[#121212] flex gap-3">
            <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                form="create-role-form"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {submitting ? <LuLoader className="animate-spin" /> : <LuSave />} 
                Create Role
            </button>
        </div>

      </div>
    </div>
  );
}

export default RolesCreate;