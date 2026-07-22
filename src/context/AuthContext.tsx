import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { isDemoMode } from '../firebase/firebase';
import { generateId } from '../utils/formatCurrency';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS_KEY = 'expense_tracker_users';
const DEMO_CURRENT_USER_KEY = 'expense_tracker_current_user';

const getDemoUsers = (): Record<string, { email: string; password: string; user: User }> => {
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveDemoUsers = (users: Record<string, { email: string; password: string; user: User }>) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

const getCurrentDemoUser = (): User | null => {
  const stored = localStorage.getItem(DEMO_CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      const savedUser = getCurrentDemoUser();
      setUser(savedUser);
      setLoading(false);
    } else {
      // Real Firebase auth state listener
      Promise.all([
        import('../firebase/firebase'),
        import('firebase/auth')
      ]).then(([{ auth }, { onAuthStateChanged }]) => {
        if (auth) {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
            if (firebaseUser) {
              const userData: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                currency: 'USD',
                monthlyBudget: 0,
              };
              setUser(userData);
              localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(userData));
            } else {
              setUser(null);
              localStorage.removeItem(DEMO_CURRENT_USER_KEY);
            }
            setLoading(false);
          });
          return () => unsubscribe();
        }
        setLoading(false);
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      const users = getDemoUsers();
      const found = Object.values(users).find(u => u.email === email);
      if (!found || found.password !== password) {
        throw new Error('Invalid email or password');
      }
      setUser(found.user);
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(found.user));
      return;
    }
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('../firebase/firebase');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    if (isDemoMode) {
      const users = getDemoUsers();
      const exists = Object.values(users).find(u => u.email === email);
      if (exists) throw new Error('Email already in use');
      
      const newUser: User = {
        uid: generateId(),
        email,
        displayName: name,
        photoURL: '',
        createdAt: new Date().toISOString(),
        currency: 'USD',
        monthlyBudget: 0,
      };
      users[newUser.uid] = { email, password, user: newUser };
      saveDemoUsers(users);
      setUser(newUser);
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(newUser));
      return;
    }
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { auth } = await import('../firebase/firebase');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem(DEMO_CURRENT_USER_KEY);
      return;
    }
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('../firebase/firebase');
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode) {
      const users = getDemoUsers();
      const found = Object.values(users).find(u => u.email === email);
      if (!found) throw new Error('No account found with this email');
      return;
    }
    const { sendPasswordResetEmail } = await import('firebase/auth');
    const { auth } = await import('../firebase/firebase');
    await sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      const newUser: User = {
        uid: generateId(),
        email: 'demo@google.com',
        displayName: 'Demo User',
        photoURL: '',
        createdAt: new Date().toISOString(),
        currency: 'USD',
        monthlyBudget: 0,
      };
      const users = getDemoUsers();
      users[newUser.uid] = { email: newUser.email, password: '', user: newUser };
      saveDemoUsers(users);
      setUser(newUser);
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(newUser));
      return;
    }
    const { signInWithPopup } = await import('firebase/auth');
    const { auth, googleProvider } = await import('../firebase/firebase');
    await signInWithPopup(auth, googleProvider);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      if (isDemoMode) {
        const users = getDemoUsers();
        if (users[user.uid]) {
          users[user.uid].user = updatedUser;
          saveDemoUsers(users);
        }
      }
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (isDemoMode && user) {
      const users = getDemoUsers();
      if (users[user.uid]) {
        users[user.uid].password = newPassword;
        saveDemoUsers(users);
      }
      return;
    }
    const { updatePassword: fbUpdatePassword } = await import('firebase/auth');
    const { auth } = await import('../firebase/firebase');
    if (auth.currentUser) {
      await fbUpdatePassword(auth.currentUser, newPassword);
    }
  };

  const deleteAccount = async () => {
    if (user) {
      if (isDemoMode) {
        const users = getDemoUsers();
        delete users[user.uid];
        saveDemoUsers(users);
      }
      setUser(null);
      localStorage.removeItem(DEMO_CURRENT_USER_KEY);
      localStorage.removeItem(`expenses_${user.uid}`);
      localStorage.removeItem(`income_${user.uid}`);
      localStorage.removeItem(`budgets_${user.uid}`);
      localStorage.removeItem(`categories_${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      resetPassword,
      signInWithGoogle,
      updateUserProfile,
      updatePassword,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
