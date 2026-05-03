import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { FiThumbsUp, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import ApiClient from '../../../services/ApiClient';
import Post from '../../../entities/Post';
import { getFullImageURL } from '../../../entities/Image';

const ForumPage = () => {
    const { wikiName, postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getTranslate } = useLocale();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthor = user && post && post.user.id === user.id;
    const isAdmin = user?.role === 'ADMIN';
    const canEdit = isAuthor || isAdmin;

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.get<Post>(`/wikis/${wikiName}/posts/${postId}`);
            setPost(response);
        } catch (error) {
            console.error("Error fetching post:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const handleLike = async () => {
        // Обработка лайков
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
                    <button onClick={handleLike} className="btn btn-light rounded-pill px-3 shadow-sm border">
                        <FiThumbsUp className="me-1 text-primary" /> {post.likesCount}
                    </button>

                    {canEdit && (
                        <Link to={`/wikis/${wikiName}/forums/${postId}/edit`} className="btn btn-outline-primary rounded-pill px-3 shadow-sm">
                            <FiEdit2 className="me-2" /> {getTranslate('edit')}
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
                    className="ql-editor p-0"
                    dangerouslySetInnerHTML={{ __html: post.body }}
                />
            </div>
        </div>
    );
};

export default ForumPage;