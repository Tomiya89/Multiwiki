import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useWiki } from '../contexts/WikiContext';
import { useLocale } from '../contexts/LocaleContext';
import { FiMessageSquare, FiGrid, FiHome, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getFullImageURL } from '../entities/Image';

import "./WikiLayout.css";

function WikiLayout() {
    const { user } = useAuth();
    const { staff, wiki, background } = useWiki();
    const { getTranslate } = useLocale();

    const bgUrl = background ? getFullImageURL(background) : null;

    return (
        <div className="d-flex flex-column flex-lg-row position-relative" style={{ minHeight: 'calc(100vh - 72px)' }}>
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
                className="wiki-sidebar border-end py-4 px-3"
                style={{
                    width: '260px',
                    flexShrink: 0,
                    zIndex: 2,
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
                            <Link to={`/wikis/${wiki?.name}`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiHome className="text-primary" /> {getTranslate('main')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={`/wikis/${wiki?.name}/forums`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiMessageSquare className="text-primary" /> {getTranslate('forums')}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={`/wikis/${wiki?.name}/categories`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
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
                            <Link to={`/wikis/${wiki?.name}/settings`} className="nav-link text-dark d-flex align-items-center gap-2 rounded p-2 hover-effect">
                                <FiSettings className="text-primary" /> {getTranslate('wikiSettings')}
                            </Link>
                        </>
                    )}
                </div>
            </aside>
            <main className="flex-grow-1 p-2 p-md-4" style={{ zIndex: 1, minWidth: 0 }}>
                <div
                    className="mx-auto shadow-lg content-card"
                    style={{
                        maxWidth: '1600px',
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '24px',
                        minHeight: '100%',
                        padding: 'clamp(1rem, 3vw, 2.5rem)'
                    }}
                >
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default WikiLayout;