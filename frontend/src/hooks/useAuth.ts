import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authApi, LoginPayload, RegisterPayload } from '@/api/auth.api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const store = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (payload: LoginPayload) => {
      store.setLoading(true);
      try {
        const res = await authApi.login(payload);
        if (res.data.data) {
          store.setAuth(res.data.data.user, res.data.data.tokens);
          toast.success(`Welcome back, ${res.data.data.user.name}!`);
          navigate('/dashboard');
        }
      } catch {
        store.setLoading(false);
        toast.error('Invalid credentials');
        throw new Error('Invalid credentials');
      }
    },
    [store, navigate]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      store.setLoading(true);
      try {
        const res = await authApi.register(payload);
        if (res.data.data) {
          store.setAuth(res.data.data.user, res.data.data.tokens);
          toast.success('Account created successfully!');
          navigate('/dashboard');
        }
      } catch {
        store.setLoading(false);
        toast.error('Registration failed');
        throw new Error('Registration failed');
      }
    },
    [store, navigate]
  );

  const logout = useCallback(() => {
    store.logout();
    navigate('/login');
    toast.success('Logged out');
  }, [store, navigate]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login,
    register,
    logout,
  };
};
