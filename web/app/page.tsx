'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDashboard, DashboardData } from '@/lib/api';

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
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Chart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3" /></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>,
  Up: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="m18 15-6-6-6 6" /></svg>,
  Down: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="m6 9 6 6 6-6" /></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M12 2a15 15 0 0 0 0 20 15 15 0 0 0 0-20M2 12h20" /></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
  Loader: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
};

const navItems = [
  { label: 'Overview', icon: Icon.Grid, href: '/', active: true },
  { label: 'Campaigns', icon: Icon.Mail, href: '/campaigns' },
  { label: 'AI Generate', icon: Icon.Sparkles, href: '/ai-generator' },
  { label: 'Team', icon: Icon.Users, href: '/team' },
  { label: 'Analytics', icon: Icon.Chart, href: '/analytics' },
  { label: 'Settings', icon: Icon.Settings, href: '/settings' },
];

// Fallback data when API fails or for demo
const fallbackData: DashboardData = {
  summary: {
    total_campaigns: 24,
    active_campaigns: 12,
    total_emails_sent: 4892,
    total_clicks: 890,
    overall_click_rate: 18.2,
    users_trained: 1847,
    avg_risk_score: 72,
  },
  recent_campaigns: [
    { id: '1', name: 'Executive Spear Phishing', status: 'active', targets_count: 47, clicks_count: 8, click_rate: 17.0, created_at: '2024-12-28' },
    { id: '2', name: 'IT Helpdesk Impersonation', status: 'active', targets_count: 234, clicks_count: 41, click_rate: 17.5, created_at: '2024-12-25' },
    { id: '3', name: 'Quarterly Security Drill', status: 'completed', targets_count: 892, clicks_count: 156, click_rate: 17.5, created_at: '2024-12-20' },
    { id: '4', name: 'New Hire Onboarding Test', status: 'completed', targets_count: 45, clicks_count: 12, click_rate: 26.7, created_at: '2024-12-15' },
  ],
  risk_by_department: { 'Finance': 78, 'HR': 65, 'Engineering': 42 },
  click_trend: [],
};

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [data, setData] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboard();
        setData(dashboardData);
        setApiConnected(true);
      } catch {
        // Use fallback data if API fails
        console.log('Using demo data - API not connected');
        setApiConnected(false);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0E14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#71717A' }}>
          <Icon.Loader />
          <p style={{ marginTop: 16 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) return null;

  const score = data.summary.avg_risk_score;
  const circ = 2 * Math.PI * 54;
  const offset = circ - (score / 100) * circ;
  const scoreColor = score > 70 ? '#F97316' : score > 40 ? '#FBBF24' : '#10B981';

  const handleLogout = () => {
    logout();
    router.push('/login');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: '#10B981' }}><Icon.Shield /></div>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>PhishGuard</span>
          </div>
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
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 4 }} title="Logout">
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
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>Security Overview</h1>
            <p style={{ fontSize: 13, color: '#71717A', margin: '4px 0 0' }}>
              {apiConnected ? 'Live data from API' : 'Demo mode - Connect API for real data'}
            </p>
          </div>
          <a href="/campaigns" style={{
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
            boxShadow: '0 0 15px rgba(16,185,129,0.4)',
            textDecoration: 'none',
          }}>
            <Icon.Plus />
            Launch Campaign
          </a>
        </header>

        {/* CONTENT */}
        <div style={{ padding: 24, opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          {/* METRICS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Active Campaigns', value: data.summary.active_campaigns.toString(), delta: '+3', up: true },
              { label: 'Emails Sent (30d)', value: data.summary.total_emails_sent.toLocaleString(), delta: '+847', up: true },
              { label: 'Avg Click Rate', value: `${data.summary.overall_click_rate.toFixed(1)}%`, delta: '-2.1%', up: false },
              { label: 'Users Trained', value: data.summary.users_trained.toLocaleString(), delta: '+124', up: true },
            ].map((m, i) => (
              <div key={i} style={{ background: '#101318', border: '1px solid #27272A', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717A', fontWeight: 500, marginBottom: 12 }}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 600, color: '#fff' }}>{m.value}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: m.up ? '#10B981' : '#F97316' }}>
                    {m.up ? <Icon.Up /> : <Icon.Down />}
                    {m.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* CAMPAIGNS TABLE */}
            <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #27272A' }}>
                <span style={{ fontWeight: 500, color: '#fff' }}>Recent Campaigns</span>
                <a href="/campaigns" style={{ fontSize: 13, color: '#10B981', textDecoration: 'none' }}>View all →</a>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #27272A' }}>
                    {['Campaign', 'Status', 'Targets', 'Clicked', 'Rate'].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717A', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recent_campaigns.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#fff', fontWeight: 500 }}>{c.name}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 500,
                          borderRadius: 4,
                          background: c.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                          color: c.status === 'active' ? '#10B981' : '#3B82F6',
                          border: `1px solid ${c.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
                          textTransform: 'capitalize',
                        }}>
                          {c.status === 'active' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />}
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#A1A1AA', fontFamily: 'monospace' }}>{c.targets_count}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#A1A1AA', fontFamily: 'monospace' }}>{c.clicks_count}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontFamily: 'monospace', color: c.click_rate > 20 ? '#F97316' : '#10B981' }}>{c.click_rate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RISK GAUGE */}
            <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717A', fontWeight: 500, marginBottom: 16 }}>Risk Score</div>
              <div style={{ position: 'relative', width: 130, height: 130 }}>
                <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#27272A" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 600, color: scoreColor }}>{score}</div>
                  <div style={{ fontSize: 11, color: '#71717A' }}>/100</div>
                </div>
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: '#A1A1AA', textAlign: 'center' }}>
                {score > 70 ? 'High risk detected' : score > 40 ? 'Moderate risk' : 'Low risk'}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            {/* DEPARTMENT RISK */}
            <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Icon.Users />
                <span style={{ fontWeight: 500, color: '#fff' }}>Risk by Department</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(data.risk_by_department).map(([dept, risk], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: '#A1A1AA' }}>{dept}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 100, height: 6, borderRadius: 3, background: '#27272A', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: risk > 70 ? '#F97316' : risk > 40 ? '#FBBF24' : '#10B981', width: `${risk}%` }} />
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: risk > 70 ? '#F97316' : risk > 40 ? '#FBBF24' : '#10B981', width: 40, textAlign: 'right' }}>{risk}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI GENERATE */}
            <a href="/ai-generator" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ background: '#101318', border: '1px solid #27272A', borderRadius: 8, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', marginBottom: 12 }}>
                  <Icon.Zap />
                  <span style={{ fontWeight: 500, color: '#fff' }}>AI Generate</span>
                </div>
                <p style={{ fontSize: 13, color: '#71717A', marginBottom: 16 }}>Create realistic phishing templates with AI.</p>
                <div style={{
                  width: '100%',
                  padding: '10px 0',
                  fontSize: 14,
                  color: '#A1A1AA',
                  background: 'transparent',
                  border: '1px solid #27272A',
                  borderRadius: 6,
                  textAlign: 'center',
                }}>
                  Generate Template
                </div>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
