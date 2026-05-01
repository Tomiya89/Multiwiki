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
import WikiEditorPage from './pages/wiki/WikiEditorPage';
import CategoriesPage from './pages/wiki/category/CategoriesPage';
import CreateCategoryPage from './pages/wiki/category/CategoryCreatePage';
import { CategoryProvider } from './contexts/CategoryContext';
import CategoryPage from './pages/wiki/category/CategoryPage';
import CategorySettingsPage from './pages/wiki/category/CategorySettingsPage';
import CategoryEditorPage from './pages/wiki/category/CategoryEditorPage';
import CreateArticlePage from "./pages/wiki/article/CreateArticlePage";
import { ArticleProvider } from './contexts/ArticleContext';
import ArticlePage from './pages/wiki/article/ArticlePage';
import ArticleEditorPage from './pages/wiki/article/ArticleEditorPage';
import ArticleSettingsPage from './pages/wiki/article/ArticleSettingsPage';
import WikiStaffsPage from './pages/wiki/WikiStaffsPage';

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <WikiProvider>
          <CategoryProvider>
            <ArticleProvider>
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
                    <Route path='edit' element={<WikiEditorPage/>} />
                    <Route path='staffs' element={<WikiStaffsPage />} />
                    <Route path='categories'>
                      <Route index element={<CategoriesPage />} />
                      <Route path='create' element={<CreateCategoryPage />} />
                      <Route path=':categoryName'>
                        <Route index element={<CategoryPage />} />
                        <Route path='edit' element={<CategoryEditorPage/>} />
                        <Route path='settings' element={<CategorySettingsPage />} />
                        <Route path='articles'>
                          <Route path='create' element={<CreateArticlePage />}></Route>
                          <Route path=':articleName'>
                            <Route index element={<ArticlePage />} />
                            <Route path='edit' element={<ArticleEditorPage />} />
                            <Route path='settings' element={<ArticleSettingsPage />} />
                          </Route>
                        </Route>
                      </Route>
                    </Route>
                  </Route>

                </Route>
              </Routes>
            </ArticleProvider>
          </CategoryProvider>
        </WikiProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

export default App
