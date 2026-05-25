const STORAGE_KEY = 'vedaai_token';

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEY);
  },
  set(token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, token);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
