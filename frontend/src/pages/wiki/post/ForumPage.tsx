import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { FiThumbsUp, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import ApiClient from '../../../services/ApiClient';
import Post from '../../../entities/Post';
import { getFullImageURL } from '../../../entities/Image';
import MessageList from '../../../components/MessageList';

const ForumPage = () => {
    const { wikiName, postId } = useParams();
    const navigate = useNavigate();
    const { user, isLoading, isAuthenticated } = useAuth();
    const { getTranslate } = useLocale();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [likesCount, setLikesCount] = useState(0);
    const [like, setLike] = useState(false);

    const isAuthor = user && post && post.user.id === user.id;
    const isAdmin = user?.role === 'ADMIN';
    const canEdit = isAuthor || isAdmin;

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.get<Post>(`/wikis/${wikiName}/posts/${postId}`);
            setLikesCount(response?.likesCount);
            setLike(response?.liked);
            setPost(response);
        } catch (error) {
            console.error("Error fetching post:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(isLoading) return;
        fetchPost();
    }, [postId, isLoading]);

    const handleLike = async () => {
        try{
            if (like) {
                setLike(false);
                setLikesCount(likesCount - 1);
                await ApiClient.delete(`/wikis/${wikiName}/posts/${postId}/like`);
            }
            else {
                setLike(true);
                setLikesCount(likesCount + 1);
                await ApiClient.get(`/wikis/${wikiName}/posts/${postId}/like`);
            }
        }catch{ }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
    if (!post) return <div className="text-center p-5">{ getTranslate('postNotFound') }</div>;

    return (
        <div className="container py-4" style={{ maxWidth: '1100px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button onClick={() => navigate(-1)} className="btn btn-link text-dark p-0 d-flex align-items-center gap-2">
                    <FiArrowLeft /> {getTranslate('backBtn')}
                </button>

                <div className="d-flex gap-2">
                    <button
                        onClick={handleLike}
                        disabled={!isAuthenticated}
                        className={`btn ${like ? 'btn-primary' : 'btn-light'} rounded-pill px-3 shadow-sm border`}
                    >
                        <FiThumbsUp className={`me-1 ${like ? 'text-white' : 'text-primary'}`} />
                        <span className={like ? 'text-white' : ''}>
                            {likesCount}
                        </span>
                    </button>
                    {canEdit && (
                        <Link
                            to={`/wikis/${wikiName}/forums/${postId}/edit`}
                            className="btn btn-outline-primary rounded-pill px-3 shadow-sm"
                        >
                            <FiEdit2 className="me-md-2" />
                            <span className="d-none d-md-inline">{getTranslate('edit')}</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <h1 className="fw-bold mb-4">{post.title}</h1>

                <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <img
                        src={post.user.avatar ? getFullImageURL(post.user.avatar) : '/default-avatar.png'}
                        className="rounded-circle me-3 border" width="45" height="45" alt=""
                    />
                    <div>
                        <div className="fw-bold">{post.user.username}</div>
                        <small className="text-muted">{new Date(post.createdAt).toLocaleDateString()}</small>
                    </div>
                </div>

                <div
                    className="ql-editor pb-3 border-bottom"
                    dangerouslySetInnerHTML={{ __html: post.body }}
                />
                <MessageList apiUrl={`/wikis/${wikiName}/posts/${postId}/messages`} />
            </div>
        </div>
    );
};

export default ForumPage;