import axios, { AxiosInstance } from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User,
  ApiResponse 
} from '../types';

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || []
      };
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService: Making login request to:', `${this.api.defaults.baseURL}/auth/login`);
      console.log('AuthService: Login credentials:', { email: credentials.email, password: '***' });
      
      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      console.log('AuthService: Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        console.log('AuthService: Setting token');
        this.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      console.error('AuthService: Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors || []
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get<{ success: boolean; user: User }>('/auth/me');
      return {
        success: response.data.success,
        data: response.data.user
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user profile'
      };
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/verify-email');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify email'
      };
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Set token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Store user data
   */
  setStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Remove stored user data
   */
  removeStoredUser(): void {
    localStorage.removeItem('user');
  }
}

export default new AuthService();
