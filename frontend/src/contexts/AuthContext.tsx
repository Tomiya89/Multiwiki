import React, { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import type User from '../entities/User';
import ApiClient from '../services/ApiClient';
import type AuthResponse from '../entities/AuthResponse';
import type Image from '../entities/Image';

interface AuthContextType{
    user: User | null
    avatar: Image | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    deleteAvatar: () => Promise<void>
    uploadAvatar: (file: File) => Promise<void>
    register: (email: string, username: string, password: string) => Promise<void>
    confirmRegister: (email: string, code: string) => Promise<void>
    updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [avatar, setAvatar] = useState<Image | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () =>{
            try{
                const restored = await ApiClient.restoreSession();
                if(restored){
                    const resotedUser: User = await ApiClient.me();
                    setNewUser(resotedUser);
                }
            }catch(error){
                console.error('Session restoration failed:', error)
            }finally{
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const setNewUser = async (newUser: User | null) => {
        setUser(newUser);
        if (newUser && newUser.avatarId != 0) {
            try {
                const newAvatar: Image = await ApiClient.get<Image>("/users/" + newUser.id.toString() + "/avatar");
                if (newAvatar)
                    setAvatar(newAvatar);
            } catch (error) {
                setAvatar(null);
            }
        }
    };

    const login = async(email: string, password: string) => {
        setIsLoading(true);
        try{
            const response: AuthResponse = await ApiClient.post<AuthResponse>("/auth/login", {
                email,
                password
            });
            ApiClient.setAccessToken(response.token);
            const loggedUser: User = await ApiClient.me();
            setNewUser(loggedUser);
        }catch(error){
            console.error('Login error:', error)
            throw error
        }finally{
            setIsLoading(false);
        }
    };

    const logout = async() => {
        setIsLoading(true);
        try{
            await ApiClient.post("/auth/logout", {});
        }catch(error){
            console.error('Logout error:', error)
        }finally{
            ApiClient.setAccessToken(null);
            setNewUser(null);
            setIsLoading(false);
        }
    };

    const register = async (email: string, username: string, password: string) => {
        setIsLoading(true);
        try {
            await ApiClient.post("/auth/register/initiate", {
                email,
                username,
                password
            });
        } catch (error) {
            console.error('Register initiation error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const confirmRegister = async (email: string, code: string) => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await ApiClient.post<AuthResponse>("/auth/register/confirm", {
                email,
                code
            });
            ApiClient.setAccessToken(response.token);
            const loggedUser: User = await ApiClient.me();
            setNewUser(loggedUser);

        } catch (error) {
            console.error('Registration confirmation error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const uploadAvatar = async (file: File) => {
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

            const response = await ApiClient.post<Image>(`/users/${user?.id}/avatar`, formData);
            setAvatar(response);
        } catch (error) {
            console.error("Ошибка при загрузке аватара:", error);
            throw error;
        }
    };

    const deleteAvatar = async () => {
        try {
            await ApiClient.delete(`/users/${user?.id}/avatar`);
            setAvatar(null);
        } catch (error) {
            console.error("Ошибка при удалении аватара:", error);
            throw error;
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        avatar,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        confirmRegister,
        deleteAvatar,
        uploadAvatar,
        updateUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
    const context = useContext(AuthContext);
    if(context === undefined)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
}