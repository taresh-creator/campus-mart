import type { Listing, ListingWithSeller, Profile, Category } from '@/types/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const TOKEN_KEY = 'campus_mart_token';
const USER_KEY = 'campus_mart_user';

export interface AuthResponse {
  token: string;
  user: Profile;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set application/json only if not uploading FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      if (errorData.errors && typeof errorData.errors === 'object') {
        const fieldErrors = Object.values(errorData.errors).join(', ');
        if (fieldErrors) errorMessage += `: ${fieldErrors}`;
      }
    } catch {
      // Ignore JSON parse error on non-json responses
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return (await response.json()) as T;
}

export const api = {
  auth: {
    async signUp(fullName: string, email: string, password: string): Promise<{ error: string | null; user?: Profile }> {
      try {
        const data = await request<AuthResponse>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ fullName, email, password }),
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { error: null, user: data.user };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Sign up failed' };
      }
    },

    async signIn(email: string, password: string): Promise<{ error: string | null; user?: Profile }> {
      try {
        const data = await request<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { error: null, user: data.user };
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Sign in failed' };
      }
    },

    async getMe(): Promise<Profile | null> {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      try {
        const profile = await request<Profile>('/auth/me');
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        return profile;
      } catch {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
    },

    signOut(): void {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },

    getToken(): string | null {
      return localStorage.getItem(TOKEN_KEY);
    },

    getStoredUser(): Profile | null {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      try {
        return JSON.parse(stored) as Profile;
      } catch {
        return null;
      }
    },
  },

  profiles: {
    async getById(id: string): Promise<Profile> {
      return request<Profile>(`/profiles/${id}`);
    },

    async updateMyProfile(fullName: string): Promise<Profile> {
      const updated = await request<Profile>('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify({ fullName }),
      });
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    },
  },

  listings: {
    async getAll(searchQuery?: string, selectedCategory?: Category | 'All'): Promise<ListingWithSeller[]> {
      const params = new URLSearchParams();
      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const queryString = params.toString();
      const endpoint = `/listings${queryString ? `?${queryString}` : ''}`;
      return request<ListingWithSeller[]>(endpoint);
    },

    async getById(id: string): Promise<ListingWithSeller> {
      return request<ListingWithSeller>(`/listings/${id}`);
    },

    async getMyListings(): Promise<ListingWithSeller[]> {
      return request<ListingWithSeller[]>('/listings/my-listings');
    },

    async create(payload: Partial<Listing>): Promise<ListingWithSeller> {
      return request<ListingWithSeller>('/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: Partial<Listing>): Promise<ListingWithSeller> {
      return request<ListingWithSeller>(`/listings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string): Promise<void> {
      return request<void>(`/listings/${id}`, {
        method: 'DELETE',
      });
    },

    async updateStatus(id: string, status: 'active' | 'sold'): Promise<ListingWithSeller> {
      return request<ListingWithSeller>(`/listings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  upload: {
    async uploadImage(file: File): Promise<{ url: string; path?: string }> {
      const formData = new FormData();
      formData.append('file', file);

      return request<{ url: string; path?: string }>('/upload', {
        method: 'POST',
        body: formData,
      });
    },
  },
};
