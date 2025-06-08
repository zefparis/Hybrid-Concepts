export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  company: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    type: string;
  };
  user: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    return data;
  },

  async register(data: RegisterData) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result = await response.json();
    return result;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    window.location.href = '/';
  },

  getToken() {
    return localStorage.getItem('token');
  },

  saveAuthData(token: string, user: any, company: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('company', JSON.stringify(company));
  },

  getStoredAuthData() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const company = localStorage.getItem('company');

    if (token && user && company) {
      return {
        token,
        user: JSON.parse(user),
        company: JSON.parse(company),
      };
    }

    return null;
  },
};