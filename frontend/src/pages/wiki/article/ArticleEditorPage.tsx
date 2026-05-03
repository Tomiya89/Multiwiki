import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useArticle } from '../../../contexts/ArticleContext';
import { useLocale } from '../../../contexts/LocaleContext';
import Editor from '../../../components/Editor';
import InfoboxEditor from '../../../components/InfoboxEditor';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useWiki } from '../../../contexts/WikiContext';
import { useCategory } from '../../../contexts/CategoryContext';
import { useAuth } from '../../../contexts/AuthContext';

import "./ArticleEditorPage.css";

function ArticleEditorPage() {
    const { user, isLoading } = useAuth();
    const { wiki, staff, loading: wikiLoading} = useWiki();
    const { category, loading: catLoading} = useCategory();
    const { article, translation, saveTranslation, loading } = useArticle();
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
                console.error("Failed to parse article infoboxData", e);
            }
        }
    }, [translation, user, isLoading]);

    const handleSave = async () => {
        const payload = {
            title,
            body: content,
            infoboxData: JSON.stringify({
                mainImage: infobox.mainImage,
                fields: infobox.fields.filter(f => f.key?.trim() || f.value?.trim()),
                sections: infobox.sections.filter(s => s.title?.trim() || s.items?.length > 0)
            })
        };

        await saveTranslation(payload as any);
        navigate(`/wikis/${wiki?.name}/categories/${category?.name}/articles/${article?.name}`);
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
        <div className="container-fluid py-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center gap-2 fw-medium"
                >
                    <FiArrowLeft /> {getTranslate('backBtn')}
                </button>
                <button
                    className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <FiSave className="me-2" />}
                    {getTranslate('save')}
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <input
                            className="form-control form-control-lg border-0 bg-transparent fw-bold mb-3 p-0"
                            style={{ fontSize: '2.5rem', outline: 'none', boxShadow: 'none' }}
                            placeholder={getTranslate("editNameArticle")}
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

export default ArticleEditorPage;