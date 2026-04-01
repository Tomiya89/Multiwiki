import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { FiMail, FiLock, FiUser, FiUserPlus, FiShield } from 'react-icons/fi';
import './LoginPage.css';

function RegisterPage() {
    const navigate = useNavigate();
    const { register, confirmRegister, isLoading: authLoading } = useAuth();
    const { getTranslate } = useLocale();

    const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError(getTranslate('PASSWORDS_DONT_MATCH'));
            return;
        }

        setLoading(true);
        try {
            await register(email, username, password);
            setStep('OTP');
        } catch (error) {
            setError(getTranslate(error?.message || "UNKNOWN_ERROR"));
        } finally {
            setLoading(false);
        }
    };
    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await confirmRegister(email, code);
            navigate('/');
        } catch (error) {
            setError(getTranslate(error?.message || "CODE_INVALID"));
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || authLoading;
    return (
        <div className="auth-page-wrapper">
            <div className="auth-card-container">
                <div className="card shadow-sm border-0 auth-card">
                    <div className="card-body p-4 p-md-5">

                        <div className="text-center mb-4">
                            <div className={`auth-icon-circle ${step === 'FORM' ? 'bg-primary' : 'bg-success'} text-white mb-3`}>
                                {step === 'FORM' ? <FiUserPlus size={28} /> : <FiShield size={28} />}
                            </div>
                            <h2 className="fw-bold h4">
                                {step === 'FORM' ? getTranslate('registerTitle') : getTranslate('verifyEmailTitle')}
                            </h2>
                            {step === 'OTP' && (
                                <p className="text-muted small">
                                    {getTranslate('codeSentDesc')} <strong>{email}</strong>
                                </p>
                            )}
                        </div>

                        {step === 'FORM' ? (
                            <form onSubmit={handleInitiate}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">{getTranslate('emailLabel')}</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><FiMail className="text-muted" /></span>
                                        <input
                                            type="email"
                                            className="form-control border-start-0 ps-0 shadow-none"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">{getTranslate('usernameLabel')}</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><FiUser className="text-muted" /></span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0 shadow-none"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            placeholder="johndoe"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">{getTranslate('passwordLabel')}</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><FiLock className="text-muted" /></span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 ps-0 shadow-none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold text-muted">{getTranslate('confirmPasswordLabel')}</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><FiLock className="text-muted" /></span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0 ps-0 shadow-none"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {error && <div className="alert alert-danger py-2 small border-0 text-center mb-3">{error}</div>}

                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3" disabled={isLoading}>
                                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : getTranslate('sendCodeBtn')}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleConfirm}>
                                <div className="mb-4">
                                    <label className="form-label small fw-semibold text-muted d-block text-center">
                                        {getTranslate('enterCodeLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg text-center fw-bold"
                                        style={{ letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                        placeholder="000000"
                                        required
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && <div className="alert alert-danger py-2 small border-0 text-center mb-3">{error}</div>}

                                <button type="submit" className="btn btn-success w-100 py-2 fw-bold rounded-3 mb-2" disabled={isLoading}>
                                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : getTranslate('confirmRegisterBtn')}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-link w-100 btn-sm text-decoration-none text-muted"
                                    onClick={() => setStep('FORM')}
                                    disabled={isLoading}
                                >
                                    {getTranslate('backToEditBtn')}
                                </button>
                            </form>
                        )}

                        <div className="text-center mt-4">
                            <p className="small text-muted mb-0">
                                {getTranslate('hasAccount')}{' '}
                                <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                    {getTranslate('loginLink')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;