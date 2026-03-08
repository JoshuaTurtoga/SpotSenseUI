import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CashierDashboard from './pages/CashierDashboard';
import FindCar from './pages/FindCar';

function PrivateRoute({ children, role }: { children: JSX.Element, role?: string }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" />;
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-car" element={<FindCar />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />

            <Route path="/cashier" element={
              <PrivateRoute role="cashier">
                <CashierDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
