import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import ApiClient from '../services/ApiClient';
import { FiLock, FiArrowLeft } from 'react-icons/fi';

function ForgotPasswordPage () {
    const { getTranslate } = useLocale();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCodeSent, setIsCodeSent] = useState(false);

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await ApiClient.post('/auth/password/forgot', { email });
            setIsCodeSent(true);
        } catch (err: any) {
            if (err?.message == 'NOT_FOUND')
                setError(getTranslate("EMAIL_IS_NOT_FOUND"));
            else
                setError(getTranslate(err?.message || "UNKNOWN_ERROR"));
        } finally {
            setLoading(false);
        }
    };


    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (newPassword !== confirmPassword) {
            setError(getTranslate('PASSWORDS_DONT_MATCH'));
            return;
        }
        setLoading(true);
        try {
            await ApiClient.post('/auth/password/reset', {
                email,
                code,
                newPassword
            });
            navigate('/login');
        } catch (err: any) {
            setError(getTranslate(err?.message || "UNKNOWN_ERROR"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 d-flex justify-content-center">
            <div className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm p-4 rounded-4">
                    <h4 className="fw-bold mb-4 text-center">
                        <FiLock className="me-2 text-primary" />
                        {getTranslate('forgotPassword')}
                    </h4>

                    {error && <div className="alert alert-danger py-2 small">{error}</div>}

                    {!isCodeSent ? (
                        <form onSubmit={handleRequestCode}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted text-uppercase">{getTranslate('emailLabel')}</label>
                                <input
                                    type="email"
                                    required
                                    className="form-control bg-light border-0"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                {loading ? "..." : getTranslate('sendCode')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-3 text-center text-muted small">
                                {getTranslate('codeSentTo')} <strong>{email}</strong>
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder={getTranslate('verificationCode')}
                                    maxLength={6}
                                    required
                                    className="form-control bg-light border-0 text-center fw-bold mb-3"
                                    style={{ letterSpacing: '4px' }}
                                    value={code}
                                    autoComplete='none'
                                    onChange={e => setCode(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    placeholder={getTranslate('newPassword')}
                                    required
                                    autoComplete='new-password'
                                    className="form-control bg-light border-0"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    placeholder={getTranslate('confirmNewPassword')}
                                    required
                                    autoComplete='new-password'
                                    className="form-control bg-light border-0"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100" disabled={loading}>
                                {loading ? "..." : getTranslate('confirmBtn')}
                            </button>
                            <button type="button" className="btn btn-link w-100 mt-2 text-decoration-none text-muted" onClick={() => setIsCodeSent(false)}>
                                <FiArrowLeft className="me-1" /> {getTranslate('backBtn')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;