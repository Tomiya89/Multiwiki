import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '../../../contexts/LocaleContext';
import Editor from '../../../components/Editor';
import { FiSave, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import ApiClient from '../../../services/ApiClient';
import Post from '../../../entities/Post';
import { useAuth } from '../../../contexts/AuthContext';

function EditForumPage() {
    const { user, isLoading } = useAuth();
    const { wikiName, postId } = useParams();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const isAuthor = user && post && post.user.id === user.id;
    const isAdmin = user?.role === 'ADMIN';
    const canEdit = isAuthor || isAdmin;

    useEffect(() => {
        if (isLoading) return;

        if (user == null)
            navigate('/login');

        const fetchPost = async () => {
            try {
                const data = await ApiClient.get<Post>(`/wikis/${wikiName}/posts/${postId}`);
                setPost(data);
                setTitle(data.title);
                setContent(data.body);
            } catch (error) {
                console.error("Failed to fetch post:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchPost();
    }, [wikiName, postId, isLoading, user]);

    const handleUpdate = async () => {
        if (!title.trim() || !content.trim()) {
            alert(getTranslate('fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            await ApiClient.put(`/wikis/${wikiName}/posts/${postId}`, {
                title,
                body: content
            });
            navigate(`/wikis/${wikiName}/forums/${postId}`);
        } catch (error) {
            console.error("Failed to update post:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Вы уверены, что хотите удалить этот пост?")) return;

        setLoading(true);
        try {
            await ApiClient.delete(`/wikis/${wikiName}/posts/${postId}`);
            navigate(`/wikis/${wikiName}/forums`);
        } catch (error) {
            if (error?.message === "NOT_FOUND"){
                navigate(`/wikis/${wikiName}/forums`);
                return;
            }
            console.error("Failed to delete post:", error);
            setLoading(false);
        }
    };

    if (!canEdit) 
        return (
            <div className="alert alert-danger shadow-sm rounded-4 mt-4">
                {getTranslate('accessDenied')}
            </div>
        );

    if (fetching) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    if (post == null) return <div className="text-center p-4 text-muted">{getTranslate("postNotFound")}</div>

    return (
        <div className="container py-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-link text-dark text-decoration-none p-0 d-flex align-items-center gap-2 fw-medium"
                >
                    <FiArrowLeft />
                    <span className="d-none d-md-inline">{getTranslate('backBtn')}</span>
                </button>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-danger rounded-pill px-3 px-md-4 shadow-sm fw-bold"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        <FiTrash2 className="me-md-2" />
                        <span className="d-none d-md-inline">{getTranslate('delete')}</span>
                    </button>

                    <button
                        className="btn btn-primary rounded-pill px-3 px-md-4 shadow-sm fw-bold"
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-md-2" />
                        ) : (
                            <FiSave className="me-md-2" />
                        )}
                        <span className="d-none d-md-inline">{getTranslate('save')}</span>
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white mx-auto" style={{ maxWidth: '900px' }}>
                <input
                    className="form-control form-control-lg border-0 bg-transparent fw-bold mb-3 p-0"
                    style={{ fontSize: '1.5rem', outline: 'none', boxShadow: 'none' }}
                    placeholder={getTranslate('postTitlePlaceholder')}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                <div className="mt-3">
                    <Editor
                        value={content}
                        onChange={setContent}
                        placeholder={getTranslate('postBodyPlaceholder')}
                    />
                </div>
            </div>
        </div>
    );
}

export default EditForumPage;