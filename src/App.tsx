import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/admin-dashboard";
import ServiceRequest from "@/pages/service-request";
import AnsweredOrdersPage from "@/pages/AnsweredOrdersPage";
import OrderPage from "./pages/OrderPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerification from "./pages/VerifyEmail";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Login Route */}
      <Route path="/service-request" element={<ProtectedRoute><ServiceRequest /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/answered-order" element={<ProtectedRoute><AnsweredOrdersPage /></ProtectedRoute>} />
      <Route path="/order-status" element={<ProtectedRoute><OrderPage /> </ProtectedRoute>} />
      <Route path="/verify-email/:token" element={<EmailVerification />} />


    </Routes>
  );
}

export default App;
