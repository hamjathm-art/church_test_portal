const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authFetch = async (url, options = {}) => {
  const accessToken = localStorage.getItem('accessToken');
 
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  // If token expired, try refreshing
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const refreshResult = await refreshResponse.json();

      if (refreshResult.success) {
        localStorage.setItem('accessToken', refreshResult.data.accessToken);
        headers['Authorization'] = `Bearer ${refreshResult.data.accessToken}`;
        response = await fetch(`${API_BASE}${url}`, { ...options, headers });
      } else {
        // Refresh failed — clear tokens and reload to login
        localStorage.clear();
        window.location.href = '/login';
        return response;
      }
    } else {
      localStorage.clear();
      window.location.href = '/login';
      return response;
    }
  }

  return response;
};

export default authFetch;
