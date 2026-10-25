import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { CandidateLayout } from "./layouts/CandidateLayout";
import { RecruiterLayout } from "./layouts/RecruiterLayout";
import { AdminLayout } from "./layouts/AdminLayout";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Candidate Pages
import { CandidateDashboard } from "./pages/candidate/CandidateDashboard";
import { CandidateJobsPage } from "./pages/candidate/CandidateJobsPage";
import { CandidateJobDetailPage } from "./pages/candidate/CandidateJobDetailPage";
import { CandidateApplicationsPage } from "./pages/candidate/CandidateApplicationsPage";
import { CandidateSavedJobsPage } from "./pages/candidate/CandidateSavedJobsPage";
import { CandidateResumePage } from "./pages/candidate/CandidateResumePage";
import { CandidateAIAssistantPage } from "./pages/candidate/CandidateAIAssistantPage";
import { CandidateInterviewsPage } from "./pages/candidate/CandidateInterviewsPage";
import { CandidateNotificationsPage } from "./pages/candidate/CandidateNotificationsPage";
import { CandidateProfilePage } from "./pages/candidate/CandidateProfilePage";
import { CandidateSettingsPage } from "./pages/candidate/CandidateSettingsPage";

// Recruiter Pages
import { RecruiterDashboard } from "./pages/recruiter/RecruiterDashboard";
import { RecruiterJobsPage } from "./pages/recruiter/RecruiterJobsPage";
import { RecruiterApplicationsPage } from "./pages/recruiter/RecruiterApplicationsPage";
import { RecruiterCandidatesPage } from "./pages/recruiter/RecruiterCandidatesPage";
import { RecruiterInterviewsPage } from "./pages/recruiter/RecruiterInterviewsPage";
import { RecruiterCompanyPage } from "./pages/recruiter/RecruiterCompanyPage";
import { RecruiterAIAssistantPage } from "./pages/recruiter/RecruiterAIAssistantPage";
import { RecruiterAnalyticsPage } from "./pages/recruiter/RecruiterAnalyticsPage";
import { RecruiterNotificationsPage } from "./pages/recruiter/RecruiterNotificationsPage";
import { RecruiterSettingsPage } from "./pages/recruiter/RecruiterSettingsPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminRecruitersPage } from "./pages/admin/AdminRecruitersPage";
import { AdminCompaniesPage } from "./pages/admin/AdminCompaniesPage";
import { AdminJobsPage } from "./pages/admin/AdminJobsPage";
import { AdminApplicationsPage } from "./pages/admin/AdminApplicationsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";

// 404 Fallback
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Ensures browser window scrolls to top on navigation change.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Dynamic redirection helper for generic /dashboard path
 */
function RoleDashboardRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "recruiter") {
    return <Navigate to="/recruiter/dashboard" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/candidate/dashboard" replace />;
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* 1. Public Marketing Routes (Wrapped in PublicLayout with navbar & footer) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<Navigate to="/#about" replace />} />
                <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
                <Route path="/contact" element={<Navigate to="/#contact" replace />} />
              </Route>

              {/* 2. Standalone Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* 3. Candidate Authenticated Workspace */}
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <CandidateLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="jobs" element={<CandidateJobsPage />} />
                <Route path="jobs/:jobId" element={<CandidateJobDetailPage />} />
                <Route path="applications" element={<CandidateApplicationsPage />} />
                <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
                <Route path="resume" element={<CandidateResumePage />} />
                <Route path="ai-assistant" element={<CandidateAIAssistantPage />} />
                <Route path="interviews" element={<CandidateInterviewsPage />} />
                <Route path="notifications" element={<CandidateNotificationsPage />} />
                <Route path="profile" element={<CandidateProfilePage />} />
                <Route path="settings" element={<CandidateSettingsPage />} />
              </Route>

              {/* 4. Recruiter Authenticated Workspace */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={["recruiter"]}>
                    <RecruiterLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="jobs" element={<RecruiterJobsPage />} />
                <Route path="applications" element={<RecruiterApplicationsPage />} />
                <Route path="candidates" element={<RecruiterCandidatesPage />} />
                <Route path="interviews" element={<RecruiterInterviewsPage />} />
                <Route path="company" element={<RecruiterCompanyPage />} />
                <Route path="ai-assistant" element={<RecruiterAIAssistantPage />} />
                <Route path="analytics" element={<RecruiterAnalyticsPage />} />
                <Route path="notifications" element={<RecruiterNotificationsPage />} />
                <Route path="settings" element={<RecruiterSettingsPage />} />
              </Route>

              {/* 5. Admin Authenticated Workspace */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="recruiters" element={<AdminRecruitersPage />} />
                <Route path="companies" element={<AdminCompaniesPage />} />
                <Route path="jobs" element={<AdminJobsPage />} />
                <Route path="applications" element={<AdminApplicationsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 6. Utility & Role Fallbacks */}
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />
              <Route path="/jobs" element={<Navigate to="/candidate/jobs" replace />} />
              <Route path="/explore-jobs" element={<Navigate to="/candidate/jobs" replace />} />

              {/* 7. Not Found & Catch-all */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;