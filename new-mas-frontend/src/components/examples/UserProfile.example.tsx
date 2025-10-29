'use client'

import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function UserProfile() {
  const { user, isLoading, isAuthenticated, backendToken } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        {user?.image && (
          <img 
            src={user.image} 
            alt="Profile" 
            className="w-20 h-20 rounded-full"
          />
        )}
        <div className="mt-4">
          <Button onClick={handleSignOut} variant="destructive">
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Example: Using backend token for API calls */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Backend Token (for API calls): 
          <code className="block mt-2 p-2 bg-white rounded text-xs overflow-hidden">
            {backendToken?.substring(0, 50)}...
          </code>
        </p>
      </div>
    </div>
  )
}
