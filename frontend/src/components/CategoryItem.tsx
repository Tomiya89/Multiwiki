import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type CategoryWithTranslation from '../entities/Category';
import { FiChevronRight } from 'react-icons/fi';

import "./CategoryItem.css";

interface Props {
    category: CategoryWithTranslation;
    wikiName: string;
    currentLocale: string;
}

const CategoryItem = ({ category, wikiName, currentLocale }: Props) => {
    const [displayName] = useState(category?.translation?.title || category.name);

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