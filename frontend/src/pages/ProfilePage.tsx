import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { getFullImageURL } from '../entities/Image';
import ApiClient from '../services/ApiClient';

import type Post from '../entities/Post';
import type Staff from '../entities/Staff';
import type SuccessResponse from '../responses/SuccessResponse';

import { FiMail, FiLock, FiCamera, FiTrash2, FiFileText, FiShield, FiChevronRight } from 'react-icons/fi';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, avatar, isLoading, isAuthenticated, uploadAvatar, deleteAvatar } = useAuth();
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'posts' | 'staff'>('posts');
    const [editMode, setEditMode] = useState<'none' | 'password' | 'email'>('none');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [newEmail, setNewEmail] = useState('');
    const [isSendedCode, setIsSendedCode] = useState<boolean>(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmPasswordForEmail, setConfirmPasswordForEmail] = useState('');

    const [posts, setPosts] = useState<Post[]>([]);
    const [staffRecords, setStaffRecords] = useState<Staff[]>([]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const mockPosts: Post[] = [
                {
                    id: 1, wikiId: 101, title: "История создания Multiwiki",
                    body: "Это тестовый пост...", userId: user.id, likesCount: 42,
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                    status: "PUBLISHED"
                }
            ];
            const mockStaff: Staff[] = [
                {
                    id: 1, wikiId: 101, userId: user.id, role: "ADMIN",
                    createdBy: 1, createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            setPosts(mockPosts);
            setStaffRecords(mockStaff);
        }
    }, [isAuthenticated, user]);

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
            if (file.size > MAX_SIZE) {
                alert(getTranslate('UNKNOWN_ERROR'));
                return;
            }
            uploadAvatar(file);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (passwords.new !== passwords.confirm) {
            setError(getTranslate('PASSWORDS_DONT_MATCH'));
            return;
        }
        setLoading(true);
        try {
            await ApiClient.post('/auth/change-password', {
                oldPassword: passwords.old,
                newPassword: passwords.new
            });
            switchEditMode('none');
        } catch (error: any) {
            setError(getTranslate(error?.message || "UNKNOWN_ERROR"));
        } finally {
            setLoading(false);
        }
    };

    const handleEmailRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await ApiClient.post<SuccessResponse>('/auth/change-email', {
                email: newEmail,
                password: confirmPasswordForEmail
            });
            if (res.status === "SUCCESS") {
                setIsSendedCode(true);
            }
        } catch (error: any) {
            setError(getTranslate(error?.message || "UNKNOWN_ERROR"));
        } finally {
            setLoading(false);
        }
    };

    const handleEmailConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await ApiClient.post('/auth/confirm-change-email', { code: verificationCode });
            switchEditMode('none');
            window.location.reload();
        } catch (error: any) {
            setError(getTranslate(error?.message || "CODE_INVALID"));
        } finally {
            setLoading(false);
        }
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
                                    <div className="profile-avatar-placeholder">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="avatar-actions">
                                <label className="btn btn-primary btn-sm rounded-circle shadow">
                                    <FiCamera /><input type="file" hidden onChange={handleAvatarUpload} accept="image/*" />
                                </label>
                                {avatar && (
                                    <button className="btn btn-danger btn-sm rounded-circle shadow ms-1" onClick={deleteAvatar}>
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h4 className="fw-bold mb-1">{user.username}</h4>
                        <p className="text-muted small mb-4">{user.email}</p>
                        <div className="d-grid gap-2">
                            <button
                                className={`btn btn-sm ${editMode === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => switchEditMode(editMode === 'email' ? 'none' : 'email')}
                            >
                                {getTranslate('changeEmail').toUpperCase()}
                            </button>
                            <button
                                className={`btn btn-sm ${editMode === 'password' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={() => switchEditMode(editMode === 'password' ? 'none' : 'password')}
                            >
                                {getTranslate('changePassword').toUpperCase()}
                            </button>
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
                                    <div className="col-12">
                                        <input type="password" placeholder={getTranslate('currentPassword')} required className="form-control bg-light border-0" value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <input type="password" placeholder={getTranslate('newPassword')} required className="form-control bg-light border-0" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <input type="password" placeholder={getTranslate('confirmNewPassword')} required className="form-control bg-light border-0" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                            {loading ? "..." : getTranslate('confirmBtn').toUpperCase()}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {editMode === 'email' && (
                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <h5 className="fw-bold mb-4"><FiMail className="me-2" />{getTranslate('changeEmail')}</h5>
                            {!isSendedCode ? (
                                <form onSubmit={handleEmailRequest}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase">{getTranslate('emailLabel')}</label>
                                        <input type="email" placeholder="example@mail.com" required className="form-control bg-light border-0" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted text-uppercase">{getTranslate('passwordLabel')}</label>
                                        <input type="password" placeholder={getTranslate('passwordLabel')} required className="form-control bg-light border-0" value={confirmPasswordForEmail} onChange={e => setConfirmPasswordForEmail(e.target.value)} />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                                            {loading ? "..." : getTranslate('sendCode').toUpperCase()}
                                        </button>
                                        <button className="btn btn-light" type="button" onClick={() => switchEditMode('none')}>
                                            {getTranslate('cancelBtn').toUpperCase()}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleEmailConfirm}>
                                    <div className="alert alert-info py-2 small">
                                        {getTranslate('codeSentTo')} <strong>{newEmail}</strong>
                                    </div>
                                    <div className="d-flex flex-column align-items-center">
                                        <input
                                            type="text"
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                            className="form-control bg-light border-0 text-center fw-bold mb-3"
                                            style={{ letterSpacing: '8px', fontSize: '1.5rem', maxWidth: '200px' }}
                                            value={verificationCode}
                                            onChange={e => setVerificationCode(e.target.value)}
                                        />
                                        <div className="d-flex gap-2 w-100">
                                            <button type="submit" className="btn btn-success flex-fill" disabled={loading}>
                                                {getTranslate('confirmBtn').toUpperCase()}
                                            </button>
                                            <button type="button" className="btn btn-light" onClick={() => setIsSendedCode(false)}>
                                                {getTranslate('backBtn').toUpperCase()}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="card-header bg-white p-0 border-bottom">
                            <div className="d-flex">
                                <button
                                    className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${activeTab === 'posts' ? 'text-primary border-bottom' : 'text-muted'}`}
                                    onClick={() => setActiveTab('posts')}
                                >
                                    <FiFileText className="me-2" /> {getTranslate('posts')}
                                </button>
                                <button
                                    className={`flex-fill py-3 border-0 bg-transparent fw-bold small text-uppercase ${activeTab === 'staff' ? 'text-primary border-bottom' : 'text-muted'}`}
                                    onClick={() => setActiveTab('staff')}
                                >
                                    <FiShield className="me-2" /> {getTranslate('staff')}
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {activeTab === 'posts' ? (
                                <div className="list-group list-group-flush">
                                    {posts.length > 0 ? (
                                        posts.map((post) => (
                                            <div
                                                key={post.id}
                                                className="list-group-item p-4 border-0 border-bottom hover-bg-light cursor-pointer d-flex justify-content-between align-items-center"
                                            >
                                                <div>
                                                    <h6 className="fw-bold mb-1">{post.title}</h6>
                                                    <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.75rem' }}>
                                                        <span>ID: {post.wikiId}</span>
                                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                        <span className="badge bg-light text-dark border">{post.status}</span>
                                                    </div>
                                                </div>
                                                <FiChevronRight className="text-muted" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-5 text-center text-muted">
                                            <FiFileText size={48} className="mb-3 opacity-25" />
                                            <p>{getTranslate('noAccount')}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr className="small text-muted text-uppercase">
                                                <th className="ps-4 py-3 border-0">Wiki ID</th>
                                                <th className="border-0">{getTranslate('profile')}</th> {/* Роль */}
                                                <th className="border-0">{getTranslate('home')}</th> {/* Дата или доп. инфо */}
                                                <th className="border-0"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffRecords.length > 0 ? (
                                                staffRecords.map((staff) => (
                                                    <tr key={staff.id}>
                                                        <td className="ps-4 fw-bold text-primary">#{staff.wikiId}</td>
                                                        <td>
                                                            <span className="badge rounded-pill bg-info-subtle text-info border border-info-subtle px-3">
                                                                {staff.role}
                                                            </span>
                                                        </td>
                                                        <td className="text-muted small">
                                                            {new Date(staff.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <button className="btn btn-link btn-sm text-muted p-0">
                                                                <FiChevronRight />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-5 text-center text-muted">
                                                        <FiShield size={48} className="mb-3 opacity-25" />
                                                        <p>{getTranslate('noAccount')}</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
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