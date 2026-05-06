import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useLocale } from '../../contexts/LocaleContext';
import Editor from '../../components/Editor';
import InfoboxEditor from '../../components/InfoboxEditor';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

import "./WikiEditorPage.css";
import { useAuth } from '../../contexts/AuthContext';

function WikiEditorPage() {
    const { user, isLoading } = useAuth();
    const { wiki, translation, staff, saveTranslation, loading } = useWiki();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [infobox, setInfobox] = useState({
        mainImage: null as string | null,
        fields: [] as any[],
        sections: [] as any[]
    });

    useEffect(() => {
        if (isLoading) return;

        if (user == null)
            navigate('/login');

        if (translation) {
            setTitle(translation.title || '');
            setContent(translation.body || '');
            try {
                const data = JSON.parse(translation.infoboxData || '{}');
                setInfobox({
                    mainImage: data.mainImage || null,
                    fields: data.fields || [],
                    sections: data.sections || []
                });
            } catch (e) {
                console.error("Failed to parse infoboxData", e);
            }
        }
    }, [translation, isLoading]);

    const handleSave = async () => {
        const fullData = {
            title,
            body: content,
            infoboxData: JSON.stringify({
                mainImage: infobox.mainImage,
                fields: infobox.fields.filter(f => f.key.trim() || f.value.trim()),
                sections: infobox.sections.filter(s => s.title.trim() || s.items.length > 0)
            })
        };
        await saveTranslation(fullData);
        navigate(`/wikis/${wiki?.name}`);
    };

    if (staff?.role !== 'OWNER' && staff?.role !== 'AUTHOR' && !(user !== null && wiki !== null && user.id === wiki.userId)) {
        return (
            <div className="alert alert-danger shadow-sm rounded-4 mt-4">
                {getTranslate('accessDenied')}
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center gap-2 fw-medium"
                >
                    <FiArrowLeft /> <span className="d-none d-sm-inline">{getTranslate('backBtn')}</span>
                </button>

                <button
                    className="btn btn-primary rounded-pill px-3 px-md-4 shadow-sm fw-bold"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm me-md-2" />
                    ) : (
                        <FiSave className="me-md-2" />
                    )}
                    <span className="d-none d-md-inline">{getTranslate('save')}</span>
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white">
                        <input
                            className="form-control form-control-lg border-0 bg-transparent fw-bold mb-3 p-0"  
                            style={{ fontSize: '1.5rem', outline: 'none', boxShadow: 'none' }}
                            placeholder={getTranslate('editNameWiki')}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        <Editor value={content} onChange={setContent} />
                    </div>
                </div>

                <div className="col-lg-4">
                    <InfoboxEditor data={infobox} onChange={setInfobox} />
                </div>
            </div>
        </div>
    );
}

export default WikiEditorPage;