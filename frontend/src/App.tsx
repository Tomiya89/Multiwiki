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
import ForumsPage from './pages/wiki/post/ForumsPage';
import CreateForumPage from './pages/wiki/post/CreateForumPage';
import ForumPage from './pages/wiki/post/ForumPage';
import EditForumPage from './pages/wiki/post/EditForumPage';
import SearchPage from './pages/wiki/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

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
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path='profile' element={<ProfilePage />} />
                  <Route path='create' element={<CreateWikiPage />} />

                  {/* Wiki */}
                  <Route path='wikis/:wikiName' element={<WikiLayout />}>
                    <Route index element={<WikiPage />} />
                    <Route path='settings' element={<WikiSettingsPage/>}/>
                    <Route path='search' element={<SearchPage />} />
                    <Route path='edit' element={<WikiEditorPage/>} />
                    <Route path='staffs' element={<WikiStaffsPage />} />

                    {/* Post */}
                    <Route path='forums'>
                      <Route index element={<ForumsPage />} />
                      <Route path='create' element={<CreateForumPage />} />
                      <Route path=':postId'>
                        <Route index element={<ForumPage />} />
                        <Route path='edit' element={<EditForumPage />} />
                      </Route>
                    </Route>

                    {/* Category */}
                    <Route path='categories'>
                      <Route index element={<CategoriesPage />} />
                      <Route path='create' element={<CreateCategoryPage />} />
                      <Route path=':categoryName'>
                        <Route index element={<CategoryPage />} />
                        <Route path='edit' element={<CategoryEditorPage/>} />
                        <Route path='settings' element={<CategorySettingsPage />} />

                        {/* Article */}
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ArticleProvider>
          </CategoryProvider>
        </WikiProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

export default App
