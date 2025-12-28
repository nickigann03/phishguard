'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/lib/api';

const Icon = {
    Shield: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
            <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Loader: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    EyeOff: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
};

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                router.push('/');
            } else {
                await register({
                    email,
                    password,
                    full_name: fullName,
                    organization_name: orgName,
                });
                // Auto-login after registration
                await login(email, password);
                router.push('/');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0B0E14 0%, #101820 50%, #0B0E14 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 600,
                height: 600,
                background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: 420,
                background: 'rgba(16, 19, 24, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: 40,
                position: 'relative',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', color: '#10B981', marginBottom: 16 }}>
                        <Icon.Shield />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: 0 }}>PhishGuard</h1>
                    <p style={{ fontSize: 14, color: '#71717A', marginTop: 8 }}>
                        {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, background: '#101318', borderRadius: 8, padding: 4, marginBottom: 24 }}>
                    <button
                        onClick={() => setMode('login')}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            fontSize: 14,
                            fontWeight: 500,
                            color: mode === 'login' ? '#fff' : '#71717A',
                            background: mode === 'login' ? '#27272A' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            fontSize: 14,
                            fontWeight: 500,
                            color: mode === 'register' ? '#fff' : '#71717A',
                            background: mode === 'register' ? '#27272A' : 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                        }}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: '#A1A1AA', marginBottom: 6 }}>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        fontSize: 14,
                                        color: '#fff',
                                        background: '#101318',
                                        border: '1px solid #27272A',
                                        borderRadius: 8,
                                        outline: 'none',
                                    }}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: '#A1A1AA', marginBottom: 6 }}>Organization</label>
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        fontSize: 14,
                                        color: '#fff',
                                        background: '#101318',
                                        border: '1px solid #27272A',
                                        borderRadius: 8,
                                        outline: 'none',
                                    }}
                                    placeholder="Acme Corp"
                                />
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, color: '#A1A1AA', marginBottom: 6 }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: 14,
                                color: '#fff',
                                background: '#101318',
                                border: '1px solid #27272A',
                                borderRadius: 8,
                                outline: 'none',
                            }}
                            placeholder="you@company.com"
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, color: '#A1A1AA', marginBottom: 6 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 44px 12px 14px',
                                    fontSize: 14,
                                    color: '#fff',
                                    background: '#101318',
                                    border: '1px solid #27272A',
                                    borderRadius: 8,
                                    outline: 'none',
                                }}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#71717A',
                                    cursor: 'pointer',
                                }}
                            >
                                {showPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            marginBottom: 16,
                            padding: 12,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8,
                            color: '#EF4444',
                            fontSize: 14,
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px 0',
                            fontSize: 15,
                            fontWeight: 600,
                            color: loading ? '#71717A' : '#000',
                            background: loading ? '#27272A' : '#10B981',
                            border: 'none',
                            borderRadius: 8,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            boxShadow: loading ? 'none' : '0 0 20px rgba(16,185,129,0.3)',
                        }}
                    >
                        {loading ? <><Icon.Loader /> Processing...</> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                {/* Footer */}
                <p style={{ textAlign: 'center', fontSize: 13, color: '#71717A', marginTop: 24 }}>
                    {mode === 'login' ? (
                        <>Don&apos;t have an account? <button onClick={() => setMode('register')} style={{ color: '#10B981', background: 'none', border: 'none', cursor: 'pointer' }}>Register</button></>
                    ) : (
                        <>Already have an account? <button onClick={() => setMode('login')} style={{ color: '#10B981', background: 'none', border: 'none', cursor: 'pointer' }}>Sign In</button></>
                    )}
                </p>
            </div>
        </div>
    );
}
