import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Doctors from './pages/admin/Doctors';
import ProtectedRoute from './components/ProtectedRoute';
import Patients from "./pages/admin/Patients";
import Medicines from "./pages/admin/Medicines";
import Bills from "./pages/admin/Bills";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute roles={['admin']}>
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Patients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/medicines"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Medicines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bills"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Bills />
          </ProtectedRoute>
        }
      />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}