import React, { createContext, useState, ReactNode } from "react";

type FileData = {
  file: File | null;
  name: string;
  size: number;
};

type QuizContextType = {
  fileData: FileData | null;
  setFileData: (data: FileData | null) => void;
};

export const QuizContext = createContext<QuizContextType>({
  fileData: null,
  setFileData: () => {},
});

export const QuizProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [fileData, setFileData] = useState<FileData | null>(null);

  return (
    <QuizContext.Provider value={{ fileData, setFileData }}>
      {children}
    </QuizContext.Provider>
  );
};
