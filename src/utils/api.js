const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('kgc_auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    },
    signup: async (userData) => {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    },
    generateOTP: async (email) => {
      const res = await fetch(`${API_URL}/api/otp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    },
    verifyOTP: async (email, otp) => {
      const res = await fetch(`${API_URL}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      return await res.json();
    }
  },

  // Data Persistence
  get: async (collection) => {
    try {
      const res = await fetch(`${API_URL}/api/data/${collection}`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API Get failed for ${collection}:`, err.message);
      return null;
    }
  },
  post: async (collection, data) => {
    try {
      const res = await fetch(`${API_URL}/api/data/${collection}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Post failed for ${collection}:`, err.message);
      return null;
    }
  },
  put: async (collection, id, data) => {
    try {
      const res = await fetch(`${API_URL}/api/data/${collection}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Put failed for ${collection}/${id}:`, err.message);
      return null;
    }
  },
  delete: async (collection, id) => {
    try {
      const res = await fetch(`${API_URL}/api/data/${collection}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Delete failed for ${collection}/${id}:`, err.message);
      return null;
    }
  },
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('kgc_auth_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Upload failed:`, err);
      return { error: true, message: err.message };
    }
  },
  getRecovery: async () => {
    try {
      const res = await fetch(`${API_URL}/api/recovery`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Recovery fetch failed:`, err.message);
      return [];
    }
  },
  restore: async (collection, id) => {
    try {
      const res = await fetch(`${API_URL}/api/recovery/restore/${collection}/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Restore failed for ${collection}/${id}:`, err.message);
      return null;
    }
  },
  permanentDelete: async (collection, id) => {
    try {
      const res = await fetch(`${API_URL}/api/recovery/permanent/${collection}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Permanent Delete failed for ${collection}/${id}:`, err.message);
      return null;
    }
  }
};
