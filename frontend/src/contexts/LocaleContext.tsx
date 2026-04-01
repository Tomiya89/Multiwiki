import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type Locale from "../entities/Locale";
import ApiClient from "../services/ApiClient";
import { translations } from "../constants/translation";

interface LocaleContextType{
    currentLocale: string
    languages: Locale[]
    setLocale: (locale : string) => void
    getTranslate: (key: string) => string
    isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({children} : { children : ReactNode}) => {
    const [currentLocale, setCurrentLocale] = useState<string>(localStorage.getItem('lang') || 'en');
    const [languages, setLanguages] = useState<Locale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await ApiClient.get<Locale[]>("/locale");

                setLanguages(response);
            } catch (error) {
                console.error("Failed to load locales", error);
            } finally{
                setIsLoading(false);
            }
        };
        fetchLanguages();
    }, []);
    
    const setLocale = (locale: string) => {
        setCurrentLocale(locale);
        localStorage.setItem('lang', locale);
    }

    const getTranslate = (key: string) => {
        return translations[currentLocale]?.[key] || translations['en']?.[key] || key;
    }

    return (
        <LocaleContext.Provider value={{currentLocale, languages, setLocale, getTranslate, isLoading}}>
            {children}
        </LocaleContext.Provider>
    );
}

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if(!context)
        throw new Error("useLocale must be used within a LocaleProvider");

    return context;
}