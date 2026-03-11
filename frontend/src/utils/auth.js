export const TOKEN_KEY = 'adminToken';
const LEGACY_TOKEN_KEY = 'token';

export const getAuthToken = () =>
  localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

export const isAuthenticated = () => Boolean(getAuthToken());

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

export const getDashboardPathByRole = (role) =>
  String(role || '').toLowerCase() === 'admin' ? '/dashboard' : '/pos';

export const setAuthSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
};
