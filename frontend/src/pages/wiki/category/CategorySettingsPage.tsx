import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategory } from '../../../contexts/CategoryContext';
import { useWiki } from '../../../contexts/WikiContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { useAuth } from '../../../contexts/AuthContext';
import ApiClient from '../../../services/ApiClient';
import { FiLink, FiArrowLeft } from 'react-icons/fi';

function CategorySettingsPage() {
    const { user, isLoading } = useAuth();
    const { wiki, staff, loading: wikiLoading } = useWiki();
    const { category, loading: catLoading } = useCategory();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(''); 

    useEffect(() => {
        if (isLoading) return;

        if (user == null)
            navigate('/login');

        if (category)
            setNewName(category.name);
    }, [category, user, isLoading]);

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    if (catLoading || wikiLoading || isLoading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    if (!isAuthor) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger shadow-sm rounded-4">
                    {getTranslate('accessDenied')}
                </div>
            </div>
        );
    }

    const handleUpdateName = async () => {
        if (!category || !wiki || newName === category.name) return;

        setSaving(true);
        setError(''); 

        try {
            await ApiClient.put(`/wikis/${wiki?.name}/categories/${category.name}`, { name: newName });
            navigate(`/wikis/${wiki?.name}/categories/${newName}/settings`);
        } catch (err: any) {
            const errorKey = err?.message || 'UNKNOWN_ERROR';
            setError(getTranslate(errorKey));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container px-3 py-4" style={{ maxWidth: '800px' }}>
            <button
                onClick={() => navigate(`/wikis/${wiki?.name}/categories/${category?.name}`)}
                className="btn btn-link text-muted p-0 mb-3 text-decoration-none d-flex align-items-center gap-2"
            >
                <FiArrowLeft /> {getTranslate('backBtn')}
            </button>

            <h2 className="fw-bold mb-4 fs-3">{getTranslate('categorySettings')}</h2>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 py-3">
                    {error}
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
                        <FiLink className="text-primary" /> {getTranslate('urlChangeTitle')}
                    </h5>
                    <p className="text-muted small">
                        {getTranslate('categoryUrlChangeDescription')}
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <div className="input-group">
                            <span className="input-group-text bg-light text-muted small d-none d-md-flex">
                                .../categories/
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value.replace(/\s+/g, '-'))}
                                placeholder="new-category-name"
                            />
                        </div>
                        <button
                            className="btn btn-primary px-4 shadow-sm w-100 w-sm-auto"
                            onClick={handleUpdateName}
                            disabled={saving || !newName || newName === category?.name}
                        >
                            {saving ? (
                                <span className="spinner-border spinner-border-sm" />
                            ) : (
                                getTranslate('save')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategorySettingsPage;