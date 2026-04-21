import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useLocale } from '../../contexts/LocaleContext';
import { FiEdit3, FiAlertCircle, FiGlobe } from 'react-icons/fi';
import type Locale from "../../entities/Locale";
import { useAuth } from '../../contexts/AuthContext';

function WikiPage() {
    const { user } = useAuth();
    const { wiki, translation, staff, availableTranslations, loading } = useWiki();
    const { setLocale, currentLocale, languages, getTranslate } = useLocale();
    const navigate = useNavigate();

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (!wiki) return null;

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    return (
        <div className="wiki-page-container mx-auto" style={{ maxWidth: '900px' }}>

            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="display-6 fw-bold mb-1">
                        {translation?.title || wiki.name}
                    </h1>
                </div>

                {isAuthor && (
                    <button
                        onClick={() => navigate(`/wikis/${wiki.name}/edit`)}
                        className="btn btn-primary d-flex align-items-center gap-2"
                    >
                        <FiEdit3 /> {getTranslate('edit')}
                    </button>
                )}
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                    {translation ? (
                        <article
                            className="wiki-article-body fs-5"
                            dangerouslySetInnerHTML={{ __html: translation.body }}
                            style={{ lineHeight: '1.7', color: '#1a202c' }}
                        />
                    ) : (
                        <div className="text-center py-5">
                            <FiAlertCircle size={48} className="text-warning mb-3" />
                            <h3 className="fw-bold">{getTranslate('translationNotFound')}</h3>
                                <p className="text-muted mb-4">
                                    {getTranslate('noContentForLang')}{' '}
                                    <strong>
                                        {languages.find((lang: Locale) => lang.locale === currentLocale)?.name || currentLocale.toUpperCase()}
                                    </strong>.
                                </p>

                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                {availableTranslations.length > 0 ? (
                                    availableTranslations.map(t => (
                                        <button
                                            key={t.id}
                                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                                            onClick={() => setLocale(t.locale)}
                                        >
                                            <FiGlobe /> {t.locale.toUpperCase()}: {t.title}
                                        </button>
                                    ))
                                ) : (
                                    <p className="small text-danger">{getTranslate('noAvailableTranslations')}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WikiPage;