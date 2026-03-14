import React from 'react';
import { Loader2 } from 'lucide-react'; // lucide-react ቀድሞ መጫኑን እርግጠኛ ሁን

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = false, 
  message = "Processing, please wait..." 
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col justify-center items-center"
    : "flex flex-col justify-center items-center p-8 min-h-[200px] w-full";

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <div className="absolute w-16 h-16 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
        
        {/* Main Spinner Icon */}
        <div className="relative">
          <Loader2 
            className="w-10 h-10 text-indigo-600 animate-spin" 
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Brand or Status Text */}
      <div className="mt-6 text-center animate-pulse">
        <h3 className="text-sm font-bold text-slate-800 tracking-widest uppercase italic">
          SimuAI
        </h3>
        {message && (
          <p className="text-xs text-slate-500 font-medium mt-1">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;