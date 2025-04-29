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

function App() {
  useOrderSync();

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        {/* Private Route */}
        <Route path="/service-request" element={<ProtectedRoute><ServiceRequest /></ProtectedRoute>} />
        <Route path="/admin-panel" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
        <Route path="/site-config" element={<ProtectedRoute><SiteConfig /></ProtectedRoute>} />

        <Route path="/answered-order" element={<ProtectedRoute><AnsweredOrdersPage /></ProtectedRoute>} />
        <Route path="/order-status" element={<ProtectedRoute><OrderPage /> </ProtectedRoute>} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />


      </Routes>
    </ErrorBoundary>
  );
}

export default App;
