import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  roblox_username: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: (user) => set({ user }),
  logout: () => {
    set({ user: null });
    fetch('/api/auth/logout', { method: 'POST' });
  },
  checkSession: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
