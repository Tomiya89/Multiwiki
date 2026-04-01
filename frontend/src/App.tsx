import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import { LocaleProvider } from './contexts/LocaleContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path='login' element={<LoginPage />} />
              <Route path='register' element={<RegisterPage />} />
            </Route>
          </Routes>
      </AuthProvider>
    </LocaleProvider>
  );
}

export default App
