const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token storage
let accessToken: string | null = null;

export function setToken(token: string) {
    accessToken = token;
    if (typeof window !== 'undefined') {
        localStorage.setItem('phishguard_token', token);
    }
}

export function getToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        return localStorage.getItem('phishguard_token');
    }
    return null;
}

export function clearToken() {
    accessToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('phishguard_token');
    }
}

// API request helper
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============================================
// AUTH API
// ============================================

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Invalid credentials');
    }

    const data = await response.json();
    setToken(data.access_token);
    return data;
}

export async function register(data: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
}) {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getCurrentUser() {
    return request('/auth/me');
}

// ============================================
// ANALYTICS API
// ============================================

export interface DashboardSummary {
    total_campaigns: number;
    active_campaigns: number;
    total_emails_sent: number;
    total_clicks: number;
    overall_click_rate: number;
    users_trained: number;
    avg_risk_score: number;
}

export interface CampaignStats {
    id: string;
    name: string;
    status: string;
    targets_count: number;
    clicks_count: number;
    click_rate: number;
    created_at: string;
}

export interface DashboardData {
    summary: DashboardSummary;
    recent_campaigns: CampaignStats[];
    risk_by_department: Record<string, number>;
    click_trend: { date: string; clicks: number }[];
}

export async function getDashboard(): Promise<DashboardData> {
    return request('/analytics/dashboard');
}

// ============================================
// CAMPAIGNS API
// ============================================

export interface Campaign {
    id: string;
    name: string;
    status: string;
    template_id: string;
    landing_page_id?: string;
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
    targets_count: number;
    clicks_count: number;
    created_at: string;
}

export async function getCampaigns(): Promise<Campaign[]> {
    return request('/campaigns/');
}

export async function getCampaign(id: string): Promise<Campaign> {
    return request(`/campaigns/${id}`);
}

export async function createCampaign(data: {
    name: string;
    template_id: string;
    target_type: string;
    target_ids?: string[];
    department?: string;
}): Promise<Campaign> {
    return request('/campaigns/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function launchCampaign(id: string): Promise<{ message: string }> {
    return request(`/campaigns/${id}/launch`, { method: 'POST' });
}

// ============================================
// TEMPLATES API
// ============================================

export interface Template {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    body_text: string;
    country_code: string;
    language: string;
    category: string;
    difficulty: string;
    brand_impersonated?: string;
    is_active: boolean;
    created_at: string;
}

export async function getTemplates(filters?: {
    country?: string;
    category?: string;
}): Promise<Template[]> {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.category) params.append('category', filters.category);

    const query = params.toString();
    return request(`/templates/${query ? `?${query}` : ''}`);
}

export async function getTemplate(id: string): Promise<Template> {
    return request(`/templates/${id}`);
}

// ============================================
// AI GENERATION API
// ============================================

export interface GenerateTemplateRequest {
    prompt: string;
    country_code?: string;
    language?: string;
    brand_category?: string;
}

export interface GeneratedTemplate {
    subject: string;
    body_html: string;
    body_text: string;
    difficulty: string;
    estimated_success_rate: string;
}

export async function generateTemplate(
    data: GenerateTemplateRequest
): Promise<GeneratedTemplate> {
    return request('/ai/generate-template', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
