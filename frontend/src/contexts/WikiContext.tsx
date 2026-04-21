import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import ApiClient from '../services/ApiClient';
import { useLocale } from './LocaleContext';
import type Wiki from "../entities/Wiki";
import type Translation from "../entities/Translation";
import type Staff from "../entities/Staff";
import type Image from "../entities/Image";

interface WikiContextType {
    wiki: Wiki | null;
    translation: Translation | null;
    staff: Staff | null;
    availableTranslations: Translation[];
    loading: boolean;
    error: string | null;
    background: Image | null;
    card: Image | null;
    deleteBackground: () => Promise<void>;
    uploadBackground: (file: File) => Promise<void>;
    deleteCard: () => Promise<void>;
    uploadCard: (file: File) => Promise<void>;
}

const WikiContext = createContext<WikiContextType | undefined>(undefined);

export const WikiProvider = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { getTranslate, currentLocale } = useLocale();

    const [background, setBackground] = useState<Image | null>(null);
    const [card, setCard] = useState<Image | null>(null);
    const [wiki, setWiki] = useState<Wiki | null>(null);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [translation, setTranslation] = useState<Translation | null>(null);
    const [availableTranslations, setAvailableTranslations] = useState<Translation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const match = matchPath({ path: "/wikis/:wikiName/*" }, location.pathname);
        const nameInUrl = match?.params.wikiName;

        if (!nameInUrl) {
            setWiki(null);
            setStaff(null);
            setTranslation(null);
            setAvailableTranslations([]);
            setError(null);
            setLoading(false);
            return;
        }

        const fetchWikiData = async () => {
            const isSameWiki = wiki && wiki.name === nameInUrl;

            if (!isSameWiki) setLoading(true);
            setError(null);

            try {
                let currentWiki = wiki;

                if (!isSameWiki) {
                    currentWiki = await ApiClient.get<Wiki>(`/wikis/${nameInUrl}`);
                    setWiki(currentWiki);

                    try {
                        const staffData = await ApiClient.get<Staff>(`/wikis/${nameInUrl}/staff/me`);
                        setStaff(staffData);
                    } catch {
                        setStaff(null);
                    }
                    try {
                        const allTrans = await ApiClient.get<Translation[]>(`/wikis/${nameInUrl}/translations`);
                        setAvailableTranslations(allTrans);
                    } catch {
                        setAvailableTranslations([]);
                    }

                    try{
                        const background = await ApiClient.get<Image>(`/wikis/${nameInUrl}/background`);
                        setBackground(background);
                    }catch{
                        setBackground(null);
                    }
                    try {
                        const card = await ApiClient.get<Image>(`/wikis/${nameInUrl}/card`);
                        setCard(card);
                    } catch {
                        setCard(null);
                    }
                }
                try {
                    const transData = await ApiClient.get<Translation>(`/wikis/${nameInUrl}/translations/${currentLocale}`);
                    setTranslation(transData);
                } catch (err) {
                    setTranslation(null);
                }

            } catch (error: any) {
                const errorKey = error?.message || 'WIKI_NOT_FOUND';
                setError(getTranslate(errorKey));
                setWiki(null);
                setTranslation(null);
                setStaff(null);
            } finally {
                setLoading(false);
            }
        };

        fetchWikiData();
    }, [location.pathname, currentLocale, getTranslate]);

    const deleteBackground = async () => {
        try {
            if (wiki)
                await ApiClient.delete(`/wikis/${wiki.name}/background`);
        } catch (error) {
            console.error("Ошибка при удалении заднего фона:", error);
            throw error;
        }
        setBackground(null);
    };

    const deleteCard = async () => {
        try {
            if (wiki)
                await ApiClient.delete(`/wikis/${wiki.name}/card`);
        } catch (error) {
            console.error("Ошибка при удалении карточки:", error);
            throw error;
        }
        setCard(null);
    };

    const uploadBackground = async (file: File) => {
        const MAX_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
            alert("Файл слишком большой! Максимальный размер — 5 МБ.");
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert("Можно загружать только изображения!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await ApiClient.post<Image>(`/wikis/${wiki?.name}/background`, formData);
            setBackground(response);
        } catch (error) {
            console.error("Ошибка при загрузке заднего фона:", error);
            throw error;
        }
    };

    const uploadCard = async (file: File) => {
        const MAX_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
            alert("Файл слишком большой! Максимальный размер — 5 МБ.");
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert("Можно загружать только изображения!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await ApiClient.post<Image>(`/wikis/${wiki?.name}/card`, formData);
            setCard(response);
        } catch (error) {
            console.error("Ошибка при загрузке карточки:", error);
            throw error;
        }
    };

    return (
        <WikiContext.Provider value={{
            wiki,
            translation,
            staff,
            availableTranslations,
            loading,
            card,
            background,
            error,
            uploadBackground,
            deleteBackground,
            uploadCard,
            deleteCard
        }}>
            {children}
        </WikiContext.Provider>
    );
};

export const useWiki = () => {
    const context = useContext(WikiContext);
    if (!context) throw new Error('useWiki must be used within a WikiProvider');
    return context;
};