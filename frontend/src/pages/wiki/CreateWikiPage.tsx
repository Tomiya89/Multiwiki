import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../contexts/LocaleContext';
import { FiPlusCircle, FiType, FiLink, FiArrowLeft } from 'react-icons/fi';
import ApiClient from '../../services/ApiClient'; 
import type Wiki from "../../entities/Wiki";

function CreateWikiPage() {
    const navigate = useNavigate();
    const { getTranslate } = useLocale();

    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await ApiClient.post<Wiki>('/wikis', {
                name: url
            });

            navigate('/wikis/' + url);
        } catch (error: any) {
            const errorKey = error?.message || 'UNKNOWN_ERROR';
            setError(getTranslate(errorKey));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container d-flex align-items-center justify-content-center animate-fade-in">
            <div className="card shadow-lg border-0 auth-card" style={{ maxWidth: '480px', width: '100%' }}>
                <div className="card-body p-5">

                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2"
                    >
                        <FiArrowLeft /> {getTranslate('backBtn')}
                    </button>

                    <div className="text-center mb-4">
                        <div className="auth-icon-circle bg-primary text-white mb-3 mx-auto shadow-sm">
                            <FiPlusCircle size={30} />
                        </div>
                        <h2 className="fw-bold">{getTranslate('createWikiTitle')}</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 text-start">
                            <label className="form-label small fw-bold text-muted">{getTranslate('wikiUrlLabel')}</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0"><FiLink className="text-primary" /></span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    placeholder="my-wiki-link"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                    required
                                />
                            </div>
                            <div className="form-text small opacity-50 px-1">
                                /wikis/<strong>{url}</strong>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-danger border-0 small mb-4 py-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <><FiPlusCircle /> {getTranslate('createBtn')}</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateWikiPage;