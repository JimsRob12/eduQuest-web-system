import React, { createContext, useState, useContext, ReactNode } from "react";

interface GameContextType {
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <GameContext.Provider value={{ gameStarted, setGameStarted }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
