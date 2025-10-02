import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoanRepaymentCalculator from './loan_repayment_calculator';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <LoanRepaymentCalculator />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
