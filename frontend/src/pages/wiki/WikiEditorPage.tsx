import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useLocale } from '../../contexts/LocaleContext';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Editor from '../../components/Editor';
import { useAuth } from '../../contexts/AuthContext';

function WikiEditorPage() {
    const { user } = useAuth();
    const { wiki, translation, staff, saveTranslation, loading } = useWiki();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (translation) {
            setTitle(translation.title || '');
            setContent(translation.body || '');
        }
    }, [translation]);

    const canEdit = staff && ['OWNER', 'AUTHOR'].includes(staff.role) || (user && wiki && user?.id === wiki.userId);

    if (!canEdit) return <div className="alert alert-danger">{getTranslate('accessDenied')}</div>;

    const handleSave = async () => {
        try {
            await saveTranslation({ title, body: content });
            navigate(`/wikis/${wiki?.name}`);
        } catch (err) {
            alert("Save failed");
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary rounded-pill">
                    <FiArrowLeft /> {getTranslate('back')}
                </button>
                <button 
                    className="btn btn-primary rounded-pill px-4 shadow"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <FiSave className="me-2" />}
                    {getTranslate('save')}
                </button>
            </div>

            <div className="bg-white bg-opacity-75 backdrop-blur rounded-4 p-4 shadow-sm">
                <input 
                    type="text"
                    className="form-control form-control-lg border-0 bg-transparent fw-bold mb-3"
                    style={{ fontSize: '2rem' }}
                    placeholder={getTranslate('titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                
                <Editor 
                    value={content} 
                    onChange={setContent} 
                    placeholder={getTranslate('startWriting')}
                />
            </div>
        </div>
    );
};

export default WikiEditorPage;