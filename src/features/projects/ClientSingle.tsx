import React, { useEffect, useState } from 'react';
import { getClientById, type Client } from '../../services/AllServices';
import { LuX, LuLoader, LuCalendar, LuCheck } from "react-icons/lu";

interface ClientSingleProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null;
}

const ClientSingle = ({ isOpen, onClose, id }: ClientSingleProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && id) {
      fetchClientDetails(id);
    } else {
      setClient(null);
      setError('');
    }
  }, [isOpen, id]);

  const fetchClientDetails = async (clientId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await getClientById(clientId);
      setClient(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load client details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#121212]">
          <h2 className="text-xl font-bold text-white">Client Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <LuX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-yellow-500">
               <LuLoader className="animate-spin" size={32} />
               <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
            </div>
          ) : client ? (
            <div className="space-y-8 text-center">
              
              {/* Logo Section */}
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-2xl overflow-hidden bg-black border-2 border-gray-800 p-2 mx-auto shadow-lg shadow-yellow-500/10">
                   {client.logo_path ? (
                     <img src={client.logo_path} alt={client.name} className="h-full w-full object-contain" />
                   ) : (
                     <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-gray-600">
                        {client.name.substring(0, 2).toUpperCase()}
                     </div>
                   )}
                </div>
                <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-[#0b0b0b] ${client.status === "1" ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>

              {/* Info Section */}
              <div className="space-y-2">
                 <h3 className="text-2xl font-bold text-white tracking-tight">{client.name}</h3>
                 <div className="flex items-center justify-center gap-2">
                    {client.status === "1" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <LuCheck size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <LuX size={12} /> Inactive
                      </span>
                    )}
                 </div>
              </div>

              {/* Meta Data */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                 <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-1">
                        <LuCalendar size={12} /> Created
                    </div>
                    <div className="text-sm font-medium text-gray-300">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                 </div>
                 <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-1">
                        <LuCalendar size={12} /> Updated
                    </div>
                    <div className="text-sm font-medium text-gray-300">
                        {client.updated_at ? new Date(client.updated_at).toLocaleDateString() : 'N/A'}
                    </div>
                 </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}

export default ClientSingle;