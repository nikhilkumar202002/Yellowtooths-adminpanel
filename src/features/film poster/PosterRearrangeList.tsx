import { useEffect, useState, useRef } from 'react';
import { getPosterDesignList, updatePosterOrder, type PosterDesignListItem } from '../../services/AllServices';
import { LuLoader, LuGripHorizontal, LuClapperboard } from "react-icons/lu";
import { showSuccess, showError, showLoading, dismissToast } from '../../utils/Toast'; // Assuming you have these utils

const PosterRearrangeList = () => {

  const [posters, setPosters] = useState<PosterDesignListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getPosterDesignList();
      const sortedData = data.sort((a, b) => a.position_number - b.position_number);
      setPosters(sortedData);
    } catch (err) {
      console.error("Failed to fetch posters", err);
      setError("Failed to load poster list.");
    } finally {
      setLoading(false);
    }
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    e.preventDefault();
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragItem.current = null;
    dragOverItem.current = null;
  };

const handleSort = async () => {
    // 1. Safety Checks
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    // 2. Clone the current full list
    const _posters = [...posters];

    // 3. Reorder the array locally
    const draggedItemContent = _posters[dragItem.current];
    _posters.splice(dragItem.current, 1); // Remove from old index
    _posters.splice(dragOverItem.current, 0, draggedItemContent); // Insert at new index

    // 4. Recalculate 'position_number' for EVERY item in the list
    // This ensures that even items you didn't touch get their numbers corrected
    const reorderedPosters = _posters.map((item, index) => ({
        ...item,
        position_number: index + 1
    }));
    
    // 5. Update UI immediately
    setPosters(reorderedPosters);
    handleDragEnd();

    // 6. Send the ENTIRE reordered list to the backend
    const toastId = showLoading("Saving order...");
    try {
        await updatePosterOrder(reorderedPosters); // <--- Passes ALL IDs
        dismissToast(toastId);
        showSuccess("Order updated successfully");
    } catch (err) {
        dismissToast(toastId);
        console.error("Failed to save order", err);
        showError("Failed to save order");
        fetchData(); // Revert if API fails
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-yellow-500">
        <LuLoader className="animate-spin mr-2" size={24}/> 
        <span className="tracking-widest uppercase text-xs font-bold">Loading Layout</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 bg-red-500/5 p-4 rounded border border-red-500/10 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Sequence Manager</h2>
           <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">Drag items to reorder • Auto-saves on drop</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full">
                {posters.length} FILMS
            </div>
        </div>
      </div>

      {/* --- Grid Layout --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 relative">
        {posters.map((poster, index) => (
          <div 
            key={poster.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
            className={`
                group relative flex flex-col bg-[#141414] rounded-lg overflow-hidden border border-gray-800 
                transition-all duration-300 cursor-move
                ${isDragging && dragItem.current === index ? 'opacity-40 scale-95 border-dashed border-yellow-500' : 'hover:border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/10'}
                ${isDragging && dragOverItem.current === index ? 'border-yellow-500 scale-105 shadow-xl shadow-yellow-500/20' : ''}
            `}
          >
            
            {/* 1. Drag Handle Bar */}
            <div className="h-6 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-center group-hover:bg-yellow-500/10 transition-colors pointer-events-none">
                <LuGripHorizontal className="text-gray-600 group-hover:text-yellow-500" size={14} />
            </div>

            {/* 2. Poster Content Area */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 min-h-[160px] pointer-events-none">
                
                {/* Background Rank Number */}
                <span className="absolute z-0 text-[80px] font-black text-[#1a1a1a] group-hover:text-[#222] transition-colors select-none leading-none -bottom-4 right-0 opacity-50">
                    {index + 1}
                </span>

                {/* Central Icon */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                     <LuClapperboard className="text-gray-500 group-hover:text-yellow-500 transition-colors" size={24} />
                </div>

                {/* Text Details */}
                <div className="relative z-10 text-center w-full px-2">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {poster.film_name}
                    </h3>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono text-gray-500 bg-black/50 border border-gray-800">
                        Pos: {index + 1}
                    </div>
                </div>
            </div>

            {/* 3. Bottom Indicator */}
            <div className="h-1 w-full bg-gray-800 group-hover:bg-yellow-500 transition-all duration-500"></div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default PosterRearrangeList;