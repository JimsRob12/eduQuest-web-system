// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import { AuthContextProvider } from "./contexts/AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuizProvider } from "./contexts/QuizProvider.tsx";
import { QuestionEditProvider } from "./contexts/QuestionProvider.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <QuizProvider>
        <QuestionEditProvider>
          <App />
        </QuestionEditProvider>
      </QuizProvider>
    </AuthContextProvider>
  </QueryClientProvider>,
);
