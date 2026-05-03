import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { getFullImageURL } from '../entities/Image';
import ApiClient from '../services/ApiClient';

import type Post from '../entities/Post';
import type PageResponse from '../entities/PageResponse';
import type Staff from '../entities/Staff';
import type SuccessResponse from '../responses/SuccessResponse';

import { FiMail, FiLock, FiCamera, FiTrash2, FiFileText, FiShield, FiChevronRight, FiHeart } from 'react-icons/fi';
import './ProfilePage.css';
import Wiki from '../entities/Wiki';


const ProfilePage = () => {
    const { user, avatar, isLoading, isAuthenticated, uploadAvatar, deleteAvatar } = useAuth();
    const { getTranslate, currentLocale } = useLocale();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'posts' | 'staff' | 'wikis'>('posts');
    const [editMode, setEditMode] = useState<'none' | 'password' | 'email'>('none');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [postsPage, setPostsPage] = useState<PageResponse<Post> | null>(null);
    const [staffPage, setStaffPage] = useState<PageResponse<Staff> | null>(null);
    const [wikiPage, setWikiPage] = useState<PageResponse<Wiki> | null>(null);

    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [newEmail, setNewEmail] = useState('');
    const [isSendedCode, setIsSendedCode] = useState<boolean>(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmPasswordForEmail, setConfirmPasswordForEmail] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    const fetchPosts = async (page: number) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await ApiClient.get<PageResponse<Post>>(`/users/${user.id}/posts?page=${page}&size=10&locale=` + currentLocale);
            setPostsPage(response);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async (page: number) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await ApiClient.get<PageResponse<Staff>>(`/users/${user.id}/staffs?page=${page}&size=10&locale=` + currentLocale);
            setStaffPage(response);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWikis = async (page: number) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await ApiClient.get<PageResponse<Wiki>>(`/users/${user.id}/wikis?page=${page}&size=10&locale=` + currentLocale);
            setWikiPage(response);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            if (activeTab === 'posts') fetchPosts(0);
            else if (activeTab === 'staff') fetchStaff(0);
            else if (activeTab === 'wikis') fetchWikis(0);
        }
    }, [activeTab, isAuthenticated, user]);

    const switchEditMode = (mode: 'none' | 'password' | 'email') => {
        setEditMode(mode);
        setError(null);
        setIsSendedCode(false);
        setPasswords({ old: '', new: '', confirm: '' });
        setNewEmail('');
        setVerificationCode('');
        setConfirmPasswordForEmail('');
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) { alert(getTranslate('UNKNOWN_ERROR')); return; }
            uploadAvatar(file);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (passwords.new !== passwords.confirm) { setError(getTranslate('PASSWORDS_DONT_MATCH')); return; }
        setLoading(true);
        try {
            await ApiClient.post('/auth/change-password', { oldPassword: passwords.old, newPassword: passwords.new });
            switchEditMode('none');
        } catch (error: any) { setError(getTranslate(error?.message || "UNKNOWN_ERROR")); } finally { setLoading(false); }
    };

    const handleEmailRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await ApiClient.post<SuccessResponse>('/auth/change-email', { email: newEmail, password: confirmPasswordForEmail });
            if (res.status === "SUCCESS") setIsSendedCode(true);
        } catch (error: any) { setError(getTranslate(error?.message || "UNKNOWN_ERROR")); } finally { setLoading(false); }
    };

    const handleEmailConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await ApiClient.post('/auth/confirm-change-email', { code: verificationCode });
            switchEditMode('none');
            window.location.reload();
        } catch (error: any) { setError(getTranslate(error?.message || "CODE_INVALID")); } finally { setLoading(false); }
    };

    if (isLoading) return <div className="spinner-border text-primary"></div>;
    if (!isAuthenticated || !user) return null;

    return (
        <div className="container py-5 profile-container">
            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 text-center">
                        <div className="position-relative d-inline-block mx-auto mb-3">
                            <div className="profile-avatar-wrapper shadow-sm">
                                {avatar ? (
                                    <img src={getFullImageURL(avatar)} alt="Avatar" className="profile-avatar-img" />
                                ) : (
                                    <div className="profile-avatar-placeholder">{user.username?.charAt(0).toUpperCase()}</div>
                                )}
                            </div>
                            <div className="avatar-actions">
                                <label className="btn btn-primary btn-sm rounded-circle shadow">
                                    <FiCamera /><input type="file" hidden onChange={handleAvatarUpload} accept="image/*" />
                                </label>
                                {avatar && (
                                    <button className="btn btn-danger btn-sm rounded-circle shadow ms-1" onClick={deleteAvatar}><FiTrash2 /></button>
                                )}
                            </div>
                        </div>
                        <h4 className="fw-bold mb-1">{user.username}</h4>
                        <p className="text-muted small mb-4">{user.email}</p>
                        <div className="d-grid gap-2">
                            <button className={`btn btn-sm ${editMode === 'email' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => switchEditMode(editMode === 'email' ? 'none' : 'email')}>{getTranslate('changeEmail').toUpperCase()}</button>
                            <button className={`btn btn-sm ${editMode === 'password' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => switchEditMode(editMode === 'password' ? 'none' : 'password')}>{getTranslate('changePassword').toUpperCase()}</button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    {error && editMode !== 'none' && <div className="alert alert-danger mb-4">{error}</div>}

                    {editMode === 'password' && (
                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <h5 className="fw-bold mb-4"><FiLock className="me-2" />{getTranslate('changePassword')}</h5>
                            <form onSubmit={handleChangePassword}>
                                <div className="row g-3">
                                    <div className="col-12"><input type="password" placeholder={getTranslate('currentPassword')} required className="form-control bg-light border-0" value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} /></div>
                                    <div className="col-md-6"><input type="password" placeholder={getTranslate('newPassword')} required className="form-control bg-light border-0" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} /></div>
                                    <div className="col-md-6"><input type="password" placeholder={getTranslate('confirmNewPassword')} required className="form-control bg-light border-0" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
                                    <div className="col-12"><button type="submit" className="btn btn-primary px-4" disabled={loading}>{loading ? "..." : getTranslate('confirmBtn').toUpperCase()}</button></div>
                                </div>
                            </form>
                        </div>
                    )}

                    {editMode === 'email' && (
                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <h5 className="fw-bold mb-4"><FiMail className="me-2" />{getTranslate('changeEmail')}</h5>
                            {!isSendedCode ? (
                                <form onSubmit={handleEmailRequest}>
                                    <div className="mb-3"><label className="form-label small fw-bold text-muted text-uppercase">{getTranslate('emailLabel')}</label><input type="email" placeholder="example@mail.com" required className="form-control bg-light border-0" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
                                    <div className="mb-3"><label className="form-label small fw-bold text-muted text-uppercase">{getTranslate('passwordLabel')}</label><input type="password" placeholder={getTranslate('passwordLabel')} required className="form-control bg-light border-0" value={confirmPasswordForEmail} onChange={e => setConfirmPasswordForEmail(e.target.value)} /></div>
                                    <div className="d-flex gap-2"><button className="btn btn-primary px-4" type="submit" disabled={loading}>{loading ? "..." : getTranslate('sendCode').toUpperCase()}</button><button className="btn btn-light" type="button" onClick={() => switchEditMode('none')}>{getTranslate('cancelBtn').toUpperCase()}</button></div>
                                </form>
                            ) : (
                                <form onSubmit={handleEmailConfirm}>
                                    <div className="alert alert-info py-2 small">{getTranslate('codeSentTo')} <strong>{newEmail}</strong></div>
                                    <div className="d-flex flex-column align-items-center">
                                        <input type="text" placeholder="000000" maxLength={6} required className="form-control bg-light border-0 text-center fw-bold mb-3" style={{ letterSpacing: '8px', fontSize: '1.5rem', maxWidth: '200px' }} value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                                        <div className="d-flex gap-2 w-100"><button type="submit" className="btn btn-success flex-fill" disabled={loading}>{getTranslate('confirmBtn').toUpperCase()}</button><button type="button" className="btn btn-light" onClick={() => setIsSendedCode(false)}>{getTranslate('backBtn').toUpperCase()}</button></div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="card-header bg-white p-0 border-bottom">
                            <div className="d-flex">
                                <button className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${activeTab === 'posts' ? 'text-primary border-bottom' : 'text-muted'}`} onClick={() => setActiveTab('posts')}><FiFileText className="me-2" /> {getTranslate('posts')}</button>
                                <button className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${activeTab === 'staff' ? 'text-primary border-bottom' : 'text-muted'}`} onClick={() => setActiveTab('staff')}><FiShield className="me-2" /> {getTranslate('staff')}</button>
                                <button className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${activeTab === 'wikis' ? 'text-primary border-bottom' : 'text-muted'}`} onClick={() => setActiveTab('wikis')}><FiShield className="me-2" /> {getTranslate('wiki')}</button>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {activeTab === 'posts' && (
                                <div className="list-group list-group-flush">
                                    {postsPage?.content && postsPage.content.length > 0 ? (
                                        postsPage.content.map((post) => (
                                            <div key={post.id} className="list-group-item p-4 border-0 border-bottom hover-bg-light cursor-pointer d-flex justify-content-between align-items-center" onClick={() => navigate(`/wikis/${post.wiki?.name}/forums/${post.id}`)}>
                                                <div>
                                                    <h6 className="fw-bold mb-1">{post.title}</h6>
                                                    <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                                        <span className="text-primary fw-bold">{post.wiki?.translations?.[0]?.title || post.wiki?.name}</span>
                                                        <span className="d-flex align-items-center"><FiHeart className="me-1" size={14} /> {post.likesCount}</span>
                                                    </div>
                                                </div>
                                                <FiChevronRight className="text-muted" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-5 text-center text-muted">{getTranslate("listIsEmpty")}</div>
                                    )}
                                    {postsPage && postsPage.totalPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center py-3 gap-3">
                                            <button className="btn btn-sm btn-outline-secondary" disabled={postsPage.first || loading} onClick={() => fetchPosts(postsPage.number - 1)}>&lt;</button>
                                            <span className="small text-muted fw-bold">{postsPage.number + 1} / {postsPage.totalPages}</span>
                                            <button className="btn btn-sm btn-outline-secondary" disabled={postsPage.last || loading} onClick={() => fetchPosts(postsPage.number + 1)}>&gt;</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'staff' && (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr className="small text-muted text-uppercase">
                                                <th className="ps-4 py-3 border-0">{getTranslate("name")}</th>
                                                <th className="border-0">{getTranslate("role")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffPage?.content && staffPage.content.length > 0 ? (
                                                staffPage.content.map((staff) => (
                                                    <tr key={staff.id} onClick={() => navigate(`/wikis/${staff.wiki?.name}`)} style={{ cursor: 'pointer' }}>
                                                        <td className="ps-4 fw-bold">{staff.wiki?.translations?.[0]?.title || staff.wiki?.name}</td>
                                                        <td><span className="badge rounded-pill bg-info-subtle text-info border border-info-subtle px-3">{getTranslate(staff?.role.toLowerCase())}</span></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={2} className="p-5 text-center text-muted">{getTranslate("listIsEmpty")}</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {staffPage && staffPage.totalPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center py-3 gap-3 border-top">
                                            <button className="btn btn-sm btn-outline-secondary" disabled={staffPage.first || loading} onClick={() => fetchStaff(staffPage.number - 1)}>&lt;</button>
                                            <span className="small text-muted fw-bold">{staffPage.number + 1} / {staffPage.totalPages}</span>
                                            <button className="btn btn-sm btn-outline-secondary" disabled={staffPage.last || loading} onClick={() => fetchStaff(staffPage.number + 1)}>&gt;</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'wikis' && (
                                <div className="list-group list-group-flush">
                                    {wikiPage?.content && wikiPage.content.length > 0 ? (
                                        wikiPage.content.map((wiki) => (
                                            <div key={wiki.id} className="list-group-item p-4 border-0 border-bottom d-flex justify-content-between align-items-center hover-bg-light cursor-pointer" onClick={() => navigate(`/wikis/${wiki.name}`)}>
                                                <h6 className="fw-bold mb-0">{wiki?.translations?.[0]?.title || wiki.name}</h6>
                                                <FiChevronRight className="text-muted" />
                                            </div>
                                        ))
                                    ) : <div className="p-5 text-center text-muted">{getTranslate("listIsEmpty")}</div>}
                                    {wikiPage && wikiPage.totalPages > 1 && (
                                        <div className="d-flex justify-content-center align-items-center py-3 gap-3">
                                            <button className="btn btn-sm btn-outline-secondary" disabled={wikiPage.first || loading} onClick={() => fetchWikis(wikiPage.number - 1)}>&lt;</button>
                                            <span className="small text-muted fw-bold">{wikiPage.number + 1} / {wikiPage.totalPages}</span>
                                            <button className="btn btn-sm btn-outline-secondary" disabled={wikiPage.last || loading} onClick={() => fetchWikis(wikiPage.number + 1)}>&gt;</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;