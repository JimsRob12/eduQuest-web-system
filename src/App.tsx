import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./contexts/ThemeProvider";
import LandingPage from "./components/Public/Landing/LandingPage";
import AboutPage from "./components/Public/AboutPage";
import FAQPage from "./components/Public/FAQPage";
import ContactPage from "./components/Public/ContactPage";
import TermsPage from "./components/Public/TermsPage";
import PrivacyPolicyPage from "./components/Public/PrivacyPolicyPage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import { AuthContextProvider } from "./contexts/AuthProvider";
import AppLayout from "./layout/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      // refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route element={<AppLayout />}>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Professor Protected Routes */}
              <Route element={<AppLayout />}>
                <Route
                  element={<ProtectedRoute allowedRoles={["professor"]} />}
                >
                  {/* <Route path="/professor/dashboard" element={<ProfessorDashboard />} /> */}
                  {/* <Route path="/professor/upload" element={<FileUpload />} /> */}
                  {/* <Route path="/professor/quizzes" element={<QuizManagement />} /> */}
                  {/* <Route path="/professor/profile" element={<Profile />} /> */}
                </Route>
              </Route>

              {/* Student Protected Routes */}
              <Route element={<AppLayout />}>
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                  {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
                  {/* <Route path="/student/quiz/:quizId" element={<QuizPlayer />} /> */}
                  {/* <Route path="/student/leaderboard" element={<Leaderboard />} /> */}
                  {/* <Route path="/student/profile" element={<Profile />} /> */}
                </Route>
              </Route>

              {/* Shared Protected Routes */}
              {/* <Route
            path="/account-settings"
            element={
              <ProtectedRoute allowedRoles={["professor", "student"]}>
                <AccountSettings />
              </ProtectedRoute>
            }
          /> */}

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthContextProvider>

      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "white",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
