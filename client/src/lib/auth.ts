import { apiRequest } from "./queryClient";

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
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  async register(data: RegisterData) {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("company_data");
  },

  getToken() {
    return localStorage.getItem("auth_token");
  },

  saveAuthData(token: string, user: any, company: any) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(user));
    localStorage.setItem("company_data", JSON.stringify(company));
  },

  getStoredAuthData() {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user_data");
    const companyStr = localStorage.getItem("company_data");

    if (!token || !userStr || !companyStr) {
      return null;
    }

    try {
      return {
        token,
        user: JSON.parse(userStr),
        company: JSON.parse(companyStr),
      };
    } catch {
      return null;
    }
  },
};
