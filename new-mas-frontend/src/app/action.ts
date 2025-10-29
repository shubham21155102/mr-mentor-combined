'use client'

import { api } from "@/lib/api"

type LoginResult = { success: true; token: any } | { success: false; error: string }
type SignupResult = { success: true } | { success: false; error: string }
type VerifyOtpResult = { success: true; token: any } | { success: false; error: string }
type CompleteProfileResult = { success: true } | { success: false; error: string }

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await api.post('/api/auth/login', { email, password })
    return { success: true, token: response.data.token }
  } catch {
    return { success: false, error: 'Either Username or Password is incorrect' }
  }
}

export async function signupUser(email: string, password: string): Promise<SignupResult> {
  try {
    await api.post('/api/auth/signup', { email, password })
    return { success: true }
  } catch {
    return { success: false, error: 'An error occurred during signup' }
  }
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const response = await api.post('/api/auth/verify-otp', { email, otp })
    return { success: true, token: response.data.token }
  } catch {
    return { success: false, error: 'Invalid OTP' }
  }
}

export async function completeProfile(email: string, fullName: string, phone: string, profession: string, domain: string, token: string): Promise<CompleteProfileResult> {
  try {
    await api.post('/api/auth/complete-profile', {
      email,
      fullName,
      phone,
      profession,
      domain,
      profilePhoto: 'x', // Placeholder
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'An error occurred completing profile' }
  }
}

export async function getUserDetails(token: string) {
  try {
    const response = await api.get('/api/user-details', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return { success: true, data: response.data.data }
  } catch {
    return { success: false, error: 'Failed to fetch user details' }
  }
}