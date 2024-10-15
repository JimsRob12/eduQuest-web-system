import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 20 }) => {
  const filledWidth = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className="relative w-full overflow-hidden border-2"
      style={{ height: `${height}px` }}
    >
      <div
        className="absolute inset-0 bg-gray-200"
        style={
          {
            //   backgroundImage: `repeating-linear-gradient(
            //     45deg,
            //     transparent,
            //     transparent 5px,
            //     rgba(0,0,0,0.1) 5px,
            //     rgba(0,0,0,0.1) 10px
            //   )`,
          }
        }
      />
      <div
        className="absolute inset-y-0 left-0 bg-purple-800 transition-all duration-300 ease-in-out"
        style={{
          width: `${filledWidth}%`,
          //   backgroundImage: `repeating-linear-gradient(
          //     45deg,
          //     transparent,
          //     transparent 5px,
          //     rgba(255,255,255,0.2) 5px,
          //     rgba(255,255,255,0.2) 10px
          //   )`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-black mix-blend-difference">
          {Math.round(filledWidth)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
