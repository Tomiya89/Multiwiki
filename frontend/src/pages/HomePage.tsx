import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { FiPlusCircle, FiBookOpen, FiGlobe, FiArrowRight } from 'react-icons/fi';

function HomePage() {
    const navigate = useNavigate();
    const { getTranslate } = useLocale();
    const [randomWikis, setRandomWikis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    
        setTimeout(() => {
            setRandomWikis([
                { id: 1, title: "История Рима", desc: "Все о великой империи", imageUrl: null },
                { id: 2, title: "Рецепты", desc: "Кулинарная книга сообщества", imageUrl: null },
                { id: 3, title: "C++ Guide", desc: "Справочник по системному программированию", imageUrl: null },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="home-page-wrapper">
            <header className="hero-container mb-5">
                <div className="card shadow-sm border-0 auth-card bg-primary text-white">
                    <div className="card-body p-5 text-center">
                        <div className="auth-icon-circle bg-white text-primary mb-3 mx-auto">
                            <FiGlobe size={32} />
                        </div>
                        <h1 className="fw-bold display-5">{getTranslate('heroTitle')}</h1>
                        <p className="opacity-75 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                            {getTranslate('heroDesc')}
                        </p>
                        <button
                            className="btn btn-light btn-lg fw-bold rounded-3 px-4 d-inline-flex align-items-center gap-2"
                            onClick={() => navigate('/create')}
                        >
                            <FiPlusCircle /> {getTranslate('createBtn')}
                        </button>
                    </div>
                </div>
            </header>

            <div className="container">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <FiBookOpen className="text-primary" size={24} />
                    <h2 className="fw-bold h4 mb-0">{getTranslate('featuredTitle')}</h2>
                </div>

                <div className="row">
                    {loading ? (
                        <div className="text-center py-5 w-100">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        randomWikis.map((wiki) => (
                            <div key={wiki.id} className="col-md-4 mb-4">
                                <div className="card shadow-sm border-0 h-100 auth-card">
                                    {wiki.imageUrl ? (
                                        <img src={wiki.imageUrl} className="card-img-top rounded-top-3" alt={wiki.title} style={{ height: '160px', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="bg-light d-flex align-items-center justify-content-center rounded-top-3" style={{ height: '160px' }}>
                                            <FiBookOpen size={48} className="text-muted opacity-25" />
                                        </div>
                                    )}

                                    <div className="card-body p-4 d-flex flex-column">
                                        <h5 className="fw-bold mb-2">{wiki.title}</h5>
                                        <p className="small text-muted flex-grow-1">{wiki.desc}</p>
                                        <button className="btn btn-outline-primary btn-sm rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 mt-3">
                                            {getTranslate('viewBtn')} <FiArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;