
// Simple fetch wrapper to replace axios and keep it lightweight
const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    register: async (name, email, password) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
    deductCredit: async () => {
      const res = await fetch(`${API_URL}/auth/deduct-credit`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    rewardCredit: async (amount: number) => {
      const res = await fetch(`${API_URL}/auth/reward-credit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount })
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  },
  spaces: {
    create: async (data) => {
      const res = await fetch(`${API_URL}/groups/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    join: async (code) => {
      const res = await fetch(`${API_URL}/groups/join`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ groupCode: code })
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    getMySpaces: async () => {
      const res = await fetch(`${API_URL}/groups/my-groups`, {
        headers: getHeaders()
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/groups/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/groups/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw await res.json();
      return res.json();
    }
  },
  prompts: {
    create: async (data) => {
      const res = await fetch(`${API_URL}/prompts/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    getBySpace: async (spaceId) => {
      const res = await fetch(`${API_URL}/prompts/${spaceId}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/prompts/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },
    update: async (id, data) => {
         const res = await fetch(`${API_URL}/prompts/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw await res.json();
        return res.json();
    },
    toggleFavorite: async (id) => {
        const res = await fetch(`${API_URL}/prompts/${id}/favorite`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!res.ok) throw await res.json();
        return res.json();
    }
  },
  notifications: {
      get: async () => {
          const res = await fetch(`${API_URL}/notifications`, {
              headers: getHeaders()
          });
          if (!res.ok) throw await res.json();
          return res.json();
      },
      markRead: async (id) => {
          const res = await fetch(`${API_URL}/notifications/${id}/read`, {
              method: 'PUT',
              headers: getHeaders()
          });
          if (!res.ok) throw await res.json();
          return res.json();
      }
  }
};