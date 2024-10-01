import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { useAuth } from "./contexts/AuthProvider";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import PublicRoute from "./components/Shared/PublicRoute";

import LandingPage from "./components/Public/Landing/LandingPage";
import AboutPage from "./components/Public/AboutPage";
import FAQPage from "./components/Public/FAQPage";
import ContactPage from "./components/Public/ContactPage";
import TermsPage from "./components/Public/TermsPage";
import PrivacyPolicyPage from "./components/Public/PrivacyPolicyPage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import NotFound from "./pages/NotFound";
import RoleAssignment from "./components/Auth/RoleAssignment";
import StudentDashboard from "./components/Auth/Student/student-dashboard";
import ProfessorDashboard from "./components/Auth/Professor/professor-dashboard";
import QuestionTypeSelection from "./components/Auth/Professor/Quiz/quiz-type-selection";
import AddQuestion from "./components/Auth/Professor/Quiz/quiz-add-question";
import CustomizeQuiz from "./components/Auth/Professor/Quiz/quiz-customize";

// Define route configurations
const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPolicyPage /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
];

const professorRoutes = [
  { path: "/professor/dashboard", element: <ProfessorDashboard /> },
  {
    path: "/professor/quiz/:quizId/type-selection",
    element: <QuestionTypeSelection />,
  },
  {
    path: "/professor/quiz/:quizId/add-question/:type",
    element: <AddQuestion />,
  },
  { path: "/professor/quiz/:quizId/customize", element: <CustomizeQuiz /> },
];

const studentRoutes = [
  { path: "/student/dashboard", element: <StudentDashboard /> },
];

const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              {publicRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<PublicRoute>{route.element}</PublicRoute>}
                />
              ))}

              {/* Role Assignment Route */}
              <Route
                path="/role-assignment"
                element={<ProtectedRoute>{<RoleAssignment />}</ProtectedRoute>}
              />

              {/* Professor Protected Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["professor"]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                {professorRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Route>

              {/* Student Protected Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                {studentRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Route>

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>

      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "white",
            color: "var(--color-grey-700)",
          },
        }}
      />
    </>
  );
};

export default App;
