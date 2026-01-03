import React, { useState } from 'react';
import { createUser } from '../../services/authService';
import { LuX, LuLoader, LuSave, LuUser, LuPhone, LuMapPin, LuGlobe } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast';

interface UserCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UserCreate = ({ isOpen, onClose, onSuccess }: UserCreateProps) => {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // Default to user
    country_code: '+91',
    phone_number: '',
    country: 'India',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone_number) {
        showError("Please fill in all required fields.");
        return;
    }

    setSubmitting(true);
    const toastId = showLoading("Creating user...");

    try {
      await createUser(formData);

      dismissToast(toastId);
      showSuccess("User created successfully!");
      
      // Reset & Close
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        country_code: '+91',
        phone_number: '',
        country: 'India',
      });
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error(err);
      dismissToast(toastId);
      showError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#121212]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LuUser className="text-yellow-500" /> Create New User
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
            <form id="create-user-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section: Account Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">Account Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Full Name <span className="text-red-500">*</span></label>
                        <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email Address <span className="text-red-500">*</span></label>
                        <input 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. john@example.com"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Password <span className="text-red-500">*</span></label>
                        <input 
                        name="password"
                        type="password" 
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Role</label>
                        <select 
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none cursor-pointer"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section: Contact & Location */}
            <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">Contact Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number Group */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-400">Phone Number <span className="text-red-500">*</span></label>
                        <div className="flex gap-3">
                            <div className="w-24">
                                <input 
                                    name="country_code"
                                    value={formData.country_code}
                                    onChange={handleChange}
                                    placeholder="+91"
                                    className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none text-center"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <LuPhone size={16} />
                                </div>
                                <input 
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Country</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <LuGlobe size={16} />
                            </div>
                            <input 
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="India"
                                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-yellow-500 outline-none"
                            />
                        </div>
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
                form="create-user-form"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {submitting ? <LuLoader className="animate-spin" /> : <LuSave />} 
                Create User
            </button>
        </div>

      </div>
    </div>
  );
}

export default UserCreate;