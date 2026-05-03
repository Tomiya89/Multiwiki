import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import ApiClient from '../services/ApiClient';
import { useLocale } from './LocaleContext';
import type Article from "../entities/Article";
import type Translation from "../entities/Translation";
import type TranslationDTO from "../entities/Translation";


interface ArticleContextType {
    article: Article | null;
    translation: Translation | null;
    availableTranslations: TranslationDTO[];
    loading: boolean;
    error: string | null;
    saveTranslation: (data: { title: string; body: string; infoboxData?: string }) => Promise<void>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { getTranslate, currentLocale } = useLocale();

    const [article, setArticle] = useState<Article | null>(null);
    const [translation, setTranslation] = useState<Translation | null>(null);
    const [availableTranslations, setAvailableTranslations] = useState<TranslationDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const match = matchPath(
            { path: "/wikis/:wikiName/categories/:categoryName/articles/:articleName/*" },
            location.pathname
        );
        const { wikiName, categoryName, articleName } = match?.params || {};
        if (!wikiName || !categoryName || !articleName || articleName === 'create') {
            setArticle(null);
            setTranslation(null);
            setAvailableTranslations([]);
            setError(null);
            return;
        }

        const fetchArticleData = async () => {
            const isSameArticle = article && article.name === articleName;

            if (!isSameArticle) setLoading(true);
            setError(null);

            try {
                if (!isSameArticle) {
                    const artData = await ApiClient.get<Article>(
                        `/wikis/${wikiName}/categories/${categoryName}/articles/${articleName}`
                    );
                    setArticle(artData);
                    setAvailableTranslations(artData?.transaltions);
                }

                try {
                    const transData = await ApiClient.get<Translation>(
                        `/wikis/${wikiName}/categories/${categoryName}/articles/${articleName}/translations/${currentLocale}`
                    );
                    setTranslation(transData);
                } catch {
                    setTranslation(null);
                }
            } catch (err: any) {
                const errorKey = err?.message || 'ARTICLE_NOT_FOUND';
                setError(getTranslate(errorKey));
                setArticle(null);
                setTranslation(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticleData();
    }, [location.pathname, currentLocale, getTranslate]);

    const saveTranslation = async (data: { title: string; body: string; infoboxData?: string }) => {
        const match = matchPath(
            { path: "/wikis/:wikiName/categories/:categoryName/articles/:articleName/*" },
            location.pathname
        );
        const { wikiName, categoryName, articleName } = match?.params || {};

        if (!wikiName || !categoryName || !articleName) return;

        setLoading(true);
        try {
            if (translation) {
                const response = await ApiClient.put<Translation>(
                    `/wikis/${wikiName}/categories/${categoryName}/articles/${articleName}/translations/${currentLocale}`,
                    data
                );
                setTranslation(response);
            } else {
                const response = await ApiClient.post<Translation>(
                    `/wikis/${wikiName}/categories/${categoryName}/articles/${articleName}/translations`,
                    {
                        ...data,
                        locale: currentLocale
                    }
                );
                setTranslation(response);
            }
        } catch (err: any) {
            console.error("Article save error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <ArticleContext.Provider value={{
            article,
            translation,
            availableTranslations,
            loading,
            error,
            saveTranslation
        }}>
            {children}
        </ArticleContext.Provider>
    );
};

export const useArticle = () => {
    const context = useContext(ArticleContext);
    if (!context) throw new Error('useArticle must be used within an ArticleProvider');
    return context;
};