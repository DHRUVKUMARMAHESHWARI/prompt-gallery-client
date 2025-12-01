
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prompt, Space, User, Notification } from '../types';
import { INITIAL_PROMPTS, INITIAL_SPACES, MOCK_USER } from '../constants';
import { api } from '../services/api';

interface StoreContextType {
  user: User | null;
  spaces: Space[];
  prompts: Prompt[];
  notifications: Notification[];
  activeSpaceId: string | 'all' | 'favorites';
  searchQuery: string;
  isDemoMode: boolean;
  isLoading: boolean;
  setSearchQuery: (q: string) => void;
  setActiveSpaceId: (id: string | 'all' | 'favorites') => void;
  addPrompt: (prompt: any) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  joinSpace: (code: string) => Promise<boolean>;
  createSpace: (name: string, type: Space['type']) => Promise<void>;
  updateSpace: (id: string, name: string, description: string) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  login: (e: string, p: string) => Promise<void>;
  register: (n: string, e: string, p: string) => Promise<void>;
  logout: () => void;
  useAICredit: () => Promise<boolean>;
  addAICredits: (amount: number) => Promise<void>;
  filteredPrompts: Prompt[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (token === 'root-demo-token') {
        enableDemoMode();
      } else if (token) {
        try {
          const userData = await api.auth.getMe();
          setUser(userData);
          await loadSpaces();
          // Load notifications initially
          loadNotifications();
        } catch (e) {
          console.error("Auth failed", e);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Poll for notifications
  useEffect(() => {
      if (!user || isDemoMode) return;
      const interval = setInterval(() => {
          loadNotifications();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
  }, [user, isDemoMode]);

  // Fetch prompts when active space changes
  useEffect(() => {
    if (user && !isDemoMode && activeSpaceId !== 'all' && activeSpaceId !== 'favorites') {
        loadPrompts(activeSpaceId);
    }
  }, [activeSpaceId, user, isDemoMode]);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setUser({ ...MOCK_USER, id: 'root', name: 'Root Admin', aiCredits: 999 });
    setSpaces(INITIAL_SPACES);
    setPrompts(INITIAL_PROMPTS);
    setNotifications([]);
    localStorage.setItem('token', 'root-demo-token');
  };

  const loadSpaces = async () => {
      const data = await api.spaces.getMySpaces();
      setSpaces(data);
  };

  const loadPrompts = async (spaceId: string) => {
      const data = await api.prompts.getBySpace(spaceId);
      setPrompts(data);
  };

  const loadNotifications = async () => {
      try {
          const data = await api.notifications.get();
          setNotifications(data);
      } catch (e) {
          console.error("Failed to load notifications", e);
      }
  };

  const login = async (email, password) => {
    if (email === 'root' && password === 'root123') {
      enableDemoMode();
      return;
    }
    const data = await api.auth.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsDemoMode(false);
    await loadSpaces();
    await loadNotifications();
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register(name, email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsDemoMode(false);
    await loadSpaces();
    await loadNotifications();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSpaces([]);
    setPrompts([]);
    setNotifications([]);
    setIsDemoMode(false);
  };

  const useAICredit = async (): Promise<boolean> => {
      if (isDemoMode) return true;
      try {
          const res = await api.auth.deductCredit();
          if (res.success) {
              setUser(prev => prev ? { ...prev, aiCredits: res.aiCredits } : null);
              return true;
          }
          return false;
      } catch (e) {
          console.error("Credit deduction failed", e);
          return false;
      }
  };

  const addAICredits = async (amount: number) => {
      if (isDemoMode) {
          setUser(prev => prev ? { ...prev, aiCredits: (prev.aiCredits || 0) + amount } : null);
          return;
      }
      try {
          const res = await api.auth.rewardCredit(amount);
          if (res.success) {
              setUser(prev => prev ? { ...prev, aiCredits: res.aiCredits } : null);
          }
      } catch (e) {
          console.error("Failed to reward credits", e);
      }
  };

  // --- CRUD Operations ---

  const addPrompt = async (data: any) => {
    if (isDemoMode) {
        const newPrompt: Prompt = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            authorId: user?.id || 'root',
            version: 1,
            isFavorite: false,
        };
        setPrompts([newPrompt, ...prompts]);
    } else {
        const newPrompt = await api.prompts.create({ ...data, authorId: user?.id });
        setPrompts([newPrompt, ...prompts]);
    }
  };

  const updatePrompt = async (id: string, updates: Partial<Prompt>) => {
    if (isDemoMode) {
        setPrompts(prompts.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
    } else {
        const updated = await api.prompts.update(id, updates);
        setPrompts(prompts.map(p => p.id === id ? updated : p));
    }
  };

  const deletePrompt = async (id: string) => {
    if (isDemoMode) {
        setPrompts(prompts.filter(p => p.id !== id));
    } else {
        await api.prompts.delete(id);
        setPrompts(prompts.filter(p => p.id !== id));
    }
  };

  const createSpace = async (name: string, type: Space['type']) => {
    if (isDemoMode) {
        const newSpace: Space = {
            id: Math.random().toString(36).substr(2, 9),
            name, type, memberCount: 1, promptCount: 0,
            role: 'OWNER', icon: 'Zap', color: 'text-neon-pink',
            joinCode: type === 'TEAM' ? 'DEMO123' : undefined
        };
        setSpaces([...spaces, newSpace]);
        setActiveSpaceId(newSpace.id);
    } else {
        const newSpace = await api.spaces.create({ name, type });
        setSpaces([...spaces, newSpace]);
        setActiveSpaceId(newSpace.id);
    }
  };

  const updateSpace = async (id: string, name: string, description: string) => {
      if (isDemoMode) {
          setSpaces(spaces.map(s => s.id === id ? { ...s, name, description } : s));
      } else {
          const updated = await api.spaces.update(id, { name, description });
          setSpaces(spaces.map(s => s.id === id ? updated : s));
      }
  };

  const deleteSpace = async (id: string) => {
      if (isDemoMode) {
          setSpaces(spaces.filter(s => s.id !== id));
          setPrompts(prompts.filter(p => p.spaceId !== id));
          if (activeSpaceId === id) setActiveSpaceId('all');
      } else {
          await api.spaces.delete(id);
          setSpaces(spaces.filter(s => s.id !== id));
          if (activeSpaceId === id) setActiveSpaceId('all');
      }
  };

  const joinSpace = async (code: string): Promise<boolean> => {
    if (isDemoMode) {
        if (code.length < 5) return false;
        const joinedSpace: Space = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Joined (${code})`, type: 'TEAM', memberCount: 5, promptCount: 10,
            role: 'MEMBER', icon: 'Users', color: 'text-neon-blue', joinCode: code
        };
        setSpaces([...spaces, joinedSpace]);
        return true;
    } else {
        try {
            const space = await api.spaces.join(code);
            setSpaces([...spaces, space]);
            // Refresh notifications immediately so user sees the "You Joined" alert
            await loadNotifications();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
  };

  const toggleFavorite = async (id: string) => {
      if (isDemoMode) {
          setPrompts(prompts.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
      } else {
          try {
            const result = await api.prompts.toggleFavorite(id);
            setPrompts(prompts.map(p => p.id === id ? { ...p, isFavorite: result.isFavorite } : p));
          } catch (e) {
              console.error("Failed to toggle favorite", e);
          }
      }
  };

  const markNotificationRead = async (id: string) => {
      if (isDemoMode) {
          setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      } else {
          await api.notifications.markRead(id);
          setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
  }

  // Filter Logic
  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSpaceId === 'favorites') return matchesSearch && p.isFavorite;
    
    // For specific spaces, prompts are already filtered by the API call in loadPrompts
    // But we still apply local search
    return matchesSearch;
  }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <StoreContext.Provider value={{
      user, spaces, prompts, notifications, activeSpaceId, searchQuery, isDemoMode, isLoading,
      setSearchQuery, setActiveSpaceId, addPrompt, updatePrompt,
      deletePrompt, toggleFavorite, joinSpace, createSpace, updateSpace, deleteSpace,
      markNotificationRead, login, register, logout, useAICredit, addAICredits, filteredPrompts
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};