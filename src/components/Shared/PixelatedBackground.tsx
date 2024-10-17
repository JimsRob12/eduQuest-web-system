/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";

// Helper function to create predefined 8-bit characters using pixel shapes
const createCharacterShape = (type: string) => {
  switch (type) {
    case "character1": // Simple 8-bit character example (like a space invader)
      return [
        { x: 0, y: 0, size: 1, color: "#00ff00" },
        { x: 1, y: 0, size: 1, color: "#00ff00" },
        { x: 0, y: 1, size: 1, color: "#00ff00" },
        { x: 1, y: 1, size: 1, color: "#00ff00" },
        { x: 2, y: 0, size: 1, color: "#00ff00" },
      ]; // A simple 3x3 block character
    case "character2": // Another example character
      return [
        { x: 0, y: 0, size: 1, color: "#ff0000" },
        { x: 0, y: 1, size: 1, color: "#ff0000" },
        { x: 1, y: 1, size: 1, color: "#ff0000" },
        { x: 2, y: 1, size: 1, color: "#ff0000" },
        { x: 2, y: 2, size: 1, color: "#ff0000" },
      ]; // Another blocky character
    default:
      return [];
  }
};

// Function to create a shooting star (meteor) with a trail
const createShootingStar = () => {
  const trailLength = Math.floor(Math.random() * 5) + 3;
  const starColor = "#fffacd"; // Pale yellow for the shooting star
  const trail = Array.from({ length: trailLength }, (_, i) => ({
    x: i * -1, // Trail behind the star
    y: i * -1,
    size: 0.5,
    color: starColor,
  }));
  return trail.concat({
    x: 0,
    y: 0,
    size: 1.5, // The head of the shooting star
    color: "#ffffff",
  });
};

const PIXEL_COUNT = 500; // Reduced from 1500
const CHARACTER_COUNT = 3; // Reduced from 5
const SHOOTING_STAR_COUNT = 5; // Reduced from 10

export const PixelatedBackground = ({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<
    {
      x: number;
      y: number;
      color: string;
      speed: number;
      size: number;
      shape?: { x: number; y: number; size: number; color: string }[];
      type: string;
      directionX?: number;
      directionY?: number;
    }[]
  >([]);

  const generateElements = useCallback(() => {
    const colors = isDarkMode
      ? ["#1a2639", "#1e3a5f", "#3d5a80", "#98c1d9"]
      : ["#e0f0e3", "#c6dea6", "#7ebdc3", "#b7d3f2"];

    const newElements = [];

    // Add pixels for the background
    for (let i = 0; i < PIXEL_COUNT; i++) {
      newElements.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.03 + 0.01,
        size: Math.random() * 0.3 + 0.1,
        type: "pixel",
      });
    }

    // Add 8-bit characters
    for (let i = 0; i < CHARACTER_COUNT; i++) {
      const characterType = i % 2 === 0 ? "character1" : "character2";
      newElements.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        shape: createCharacterShape(characterType),
        type: "character",
        speed: Math.random() * 0.02 + 0.005,
        size: 5,
      });
    }

    // Add shooting stars (meteors)
    for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
      newElements.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        shape: createShootingStar(),
        type: "shootingStar",
        speed: Math.random() * 0.05 + 0.02,
        directionX: Math.random() * 0.05 + 0.03,
        directionY: Math.random() * 0.05 + 0.03,
        size: 5,
      });
    }

    return newElements;
  }, [isDarkMode]);

  useEffect(() => {
    setElements(generateElements());
  }, [isDarkMode, generateElements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements.forEach((element) => {
        if (element.type === "shootingStar") {
          element.x = (element.x + (element.directionX ?? 0)) % 100;
          element.y = (element.y + (element.directionY ?? 0)) % 100;
        } else {
          element.y = (element.y + element.speed) % 100;
          element.x =
            (element.x + Math.sin(element.y * 0.1) * 0.02 + 100) % 100;
        }

        if (element.type === "character" || element.type === "shootingStar") {
          element.shape?.forEach((pixel: any) => {
            ctx.fillStyle = pixel.color;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(
              ((element.x + pixel.x) / 100) * canvas.width,
              ((element.y + pixel.y) / 100) * canvas.height,
              (pixel.size / 100) * canvas.width,
              (pixel.size / 100) * canvas.height,
            );
          });
        } else {
          ctx.fillStyle = element.color;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(
            (element.x / 100) * canvas.width,
            (element.y / 100) * canvas.height,
            (element.size / 100) * canvas.width,
            (element.size / 100) * canvas.height,
          );
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [elements]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
};
