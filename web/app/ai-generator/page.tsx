'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { generateTemplate, GeneratedTemplate } from '@/lib/api';

/* ============ ICONS ============ */
const Icon = {
    Shield: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Grid: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    Mail: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    Sparkles: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>,
    Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
    Chart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>,
    Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3" /></svg>,
    Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    Copy: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 6L9 17l-5-5" /></svg>,
    Loader: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
};

const navItems = [
    { label: 'Overview', icon: Icon.Grid, href: '/' },
    { label: 'Campaigns', icon: Icon.Mail, href: '/campaigns' },
    { label: 'AI Generate', icon: Icon.Sparkles, href: '/ai-generator', active: true },
    { label: 'Team', icon: Icon.Users, href: '/team' },
    { label: 'Analytics', icon: Icon.Chart, href: '/analytics' },
    { label: 'Settings', icon: Icon.Settings, href: '/settings' },
];

const presets = [
    { label: 'IT Support Request', prompt: 'IT helpdesk asking to verify account credentials due to suspicious activity' },
    { label: 'HR Bonus Notification', prompt: 'HR department announcing year-end bonus, requiring bank details update' },
    { label: 'Invoice Payment', prompt: 'Finance department urgent invoice payment request from vendor' },
    { label: 'Password Expiry', prompt: 'System notification about password expiring, need to reset immediately' },
    { label: 'CEO Request', prompt: 'Urgent request from CEO for wire transfer to new vendor' },
];

const countries = [
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'US', name: 'United States' },
];

const categories = [
    { value: 'corporate', label: 'Corporate / Internal' },
    { value: 'banking', label: 'Banking & Finance' },
    { value: 'ecommerce', label: 'E-Commerce' },
    { value: 'government', label: 'Government' },
    { value: 'tech', label: 'Tech / SaaS' },
];

export default function AIGenerator() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [country, setCountry] = useState('MY');
    const [category, setCategory] = useState('corporate');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GeneratedTemplate | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || !isAuthenticated) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await generateTemplate({
                prompt: prompt.trim(),
                country_code: country,
                brand_category: category,
            });
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed. Make sure the API is running and you have a valid Groq API key.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0E14' }}>
            {/* SIDEBAR */}
            <aside style={{
                width: 220,
                minWidth: 220,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                background: 'rgba(11,14,20,0.95)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100
            }}>
                <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{ color: '#10B981' }}><Icon.Shield /></div>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>PhishGuard</span>
                    </a>
                </div>
                <nav style={{ flex: 1, padding: '12px 0' }}>
                    {navItems.map((item, i) => (
                        <a key={i} href={item.href} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            margin: '2px 8px',
                            borderRadius: 6,
                            fontSize: 14,
                            textDecoration: 'none',
                            color: item.active ? '#fff' : '#71717A',
                            background: item.active ? 'rgba(255,255,255,0.05)' : 'transparent',
                        }}>
                            <item.icon />
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#000' }}>
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user?.full_name || 'User'}</div>
                            <div style={{ fontSize: 11, color: '#71717A' }}>{user?.role || 'Admin'}</div>
                        </div>
                        <button onClick={() => { logout(); router.push('/login'); }} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 4 }}>
                            <Icon.Logout />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
                {/* HEADER */}
                <header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(11,14,20,0.9)',
                    backdropFilter: 'blur(12px)'
                }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon.Zap />
                            AI Template Generator
                        </h1>
                        <p style={{ fontSize: 13, color: '#71717A', margin: '4px 0 0' }}>Generate realistic phishing templates using Groq AI</p>
                    </div>
                </header>

                {/* CONTENT */}
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* LEFT: INPUT */}
                    <div>
                        {/* Quick Presets */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#71717A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Presets</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {presets.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(p.prompt)}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: 13,
                                            color: '#A1A1AA',
                                            background: 'transparent',
                                            border: '1px solid #27272A',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#71717A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scenario Description</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the phishing scenario you want to create..."
                                style={{
                                    width: '100%',
                                    height: 120,
                                    padding: 14,
                                    fontSize: 14,
                                    color: '#fff',
                                    background: '#101318',
                                    border: '1px solid #27272A',
                                    borderRadius: 8,
                                    resize: 'none',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {/* Options Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: '#71717A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Country</label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        fontSize: 14,
                                        color: '#fff',
                                        background: '#101318',
                                        border: '1px solid #27272A',
                                        borderRadius: 8,
                                        outline: 'none',
                                    }}
                                >
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, color: '#71717A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        fontSize: 14,
                                        color: '#fff',
                                        background: '#101318',
                                        border: '1px solid #27272A',
                                        borderRadius: 8,
                                        outline: 'none',
                                    }}
                                >
                                    {categories.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
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
                            {loading ? <><Icon.Loader /> Generating with Groq AI...</> : <><Icon.Zap /> Generate Template</>}
                        </button>

                        {error && (
                            <div style={{ marginTop: 16, padding: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444', fontSize: 14 }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: OUTPUT */}
                    <div>
                        {result ? (
                            <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: 8, overflow: 'hidden' }}>
                                {/* Subject */}
                                <div style={{ padding: 16, borderBottom: '1px solid #27272A' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <label style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject Line</label>
                                        <button onClick={() => copyToClipboard(result.subject, 'subject')} style={{ background: 'none', border: 'none', color: copied === 'subject' ? '#10B981' : '#71717A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                            {copied === 'subject' ? <><Icon.Check /> Copied</> : <><Icon.Copy /> Copy</>}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>{result.subject}</div>
                                </div>

                                {/* Body */}
                                <div style={{ padding: 16, borderBottom: '1px solid #27272A' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <label style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Body (HTML)</label>
                                        <button onClick={() => copyToClipboard(result.body_html, 'html')} style={{ background: 'none', border: 'none', color: copied === 'html' ? '#10B981' : '#71717A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                            {copied === 'html' ? <><Icon.Check /> Copied</> : <><Icon.Copy /> Copy</>}
                                        </button>
                                    </div>
                                    <div
                                        style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto', padding: 12, background: '#101318', borderRadius: 6 }}
                                        dangerouslySetInnerHTML={{ __html: result.body_html }}
                                    />
                                </div>

                                {/* Metadata */}
                                <div style={{ padding: 16, display: 'flex', gap: 16 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Difficulty</div>
                                        <div style={{ fontSize: 14, color: '#fff', textTransform: 'capitalize' }}>{result.difficulty}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Est. Success Rate</div>
                                        <div style={{ fontSize: 14, color: result.estimated_success_rate === 'high' ? '#F97316' : result.estimated_success_rate === 'medium' ? '#FBBF24' : '#10B981', textTransform: 'capitalize' }}>{result.estimated_success_rate}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ padding: 16, borderTop: '1px solid #27272A', display: 'flex', gap: 12 }}>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px 0',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: '#fff',
                                        background: '#10B981',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                    }}>
                                        Save as Template
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        padding: '10px 0',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: '#A1A1AA',
                                        background: 'transparent',
                                        border: '1px solid #27272A',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                    }}>
                                        Use in Campaign
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(24,24,27,0.5)',
                                border: '1px solid #27272A',
                                borderRadius: 8,
                                height: '100%',
                                minHeight: 400,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#71717A',
                                textAlign: 'center',
                                padding: 40,
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>✨</div>
                                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No template generated yet</div>
                                <div style={{ fontSize: 14 }}>Describe a scenario and click Generate to create a phishing template</div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
