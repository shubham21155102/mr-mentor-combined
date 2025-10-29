'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  ChevronRight, 
  Edit, 
  Lock,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConditionalNavBar from '@/components/ConditionalNavBar'
import Footer from '@/components/Footer'

interface MentorProfile {
  id: string;
  company: string;
  role: string;
  institute: string;
  slotsLeft: number;
  description: string;
  category: string;
  subCategory: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const { user, isLoading, userRole } = useUser()
  const { data: session } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordEditing, setIsPasswordEditing] = useState(false)
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profession: user?.profession || '',
    domain: user?.domain || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // Fetch mentor profile if user is an expert/mentor
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!user?.id || (userRole !== 'expert' && userRole !== 'admin')) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mentors/${user.id}/profile`)
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'OK' && data.data?.mentorProfile?.[0]) {
            setMentorProfile(data.data.mentorProfile[0])
          }
        }
      } catch (error) {
        console.error('Error fetching mentor profile:', error)
      }
    }

    fetchMentorProfile()
  }, [user?.id, userRole])

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profession: user.profession || '',
        domain: user.domain || '',
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Implementation for save functionality will be added
    setIsEditing(false)
  }

  const handlePasswordUpdate = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setIsPasswordLoading(true)

    try {
      // Get token from NextAuth session
      // @ts-ignore - backendToken is our custom property
      const token = session?.backendToken
      
      if (!token) {
        setPasswordError('You must be logged in to change your password')
        setIsPasswordLoading(false)
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      setPasswordSuccess('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsPasswordEditing(false)

      // Auto-clear success message after 5 seconds
      setTimeout(() => setPasswordSuccess(''), 5000)
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsPasswordLoading(false)
    }
  }
  const isMentor = userRole === 'expert' || userRole === 'admin'

  return (
    <>
      <ConditionalNavBar/>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation - Exact Figma positioning */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <nav className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Profile Page</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header - Exact Figma layout */}
          <div className="bg-white rounded-lg shadow-sm mb-8 mt-8">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user?.profilePhoto || '/placeholder-avatar.jpg'} alt={user?.fullName} />
                      <AvatarFallback className="text-2xl">
                        {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-2xl font-semibold text-[#1A97A4]">
                        {user?.fullName || 'Placeholder text'}
                      </h1>
                      {isMentor && (
                        <Badge className="text-white px-3 py-1 rounded-xl" style={{ background: 'linear-gradient(146deg, #F6C218 16.03%, #1A97A4 87.5%)' }}>
                          Mentor
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-gray-600">
                      {mentorProfile?.role || user?.profession || 'Placeholder text'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    id="profile-picture-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      // Handle profile picture upload
                      const file = e.target.files?.[0]
                      if (file) {
                        // TODO: Implement file upload logic
                        console.log('Profile picture file selected:', file)
                        // You can implement the actual upload functionality here
                      }
                    }}
                  />
                  <Button
                    className="bg-white text-[#1A97A4] px-6 py-2 h-10 rounded-2xl border-black border"
                    onClick={() => document.getElementById('profile-picture-upload')?.click()}
                  >
                    Change Profile picture
                    <Edit className="ml-2 h-4 w-4" />
                  </Button>
                  {isMentor && (
                    <div className="bg-[#245fb9] rounded-3xl p-6 text-white relative overflow-hidden w-64 h-32">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                      <div className="relative z-10">
                        <p className="text-4xl font-semibold italic mb-2">2.5x</p>
                        <Button
                          className="bg-white text-[#1a97a4] hover:bg-gray-100 shadow-lg"
                          size="sm"
                          onClick={() => router.push('/mentor-multiplier')}
                        >
                          View Breakdown
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section - Exact Figma layout */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1A97A4]">Personal Information</h2>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-6 py-2 h-10"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </div>
              
              <Separator className="mb-8" />
              
              {/* First row - 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Full Name</div>
                  {isEditing ? (
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1"
                      aria-label="Full Name"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm">{user?.fullName || 'Placeholder text'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Email</div>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                      aria-label="Email"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm">{user?.email || 'Placeholder text'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Phone</div>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1"
                      aria-label="Phone"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm">{user?.phone || 'Placeholder text'}</p>
                  )}
                </div>
              </div>
              
              {/* Second row - 2 or 3 columns based on role */}
              <div className={`grid grid-cols-1 ${isMentor ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 mb-8`}>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Profession</div>
                  {isEditing ? (
                    <Input
                      value={formData.profession}
                      onChange={(e) => handleInputChange('profession', e.target.value)}
                      className="mt-1"
                      aria-label="Profession"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm">{user?.profession || 'Placeholder text'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Domain</div>
                  {isEditing ? (
                    <Input
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      className="mt-1"
                      aria-label="Domain"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm">{user?.domain || 'Placeholder text'}</p>
                  )}
                </div>
                
                {isMentor && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">College</div>
                    <p className="text-gray-900 text-sm">{mentorProfile?.institute || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Mentor-specific fields */}
              {isMentor && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Company</div>
                      <p className="text-gray-900 text-sm">{mentorProfile?.company || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Designation</div>
                      <p className="text-gray-900 text-sm">{mentorProfile?.role || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">LinkedIn Profile Link</div>
                      <p className="text-gray-900 text-sm">https://linkedin.com/in/mentor</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">About me</div>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        {mentorProfile?.description || "I'm a passionate professional who loves helping others grow and achieve their goals."}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Rating</div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${
                              star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {isEditing && (
                <div className="flex justify-end space-x-4 mt-8">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Password Section - Exact Figma layout */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              </div>
              
              <Separator className="mb-8" />
              
              {/* Error and Success Messages */}
              {passwordError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {passwordSuccess}
                </div>
              )}
              
              <div className="max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="flex items-center space-x-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          handlePasswordChange('currentPassword', e.target.value)
                          setPasswordError('')
                        }}
                        className="mt-1"
                        disabled={!isPasswordEditing}
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Lock className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          handlePasswordChange('newPassword', e.target.value)
                          setPasswordError('')
                        }}
                        className="mt-1"
                        disabled={!isPasswordEditing}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/forgot-password')}
                    className="text-blue-600 hover:text-blue-700 px-6 py-2 h-10"
                  >
                    Forgot password
                  </Button>
                  
                  <div className="flex space-x-4">
                    {isPasswordEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsPasswordEditing(false)
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                            setPasswordError('')
                            setPasswordSuccess('')
                          }} 
                          className="px-6 py-2 h-10"
                          disabled={isPasswordLoading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handlePasswordUpdate} 
                          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-10"
                          disabled={isPasswordLoading}
                        >
                          {isPasswordLoading ? 'Updating...' : 'Update'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsPasswordEditing(true)
                          setPasswordError('')
                          setPasswordSuccess('')
                        }}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-10"
                      >
                        Update Password
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default Profile