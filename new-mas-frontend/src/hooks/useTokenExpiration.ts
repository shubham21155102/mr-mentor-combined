import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { isTokenExpired, willExpireSoon, getTimeUntilExpiration, formatTokenExpiration } from '@/lib/jwt';

/**
 * Hook to check JWT token expiration status
 * @returns Object with token expiration utilities
 */
export function useTokenExpiration() {
  const { data: session } = useSession();

  const checkTokenExpiration = useCallback(() => {
    const token = session?.backendToken;
    if (!token) return null;

    return {
      isExpired: isTokenExpired(token),
      willExpireSoon: willExpireSoon(token),
      timeUntilExpiration: getTimeUntilExpiration(token),
      formattedExpiration: formatTokenExpiration(token),
    };
  }, [session?.backendToken]);

  const tokenStatus = checkTokenExpiration();

  return {
    tokenStatus,
    checkTokenExpiration,
    isTokenValid: tokenStatus?.isExpired === false,
    isTokenExpired: tokenStatus?.isExpired === true,
    willExpireSoon: tokenStatus?.willExpireSoon || false,
  };
}
