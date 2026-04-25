import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';

export default function App() {
  const { token } = useAuth();
  return token ? <Dashboard /> : <LoginPage />;
}
