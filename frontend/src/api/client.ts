import axios from 'axios';
import type { GenerationStatusPayload } from '../types/generation';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Intercept requests to add JWT token if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('omnipitch_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export const uploadDocument = async (
    files: File[],
    orgName: string,
    purpose: string,
    targetAudience: string,
    keyMessage: string,
    designVibe: string,
) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });
    formData.append('org_name', orgName);
    formData.append('purpose', purpose);
    formData.append('target_audience', targetAudience);
    formData.append('key_message', keyMessage);
    formData.append('design_vibe', designVibe);

    const response = await api.post<GenerationStatusPayload>('/api/upload', formData);
    return response.data;
};

export const checkStatus = async (jobId: string) => {
    const response = await api.get<GenerationStatusPayload>(`/api/status/${jobId}`);
    return response.data;
};

export const getDownloadUrl = (jobId: string) => {
    return `${API_BASE_URL}/api/download/${jobId}`;
};

// --- AUTHENTICATION API ---

export const loginUser = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 requires username field
    formData.append('password', password);

    const response = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data; // { access_token, token_type, persona }
};

export const registerUser = async (firstName: string, lastName: string, companyName: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        email,
        password
    });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/api/auth/me');
    return response.data; // { id, email, persona }
};

export const updatePersona = async (persona: string) => {
    const response = await api.put('/api/auth/persona', { persona });
    return response.data;
};
