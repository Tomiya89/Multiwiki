import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiHome } from 'react-icons/fi';
import { useLocale } from '../contexts/LocaleContext';

function NotFoundPage() {
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    return (
        <div className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <FiAlertCircle size={80} className="text-muted mb-4" />
            <h1 className="fw-bold display-1 text-dark mb-2">404</h1>
            <h3 className="text-muted mb-4">{getTranslate('pageNotFound')}</h3>

            <button
                onClick={() => navigate('/')}
                className="btn btn-primary rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
            >
                <FiHome /> {getTranslate('goHome')}
            </button>
        </div>
    );
}

export default NotFoundPage;