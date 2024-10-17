import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex h-[calc(100%-5rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
