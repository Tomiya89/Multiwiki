import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiTrash2, FiCornerDownLeft, FiThumbsUp } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ApiClient from '../services/ApiClient';
import Message from '../entities/Message';
import PageResponse from '../entities/PageResponse';
import { getFullImageURL } from '../entities/Image';
import { useLocale } from '../contexts/LocaleContext';

interface MessageItemProps {
    message: Message;
    isNew: boolean;
    onDelete: (id: number) => void;
    onReply: () => void;
    level?: number;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isNew, onDelete, onReply, level = 0 }) => {
    const { getTranslate } = useLocale();
    const { user, isAuthenticated } = useAuth();
    const [replies, setReplies] = useState<Message[]>([]);
    const [lastId, setLastId] = useState<number>(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyBody, setReplyBody] = useState('');

    const [likesCount, setLikesCount] = useState(0);
    const [like, setLike] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    const canDelete = user && (user.id === message.user.id || user.role === 'ADMIN') && message.status !== 'DELETED';

    const fetchReplies = async (isReset: boolean = false) => {
        if (loadingReplies || (!hasMore && !isReset) || message.new || isNew) return;
        setLoadingReplies(true);
        try {
            const currentLastId = isReset ? 0 : lastId;
            const response = await ApiClient.get<PageResponse<Message>>(
                `/messages/${message.id}/messages?limit=10&lastId=${currentLastId}`
            );

            const newContent = response.content;

            if (isReset) {
                setReplies(newContent);
            } else {
                setReplies(prev => [...prev, ...newContent]);
            }

            setHasMore(!response.last);

            if (newContent.length > 0) {
                setLastId(newContent[newContent.length - 1].id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingReplies(false);
        }
    };

    useEffect(() => {
        setLikesCount(message?.likesCount);
        setLike(message?.liked);
        fetchReplies(true);
    }, [message.id]);

    const lastReplyRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingReplies) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchReplies();
            }
        });

        if (node) observer.current.observe(node);
    }, [loadingReplies, hasMore, lastId]);

    const handleReplySubmit = async () => {
        if (!replyBody.trim()) return;
        try {

            const newReply = await ApiClient.post<Message>(`/messages/${message.id}/messages`, { body: replyBody });
            newReply.new = true;
            setReplies(prev => [...prev, newReply]);

            setReplyBody('');
            setIsReplying(false);
        } catch (e) { console.error(e); }
    };

    const handleLike = async () => {
        try{
            if (like) {
                setLike(false);
                setLikesCount(likesCount - 1);
                await ApiClient.delete(`/messages/${message?.id}/like`);
            }
            else {
                setLike(true);
                setLikesCount(likesCount + 1);
                await ApiClient.get(`/messages/${message?.id}/like`);
            }
        }catch{ }
    };

    return (
        <div className="message-wrapper">
            <div
                className={`d-flex align-items-start p-3 border-bottom ${level > 0 ? 'bg-light' : 'bg-white'}`}
                style={{
                    borderLeft: level > 0 ? '4px solid #0d6efd' : 'none',
                    marginLeft: level > 0 ? (window.innerWidth < 576 ? '5px' : '10px') : '0px',
                    touchAction: 'manipulation'
                }}
            >
                <img
                    src={message.user?.avatar ? getFullImageURL(message.user.avatar) : '/default-avatar.png'}
                    className="rounded-circle me-3"
                    alt="avatar"
                    style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        flexShrink: 0
                    }}
                />
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-1">
                        <span className="fw-bold text-truncate" style={{ maxWidth: '65%' }}>
                            {message.user?.username || 'User'}
                        </span>
                        <small className="text-muted text-nowrap ms-2">
                            {new Date(message.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                    {message.status === 'DELETED' ? <div className="p-2 mb-2 text-muted fst-italic" style={{ paddingLeft: `${level * 20}px` }}>
                        <small>{getTranslate('msgIsDeleted')}</small>
                    </div> : <div className="mt-1" dangerouslySetInnerHTML={{ __html: message.body }} />}
                    

                    <div className="mt-2 d-flex gap-3">
                        <button
                            onClick={handleLike}
                            className={`btn btn-sm d-flex align-items-center gap-1 ${like ? 'text-primary' : 'text-muted'}`}
                            style={{ border: 'none', background: 'transparent' }}
                            aria-label={getTranslate('like')}
                            disabled={!isAuthenticated}
                        >
                            <FiThumbsUp size={16} fill={like ? 'currentColor' : 'none'} />
                            <small>{likesCount}</small>
                        </button>
                        {
                            isAuthenticated ? (<button
                                className="btn btn-sm btn-link text-decoration-none p-0"
                                onClick={() => setIsReplying(!isReplying)}
                                aria-label={isReplying ? getTranslate('cancelBtn') : getTranslate('answerBtn')}
                            >
                                <FiCornerDownLeft />
                                <span className="d-none d-sm-inline ms-1">
                                    {isReplying ? getTranslate('cancelBtn') : getTranslate('answerBtn')}
                                </span>
                            </button>): (<></>)
                        }
                        

                        {canDelete && (
                            <button
                                className="btn btn-sm btn-link text-decoration-none p-0 text-danger"
                                onClick={() => onDelete(message.id)}
                                aria-label={getTranslate('delete')}
                            >
                                <FiTrash2 />
                                <span className="d-none d-sm-inline ms-1">{getTranslate('delete')}</span>
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-3">
                            <textarea
                                className="form-control"
                                rows={2}
                                value={replyBody}
                                onChange={(e) => setReplyBody(e.target.value)}
                                placeholder={getTranslate("yourComment")}
                            />
                            <button className="btn btn-primary btn-sm mt-2" onClick={handleReplySubmit}>{getTranslate("send")}</button>
                        </div>
                    )}
                </div>
            </div>

            {(replies && (replies.length > 0 || loadingReplies)) && (
                <div className="replies-container" style={{ paddingLeft: '20px' }}>
                    {replies.map((reply, index) => (
                        <div key={`${reply.id}-${index}`} ref={index === replies.length - 1 ? lastReplyRef : null} className="mt-2">
                            <MessageItem
                                isNew={reply.new === true}
                                message={reply}
                                onDelete={async (id) => {
                                    try {
                                        await ApiClient.delete(`/messages/${id}`);
                                    } catch (e) { }
                                    setReplies(prev => prev.map(m => m.id === id ? { ...m, status: 'DELETED' } : m));
                                }}
                                onReply={onReply}
                                level={level + 1}
                            />
                        </div>
                    ))}

                    {loadingReplies && (
                        <div className="text-center py-2">
                            <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageItem;