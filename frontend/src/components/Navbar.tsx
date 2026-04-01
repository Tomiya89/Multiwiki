import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { getFullImageURL } from "../entities/Image";

import { FiGlobe, FiUser, FiLogOut, FiMenu, FiX, FiChevronDown } from "react-icons/fi";

import './Navbar.css';

function Navbar() {
    const { getTranslate, languages, currentLocale, setLocale } = useLocale();
    const { user, avatar, isAuthenticated, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const userDropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (userDropdownRef.current && !userDropdownRef.current.contains(target))
                setIsUserDropdownOpen(false);
            if (langDropdownRef.current && !langDropdownRef.current.contains(target)) 
                setIsLangDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
        setIsLangDropdownOpen(false);
        document.body.style.overflow = 'unset';
    }, [location.pathname]);

    const handleLogout = async (e: React.MouseEvent) => {
        console.log("!#!@#KDASPODP");
        e.preventDefault();
        e.stopPropagation();

        setIsUserDropdownOpen(false);

        await logout();
        navigate("/");
    };

    const getAvatarUrl = () => avatar ? getFullImageURL(avatar) : null;
    const getInitial = () => user?.username?.charAt(0).toUpperCase() || "?";

    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        document.body.style.overflow = newState ? 'hidden' : 'unset';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
            <div className="container-fluid px-4">

                <div className="d-flex align-items-center">
                    <div className="dropdown me-3" ref={langDropdownRef}>
                        <button
                            className="btn btn-light btn-sm d-flex align-items-center gap-2 border shadow-sm"
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                        >
                            <FiGlobe className="text-primary" />
                            <span className="fw-bold">{currentLocale.toUpperCase()}</span>
                        </button>

                        <ul className={`dropdown-menu shadow border-0 mt-2 ${isLangDropdownOpen ? 'show' : ''}`}>
                            {languages.map((lang) => (
                                <li key={lang.locale}>
                                    <button
                                        className={`dropdown-item ${currentLocale === lang.locale ? 'active bg-primary text-white' : ''}`}
                                        onClick={() => {
                                            setLocale(lang.locale);
                                            setIsLangDropdownOpen(false);
                                        }}
                                    >
                                        {lang.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    {isLoading ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    ) : isAuthenticated && user ? (
                        <div className="dropdown" ref={userDropdownRef}>
                            <div
                                className="d-flex align-items-center gap-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            >
                                <span className="d-none d-md-block fw-medium text-dark">{user.username}</span>
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow"
                                    style={{ width: 40, height: 40, overflow: 'hidden' }}>
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()!} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <span className="fw-bold">{getInitial()}</span>
                                    )}
                                </div>
                                <FiChevronDown className={`text-muted transition-all ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isUserDropdownOpen ? 'show' : ''}`}
                                style={{ position: 'absolute', right: 0, left: 'auto' }}>
                                <li className="dropdown-header border-bottom mb-1 pb-2">
                                    <div className="fw-bold text-dark">{user.username}</div>
                                </li>
                                <li>
                                    <Link to="/profile" className="dropdown-item d-flex align-items-center gap-2 py-2">
                                        <FiUser /> {getTranslate('profile')}
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button onClick={handleLogout} className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger">
                                        <FiLogOut /> {getTranslate('logout')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="d-none d-lg-flex gap-2">
                            <button className="btn btn-link text-dark text-decoration-none fw-medium" onClick={() => navigate("/login")}>
                                {getTranslate('login')}
                            </button>
                            <button className="btn btn-primary px-4 rounded-pill shadow-sm" onClick={() => navigate("/register")}>
                                {getTranslate('register')}
                            </button>
                        </div>
                    )}

                    <button
                        className="btn btn-light d-lg-none border-0 shadow-sm"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            <aside className={`mobile-sidebar bg-white shadow-lg ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="p-4 h-100 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold text-primary mb-0">Menu</h4>
                        <button className="btn btn-light rounded-circle" onClick={toggleMobileMenu}><FiX size={24} /></button>
                    </div>

                    <div className="mobile-section mb-4">
                        <h6 className="text-uppercase text-muted small fw-bold mb-3">{getTranslate('selectLang')}</h6>
                        <div className="row g-2">
                            {languages.map(lang => (
                                <div className="col-6" key={lang.locale}>
                                    <button
                                        className={`btn btn-sm w-100 py-2 border ${currentLocale === lang.locale ? 'btn-primary' : 'btn-light'}`}
                                        onClick={() => setLocale(lang.locale)}
                                    >
                                        {lang.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="nav flex-column gap-3 mb-auto">
                        <Link to="/" className="h5 text-dark text-decoration-none border-bottom pb-2">{getTranslate('home')}</Link>
                        {isAuthenticated && <Link to="/profile" className="h5 text-dark text-decoration-none border-bottom pb-2">{getTranslate('profile')}</Link>}
                    </div>

                    <div className="mt-4 pt-4 border-top">
                        {isAuthenticated ? (
                            <button className="btn btn-danger w-100 py-3 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                                <FiLogOut /> {getTranslate('logout')}
                            </button>
                        ) : (
                            <div className="d-grid gap-2">
                                <button className="btn btn-outline-primary py-2" onClick={() => navigate("/login")}>{getTranslate('login')}</button>
                                <button className="btn btn-primary py-2" onClick={() => navigate("/register")}>{getTranslate('register')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu} />}
        </nav>
    );
}

export default Navbar;