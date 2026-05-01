import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCategory } from '../../../contexts/CategoryContext';
import { useWiki } from '../../../contexts/WikiContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { useAuth } from '../../../contexts/AuthContext';
import ApiClient from '../../../services/ApiClient';
import WikiInfobox from '../../../components/Infobox';
import parseHeadings from "../../../functions/parseHeadings";
import Article from '../../../entities/Article';
import Locale from "../../../entities/Locale";

import {
    FiEdit3,
    FiAlertCircle,
    FiGlobe,
    FiSettings,
    FiFileText,
    FiChevronRight,
    FiPlus
} from 'react-icons/fi';

import "./CategoryPage.css";

interface ArticleWithTranslation extends Article {
    translation?: {
        title: string;
    } | null;
}

function CategoryPage() {
    const { user } = useAuth();
    const { wiki, staff, loading: wikiLoading } = useWiki();
    const { category, translation, availableTranslations, loading: catLoading } = useCategory();
    const { setLocale, currentLocale, languages, getTranslate } = useLocale();
    const navigate = useNavigate();

    const [articles, setArticles] = useState<ArticleWithTranslation[]>([]);
    const [articlesLoading, setArticlesLoading] = useState(true);

    useEffect(() => {
        if (!wiki || !category) return;

        const loadArticlesWithTranslations = async () => {
            setArticlesLoading(true);
            try {
                const baseArticles = await ApiClient.get<Article[]>(
                    `/wikis/${wiki?.name}/categories/${category?.name}/articles`
                );

                const enriched = await Promise.all(
                    baseArticles.map(async (art) => {
                        try {
                            const transData = await ApiClient.get<{ title: string }>(
                                `/wikis/${wiki?.name}/categories/${category?.name}/articles/${art.name}/translations/${currentLocale}`
                            );
                            return { ...art, translation: transData };
                        } catch (err) {
                            return { ...art, translation: null };
                        }
                    })
                );

                setArticles(enriched);
            } catch (err) {
                console.error("Error loading articles or translations:", err);
            } finally {
                setArticlesLoading(false);
            }
        };

        loadArticlesWithTranslations();
    }, [wiki, category, currentLocale]);

    const { processedHtml, headings } = useMemo(() => {
        if (!translation?.body) return { processedHtml: '', headings: [] };
        return parseHeadings(translation.body);
    }, [translation?.body, translation?.id]);

    const groupedArticles = useMemo(() => {
        const getTitle = (art: ArticleWithTranslation) => art.translation?.title || art.name;
        const sorted = [...articles].sort((a, b) =>
            getTitle(a).localeCompare(getTitle(b), currentLocale)
        );

        const groups: Record<string, ArticleWithTranslation[]> = {};
        sorted.forEach(art => {
            const title = getTitle(art);
            const letter = title[0]?.toUpperCase() || '#';
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(art);
        });
        return groups;
    }, [articles, currentLocale]);

    const isAuthor = (staff?.role === 'AUTHOR' || staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId));

    if (catLoading || wikiLoading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (!category) return null;

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${id}`);
        }
    };

    return (
        <div className="category-page-wrapper py-4">
            <div className="container-fluid px-md-5" style={{ maxWidth: '1600px' }}>
                <div className="row g-4">

                    <aside className="col-xl-2 col-lg-3 d-none d-lg-block">
                        {(headings.length > 0 || articles.length > 0) && translation && (
                            <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
                                <h6 className="text-uppercase fw-bold text-muted mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                    {getTranslate('toc')}
                                </h6>
                                <nav className="nav flex-column border-start border-2 border-light">
                                    {headings.map((h) => (
                                        <a key={h.id} href={`#${h.id}`} onClick={(e) => handleNavClick(e, h.id)}
                                            className={`nav-link py-1 toc-link ${h.level === 'h3' ? 'ms-3 small opacity-75' : 'fw-medium'}`}>
                                            {h.text}
                                        </a>
                                    ))}
                                    {articles.length > 0 && (
                                        <a href="#articles-section" onClick={(e) => handleNavClick(e, 'articles-section')}
                                            className="nav-link py-1 toc-link fw-bold text-primary mt-2">
                                            {getTranslate('articles')}
                                        </a>
                                    )}
                                </nav>
                            </div>
                        )}
                    </aside>

                    <main className={headings.length > 0 ? "col-xl-10 col-lg-9 col-12" : "col-12"}>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <nav aria-label="breadcrumb" className="mb-1">
                                    <ol className="breadcrumb mb-0" style={{ fontSize: '0.9rem' }}>
                                        <li className="breadcrumb-item text-muted">{getTranslate('category')}</li>
                                    </ol>
                                </nav>
                                <h1 className="display-5 fw-bold m-0 text-dark tracking-tighter">
                                    {translation?.title || category.name}
                                </h1>
                            </div>

                            {isAuthor && (
                                <div className="d-flex gap-2">
                                    <button
                                        onClick={() => navigate(`/wikis/${wiki?.name}/categories/${category?.name}/articles/create`)}
                                        className="btn btn-primary rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                                    >
                                        <FiPlus size={20} />
                                        <span>{getTranslate('createArticleTitle')}</span>
                                    </button>
                                    <button onClick={() => navigate(`/wikis/${wiki?.name}/categories/${category?.name}/settings`)}
                                        className="btn btn-outline-secondary rounded-pill px-3 shadow-sm">
                                        <FiSettings />
                                    </button>
                                    <button onClick={() => navigate(`/wikis/${wiki?.name}/categories/${category?.name}/edit`)}
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
                                        <WikiInfobox
                                            infoboxDataString={translation.infoboxData}
                                            title={translation.title}
                                        />
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

                        <section id="articles-section" className="mt-5 pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold m-0 d-flex align-items-center gap-2">
                                    <FiFileText className="text-primary" />
                                    {getTranslate('articlesInCategory')}
                                </h3>
                            </div>

                            {articlesLoading ? (
                                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                            ) : articles.length === 0 ? (
                                <div className="p-5 text-center bg-white rounded-4 shadow-sm border border-dashed">
                                    <p className="text-muted mb-0">{getTranslate('categoryArticlesEmpty')}</p>
                                </div>
                            ) : (
                                <div className="articles-list">
                                    {Object.keys(groupedArticles).map(letter => (
                                        <div key={letter} className="mb-5">
                                            <h2 className="letter-group-title">{letter}</h2>
                                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                                                {groupedArticles[letter].map(art => (
                                                    <div className="col" key={art.id}>
                                                        <Link to={`/wikis/${wiki?.name}/categories/${category?.name}/articles/${art.name}`}
                                                            className="text-decoration-none h-100 d-block">
                                                            <div className="card h-100 border-0 shadow-sm rounded-3 article-card-hover">
                                                                <div className="card-body d-flex align-items-center justify-content-between py-3">
                                                                    <span className="fw-semibold text-dark">
                                                                        {art.translation?.title || art.name}
                                                                    </span>
                                                                    <FiChevronRight className="text-muted" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;