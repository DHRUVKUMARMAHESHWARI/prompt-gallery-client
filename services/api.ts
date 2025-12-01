// Simple fetch wrapper to replace axios and keep it lightweight
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  const text = await res.text();
  
  // Log for debugging
  console.log('Response Status:', res.status);
  console.log('Response Text:', text);
  
  if (!res.ok) {
    try {
      const error = JSON.parse(text);
      throw error;
    } catch (e) {
      throw new Error(`Server error (${res.status}): ${text.substring(0, 100)}`);
    }
  }
  
  try {
    return JSON.parse(text) || {};
  } catch {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await handleResponse(res);
        return data || { token: null, user: null };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    register: async (name: string, email: string, password: string) => {
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await handleResponse(res);
        return data || { token: null, user: null };
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    },
    getMe: async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: getHeaders()
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('GetMe error:', error);
        return null;
      }
    },
    deductCredit: async () => {
      try {
        const res = await fetch(`${API_URL}/auth/deduct-credit`, {
          method: 'POST',
          headers: getHeaders()
        });
        return res.ok ? await res.json() : { success: false };
      } catch (error) {
        console.error('Deduct credit error:', error);
        throw error;
      }
    },
    rewardCredit: async (amount: number) => {
      try {
        const res = await fetch(`${API_URL}/auth/reward-credit`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ amount })
        });
        return res.ok ? await res.json() : { success: false };
      } catch (error) {
        console.error('Reward credit error:', error);
        throw error;
      }
    }
  },
  spaces: {
    create: async (data: any) => {
      try {
        const res = await fetch(`${API_URL}/groups/create`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('Create space error:', error);
        throw error;
      }
    },
    join: async (code: string) => {
      try {
        const res = await fetch(`${API_URL}/groups/join`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ groupCode: code })
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('Join space error:', error);
        throw error;
      }
    },
    getMySpaces: async () => {
      try {
        const res = await fetch(`${API_URL}/groups/my-groups`, {
          headers: getHeaders()
        });
        return res.ok ? await res.json() : [];
      } catch (error) {
        console.error('Get spaces error:', error);
        return [];
      }
    },
    update: async (id: string, data: any) => {
      if (!id) throw new Error('Space ID is required');
      try {
        const res = await fetch(`${API_URL}/groups/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('Update space error:', error);
        throw error;
      }
    },
    delete: async (id: string) => {
      if (!id) throw new Error('Space ID is required');
      try {
        const res = await fetch(`${API_URL}/groups/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        return res.ok ? await res.json() : { success: false };
      } catch (error) {
        console.error('Delete space error:', error);
        throw error;
      }
    }
  },
  prompts: {
    create: async (data: any) => {
      try {
        const res = await fetch(`${API_URL}/prompts/create`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('Create prompt error:', error);
        throw error;
      }
    },
    getBySpace: async (spaceId: string) => {
      if (!spaceId) throw new Error('Space ID is required');
      try {
        const res = await fetch(`${API_URL}/prompts/${spaceId}`, {
          headers: getHeaders()
        });
        return res.ok ? await res.json() : [];
      } catch (error) {
        console.error('Get prompts error:', error);
        return [];
      }
    },
    delete: async (id: string) => {
      if (!id) throw new Error('Prompt ID is required');
      try {
        const res = await fetch(`${API_URL}/prompts/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        return res.ok ? await res.json() : { success: false };
      } catch (error) {
        console.error('Delete prompt error:', error);
        throw error;
      }
    },
    update: async (id: string, data: any) => {
      if (!id) throw new Error('Prompt ID is required');
      try {
        const res = await fetch(`${API_URL}/prompts/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('Update prompt error:', error);
        throw error;
      }
    },
    toggleFavorite: async (id: string) => {
      if (!id) throw new Error('Prompt ID is required');
      try {
        const res = await fetch(`${API_URL}/prompts/${id}/favorite`, {
          method: 'PUT',
          headers: getHeaders()
        });
        return res.ok ? await res.json() : null;
      } catch (error) {
        console.error('Toggle favorite error:', error);
        throw error;
      }
    }
  },
  notifications: {
    get: async () => {
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: getHeaders()
        });
        return res.ok ? await res.json() : [];
      } catch (error) {
        console.error('Get notifications error:', error);
        return [];
      }
    },
    markRead: async (id: string) => {
      if (!id) throw new Error('Notification ID is required');
      try {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
          method: 'PUT',
          headers: getHeaders()
        });
        return res.ok ? await res.json() : { success: false };
      } catch (error) {
        console.error('Mark read error:', error);
        throw error;
      }
    }
  }
};