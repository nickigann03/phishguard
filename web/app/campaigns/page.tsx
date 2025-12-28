'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getCampaigns, Campaign } from '@/lib/api';

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
    Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>,
    Play: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" /></svg>,
    Eye: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    MoreH: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>,
    Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    Loader: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
};

const navItems = [
    { label: 'Overview', icon: Icon.Grid, href: '/' },
    { label: 'Campaigns', icon: Icon.Mail, href: '/campaigns', active: true },
    { label: 'AI Generate', icon: Icon.Sparkles, href: '/ai-generator' },
    { label: 'Team', icon: Icon.Users, href: '/team' },
    { label: 'Analytics', icon: Icon.Chart, href: '/analytics' },
    { label: 'Settings', icon: Icon.Settings, href: '/settings' },
];

// Demo data fallback
const demoCampaigns = [
    { id: '1', name: 'Executive Spear Phishing', status: 'active', template_id: '1', targets_count: 47, clicks_count: 8, created_at: '2024-12-28' },
    { id: '2', name: 'IT Helpdesk Impersonation', status: 'active', template_id: '2', targets_count: 234, clicks_count: 41, created_at: '2024-12-25' },
    { id: '3', name: 'Quarterly Security Drill', status: 'completed', template_id: '3', targets_count: 892, clicks_count: 156, created_at: '2024-12-20' },
    { id: '4', name: 'New Hire Onboarding Test', status: 'completed', template_id: '4', targets_count: 45, clicks_count: 12, created_at: '2024-12-15' },
    { id: '5', name: 'Finance Team Assessment', status: 'draft', template_id: '5', targets_count: 23, clicks_count: 0, created_at: '2024-12-28' },
    { id: '6', name: 'Board Member Simulation', status: 'scheduled', template_id: '6', targets_count: 8, clicks_count: 0, created_at: '2024-12-27' },
];

export default function CampaignsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await getCampaigns();
                setCampaigns(data);
            } catch {
                // Use demo data
                setCampaigns(demoCampaigns as Campaign[]);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchCampaigns();
        }
    }, [isAuthenticated]);

    if (authLoading || !isAuthenticated) return null;

    const filteredCampaigns = campaigns.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || c.status.toLowerCase() === filter;
        return matchSearch && matchFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return { bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.2)' };
            case 'completed': return { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: 'rgba(59,130,246,0.2)' };
            case 'scheduled': return { bg: 'rgba(249,115,22,0.1)', color: '#F97316', border: 'rgba(249,115,22,0.2)' };
            default: return { bg: 'rgba(113,113,122,0.1)', color: '#71717A', border: 'rgba(113,113,122,0.2)' };
        }
    };

    const calcRate = (clicks: number, targets: number) => targets > 0 ? (clicks / targets * 100) : 0;

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
                        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>Campaigns</h1>
                        <p style={{ fontSize: 13, color: '#71717A', margin: '4px 0 0' }}>Manage and monitor your phishing simulation campaigns</p>
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 16px',
                        background: '#10B981',
                        color: '#000',
                        fontWeight: 600,
                        fontSize: 14,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(16,185,129,0.4)'
                    }}>
                        <Icon.Plus />
                        New Campaign
                    </button>
                </header>

                {/* CONTENT */}
                <div style={{ padding: 24 }}>
                    {/* Filters Row */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717A' }}>
                                <Icon.Search />
                            </div>
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 36px',
                                    fontSize: 14,
                                    color: '#fff',
                                    background: '#101318',
                                    border: '1px solid #27272A',
                                    borderRadius: 6,
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 4, background: '#101318', borderRadius: 6, padding: 4 }}>
                            {['all', 'active', 'completed', 'scheduled', 'draft'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 13,
                                        color: filter === f ? '#fff' : '#71717A',
                                        background: filter === f ? '#27272A' : 'transparent',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#71717A' }}>
                            <Icon.Loader />
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #27272A' }}>
                                        {['Campaign', 'Status', 'Targets', 'Clicked', 'Click Rate', 'Created', 'Actions'].map((h) => (
                                            <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717A', fontWeight: 500 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCampaigns.map((c) => {
                                        const statusStyle = getStatusStyle(c.status);
                                        const rate = calcRate(c.clicks_count, c.targets_count);
                                        return (
                                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '14px 16px', fontSize: 14, color: '#fff', fontWeight: 500 }}>{c.name}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '4px 10px',
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        borderRadius: 4,
                                                        background: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        border: `1px solid ${statusStyle.border}`,
                                                        textTransform: 'capitalize',
                                                    }}>
                                                        {c.status === 'active' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />}
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 14, color: '#A1A1AA', fontFamily: 'monospace' }}>{c.targets_count}</td>
                                                <td style={{ padding: '14px 16px', fontSize: 14, color: '#A1A1AA', fontFamily: 'monospace' }}>{c.clicks_count}</td>
                                                <td style={{ padding: '14px 16px', fontSize: 14, fontFamily: 'monospace', color: rate > 20 ? '#F97316' : rate > 0 ? '#10B981' : '#71717A' }}>
                                                    {rate > 0 ? `${rate.toFixed(1)}%` : '-'}
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#71717A' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        {c.status === 'draft' && (
                                                            <button style={{ padding: '6px 10px', fontSize: 12, color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <Icon.Play /> Launch
                                                            </button>
                                                        )}
                                                        <button style={{ padding: '6px 10px', fontSize: 12, color: '#A1A1AA', background: 'transparent', border: '1px solid #27272A', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Icon.Eye /> View
                                                        </button>
                                                        <button style={{ padding: '6px', color: '#71717A', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                                            <Icon.MoreH />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredCampaigns.length === 0 && (
                                <div style={{ padding: 40, textAlign: 'center', color: '#71717A' }}>
                                    No campaigns found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
