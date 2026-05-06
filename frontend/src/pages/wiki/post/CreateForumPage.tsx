import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWiki } from '../../../contexts/WikiContext';
import { useLocale } from '../../../contexts/LocaleContext';
import Editor from '../../../components/Editor';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import ApiClient from '../../../services/ApiClient';
import { useAuth } from '../../../contexts/AuthContext';

function CreateForumPage() {
    const { user, isLoading } = useAuth();
    const { wiki } = useWiki();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            alert(getTranslate('fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            await ApiClient.post(`/wikis/${wiki?.name}/posts`, {
                title,
                body: content
            });

            navigate(`/wikis/${wiki?.name}/forums`);
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoading) return;

        if (user == null)
            navigate('/login');
    }, [isLoading, user]);

    return (
        <div className="container py-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center gap-2 fw-medium"
                >
                    <FiArrowLeft />
                    <span className="d-none d-md-inline">{getTranslate('backBtn')}</span>
                </button>

                <button
                    className="btn btn-primary rounded-pill px-3 px-md-4 shadow-sm fw-bold"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm me-md-2" />
                    ) : (
                        <FiSave className="me-md-2" />
                    )}
                    <span className="d-none d-md-inline">{getTranslate('createPost')}</span>
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white mx-auto" style={{ maxWidth: '900px' }}>
                <input
                    className="form-control form-control-lg border-0 bg-transparent fw-bold mb-3 p-0"
                    style={{ fontSize: '1.5rem', outline: 'none', boxShadow: 'none' }}
                    placeholder={getTranslate('postTitlePlaceholder')}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <div className="mt-3">
                    <Editor
                        value={content}
                        onChange={setContent}
                        placeholder={getTranslate('postBodyPlaceholder')}
                    />
                </div>
            </div>
        </div>
    );
}

export default CreateForumPage;