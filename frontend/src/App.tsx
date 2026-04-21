import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import { LocaleProvider } from './contexts/LocaleContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreateWikiPage from './pages/wiki/CreateWikiPage';
import WikiLayout from './components/WikiLayout';
import { WikiProvider } from './contexts/WikiContext';
import WikiPage from './pages/wiki/WikiPage';
import WikiSettingsPage from './pages/wiki/WikiSettingsPage';

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <WikiProvider>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path='login' element={<LoginPage />} />
              <Route path='register' element={<RegisterPage />} />
              <Route path='profile' element={<ProfilePage />} />
              <Route path='create' element={<CreateWikiPage />} />

              {/* Wiki */}
              <Route path='wikis/:wikiName' element={<WikiLayout />}>
                <Route index element={<WikiPage />} />
                <Route path='settings' element={<WikiSettingsPage/>}/>
              </Route>

            </Route>
          </Routes>
        </WikiProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

export default App
