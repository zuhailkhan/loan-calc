import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
