import React, { useState, useRef, useCallback, useEffect } from 'react';
import ApiClient from '../services/ApiClient';
import Message from '../entities/Message';
import PageResponse from '../entities/PageResponse';
import MessageItem from './MessageItem';
import { useLocale } from '../contexts/LocaleContext';

import "./MessageList.css";
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

interface MessageListProps {
    apiUrl: string;
}

const MessageList: React.FC<MessageListProps> = ({ apiUrl }) => {
    const { getTranslate } = useLocale();
    const { isAuthenticated } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [newBody, setNewBody] = useState('');

    const observer = useRef<IntersectionObserver | null>(null);
    const lastIdRef = useRef<number>(0);
    const hasMoreRef = useRef<boolean>(true);
    const isLoadingRef = useRef<boolean>(false);

    const fetchMessages = useCallback(async (isReset: boolean = false) => {
        if (isLoadingRef.current || (!hasMoreRef.current && !isReset)) return;

        isLoadingRef.current = true;
        setLoading(true);

        try {
            if (isReset) {
                lastIdRef.current = 0;
                hasMoreRef.current = true;
            }

            const response = await ApiClient.get<PageResponse<Message>>(
                `${apiUrl}?limit=10&lastId=${lastIdRef.current}`
            );

            const newContent = response.content;
            setMessages(prev => isReset ? newContent : [...prev, ...newContent]);

            hasMoreRef.current = newContent.length !== 0;
            if (newContent.length > 0) {
                lastIdRef.current = newContent[newContent.length - 1].id;
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [apiUrl]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingRef.current) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreRef.current) {
                fetchMessages();
            }
        }, { rootMargin: '100px', threshold: 0.1 });
        if (node) observer.current.observe(node);
    }, [fetchMessages]);

    const handleCreateNew = async () => {
        if (!newBody.trim()) return;
        try {
            const response = await ApiClient.post<Message>(apiUrl, { body: newBody, parentId: 0 });
            response.new = true;
            setMessages(prev => [response, ...prev]);
            setNewBody('');
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: number) => {
        try {
            await ApiClient.delete('/messages/' + id);
        } catch (e) {
            
        }
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'DELETED' } : m));
    };

    useEffect(() => {
        fetchMessages(true);
    }, [apiUrl, fetchMessages]);

    return (
        <section id="comments-section">
            <div className="message-list-container pt-3">
                {
                    isAuthenticated ? (
                    <div className="card p-3 mb-4 shadow-sm border-0 rounded-4">
                        <textarea
                            className="form-control"
                            rows={3}
                            value={newBody}
                            onChange={(e) => setNewBody(e.target.value)}
                            placeholder={getTranslate('yourComment')}
                        />
                        <button className="btn btn-primary mt-3" onClick={handleCreateNew}>{getTranslate("send")}</button>
                    </div>) : 
                    (
                    <div className="card p-4 mb-4 shadow-sm border-0 rounded-4 bg-light text-center">
                        <p className="text-muted mb-3">
                            {getTranslate('loginToCommentText')}
                        </p>
                        <Link
                            to="/login"
                            className="btn btn-outline-primary rounded-pill px-4 d-inline-flex align-items-center justify-content-center gap-2"
                        >
                            <FiLogIn />
                            {getTranslate("loginBtn")}
                        </Link>
                    </div>
                    )
                }
               

                <div className="message-list-items">
                    {messages && messages.filter(Boolean).map((msg, index) => (
                        <div
                            key={msg.id}
                            ref={index === messages.length - 1 ? lastElementRef : null}
                        >
                            <MessageItem
                                message={msg}
                                isNew={msg.new === true}
                                onDelete={handleDelete}
                                onReply={() => fetchMessages(true)}
                            />
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="py-4 text-center">
                        <div className="spinner-border text-primary" role="status" />
                    </div>
                )}
            </div>
        </section>
    );
};

export default MessageList;