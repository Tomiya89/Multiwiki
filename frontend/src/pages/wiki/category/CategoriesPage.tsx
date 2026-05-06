import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiClient from '../../../services/ApiClient';
import Category from '../../../entities/Category';
import CategoryWithTranslation from '../../../entities/Category';
import CategoryItem from '../../../components/CategoryItem';
import { useLocale } from '../../../contexts/LocaleContext';
import { useWiki } from '../../../contexts/WikiContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FiPlus } from 'react-icons/fi';

import "./CategoriesPage.css";

const CategoriesPage = () => {
    const navigate = useNavigate();
    const { wiki, staff } = useWiki();
    const { user } = useAuth();
    const { currentLocale, getTranslate } = useLocale();

    const [categories, setCategories] = useState<CategoryWithTranslation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!wiki?.name) return;

        const loadCategoriesWithTranslations = async () => {
            setLoading(true);
            try {
                const baseCategories = await ApiClient.get<Category[]>(`/wikis/${wiki.name}/categories`);

                const categories = baseCategories.map((cat) => {
                    for(const transl of cat?.translations){
                        if (transl?.locale === currentLocale)
                            return { ...cat, translation: transl };
                    }
                    return { ...cat, translation: null};
                });

                setCategories(categories);
            } catch (err) {
                console.error("Error loading categories or translations:", err);
            } finally {
                setLoading(false);
            }
        };

        loadCategoriesWithTranslations();
    }, [wiki?.name, currentLocale]);

    const grouped = useMemo(() => {
        const getTitle = (cat: CategoryWithTranslation) => cat.translation?.title || cat.name;

        const sorted = [...categories].sort((a, b) =>
            getTitle(a).localeCompare(getTitle(b), currentLocale)
        );

        const groups: Record<string, CategoryWithTranslation[]> = {};

        sorted.forEach(cat => {
            const title = getTitle(cat);
            const letter = title[0]?.toUpperCase() || '#';
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(cat);
        });

        return groups;
    }, [categories, currentLocale]);

    const isAuthor = staff?.role === 'AUTHOR' ||
        staff?.role === 'OWNER' ||
        (user && wiki && user.id === wiki.userId);

    if (loading) return (
        <div className="text-center p-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2 text-muted">{getTranslate('loading') || 'Загрузка...'}</p>
        </div>
    );

    if (!wiki) return null;

    return (
        <div className="categories-page-wrapper py-4">
            <div className="container-fluid px-3 px-md-5" style={{ maxWidth: '1600px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h2 display-md-5 fw-bold m-0 text-dark uppercase tracking-tighter">
                        {getTranslate('categories')}
                    </h1>
                    {isAuthor && (
                        <button
                            onClick={() => navigate(`/wikis/${wiki.name}/categories/create`)}
                            className="btn btn-primary rounded-pill px-3 px-md-4 shadow-sm d-flex align-items-center gap-2"
                        >
                            <FiPlus size={20} />
                            <span className="d-none d-md-inline">{getTranslate('createCategoryTitle')}</span>
                        </button>
                    )}
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-4 p-lg-5">
                        {Object.keys(grouped).length === 0 ? (
                            <div className="text-center py-5">
                                <p className="text-muted fs-5">{getTranslate('categoriesEmpty')}</p>
                            </div>
                        ) : (
                            <div className="categories-list">
                                {Object.keys(grouped).map(letter => (
                                    <div key={letter} className="mb-4 mb-md-5">
                                        <h2 className="letter-group-title">{letter}</h2>
                                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                                            {grouped[letter].map(cat => (
                                                <div className="col" key={cat.id}>
                                                    <CategoryItem
                                                        category={cat}
                                                        wikiName={wiki.name}
                                                        currentLocale={currentLocale}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;