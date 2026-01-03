import { useEffect, useState } from 'react';
import { getUserById } from '../../services/authService';
import { LuX, LuLoader, LuCalendar, LuMail, LuUser, LuPhone, LuGlobe, LuShield } from "react-icons/lu";

interface UserSingleProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null;
}

const UserSingle = ({ isOpen, onClose, id }: UserSingleProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && id) {
      fetchDetails(id);
    } else {
      setUser(null);
      setError('');
    }
  }, [isOpen, id]);

  const fetchDetails = async (userId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserById(userId);
      // *** FIX: Extract the nested 'user' object from the response ***
      if (response && response.user) {
        setUser(response.user);
      } else {
        // Fallback in case structure varies
        setUser(response);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load user details.");
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
          <h2 className="text-xl font-bold text-white">User Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <LuX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-yellow-500">
               <LuLoader className="animate-spin" size={32} />
               <span className="text-sm font-medium">Loading details...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
            </div>
          ) : user ? (
            <div className="space-y-8 text-center">
              
              {/* Avatar & Role */}
              <div className="relative inline-block">
                <div className="h-28 w-28 rounded-full bg-[#1a1a1a] border-2 border-yellow-500 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <span className="text-4xl font-bold text-white">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : <LuUser />}
                    </span>
                </div>
                {/* Role Badge */}
                <div className={`
                    absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-bold border shadow-lg flex items-center gap-1
                    ${user.role === 'admin' 
                        ? 'bg-purple-600 text-white border-purple-400' 
                        : 'bg-gray-700 text-gray-200 border-gray-600'
                    }
                `}>
                    {user.role === 'admin' ? <LuShield size={10} /> : <LuUser size={10} />}
                    {user.role ? user.role.toUpperCase() : 'USER'}
                </div>
              </div>

              {/* Name & Basic Info */}
              <div className="space-y-1">
                 <h3 className="text-2xl font-bold text-white tracking-tight">{user.name}</h3>
              
              </div>

              {/* Detailed Info Grid */}
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 divide-y divide-gray-800">
                 
                 {/* Email */}
                 <div className="flex items-center p-4 hover:bg-white/5 transition-colors">
                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg mr-4">
                        <LuMail size={20} />
                    </div>
                    <div className="text-left overflow-hidden">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Email Address</div>
                        <div className="text-sm text-gray-200 truncate">{user.email || 'N/A'}</div>
                    </div>
                 </div>

                 {/* Phone */}
                 <div className="flex items-center p-4 hover:bg-white/5 transition-colors">
                    <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg mr-4">
                        <LuPhone size={20} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</div>
                        <div className="text-sm text-gray-200">
                            {user.phone_number 
                                ? `${user.country_code || ''} ${user.phone_number}`
                                : 'N/A'
                            }
                        </div>
                    </div>
                 </div>

                 {/* Country */}
                 <div className="flex items-center p-4 hover:bg-white/5 transition-colors">
                    <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg mr-4">
                        <LuGlobe size={20} />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Country</div>
                        <div className="text-sm text-gray-200">{user.country || 'N/A'}</div>
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

export default UserSingle;