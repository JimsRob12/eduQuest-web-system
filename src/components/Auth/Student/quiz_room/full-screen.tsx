import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";

const FullScreenButton = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={toggleFullScreen}
        className="fixed right-6 top-6 z-10 w-fit rounded-md bg-slate-500 bg-opacity-10 p-1.5 hover:bg-opacity-20 md:right-12 lg:right-16"
        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
      >
        {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>
    </div>
  );
};

export default FullScreenButton;
