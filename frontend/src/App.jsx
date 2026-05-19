import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/worker/Login';
import Dashboard from './pages/worker/Dashboard';
import Parts from './pages/worker/Parts';
import Appointment from './pages/worker/Appointment';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import Clients from './pages/owner/Clients';
import Workers from './pages/owner/Workers';
import Invoices from './pages/owner/Invoices';
import OwnerAppointments from './pages/owner/OwnerAppointments';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/worker/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/worker/parts" element={<ProtectedRoute><Parts/></ProtectedRoute>} />
          <Route path="/worker/appointments" element={<ProtectedRoute><Appointment/></ProtectedRoute>} />
          <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard/></ProtectedRoute>} />
          <Route path="/owner/clients" element={<ProtectedRoute><Clients/></ProtectedRoute>} />
          <Route path="/owner/workers" element={<ProtectedRoute><Workers/></ProtectedRoute>} />
          <Route path="/owner/invoices" element={<ProtectedRoute><Invoices/></ProtectedRoute>} />
          <Route path="/owner/appointments" element={<ProtectedRoute><OwnerAppointments/></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
