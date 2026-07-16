import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import * as authService from '@/api/authService';
import { clearStoredToken, getErrorMessage, getStoredToken, setStoredToken } from '@/api/axios';
import type { LoginPayload, RegisterPayload, User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUser = (data: User & { _id?: string }): User => ({
  id: data.id || data._id || '',
  name: data.name,
  email: data.email,
  role: data.role,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      setUser(normalizeUser(response.data as User & { _id?: string }));
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const response = await authService.login(payload);
      setStoredToken(response.token);
      setUser(normalizeUser(response.data));
      toast.success(`Welcome back, ${response.data.name}!`);
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed. Please try again.');
      toast.error(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const response = await authService.register(payload);
      setStoredToken(response.token);
      setUser(normalizeUser(response.data));
      toast.success('Account created successfully!');
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed. Please try again.');
      toast.error(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
