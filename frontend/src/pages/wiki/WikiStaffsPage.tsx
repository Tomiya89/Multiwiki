import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import ApiClient from '../../services/ApiClient';
import { FiTrash2, FiUserPlus, FiUser, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import type StaffDTO from '../../entities/Staff';
import PageResponse from '../../entities/PageResponse';

function WikiStaffsPage() {
    const { wikiName } = useParams();
    const { user } = useAuth();
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

    const clearError = () => setError(null);

    const fetchStaff = useCallback(async () => {
        if (!wikiName || !user) return;

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
    }, [wikiName, page, query, user, getTranslate]);

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
            const errorKey = err?.message || 'STAFF_DELETE_ERROR';
            setError(getTranslate(errorKey));
        }
    };

    if (!isOwner) {
        return (
            <div className="alert alert-danger shadow-sm rounded-4 mt-4 text-center">
                {getTranslate('accessDenied')}
            </div>
        );
    }

    return (
        <div className="mx-auto" style={{ maxWidth: '900px' }}>
            <h2 className="fw-bold mb-4">{getTranslate('manageStaff')}</h2>

            {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 py-3 d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2">
                        <FiAlertCircle /> {error}
                    </span>
                    <button type="button" className="btn-close" onClick={clearError}></button>
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 mb-4 p-4">
                <h5 className="mb-3 d-flex align-items-center gap-2">
                    <FiUserPlus /> {getTranslate('addUser')}
                </h5>
                <div className="row g-2">
                    <div className="col-md-6">
                        <input
                            className="form-control"
                            placeholder="username"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            onFocus={clearError}
                        />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                            <option value="AUTHOR">{getTranslate('author')}</option>
                            <option value="OWNER">{getTranslate('owner')}</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <button className="btn btn-primary w-100" onClick={handleAdd} disabled={loading}>
                            {getTranslate('add')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <input
                    className="form-control"
                    placeholder={getTranslate('findByUsername')}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">{getTranslate('user')}</th>
                                <th>{getTranslate('role')}</th>
                                <th className="text-end pe-4">{getTranslate('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : staffList.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-4 text-muted">{getTranslate('notFound')}</td></tr>
                            ) : (
                                staffList.map((s) => (
                                    <tr key={s.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light rounded-circle p-2"><FiUser /></div>
                                                <span className="fw-medium">{s.user?.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm w-auto"
                                                value={s.role}
                                                onChange={(e) => handleRoleChange(s.user.id, e.target.value)}
                                            >
                                                <option value="AUTHOR">{getTranslate('author')}</option>
                                                <option value="OWNER">{getTranslate('owner')}</option>
                                            </select>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(s.user.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                    >
                        <FiChevronLeft /> {getTranslate('backBtn')}
                    </button>
                    <span className="text-muted small">{getTranslate("page")} {page + 1} / {totalPages}</span>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(page + 1)}
                    >
                        {getTranslate("forwardBtn")} <FiChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
}

export default WikiStaffsPage;