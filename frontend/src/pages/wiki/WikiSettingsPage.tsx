import React, { useEffect, useState } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useLocale } from '../../contexts/LocaleContext';
import { getFullImageURL } from '../../entities/Image';
import { FiBookOpen, FiImage, FiLink, FiTrash2, FiUpload } from 'react-icons/fi';
import ApiClient from '../../services/ApiClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import './WikiSettingsPage.css';

function WikiSettingsPage() {
    const { user, isLoading } = useAuth();
    const { wiki, staff, background, card, uploadBackground, deleteBackground, uploadCard, deleteCard, loading } = useWiki();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [newName, setNewName] = useState(wiki?.name || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoading) return;

        if (user == null)
            navigate('/login');

        if (wiki) 
            setNewName(wiki.name);
    }, [wiki, isLoading]);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (staff?.role !== 'OWNER' && !(user !== null && wiki !== null && user.id === wiki.userId)) {
        return (
            <div className="alert alert-danger shadow-sm rounded-4 mt-4">
                {getTranslate('accessDenied')}
            </div>
        );
    }

    const handleUpdateName = async () => {
        if (!wiki || newName === wiki.name) return;
        setSaving(true);
        setError('');
        try {
            await ApiClient.put(`/wikis/${wiki.name}`, { name: newName });
            navigate(`/wikis/${newName}/settings`);
        } catch (err: any) {
            const errorKey = err?.message || 'UNKNOWN_ERROR';
            setError(getTranslate(errorKey));
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'card') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        try {
            if (type === 'bg') await uploadBackground(file);
            else await uploadCard(file);
        } catch (err: any) {
            const errorKey = err?.message || 'UPLOAD_FAILED';
            setError(getTranslate(errorKey));
        }
    };

    return (
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
            <h2 className="fw-bold mb-4 px-2">{getTranslate('wikiSettings')}</h2>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 py-3 mx-2">
                    {error}
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3 p-md-4">
                    <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
                        <FiLink className="text-primary" /> {getTranslate('urlChangeTitle')}
                    </h5>
                    <p className="text-muted small">{getTranslate('urlChangeDescription')}</p>
                    
                    <div className="d-flex flex-column flex-md-row gap-2">
                        <div className="input-group">
                            <span className="input-group-text bg-light">/wikis/</span>
                            <input
                                type="text"
                                className="form-control"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                            />
                        </div>
                        <button
                            className="btn btn-primary px-4 w-100 w-md-auto"
                            onClick={handleUpdateName}
                            disabled={saving || !newName || newName === wiki?.name}
                        >
                            {saving ? <span className="spinner-border spinner-border-sm" /> : getTranslate('save')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-3 p-md-4">
                    <h5 className="fw-bold d-flex align-items-center gap-2 mb-4">
                        <FiImage className="text-primary" /> {getTranslate('visualSettings')}
                    </h5>

                    <div className="row g-3 g-md-4">
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-medium">{getTranslate('backgroundImage')}</label>
                            <div className="upload-zone position-relative rounded-3 border d-flex align-items-center justify-content-center overflow-hidden bg-light" style={{ height: '160px' }}>
                                {background ? (
                                    <div className="w-100 h-100 position-relative group">
                                        <img src={getFullImageURL(background)} className="w-100 h-100 object-fit-cover" alt="Background" />
                                        <button
                                            onClick={(e) => { e.preventDefault(); deleteBackground(); }}
                                            className="btn btn-danger btn-sm position-absolute shadow"
                                            style={{ top: '10px', right: '10px', zIndex: 10, borderRadius: '8px' }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-label d-flex flex-column align-items-center justify-content-center w-100 h-100 cursor-pointer m-0">
                                        <div className="upload-icon-wrapper mb-2">
                                            <FiUpload size={28} className="text-primary" />
                                        </div>
                                        <span className="small fw-bold text-secondary">{getTranslate('upload')}</span>
                                        <input type="file" className="d-none" accept="image/*" onChange={(e) => handleFileChange(e, 'bg')} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label fw-medium">{getTranslate('cardImage')}</label>
                            <div className="upload-zone position-relative rounded-3 border overflow-hidden shadow-sm" style={{ height: '230px', transition: 'all 0.3s' }}>
                                {card ? (
                                    <div className="w-100 h-100 bg-white">
                                        <img src={`${getFullImageURL(card)}`} className="w-100" alt="Preview" style={{ height: '160px', objectFit: 'cover' }} />
                                        <div className="p-3">
                                            <div className="bg-light rounded-pill" style={{ height: '15px', width: '60%' }}></div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); deleteCard(); }}
                                            className="btn btn-danger btn-sm position-absolute shadow"
                                            style={{ top: '10px', right: '10px', zIndex: 10, borderRadius: '8px' }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="upload-label d-flex flex-column w-100 h-100 cursor-pointer m-0 bg-white">
                                        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '160px' }}>
                                            <FiBookOpen size={48} className="text-muted opacity-25" />
                                        </div>
                                        <div className="p-3 border-top d-flex align-items-center justify-content-center gap-2 text-primary">
                                            <FiUpload />
                                            <span className="small fw-bold">{getTranslate('upload')}</span>
                                        </div>
                                        <input type="file" className="d-none" accept="image/*" onChange={(e) => handleFileChange(e, 'card')} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WikiSettingsPage;