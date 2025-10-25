import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { djangoApi, User } from '../services/djangoApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (username: string, email: string, password: string, fullName: string, role: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await djangoApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string, fullName: string, role: string) => {
    const userData = await djangoApi.register(username, email, password, fullName, role);
    setUser(userData);
  };

  const signIn = async (username: string, password: string) => {
    const userData = await djangoApi.login(username, password);
    setUser(userData);
  };

  const signOut = async () => {
    djangoApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
