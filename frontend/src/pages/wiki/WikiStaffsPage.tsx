import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import ApiClient from '../../services/ApiClient';
import { FiTrash2, FiUserPlus, FiUser, FiChevronLeft, FiChevronRight, FiAlertCircle, FiPlus } from 'react-icons/fi';
import type StaffDTO from '../../entities/Staff';
import PageResponse from '../../entities/PageResponse';
import User from '../../entities/User';
import { getFullImageURL } from '../../entities/Image';



function WikiStaffsPage() {
    const { wikiName } = useParams();
    const { user, isLoading } = useAuth();
    const { wiki } = useWiki();
    const { getTranslate } = useLocale();

    const [staffList, setStaffList] = useState<StaffDTO[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [query, setQuery] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newRole, setNewRole] = useState('AUTHOR');

    const isOwner = user && wiki && user.id === wiki.userId;
    const pageSize = 10;

    const navigate = useNavigate();

    const clearError = () => setError(null);

    const fetchStaff = useCallback(async () => {
        if (!wikiName) return;

        if (isLoading) return;

        if (user == null)
            navigate('/login');

        setLoading(true);
        clearError();
        try {
            const res = await ApiClient.get<PageResponse<StaffDTO>>(
                `/wikis/${wikiName}/staffs?page=${page}&size=${pageSize}&query=${query}`
            );
            setStaffList(res.content);
            setTotalPages(res.totalPages);
        } catch (err: any) {
            const errorKey = err?.message || 'STAFF_FETCH_ERROR';
            setError(getTranslate(errorKey));
        } finally {
            setLoading(false);
        }
    }, [wikiName, isLoading, page, query, user, getTranslate]);

    useEffect(() => {
        setPage(0);
    }, [query]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleAdd = async () => {
        if (!newUsername.trim()) return;
        clearError();
        try {
            await ApiClient.post(`/wikis/${wikiName}/staffs`, {
                username: newUsername.trim(),
                role: newRole
            });
            setNewUsername('');
            fetchStaff();
        } catch (err: any) {
            console.log(err);
            const errorKey = err?.message || 'STAFF_ADD_ERROR';
            setError(getTranslate(errorKey));
        }
    };

    const handleRoleChange = async (userId: number, role: string) => {
        clearError();
        try {
            await ApiClient.put(`/wikis/${wikiName}/staffs/${userId}`, { role });
            fetchStaff();
        } catch (err: any) {
            const errorKey = err?.message || 'STAFF_UPDATE_ERROR';
            setError(getTranslate(errorKey));
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm(getTranslate('confirmDelete') || 'Вы уверены?')) return;
        clearError();
        try {
            await ApiClient.delete(`/wikis/${wikiName}/staffs/${userId}`);
            fetchStaff();
        } catch (err: any) {
            if (err?.message === 'NOT_FOUND'){
                fetchStaff();
                return;
            }
            const errorKey = err?.message || 'STAFF_DELETE_ERROR';
            setError(getTranslate(errorKey));
        }
    };

    const getAvatarUrl = (user: User) => user?.avatar ? getFullImageURL(user?.avatar) : null;
    const getInitial = (user: User) => user?.username?.charAt(0).toUpperCase() || "?";

    if (!isOwner) {
        return (
            <div className="alert alert-danger shadow-sm rounded-4 mt-4 text-center">
                {getTranslate('accessDenied')}
            </div>
        );
    }

    return (
        <div className="mx-auto" style={{ maxWidth: '900px' }}>
            <h2 className="fw-bold mb-4 px-2">{getTranslate('manageStaff')}</h2>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 py-3 d-flex justify-content-between align-items-center mx-2">
                    <span className="d-flex align-items-center gap-2"><FiAlertCircle /> {error}</span>
                    <button type="button" className="btn-close" onClick={clearError}></button>
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 p-md-4">
                <h5 className="mb-3 d-flex align-items-center gap-2">
                    <FiUserPlus /> {getTranslate('addUser')}
                </h5>

                <div className="row g-2">
                    <div className="col-12 col-md-6">
                        <input
                            className="form-control form-control-lg"
                            placeholder="username"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            onFocus={clearError}
                        />
                    </div>

                    <div className="col-8 col-md-3">
                        <select
                            className="form-select form-select-lg w-100"
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                        >
                            <option value="AUTHOR">{getTranslate('author')}</option>
                            <option value="OWNER">{getTranslate('owner')}</option>
                        </select>
                    </div>

                    <div className="col-4 col-md-3">
                        <button
                            className="btn btn-primary btn-lg w-100 h-100 d-flex align-items-center justify-content-center"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            <span className="d-none d-md-inline">{getTranslate('add')}</span>
                            <FiPlus className="d-md-none" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="mb-3 px-2">
                <input className="form-control" placeholder={getTranslate('findByUsername')} value={query} onChange={e => setQuery(e.target.value)} />
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 d-none d-md-block">
                <table className="table align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4">{getTranslate('user')}</th>
                            <th>{getTranslate('role')}</th>
                            <th className="text-end pe-4">{getTranslate('action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={3} className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            : staffList.length === 0 ? <tr><td colSpan={3} className="text-center py-4 text-muted">{getTranslate('notFound')}</td></tr>
                                : staffList.map((s) => (
                                    <tr key={s.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-2">
                                                {getAvatarUrl(s.user) ? <img src={getAvatarUrl(s.user)!} className="rounded-circle object-fit-cover" style={{ width: '32px', height: '32px' }} alt="" />
                                                    : <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary border" style={{ width: '32px', height: '32px' }}><span className="fw-bold small">{getInitial(s.user)}</span></div>}
                                                <span className="fw-medium">{s.user?.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <select className="form-select form-select-sm" style={{ width: '120px' }} value={s.role} onChange={(e) => handleRoleChange(s.user.id, e.target.value)}>
                                                <option value="AUTHOR">{getTranslate('author')}</option>
                                                <option value="OWNER">{getTranslate('owner')}</option>
                                            </select>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(s.user.id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            <div className="d-block d-md-none">
                {loading ? <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
                    : staffList.length === 0 ? <div className="text-center py-4 text-muted">{getTranslate('notFound')}</div>
                        : staffList.map((s) => (
                            <div key={s.id} className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        {getAvatarUrl(s.user) ? <img src={getAvatarUrl(s.user)!} className="rounded-circle object-fit-cover" style={{ width: '40px', height: '40px' }} alt="" />
                                            : <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}><span className="fw-bold">{getInitial(s.user)}</span></div>}
                                        <span className="fw-bold fs-6">{s.user?.username}</span>
                                    </div>
                                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(s.user.id)}><FiTrash2 /></button>
                                </div>
                                <select className="form-select form-select-lg w-100" value={s.role} onChange={(e) => handleRoleChange(s.user.id, e.target.value)}>
                                    <option value="AUTHOR">{getTranslate('author')}</option>
                                    <option value="OWNER">{getTranslate('owner')}</option>
                                </select>
                            </div>
                        ))}
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-4 pb-4">
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" disabled={page === 0} onClick={() => setPage(page - 1)}>
                        <FiChevronLeft /> <span className="d-none d-sm-inline">{getTranslate('backBtn')}</span>
                    </button>
                    <span className="text-muted small mx-2">{page + 1} / {totalPages}</span>
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                        <span className="d-none d-sm-inline">{getTranslate("forwardBtn")}</span> <FiChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
}

export default WikiStaffsPage;