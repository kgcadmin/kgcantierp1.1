const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const api = {
  get: async (collection) => {
    try {
      const res = await fetch(`${API_URL}/api/data/${collection}`);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        method: 'DELETE'
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
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
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
      const res = await fetch(`${API_URL}/api/recovery`);
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
        method: 'POST'
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
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Permanent Delete failed for ${collection}/${id}:`, err.message);
      return null;
    }
  },
  sendEmail: async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`API Send Email failed:`, err.message);
      return { success: false, error: err.message };
    }
  }
};
