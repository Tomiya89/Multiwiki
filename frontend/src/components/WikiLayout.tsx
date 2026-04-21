import React from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { useWiki } from '../contexts/WikiContext';
import { useLocale } from '../contexts/LocaleContext';
import { FiMessageSquare, FiGrid, FiHome, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getFullImageURL } from '../entities/Image'; // Импортируем утилиту

const WikiLayout: React.FC = () => {
    const { user } = useAuth();
    const { staff, wiki, background } = useWiki();
    const { getTranslate } = useLocale();
    const { wikiName } = useParams();

    const bgUrl = background ? getFullImageURL(background) : null;

    return (
        <div className="d-flex position-relative" style={{ minHeight: 'calc(100vh - 72px)' }}>

            {bgUrl && (
                <div
                    className="position-fixed inset-0 w-100 h-100"
                    style={{
                        backgroundImage: `url(${bgUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                        zIndex: -1
                    }}
                />
            )}

            <aside
                className="border-end py-4 px-3"
                style={{
                    width: '260px',
                    flexShrink: 0,
                    zIndex: 1,
                    backgroundColor: 'rgba(248, 249, 250, 0.8)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <div className="sticky-top" style={{ top: '90px' }}>
                    <h6 className="text-uppercase text-muted small fw-bold mb-3 px-2">
                        {getTranslate('navigation')}
                    </h6>
                    <ul className="nav flex-column gap-1">
                        <li className="nav-item">
                            <Link to={`/wikis/${wikiName}`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiHome className="text-primary" /> {getTranslate('main')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={`/wikis/${wikiName}/forums`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiMessageSquare className="text-primary" /> {getTranslate('forums')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={`/wikis/${wikiName}/categories`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiGrid className="text-primary" /> {getTranslate('categories')}
                            </Link>
                        </li>
                    </ul>

                    {(staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId)) && (
                        <>
                            <hr className="my-4 opacity-10" />
                            <h6 className="text-uppercase text-muted small fw-bold mb-3 px-2">
                                {getTranslate('management')}
                            </h6>
                            <Link to={`/wikis/${wikiName}/settings`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiSettings className="text-primary" /> {getTranslate('wikiSettings')}
                            </Link>
                        </>
                    )}
                </div>
            </aside>

            <main className="flex-grow-1 p-4" style={{ zIndex: 1 }}>
                <div
                    className="mx-auto shadow-lg"
                    style={{
                        maxWidth: '1200px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '24px',
                        minHeight: '100%',
                        padding: '2rem'
                    }}
                >
                    <Outlet />
                </div>
            </main>
            <style>{`
                .hover-effect {
                    transition: all 0.2s ease;
                }
                .hover-effect:hover {
                    background-color: rgba(13, 110, 253, 0.1);
                    color: #0d6efd !important;
                    transform: translateX(5px);
                }
            `}</style>
        </div>
    );
};

export default WikiLayout;