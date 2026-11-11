export function getAuthToken(): string | null {
  return localStorage.getItem('mabele_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('mabele_auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('mabele_auth_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
