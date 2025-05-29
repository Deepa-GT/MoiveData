import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="relative">
        {/* Outer circle */}
        <div className="w-16 h-16 border-4 border-yellow-500/20 rounded-full animate-spin">
          {/* Inner circle - rotating part */}
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-yellow-500 rounded-full animate-spin-fast border-t-transparent"></div>
        </div>
        {/* Loading text */}
        <div className="mt-4 text-center text-yellow-500 font-medium">Loading...</div>
      </div>
    </div>
  );
};

export default Loading; 