import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import Navbar from './components/Layout/Navbar';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Features from './pages/Features';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Feed from './pages/Feed';
import Groups from './pages/Groups';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import VerifyEmail from './pages/VerifyEmail';
import OnboardingComplete from './pages/OnboardingComplete';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Footer from './components/UI/Footer';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/Admin/AdminRoute';
import AdminLayout from './components/Admin/Layout/AdminLayout';
import UserManagement from './components/Admin/Users/UserManagement';
import ContentModeration from './components/Admin/Moderation/ContentModeration';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding-complete" element={<OnboardingComplete />} />
          
          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/discover" 
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/moderation" 
            element={
              <AdminRoute>
                <AdminLayout>
                  <ContentModeration />
                </AdminLayout>
              </AdminRoute>
            } 
          />
          
          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

export default App;