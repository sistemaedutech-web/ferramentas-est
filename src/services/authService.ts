export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
}

const AUTH_STORAGE_KEY = 'esantateresinha_admin_auth_v1';
const AUTH_EVENT = 'esantateresinha_auth_changed';

// Configured Super Admin
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'ivan@profesorivan.com.br',
  password: '123@mudar',
  name: 'Prof. Ivan (Super Admin)',
};

export const AuthService = {
  getCurrentUser(): AdminUser | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  async login(
    emailInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    // 1. Try server API login if available
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.admin) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.admin));
          window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: data.admin }));
          return { success: true, user: data.admin };
        }
      }
    } catch {
      // Server not answering or offline, proceed to fallback verification
    }

    // 2. Client verification against Super Admin credentials
    const isSuperAdminEmail =
      email === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() ||
      email === 'canalprofessorivan@gmail.com';

    if (isSuperAdminEmail && password === SUPER_ADMIN_CREDENTIALS.password) {
      const user: AdminUser = {
        id: 'super-admin-ivan',
        name: SUPER_ADMIN_CREDENTIALS.name,
        email: SUPER_ADMIN_CREDENTIALS.email,
        role: 'super_admin',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
      return { success: true, user };
    }

    return {
      success: false,
      error: 'E-mail ou senha inválidos. Verifique as credenciais do Super Admin.',
    };
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
  },

  onAuthChange(callback: (user: AdminUser | null) => void): () => void {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<AdminUser | null>;
      callback(custom.detail || this.getCurrentUser());
    };
    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  },
};
