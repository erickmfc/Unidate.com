import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SiteActivityTracker from './components/SiteActivityTracker';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ToastProvider } from './components/UI/Toast';
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Footer from './components/UI/Footer';
import ModernAdminLayout from './components/Admin/Layout/SimpleAdminLayout';
import TermsAcceptanceModal from './components/Auth/TermsAcceptanceModal';
import { hasAcceptedTerms } from './services/termsAcceptanceService';

const LoginForm = lazy(() => import('./components/Auth/LoginForm'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));
const RegisterForm = lazy(() => import('./components/Auth/RegisterForm'));
const HomePage = lazy(() => import('./pages/HomePage'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Profile2 = lazy(() => import('./pages/Profile2'));
const Discover = lazy(() => import('./pages/Discover'));
const Feed = lazy(() => import('./pages/Feed'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupDetails = lazy(() => import('./pages/GroupDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Chat = lazy(() => import('./pages/Chat'));
const Settings = lazy(() => import('./pages/Settings'));
const OnboardingFlow = lazy(() => import('./components/Onboarding/OnboardingFlow'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const OnboardingComplete = lazy(() => import('./pages/OnboardingComplete'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDashboardV3 = lazy(() => import('./components/Admin/Dashboard/AdminDashboardV3'));
const AdminRoute = lazy(() => import('./components/Admin/AdminRoute'));
const AdminLayout = lazy(() => import('./components/Admin/Layout/AdminLayout'));
const UserManagement = lazy(() => import('./components/Admin/Users/UserManagement'));
const ContentManagement = lazy(() => import('./components/Admin/Content/ContentManagement'));
const FeatureFlags = lazy(() => import('./components/Admin/Features/FeatureFlags'));
const ContentModeration = lazy(() => import('./components/Admin/Moderation/ContentModeration'));
const AdvancedAnalytics = lazy(() => import('./components/Admin/Analytics/AdvancedAnalytics'));
const NotificationSystem = lazy(() => import('./components/Admin/Notifications/NotificationSystem'));
const AdvancedReports = lazy(() => import('./components/Admin/Reports/AdvancedReports'));
const AIControlPage = lazy(() => import('./pages/admin/AIControlPage'));
const SOSPage = lazy(() => import('./pages/SOSPage'));
const AnonymousWallPage = lazy(() => import('./pages/AnonymousWallPage'));
const Events = lazy(() => import('./pages/Events'));
const CampusGuide = lazy(() => import('./pages/CampusGuide'));
const Impulsionar = lazy(() => import('./pages/Impulsionar'));

const Experts = lazy(() => import('./pages/Experts'));
const BotDemo = lazy(() => import('./pages/BotDemo'));
const AdminInstructions = lazy(() => import('./components/Admin/AdminInstructions'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, userProfile } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (userProfile && !userProfile.onboardingCompleted) {
    return <Navigate to="/onboarding-complete" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!location.pathname.startsWith('/admin') && 
       !location.pathname.startsWith('/experts') && 
       location.pathname !== '/feed' && 
       location.pathname !== '/impulsionar' && <Navbar />}
      <main className={
        location.pathname.startsWith('/admin') || 
        location.pathname.startsWith('/experts') || 
        location.pathname === '/feed' || 
        location.pathname === '/impulsionar' 
          ? '' 
          : 'pt-16'
      }>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/onboarding-complete" element={<OnboardingComplete />} />
          
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
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile2" 
            element={
              <ProtectedRoute>
                <Profile2 />
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
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
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
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/impulsionar" 
            element={
              <ProtectedRoute>
                <Impulsionar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/campus-guide" 
            element={
              <ProtectedRoute>
                <CampusGuide />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/experts" 
            element={
              <ProtectedRoute>
                <Experts />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/bot-demo"
            element={
              <ProtectedRoute>
                <BotDemo />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin-instructions" 
            element={<AdminInstructions />} 
          />
          
          <Route 
            path="/sos" 
            element={
              <ProtectedRoute>
                <SOSPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/anonymous-wall" 
            element={
              <ProtectedRoute>
                <AnonymousWallPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <AdminDashboardV3 />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/ai-control" 
            element={
              <AdminRoute>
                <AIControlPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <UserManagement />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/content" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <ContentManagement />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/moderation" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <ContentModeration />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/features" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <FeatureFlags />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Eventos</h1>
                    <p className="text-gray-600 dark:text-gray-400">Gerenciamento de eventos em desenvolvimento.</p>
                  </div>
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <AdvancedAnalytics />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/notifications" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <NotificationSystem />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <AdvancedReports />
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <AdminRoute>
                <ModernAdminLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configurações</h1>
                    <p className="text-gray-600 dark:text-gray-400">Configurações do sistema em desenvolvimento.</p>
                  </div>
                </ModernAdminLayout>
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const TermsAcceptanceGate: React.FC = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [showTerms, setShowTerms] = React.useState(false);

  React.useEffect(() => {
    setShowTerms(false);

    if (loading || !isAuthenticated || !currentUser?.id) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const accepted = await hasAcceptedTerms(currentUser.id);
        if (!cancelled && !accepted) setShowTerms(true);
      } catch (error) {
        // Fail closed: without a successful verification, the person must be
        // able to read and retry the acceptance instead of bypassing it.
        console.error('Erro ao verificar aceite dos termos:', error);
        if (!cancelled) setShowTerms(true);
      }
    }, 10_000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [currentUser?.id, isAuthenticated, loading]);

  if (!showTerms || !currentUser?.id) return null;
  return <TermsAcceptanceModal userId={currentUser.id} onAccepted={() => setShowTerms(false)} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ToastProvider>
          <Router>
            <SiteActivityTracker />
            <AppContent />
            <TermsAcceptanceGate />
          </Router>
        </ToastProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

export default App;
// Touch for rebuild

