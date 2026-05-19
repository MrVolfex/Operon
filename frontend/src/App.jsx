import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/worker/Login';
import Dashboard from './pages/worker/Dashboard';
import Parts from './pages/worker/Parts';
import Appointment from './pages/worker/Appointment';

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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/parts" element={<ProtectedRoute><Parts/></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointment/></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
