/**
 * Frontend authentication utility.
 *
 * Stores and retrieves the JWT token and user data from localStorage.
 * The backend issues a JWT on POST /api/auth/login with payload:
 *   { token, message, user: { id, name, email, role } }
 *
 * The token contains { userId, role, iat, exp } and expires in 1 day.
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "government" | "public";
}

/** Save the JWT token to localStorage. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Retrieve the stored JWT token, or null if absent. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Save user data to localStorage. */
export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Retrieve the stored user, or null if absent or malformed. */
export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/** Check whether authentication data is present. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/** Remove all stored authentication data. */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
