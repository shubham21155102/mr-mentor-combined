'use client'

import { useSession } from 'next-auth/react'

export interface ExtendedSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  backendToken?: string
  accessToken?: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const user = session?.user
  const backendToken = (session as ExtendedSession)?.backendToken
  const accessToken = (session as ExtendedSession)?.accessToken

  return {
    session: session as ExtendedSession,
    status,
    isLoading,
    isAuthenticated,
    user,
    backendToken,
    accessToken,
  }
}
