import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiClient from '../services/ApiClient';
import type Category from '../entities/Category';
import type Translation from "../entities/Translation";
import { FiChevronRight } from 'react-icons/fi';

import "./CategoryItem.css";

interface Props {
    category: Category;
    wikiName: string;
    currentLocale: string;
}

const CategoryItem = ({ category, wikiName, currentLocale }: Props) => {
    const [displayName, setDisplayName] = useState(category.name);

    useEffect(() => {
        const fetchTranslation = async () => {
            try {
                const trans = await ApiClient.get<Translation>(
                    `/wikis/${wikiName}/categories/${category.name}/translations/${currentLocale}`
                );
                if (trans?.title) {
                    setDisplayName(trans?.title);
                }
            } catch {
                setDisplayName(category.name);
            }
        };
        fetchTranslation();
    }, [category.name, wikiName, currentLocale]);

    return (
        <Link
            to={`/wikis/${wikiName}/categories/${category.name}`}
            className="category-card-link text-decoration-none"
        >
            <div className="category-item-card p-3 h-100 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                    <div className="d-flex flex-column overflow-hidden">
                        <span className="category-title text-dark fw-bold text-truncate">
                            {displayName}
                        </span>

                        {displayName === category.name ? (
                            <span className="category-badge-original">
                                {category.name}
                            </span>
                        ) : (
                            <span className="text-muted small opacity-50 font-monospace">
                                #{category.id}
                            </span>
                        )}
                    </div>
                </div>

                <FiChevronRight className="arrow-icon text-primary opacity-0" />
            </div>
        </Link>
    );
};

export default CategoryItem;