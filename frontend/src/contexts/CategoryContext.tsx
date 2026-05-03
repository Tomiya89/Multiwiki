import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import ApiClient from '../services/ApiClient';
import { useLocale } from './LocaleContext';
import type Category from "../entities/Category";
import type Translation from "../entities/Translation";
import type TranslationDTO from "../entities/Translation";

interface CategoryContextType {
    category: Category | null;
    translation: Translation | null;
    availableTranslations: TranslationDTO[];
    loading: boolean;
    error: string | null;
    saveTranslation: (data: { title: string; description: string }) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { getTranslate, currentLocale } = useLocale();

    const [category, setCategory] = useState<Category | null>(null);
    const [translation, setTranslation] = useState<Translation | null>(null);
    const [availableTranslations, setAvailableTranslations] = useState<TranslationDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const match = matchPath(
            { path: "/wikis/:wikiName/categories/:categoryName/*" },
            location.pathname
        );

        const wikiName = match?.params.wikiName;
        const categoryName = match?.params.categoryName;

        if (!wikiName || !categoryName || categoryName === 'create') {
            setCategory(null);
            setTranslation(null);
            setAvailableTranslations([]);
            setError(null);
            return;
        }

        const fetchCategoryData = async () => {
            const isSameCategory = category && category.name === categoryName;

            if (!isSameCategory) setLoading(true);
            setError(null);

            try {
                if (!isSameCategory) {
                    const catData = await ApiClient.get<Category>(`/wikis/${wikiName}/categories/${categoryName}`);
                    setCategory(catData);
                    setAvailableTranslations(catData?.translations);
                }

                try {
                    const transData = await ApiClient.get<Translation>(
                        `/wikis/${wikiName}/categories/${categoryName}/translations/${currentLocale}`
                    );
                    setTranslation(transData);
                } catch {
                    setTranslation(null);
                }
            } catch (err: any) {
                const errorKey = err?.message || 'CATEGORY_NOT_FOUND';
                setError(getTranslate(errorKey));
                setCategory(null);
                setTranslation(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [location.pathname, currentLocale, getTranslate]);

    const saveTranslation = async (data: { title: string; description: string }) => {
        const match = matchPath({ path: "/wikis/:wikiName/categories/:categoryName/*" }, location.pathname);
        const wikiName = match?.params.wikiName;
        const categoryName = match?.params.categoryName;

        if (!wikiName || !categoryName) return;

        setLoading(true);
        try {
            if (translation) {
                const response = await ApiClient.put<Translation>(
                    `/wikis/${wikiName}/categories/${categoryName}/translations/${currentLocale}`,
                    data
                );
                setTranslation(response);
            } else {
                const response = await ApiClient.post<Translation>(
                    `/wikis/${wikiName}/categories/${categoryName}/translations`,
                    {
                        ...data,
                        locale: currentLocale
                    }
                );
                setTranslation(response);
            }
        } catch (err: any) {
            console.error("Category save error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <CategoryContext.Provider value={{
            category,
            translation,
            availableTranslations,
            loading,
            error,
            saveTranslation
        }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error('useCategory must be used within a CategoryProvider');
    return context;
};