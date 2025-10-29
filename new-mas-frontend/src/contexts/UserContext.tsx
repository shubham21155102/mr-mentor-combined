'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getUserDetails } from "@/app/action"
import { isTokenExpired, willExpireSoon, getUserRoleFromToken, type UserRole } from '@/lib/jwt';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profession: string;
  domain: string;
  profilePhoto: string;
  isVerified: boolean;
  role?: UserRole; // User role from token
  createdAt: string;
  updatedAt: string;
  tokens: Array<{
    id: string;
    token: string;
    userId: string;
    createdAt: string;
    expiresAt: string | null;
  }>;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  userRole: UserRole | null; // Exposed user role for easy access
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUserDetails: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Login function - kept for backward compatibility but not used with NextAuth
  const login = React.useCallback(async (token: string) => {
    // This is now handled by NextAuth signIn
    console.warn('Direct login called - use NextAuth signIn instead');
  }, []);

  const logout = React.useCallback(async () => {
    setUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    await signOut({ callbackUrl: '/login' });
  }, []);

  const fetchUserDetails = React.useCallback(async () => {
    try {
      // Get token from NextAuth session
      // @ts-ignore - backendToken is our custom property
      const token = session?.backendToken;
      
      if (!token) {
        setIsLoading(false);
        setUser(null);
        setIsLoggedIn(false);
        setUserRole(null);
        return;
      }

      // Check if token is expired
      const tokenExpired = isTokenExpired(token);
      if (tokenExpired === true) {
        console.warn('JWT token is expired, logging out user');
        await logout();
        return;
      }

      // Check if token will expire soon (within 5 minutes)
      if (willExpireSoon(token, 5 * 60 * 1000)) {
        console.warn('JWT token will expire soon, consider refreshing');
      }

      // Extract user role from token
      const roleFromToken = getUserRoleFromToken(token);
      setUserRole(roleFromToken);

      const result = await getUserDetails(token);

      if (result.success) {
        setUser({
          ...result.data,
          role: roleFromToken || undefined
        });
        setIsLoggedIn(true);
      } else {
        // If the error is due to token expiration, logout the user
        if (result.error?.includes('token') || result.error?.includes('expired') || result.error?.includes('unauthorized')) {
          console.warn('Token appears to be invalid/expired based on API response, logging out');
          await logout();
          return;
        }
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      
      // Check if error is related to authentication
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      if (errorMessage.includes('unauthorized') || errorMessage.includes('token') || errorMessage.includes('expired')) {
        console.warn('Authentication error detected, logging out user');
        await logout();
        return;
      }
      
      setUser(null);
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, logout]);  // Periodic token expiration check
  useEffect(() => {
    if (!isLoggedIn || !session?.backendToken) return;

    const checkTokenExpiration = () => {
      const token = session.backendToken;
      if (token && isTokenExpired(token) === true) {
        console.warn('Token expired during periodic check, logging out');
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, session?.backendToken, logout]);

  // Fetch user details when session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'authenticated' && session) {
      fetchUserDetails();
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, [session, status, fetchUserDetails]);

  const value: UserContextType = React.useMemo(() => ({
    user,
    isLoading,
    isLoggedIn,
    userRole,
    login,
    logout,
    fetchUserDetails,
  }), [user, isLoading, isLoggedIn, userRole, login, logout, fetchUserDetails]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};