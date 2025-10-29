/**
 * JWT Token utility functions for handling token expiration and validation
 */

export type UserRole = 'user' | 'admin' | 'expert';

interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  id: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if expired, false if valid, null if invalid token
 */
export function isTokenExpired(token: string): boolean | null {
  const payload = decodeJWT(token);
  if (!payload?.exp) return null;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get token expiration time
 * @param token JWT token string
 * @returns Expiration timestamp in milliseconds or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload?.exp) return null;
  
  return payload.exp * 1000; // Convert to milliseconds
}

/**
 * Get time until token expires
 * @param token JWT token string
 * @returns Time in milliseconds until expiration, or null if invalid/expired
 */
export function getTimeUntilExpiration(token: string): number | null {
  const expiration = getTokenExpiration(token);
  if (!expiration) return null;
  
  const timeUntilExpiration = expiration - Date.now();
  return timeUntilExpiration > 0 ? timeUntilExpiration : null;
}

/**
 * Check if token will expire within specified time
 * @param token JWT token string
 * @param timeInMs Time in milliseconds to check ahead
 * @returns true if token expires within the specified time
 */
export function willExpireSoon(token: string, timeInMs: number = 5 * 60 * 1000): boolean {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (timeUntilExpiration === null) return true;
  
  return timeUntilExpiration <= timeInMs;
}

/**
 * Format expiration time for display
 * @param token JWT token string
 * @returns Formatted expiration string or null if invalid
 */
export function formatTokenExpiration(token: string): string | null {
  const expiration = getTokenExpiration(token);
  if (!expiration) return null;
  
  const date = new Date(expiration);
  return date.toLocaleString();
}

/**
 * Get user role from JWT token
 * @param token JWT token string
 * @returns User role or null if invalid
 */
export function getUserRoleFromToken(token: string): UserRole | null {
  const payload = decodeJWT(token);
  if (!payload?.role) return null;
  
  return payload.role;
}

/**
 * Get user ID from JWT token
 * @param token JWT token string
 * @returns User ID or null if invalid
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload?.id) return null;
  
  return payload.id;
}

/**
 * Get user email from JWT token
 * @param token JWT token string
 * @returns User email or null if invalid
 */
export function getUserEmailFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload?.email) return null;
  
  return payload.email;
}
