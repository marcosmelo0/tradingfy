import React from 'react';

const ProcessingOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col items-center space-y-6 p-8 rounded-3xl bg-gray-900/40 border border-white/10 shadow-2xl scale-in-center">
        {/* Animated Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          {/* Inner Light */}
          <div className="absolute inset-4 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Processando</h2>
          <p className="text-gray-400 text-sm">Aguarde enquanto preparamos tudo...</p>
        </div>
        
        {/* Subtle Progress Trace */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-shimmer scale-x-150 origin-left"></div>
        </div>
      </div>

      <style jsx>{`
        .scale-in-center {
          animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default ProcessingOverlay;
