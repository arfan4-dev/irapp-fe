import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/admin-dashboard";
import ServiceRequest from "@/pages/service-request";

import ProtectedRoute from "./routes/ProtectedRoute";
import ErrorBoundary from "./components/error-boundary";
import { useOrderSync } from "./utils/orderSync";
import ManageUsers from "./features/admin/ManageUsers";
import Login from "./pages/Login";
import AnsweredOrdersPage from "./pages/answered-orders-page";
import OrderPage from "./pages/order-page";
import EmailVerification from "./pages/verify-email";
import AdminLogin from "./pages/admin-login";
import Register from "./pages/Register";
import SiteConfig from "./pages/site-config";
import useDynamicSiteMeta from "./hooks/useDynamicSiteMeta";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useEffect } from "react";
import { fetchSiteConfig } from "./store/features/siteConfig/siteConfig";
import DepartmentManagementPage from "./pages/department";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import PublicRoute from "./routes/PublicRoute";

function App() {
  useOrderSync();
  const { config } = useSelector((state: RootState) => state?.siteConfig);
  const dispatch = useDispatch<AppDispatch>();
  useDynamicSiteMeta({ faviconUrl: (config?.faviconUrl || '/assets/favicon.ico'), title: (config?.siteTitle || 'Internal Service Management System') })
  useEffect(() => {
    dispatch(fetchSiteConfig()).unwrap()
  }, [])
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Route */}
        {/* <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} /> */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path="/" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/admin" element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        <Route path="/reset-password/:token" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
        {/* Private Route */}
        <Route path="/service-request" element={<ProtectedRoute><ServiceRequest /></ProtectedRoute>} />
        <Route path="/admin-panel" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff-panel" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin-panel/site-config" element={<ProtectedRoute><SiteConfig /></ProtectedRoute>} />
        <Route path="/manage-categories-departments" element={<ProtectedRoute><DepartmentManagementPage /></ProtectedRoute>} />

        <Route path="/answered-order" element={<ProtectedRoute><AnsweredOrdersPage /></ProtectedRoute>} />
        <Route path="/order-status" element={<ProtectedRoute><OrderPage /> </ProtectedRoute>} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />


      </Routes>
    </ErrorBoundary>
  );
}

export default App;
