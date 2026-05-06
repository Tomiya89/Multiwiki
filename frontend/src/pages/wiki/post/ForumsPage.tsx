import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWiki } from '../../../contexts/WikiContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { useAuth } from '../../../contexts/AuthContext';
import { FiThumbsUp, FiCalendar, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getFullImageURL } from '../../../entities/Image';
import Post from '../../../entities/Post';
import PageResponse from '../../../entities/PageResponse'; 
import ApiClient from '../../../services/ApiClient';

const ForumsPage = () => {
    const { wiki, loading: wikiLoading } = useWiki();
    const { user, isLoading } = useAuth();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [pageData, setPageData] = useState<PageResponse<Post> | null>(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    const [searchQuery, setSearchQuery] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const titleParam = searchQuery.trim() ? `&title=${encodeURIComponent(searchQuery)}` : '';
            const query = `?page=${page}&size=10&sort=${sortField},${sortDir}${titleParam}`;

            const response = await ApiClient.get<PageResponse<Post>>(`/wikis/${wiki?.name}/posts${query}`);
            setPageData(response);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchPosts();
    };

    useEffect(() => {
        if (isLoading) return;
        if (wiki) fetchPosts();
    }, [page, sortField, sortDir, wiki]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
        setPage(0);
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return null;
        return sortDir === 'asc' ? <FiArrowUp className="ms-1" size={14} /> : <FiArrowDown className="ms-1" size={14} />;
    };

    if (wikiLoading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold m-0">{getTranslate('forums')}</h2>
                <Link to={`/wikis/${wiki?.name}/forums/create`} className="btn btn-primary d-flex align-items-center gap-2">
                    <FiPlus /> {getTranslate('createPost')}
                </Link>
            </div>

            <div className="mb-4">
                <div className="input-group shadow-sm">
                    <input
                        type="text"
                        className="form-control form-control-lg border-end-0"
                        placeholder={getTranslate("name")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{ border: '1px solid #dee2e6' }}
                    />
                    <button className="btn btn-primary px-4" onClick={handleSearch}>
                        {getTranslate("search")}
                    </button>
                </div>
            </div>

            <div className="table-responsive bg-white rounded shadow-sm d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="cursor-pointer" onClick={() => handleSort('title')}>{getTranslate("name")} <SortIcon field="title" /></th>
                            <th className="cursor-pointer" onClick={() => handleSort('likesCount')}>{getTranslate("likes")} <SortIcon field="likesCount" /></th>
                            <th className="cursor-pointer" onClick={() => handleSort('createdAt')}>{getTranslate('date')} <SortIcon field="createdAt" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="text-center p-4">{getTranslate('loading')}</td></tr>
                        ) : pageData?.content && pageData.content.length > 0 ? (
                            pageData.content.map((post) => (
                                <tr key={post.id} onClick={() => navigate(`/wikis/${wiki?.name}/forums/${post.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img src={post.user.avatar ? getFullImageURL(post.user.avatar) : '/default-avatar.png'} className="rounded-circle me-3 border" width="32" height="32" alt="" />
                                            <div>
                                                <div className="fw-bold">{post.title}</div>
                                                <small className="text-muted">@{post.user.username}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-primary"><FiThumbsUp className="me-1" />{post.likesCount}</span></td>
                                    <td><FiCalendar className="me-1" />{new Date(post.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={3} className="text-center p-4 text-muted">{getTranslate("postsNotFound")}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-md-none">
                {loading ? (
                    <div className="text-center p-4">{getTranslate('loading')}</div>
                ) : pageData?.content && pageData.content.length > 0 ? (
                    pageData.content.map((post) => (
                        <div key={post.id} className="card shadow-sm mb-3" onClick={() => navigate(`/wikis/${wiki?.name}/forums/${post.id}`)}>
                            <div className="card-body">
                                <h6 className="fw-bold mb-2">{post.title}</h6>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center text-muted small">
                                        <img src={post.user.avatar ? getFullImageURL(post.user.avatar) : '/default-avatar.png'} className="rounded-circle me-2" width="24" height="24" alt="" />
                                        @{post.user.username}
                                    </div>
                                    <div className="d-flex gap-3 text-muted small">
                                        <span><FiThumbsUp className="me-1" />{post.likesCount}</span>
                                        <span><FiCalendar className="me-1" />{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-4 text-muted">{getTranslate("postsNotFound")}</div>
                )}
            </div>

            {pageData && pageData.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pageData.first}
                        onClick={() => setPage(prev => prev - 1)}
                    >
                        {getTranslate("backBtn")}
                    </button>

                    <span className="align-self-center px-3">
                        {pageData.number + 1} / {pageData.totalPages}
                    </span>

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={pageData.last}
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        {getTranslate("forwardBtn")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ForumsPage;