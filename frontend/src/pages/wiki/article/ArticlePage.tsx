import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useArticle } from '../../../contexts/ArticleContext';
import { useWiki } from '../../../contexts/WikiContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { useAuth } from '../../../contexts/AuthContext';
import WikiInfobox from '../../../components/Infobox';
import parseHeadings from "../../../functions/parseHeadings";

import {
    FiEdit3,
    FiAlertCircle,
    FiSettings,
    FiChevronLeft,
    FiGlobe
} from 'react-icons/fi';
import Locale from '../../../entities/Locale';
import MessageList from '../../../components/MessageList';

function ArticlePage() {
    const { user } = useAuth();
    const { wiki, staff } = useWiki();
    const { article, translation, availableTranslations, loading, error } = useArticle();
    const { setLocale, currentLocale, languages, getTranslate } = useLocale();
    const { wikiName, categoryName, articleName } = useParams();
    const navigate = useNavigate();

    const { processedHtml, headings } = useMemo(() => {
        if (!translation?.body) return { processedHtml: '', headings: [] };
        return parseHeadings(translation.body);
    }, [translation?.body, translation?.id]);

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    if (error || !article) {
        return (
            <div className="container py-5 text-center">
                <FiAlertCircle size={64} className="text-danger mb-4" />
                <h2 className="fw-bold">{error || getTranslate('articleNotFound')}</h2>
                <button onClick={() => navigate(-1)} className="btn btn-outline-primary mt-3">
                    <FiChevronLeft /> {getTranslate('goBack')}
                </button>
            </div>
        );
    }

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${id}`);
        }
    };

    return (
        <div className="article-page-wrapper py-4">
            <div className="container-fluid px-md-5" style={{ maxWidth: '1600px' }}>
                <div className="row g-4">

                    <aside className="col-xl-2 col-lg-3 d-none d-lg-block">
                        <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                {getTranslate('toc')}
                            </h6>
                            {headings.length > 0 && (
                                <nav className="nav flex-column border-start border-2 border-light">
                                    {headings.map((h) => (
                                        <a key={h.id} href={`#${h.id}`} onClick={(e) => handleNavClick(e, h.id)}
                                            className={`nav-link py-1 toc-link ${h.level === 'h3' ? 'ms-3 small opacity-75' : 'fw-medium'}`}>
                                            {h.text}
                                        </a>
                                    ))}
                                </nav>
                            )}
                            <a href="#comments-section" onClick={(e) => handleNavClick(e, 'comments-section')}
                                className="nav-link py-1 toc-link fw-bold text-primary mt-2">
                                {getTranslate('comments')}
                            </a>
                        </div>
                    </aside>

                    <main className="col-xl-10 col-lg-9 col-12">

                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <nav aria-label="breadcrumb" className="mb-1">
                                    <ol className="breadcrumb mb-0" style={{ fontSize: '0.9rem' }}>
                                        <li className="breadcrumb-item">
                                            <button onClick={() => navigate(`/wikis/${wikiName}/categories/${categoryName}`)}
                                                className="btn btn-link p-0 border-0 align-baseline text-decoration-none text-muted">
                                                {categoryName}
                                            </button>
                                        </li>
                                        <li className="breadcrumb-item active text-primary fw-medium" aria-current="page">
                                            {getTranslate('article')}
                                        </li>
                                    </ol>
                                </nav>
                                <h1 className="display-5 fw-bold m-0 text-dark tracking-tighter">
                                    {translation?.title || article.name}
                                </h1>
                            </div>

                            {isAuthor && (
                                <div className="d-flex gap-2">
                                    <button onClick={() => navigate(`/wikis/${wikiName}/categories/${categoryName}/articles/${articleName}/settings`)}
                                        className="btn btn-outline-secondary rounded-pill px-3 shadow-sm">
                                        <FiSettings />
                                    </button>
                                    <button onClick={() => navigate(`/wikis/${wikiName}/categories/${categoryName}/articles/${articleName}/edit`)}
                                        className="btn btn-primary rounded-pill px-4 shadow-sm">
                                        <FiEdit3 className="me-2" /> {getTranslate('edit')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                            <div className="card-body p-4 p-lg-5">
                                {translation ? (
                                    <div className="wiki-main-layout">
                                        {translation.infoboxData && (
                                            <WikiInfobox
                                                infoboxDataString={translation.infoboxData}
                                                title={translation.title}
                                            />
                                        )}
                                        <article className="wiki-article-body"
                                            dangerouslySetInnerHTML={{ __html: processedHtml }} />
                                    </div>
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
                        <MessageList apiUrl={`/wikis/${wiki?.name}/categories/${categoryName}/articles/${articleName}/messages`} />
                    </main>
                </div>
                
            </div>
        </div>
    );
}

export default ArticlePage;