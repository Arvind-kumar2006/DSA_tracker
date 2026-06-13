import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import AuthPage from './components/AuthPage.jsx';
import TrackerApp from './TrackerApp.jsx';
import PageSkeleton from './components/PageSkeleton.jsx';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <PageSkeleton />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <SettingsProvider>
      <TrackerApp />
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
