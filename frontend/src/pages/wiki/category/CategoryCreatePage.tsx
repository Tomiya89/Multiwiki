import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../../contexts/LocaleContext';
import { FiPlusCircle, FiLink, FiArrowLeft } from 'react-icons/fi';
import ApiClient from '../../../services/ApiClient';
import type Category from '../../../entities/Category';
import { useWiki } from '../../../contexts/WikiContext';
import { useAuth } from '../../../contexts/AuthContext';

function CreateCategoryPage() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const { wiki, staff, loading: wikiLoading } = useWiki();
    const { getTranslate } = useLocale();

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        if(!wiki) return;
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await ApiClient.post<Category>(`/wikis/${wiki?.name}/categories`, { name });
            navigate(`/wikis/${wiki?.name}/categories`);
        } catch (error: any) {
            setError(getTranslate(error?.message || 'UNKNOWN_ERROR'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoading) return;

        if (user == null)
            navigate('/login');
    }, [isLoading, user]);

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    if (wikiLoading || isLoading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

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
        <div className="py-4 px-3 d-flex justify-content-center">
            <div style={{ maxWidth: '600px', width: '100%' }}>

                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-decoration-none text-muted mb-3 mb-md-4 p-0 d-flex align-items-center gap-2 hover-opacity"
                >
                    <FiArrowLeft /> {getTranslate('backBtn')}
                </button>

                <div className="mb-4 mb-md-5 text-center text-md-start">
                    <h2 className="fs-3 fs-md-2 fw-bold text-dark mb-2">
                        {getTranslate('createCategoryTitle')}
                    </h2>
                    <p className="text-muted small">
                        {getTranslate('createCategoryDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-light p-3 p-md-5 rounded-4 border">
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>
                            {getTranslate('categoryUrlLabel')}
                        </label>
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-white border-end-0 shadow-none">
                                <FiLink className="text-primary" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 shadow-none ps-0"
                                placeholder="example-name"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="mt-2 small text-muted px-1 text-truncate">
                            /wikis/{wiki?.name}/categories/<strong>{name || '...'}</strong>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger border-0 small mb-4">
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
                            <><FiPlusCircle /> {getTranslate('createCategoryBtn')}</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateCategoryPage;