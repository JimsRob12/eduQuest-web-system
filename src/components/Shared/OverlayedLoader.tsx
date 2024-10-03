import React from "react";

interface OverlayedLoaderProps {
  isLoading: boolean;
}

const OverlayedLoader: React.FC<OverlayedLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-purple-500"></div>
    </div>
  );
};

export default OverlayedLoader;
