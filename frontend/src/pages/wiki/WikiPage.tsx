import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useLocale } from '../../contexts/LocaleContext';
import { FiEdit3, FiAlertCircle, FiGlobe } from 'react-icons/fi';
import type Locale from "../../entities/Locale";
import { useAuth } from '../../contexts/AuthContext';
import WikiInfobox from '../../components/Infobox';
import parseHeadings from "../../functions/parseHeadings";
import MessageList from '../../components/MessageList';

function WikiPage() {
    const { user } = useAuth();
    const { wiki, translation, staff, availableTranslations, loading } = useWiki();
    const { setLocale, currentLocale, languages, getTranslate } = useLocale();
    const navigate = useNavigate();

    const { processedHtml, headings } = useMemo(() => {
        if (!translation?.body) return { processedHtml: '', headings: [] };
        return parseHeadings(translation.body);
    }, [translation?.body, translation?.id]);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (!wiki) return null;

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${id}`);
        }
    };

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    return (
        <div className="wiki-page-wrapper py-4">
            <div className="container-fluid px-md-5" style={{ maxWidth: '1600px' }}>
                <div className="row g-4">
                    <aside className="col-xl-2 col-lg-2 d-none d-lg-block">
                       
                            <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
                                <div className="toc-wrapper">
                                    <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                        {getTranslate('toc')}
                                    </h6>
                                {headings.length > 0 && (
                                    <nav className="nav flex-column border-start border-2 border-light">
                                        {headings.map((h) => (
                                            <a
                                                key={h.id}
                                                href={`#${h.id}`}
                                                onClick={(e) => handleNavClick(e, h.id)}
                                                className={`nav-link py-1 toc-link ${h.level === 'h3' ? 'ms-3 small opacity-75' : 'fw-medium'}`}
                                                style={{ fontSize: '0.85rem' }}
                                            >
                                                {h.text}
                                            </a>
                                        ))}
                                        <a href="#comments-section" onClick={(e) => handleNavClick(e, 'comments-section')}
                                            className="nav-link py-1 toc-link fw-bold text-primary mt-2">
                                            {getTranslate('comments')}
                                        </a>
                                    </nav>
                                )}
                                </div>
                            </div>
                    </aside>

                    <main className="col-xl-10 col-lg-9 col-12">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h1 className="display-5 fw-bold m-0 text-dark">{translation?.title || wiki.name}</h1>
                            {isAuthor && (
                                <button
                                    onClick={() => navigate(`/wikis/${wiki.name}/edit`)}
                                    className="btn btn-primary rounded-pill px-4 shadow-sm"
                                >
                                    <FiEdit3 className="me-2" /> {getTranslate('edit')}
                                </button>
                            )}
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-body p-4 p-lg-5">
                                {translation ? (
                                    <div className="wiki-main-layout">
                                        <WikiInfobox
                                            infoboxDataString={translation.infoboxData}
                                            title={translation.title}
                                        />

                                        <article
                                            key={translation.id} //
                                            className="wiki-article-body"
                                            dangerouslySetInnerHTML={{ __html: processedHtml }}
                                        />
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
                        <MessageList apiUrl={`/wikis/${wiki?.name}/messages`} />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default WikiPage;