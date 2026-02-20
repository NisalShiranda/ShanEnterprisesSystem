import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (to be created)
const LoginPage = () => <div className="p-10 text-center text-3xl">Login Page</div>;
const RegisterPage = () => <div className="p-10 text-center text-3xl">Register Page</div>;
const Dashboard = () => <div className="p-10 text-center text-3xl">Dashboard</div>;
const Machines = () => <div className="p-10 text-center text-3xl">Machines</div>;
const Parts = () => <div className="p-10 text-center text-3xl">Parts</div>;
const Sales = () => <div className="p-10 text-center text-3xl">Sales</div>;
const Rentals = () => <div className="p-10 text-center text-3xl">Rentals</div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/machines" element={
            <ProtectedRoute>
              <Machines />
            </ProtectedRoute>
          } />

          <Route path="/parts" element={
            <ProtectedRoute>
              <Parts />
            </ProtectedRoute>
          } />

          <Route path="/sales" element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } />

          <Route path="/rentals" element={
            <ProtectedRoute>
              <Rentals />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
