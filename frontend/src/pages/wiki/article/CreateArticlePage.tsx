import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../../contexts/LocaleContext';
import { FiPlusCircle, FiFileText, FiArrowLeft } from 'react-icons/fi';
import ApiClient from '../../../services/ApiClient';
import type Article from '../../../entities/Article';
import { useWiki } from '../../../contexts/WikiContext';
import { useCategory } from '../../../contexts/CategoryContext';
import { useAuth } from '../../../contexts/AuthContext';

function CreateArticlePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { wiki, staff, loading: wikiLoading} = useWiki();
    const { category, loading: catLoading} = useCategory();
    const { getTranslate } = useLocale();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !wiki || !category || loading) return;

        setLoading(true);
        setError('');

        try {
            const newArticle = await ApiClient.post<Article>(
                `/wikis/${wiki?.name}/categories/${category?.name}/articles`,
                { name } 
            );

            navigate(`/wikis/${wiki?.name}/categories/${category?.name}/articles/${newArticle.name}`);
        } catch (err: any) {
            const errorKey = err?.response?.data?.message || err?.message || 'UNKNOWN_ERROR';
            setError(getTranslate(errorKey));
        } finally {
            setLoading(false);
        }
    };

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    if (wikiLoading || catLoading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    if (!isAuthor) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger shadow-sm rounded-4">
                    {getTranslate('accessDenied')}
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 d-flex justify-content-center animate-fade-in">
            <div style={{ maxWidth: '600px', width: '100%' }}>

                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2"
                >
                    <FiArrowLeft /> {getTranslate('backBtn')}
                </button>

                <div className="mb-5 text-center text-md-start">
                    <h2 className="display-6 fw-bold text-dark mb-2">
                        {getTranslate('createArticleTitle')}
                    </h2>
                    <p className="text-muted">
                        {getTranslate('addingToCategory')}: <span className="badge bg-secondary">{category?.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-4 p-md-5 rounded-4 border shadow-sm">
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase text-muted">
                            {getTranslate('articleUrlLabel')}
                        </label>
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                                <FiFileText className="text-primary" />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0 shadow-none ps-0"
                                placeholder="article-url-name"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="mt-2 small text-muted px-1">
                            /wikis/{wiki?.name}/categories/{category?.name}/articles/<strong>{name || '...'}</strong>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger border-0 small mb-4 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        disabled={loading || !name}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <>
                                <FiPlusCircle size={20} />
                                {getTranslate('createArticleTitle')}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateArticlePage;