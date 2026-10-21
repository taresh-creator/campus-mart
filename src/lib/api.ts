import type { Profile } from '@/types/supabase';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://campus-mart-zrni.onrender.com/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
}

export const api = {
  auth: {
    getToken(): string | null {
      return localStorage.getItem('token');
    },

    getStoredUser(): Profile | null {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },

    async getMe(): Promise<Profile | null> {
      try {
        return await apiRequest<Profile>('/auth/me');
      } catch {
        return null;
      }
    },

    async signUp(
      fullName: string,
      email: string,
      password: string
    ): Promise<{ user?: Profile; token?: string; error?: string }> {
      try {
        const data = await apiRequest<{
          token: string;
          user: Profile;
        }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            fullName,
            email,
            password,
          }),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Signup failed',
        };
      }
    },

    async signIn(
      email: string,
      password: string
    ): Promise<{ user?: Profile; token?: string; error?: string }> {
      try {
        const data = await apiRequest<{
          token: string;
          user: Profile;
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
          }),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },

    signOut(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
};