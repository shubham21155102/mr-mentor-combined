'use client'

import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/lib/jwt';

/**
 * Example component that shows how to use user roles for dynamic UI
 */
export const RoleBasedComponent = () => {
  const { user, userRole, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Role-Based Dashboard</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Logged in as: {user.email}</p>
        <p className="text-sm font-medium">Role: {userRole || 'No role assigned'}</p>
      </div>

      {/* Admin-only content */}
      {userRole === 'admin' && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 mb-3">
          <h3 className="font-bold text-red-700">Admin Panel</h3>
          <p className="text-sm text-red-600">You have full administrative access</p>
          <ul className="mt-2 text-sm text-red-600">
            <li>• Manage all users</li>
            <li>• View analytics</li>
            <li>• System settings</li>
          </ul>
        </div>
      )}

      {/* Expert-only content */}
      {userRole === 'expert' && (
        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 mb-3">
          <h3 className="font-bold text-blue-700">Expert Dashboard</h3>
          <p className="text-sm text-blue-600">You can mentor students and manage sessions</p>
          <ul className="mt-2 text-sm text-blue-600">
            <li>• View scheduled sessions</li>
            <li>• Manage availability</li>
            <li>• Access mentor tools</li>
          </ul>
        </div>
      )}

      {/* User-only content */}
      {userRole === 'user' && (
        <div className="p-3 bg-green-50 border-l-4 border-green-500 mb-3">
          <h3 className="font-bold text-green-700">Student Dashboard</h3>
          <p className="text-sm text-green-600">Book sessions with experts</p>
          <ul className="mt-2 text-sm text-green-600">
            <li>• Browse mentors</li>
            <li>• Book sessions</li>
            <li>• View history</li>
          </ul>
        </div>
      )}

      {/* Common content for all users */}
      <div className="p-3 bg-gray-50 border-l-4 border-gray-500">
        <h3 className="font-bold text-gray-700">Common Features</h3>
        <p className="text-sm text-gray-600">Available to all logged-in users</p>
        <ul className="mt-2 text-sm text-gray-600">
          <li>• Profile settings</li>
          <li>• Notifications</li>
          <li>• Support</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role: UserRole) => {
  const { userRole } = useUser();
  return userRole === role;
};

/**
 * Component wrapper that only renders children if user has the required role
 */
interface RoleGuardProps {
  role: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ role, children, fallback = null }) => {
  const { userRole } = useUser();

  const hasRole = Array.isArray(role) 
    ? role.includes(userRole as UserRole)
    : userRole === role;

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
