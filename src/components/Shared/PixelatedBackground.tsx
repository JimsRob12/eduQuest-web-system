import { useCallback, useEffect, useState } from "react";

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

export const PixelatedBackground = ({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) => {
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
    const newElements = [];
    const colors = isDarkMode
      ? ["#1a2639", "#1e3a5f", "#3d5a80", "#98c1d9"]
      : ["#e0f0e3", "#c6dea6", "#7ebdc3", "#b7d3f2"];

    // Add pixels for the background
    for (let i = 0; i < 1500; i++) {
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
    for (let i = 0; i < 5; i++) {
      const characterType = i % 2 === 0 ? "character1" : "character2";
      newElements.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        shape: createCharacterShape(characterType),
        type: "character",
        speed: Math.random() * 0.02 + 0.005,
        size: 5, // Size of the overall 8-bit character
      });
    }

    // Add shooting stars (meteors)
    for (let i = 0; i < 10; i++) {
      newElements.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        shape: createShootingStar(),
        type: "shootingStar",
        speed: Math.random() * 0.05 + 0.02, // Shooting stars move fast
        directionX: Math.random() * 0.05 + 0.03,
        directionY: Math.random() * 0.05 + 0.03,
        size: 5, // Shooting star size
      });
    }

    return newElements;
  }, [isDarkMode]);

  useEffect(() => {
    setElements(generateElements());
  }, [isDarkMode, generateElements]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      setElements((prevElements) =>
        prevElements.map((element) => {
          if (element.type === "shootingStar") {
            return {
              ...element,
              x: (element.x + (element.directionX ?? 0)) % 100,
              y: (element.y + (element.directionY ?? 0)) % 100,
            };
          }
          return {
            ...element,
            y: (element.y + element.speed) % 100,
            x: element.x + Math.sin(element.y * 0.1) * 0.02,
          };
        }),
      );
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
      </filter>
      <g filter="url(#blur)">
        {elements.map((element, index) =>
          element.type === "character" || element.type === "shootingStar" ? (
            element.shape?.map((pixel, idx) => (
              <rect
                key={`${index}-${idx}`}
                x={`${element.x + pixel.x}%`}
                y={`${element.y + pixel.y}%`}
                width={`${pixel.size}%`}
                height={`${pixel.size}%`}
                fill={pixel.color}
                opacity="0.9"
              />
            ))
          ) : (
            <rect
              key={index}
              x={`${element.x}%`}
              y={`${element.y}%`}
              width={`${element.size}%`}
              height={`${element.size}%`}
              fill={element.color}
              opacity="0.7"
            />
          ),
        )}
      </g>
    </svg>
  );
};
