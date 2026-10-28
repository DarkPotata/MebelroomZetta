const BASE_URL = 'http://localhost:3000';

export async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token'); // Токен для stateless авторизации
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || `Ошибка HTTP: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}