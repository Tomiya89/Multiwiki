import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useWiki } from '../contexts/WikiContext';
import { useLocale } from '../contexts/LocaleContext';
import { FiMessageSquare, FiGrid, FiHome, FiSettings, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getFullImageURL } from '../entities/Image';

import "./WikiLayout.css";

function WikiLayout() {
    const { user } = useAuth();
    const { staff, wiki, background } = useWiki();
    const { getTranslate } = useLocale();
    const [isOpen, setIsOpen] = useState(false); // Состояние шторки

    const bgUrl = background ? getFullImageURL(background) : null;
    
    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <div className="wiki-layout-container">
            {/* Фоновое изображение */}
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

            {/* Кнопка открытия меню для мобилок */}
            <button className="mobile-menu-toggle d-lg-none" onClick={toggleSidebar}>
                {isOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Затемнение фона при открытой шторке */}
            {isOpen && <div className="sidebar-overlay d-lg-none" onClick={closeSidebar} />}

            <aside className={`wiki-sidebar ${isOpen ? 'open' : ''}`}>
                {wiki ? (
                    <div className="sidebar-sticky-wrapper">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3 px-2">
                            {getTranslate('navigation')}
                        </h6>
                        <ul className="nav flex-column gap-1">
                            <li className="nav-item">
                                <Link to={`/wikis/${wiki?.name}`} className="nav-link-custom hover-effect" onClick={closeSidebar}>
                                    <FiHome className="text-primary" /> {getTranslate('main')}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to={`/wikis/${wiki?.name}/forums`} className="nav-link-custom hover-effect" onClick={closeSidebar}>
                                    <FiMessageSquare className="text-primary" /> {getTranslate('forums')}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to={`/wikis/${wiki?.name}/categories`} className="nav-link-custom hover-effect" onClick={closeSidebar}>
                                    <FiGrid className="text-primary" /> {getTranslate('categories')}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to={`/wikis/${wiki?.name}/search`} className="nav-link-custom hover-effect" onClick={closeSidebar}>
                                    <FiSearch className="text-primary" /> {getTranslate('search')}
                                </Link>
                            </li>
                        </ul>

                        {(staff?.role === 'OWNER' || (user !== null && wiki !== null && user.id === wiki.userId)) && (
                            <>
                                <hr className="my-4 opacity-10" />
                                <h6 className="text-uppercase text-muted small fw-bold mb-3 px-2">
                                    {getTranslate('management')}
                                </h6>
                                <Link to={`/wikis/${wiki?.name}/settings`} className="nav-link-custom hover-effect" onClick={closeSidebar}>
                                    <FiSettings className="text-primary" /> {getTranslate('wikiSettings')}
                                </Link>
                                <Link to={`/wikis/${wiki?.name}/staffs`} className="nav-link-custom hover-effect" onClick={closeSidebar}>
                                    <FiSettings className="text-primary" /> {getTranslate('manageStaff')}
                                </Link>
                            </>
                        )}
                    </div>
                ) : <div />}
            </aside>

            <main className="wiki-main-content">
                <div className="mx-auto shadow-lg content-card">
                    {wiki ? <Outlet /> : <div className="text-center p-5">{getTranslate('wikiNotFound')}</div>}
                </div>
            </main>
        </div>
    );
};

export default WikiLayout;