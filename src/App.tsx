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
import PublicRoute from "./components/Shared/PublicRoute";
import StudentDashboard from "./components/Auth/Student/student-dashboard";
import ProfessorDashboard from "./components/Auth/Professor/professor-dashboard";
import RoleAssignment from "./components/Auth/RoleAssignment";
import RoleAssignmentRoute from "./components/Shared/RoleAssignmentRoute";
import QuestionTypeSelection from "./components/Auth/Professor/Quiz/quiz-type-selection";
import AddQuestion from "./components/Auth/Professor/Quiz/quiz-add-question";
import CustomizeQuiz from "./components/Auth/Professor/Quiz/quiz-customize";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
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
                <Route element={<PublicRoute />}>
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
              </Route>

              <Route element={<AppLayout />}>
                <Route path="/role-assignment" element={<RoleAssignment />} />
                <Route element={<RoleAssignmentRoute />}>
                  <Route
                    element={<ProtectedRoute allowedRoles={["professor"]} />}
                  >
                    {/* Professor Protected Routes */}
                    <Route
                      path="/professor/dashboard"
                      element={<ProfessorDashboard />}
                    />
                    <Route path="/tite" element={<AboutPage />} />
                    <Route
                      path="/professor/quiz/:quizId/type-selection"
                      element={<QuestionTypeSelection />}
                    />
                    <Route
                      path="/professor/quiz/:quizId/add-question/:type"
                      element={<AddQuestion />}
                    />
                    <Route
                      path="/professor/quiz/:quizId/customize"
                      element={<CustomizeQuiz />}
                    />
                  </Route>

                  {/* Student Protected Routes */}
                  <Route
                    element={<ProtectedRoute allowedRoles={["student"]} />}
                  >
                    <Route
                      path="/student/dashboard"
                      element={<StudentDashboard />}
                    />
                  </Route>
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
