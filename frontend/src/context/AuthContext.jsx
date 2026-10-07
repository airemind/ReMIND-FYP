import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  googleLogin,
  loginUser,
  logoutUser,
  saveToken
} from '../middleware/authMiddleware';

import { getCurrentUser } from '../middleware/userMiddleware';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Load Current User */

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);

      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* Login */

  const login = useCallback(async (credentials) => {
    try {
      const response = await loginUser(credentials);

      const token =
        response?.access_token ||
        response?.token;

      if (!token) {
        throw new Error('Authentication token not received.');
      }

      saveToken(token);

      const currentUser = await getCurrentUser();

      setUser(currentUser);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  /* Google Login */

  const loginWithGoogle = useCallback(async (googleData) => {
    try {
      const response = await googleLogin(googleData);

      const token =
        response?.access_token ||
        response?.token;

      if (!token) {
        throw new Error('Authentication token not received.');
      }

      saveToken(token);

      const currentUser = await getCurrentUser();

      setUser(currentUser);

      return response;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }, []);

  /* Logout */

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
