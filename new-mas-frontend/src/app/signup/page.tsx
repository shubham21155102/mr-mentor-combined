"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { signupUser, verifyOtp, completeProfile } from "@/app/action"
import { signIn } from 'next-auth/react'

type SignUpStep = 'credentials' | 'otp' | 'information'

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState<SignUpStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Captcha state (canvas-based, similar to LogInForm)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const captchaLength = 6
  const makeCaptchaText = (len = captchaLength) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let s = ''
    for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
    return s
  }

  const [captchaText, setCaptchaText] = useState<string>(() => makeCaptchaText())
  const [userCaptcha, setUserCaptcha] = useState('')
  const [captchaValid, setCaptchaValid] = useState(false)
  const [seed, setSeed] = useState(Math.random()) // change to force redraw

  const drawCaptchaToCanvas = (text: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = (canvas.width = 260)
    const height = (canvas.height = 80)

    ctx.clearRect(0, 0, width, height)
    const g = ctx.createLinearGradient(0, 0, width, height)
    g.addColorStop(0, '#f7fafb')
    g.addColorStop(1, '#eef2f4')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)

    const noiseDensity = 0.0025
    const noiseCount = Math.floor(width * height * noiseDensity)
    for (let i = 0; i < noiseCount; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1)
    }

    const drawNoiseLine = (count = 2, above = false) => {
      for (let n = 0; n < count; n++) {
        ctx.beginPath()
        const yStart = Math.random() * height * (above ? 0.9 : 0.6) + (above ? 0 : 10)
        ctx.moveTo(0, yStart)
        for (let x = 0; x <= width; x += 20) {
          const y = yStart + (Math.sin((x + Math.random() * 100) * 0.05) * 8) + (Math.random() * 6 - 3)
          ctx.lineTo(x, y)
        }
        ctx.lineWidth = 1 + Math.random() * 1.5
        ctx.strokeStyle = `rgba(${30 + Math.random() * 80}, ${30 + Math.random() * 80}, ${30 + Math.random() * 80}, ${0.08 + Math.random() * 0.2})`
        ctx.stroke()
      }
    }
    drawNoiseLine(2, false)

    const padding = 18
    const availableWidth = width - padding * 2
    const charSpacing = availableWidth / text.length

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      ctx.save()

      const fontSize = 28 + Math.floor(Math.random() * 12)
      const families = ['monospace', 'Georgia', 'Arial', 'Courier New', 'Tahoma']
      const family = families[Math.floor(Math.random() * families.length)]
      ctx.font = `${fontSize}px ${family}`

      const x = padding + i * charSpacing + (Math.random() * 6 - 3)
      const baseline = height / 2 + (Math.random() * 12 - 6)

      const angle = (Math.random() * 28 - 14) * (Math.PI / 180)
      ctx.translate(x, baseline)
      ctx.rotate(angle)
      const shearX = Math.random() * 0.6 - 0.3
      ctx.transform(1, 0, shearX, 1, 0, 0)

      const r = 30 + Math.floor(Math.random() * 150)
      const gcol = 30 + Math.floor(Math.random() * 150)
      const b = 30 + Math.floor(Math.random() * 150)
      ctx.fillStyle = `rgba(${r}, ${gcol}, ${b}, ${0.85 - Math.random() * 0.2})`

      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(20,20,20,${0.08 + Math.random() * 0.08})`

      ctx.fillText(ch, 0, 0)
      ctx.strokeText(ch, 0, 0)

      ctx.restore()
    }

    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      const cx = Math.random() * width
      const cy = Math.random() * height
      const rad = 1 + Math.random() * 3
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.15})`
      ctx.fill()
    }

    drawNoiseLine(2, true)

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let k = 0; k < data.length; k += 4) {
      if (Math.random() < 0.002) {
        data[k + 0] = Math.min(255, data[k + 0] + (Math.random() * 60 - 30))
        data[k + 1] = Math.min(255, data[k + 1] + (Math.random() * 60 - 30))
        data[k + 2] = Math.min(255, data[k + 2] + (Math.random() * 60 - 30))
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }

  const regenerateCaptcha = () => {
    const t = makeCaptchaText()
    setCaptchaText(t)
    setUserCaptcha('')
    setCaptchaValid(false)
    setSeed(Math.random())
  }

  useEffect(() => {
    drawCaptchaToCanvas(captchaText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captchaText, seed])

  const handleCaptchaChange = (value: string) => {
    setUserCaptcha(value)
    setCaptchaValid(value.trim() === captchaText)
  }

  // Information step fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profession, setProfession] = useState('')
  const [domain, setDomain] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    if (!captchaValid) {
      setError('Please enter the characters shown in the captcha')
      return
    }
    setLoading(true)
    setError(null)
    const result = await signupUser(email, password)
    if (result.success) {
      setCurrentStep('otp')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await verifyOtp(email, otp.join(''))
    if (result.success) {
      setToken(result.token)
      setCurrentStep('information')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleInformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!token) {
      setError('No token available')
      setLoading(false)
      return
    }
    const result = await completeProfile(email, fullName, phone, profession, domain, token)
    if (result.success) {
      window.location.href = '/login'
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Google sign up error:', error)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`)
        if (nextInput) {
          (nextInput as HTMLInputElement).focus()
        }
      }
    }
  }

  // Step 1: Credentials Form
  const renderCredentialsStep = () => (
    <>
      <div className="text-center mb-4 sm:mb-6 mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-semibold text-black leading-tight mb-2">Create your account</h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-5 sm:leading-6 px-2 sm:px-4">Get started with MAS — connect with mentors and accelerate your career.</p>
      </div>

      <form onSubmit={handleCredentialsSubmit} className="space-y-4 sm:space-y-5 mt-4 sm:mt-6">
        
        {/* Email Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#919191]" />
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 md:pl-16 pr-3 sm:pr-4 md:pr-6 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#919191]" />
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 md:pl-16 pr-10 sm:pr-12 md:pr-14 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 md:pr-6 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#919191]" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#919191]" />
            )}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#919191]" />
          </div>
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 md:pl-16 pr-10 sm:pr-12 md:pr-14 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 md:pr-6 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#919191]" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#919191]" />
            )}
          </button>
        </div>
        
        {error && <p className="text-xs sm:text-sm text-red-500 px-2">{error}</p>}

        {/* Captcha */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <canvas
              ref={canvasRef}
              width={260}
              height={80}
              className="border rounded bg-white select-none"
              aria-label="captcha image"
            />
            <button
              type="button"
              onClick={regenerateCaptcha}
              className="p-2 text-[#1a97a4] hover:text-[#0e656f]"
            >
              {/* simple refresh icon via unicode to avoid import overhead */}
              ⟳
            </button>
          </div>

          <Input
            type="text"
            placeholder="Type the characters shown above"
            value={userCaptcha}
            onChange={(e) => handleCaptchaChange(e.target.value)}
            className={`h-10 sm:h-12 md:h-14 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl placeholder:text-[#919191] focus:ring-2 ${
              captchaValid ? 'focus:ring-green-500' : 'focus:ring-[#1a97a4]'
            } focus:border-transparent`}
            required
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full h-10 sm:h-12 md:h-14 bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white text-base sm:text-lg md:text-xl font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] transition-all"
        >
          Continue
        </Button>
      </form>
      

      <div className="text-center my-4 sm:my-6">
        <span className="text-neutral-600 text-xs sm:text-sm">Or sign up with</span>
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignUp}
        variant="outline"
        className="w-full h-10 sm:h-12 md:h-14 border-[#1a97a4] text-black text-base sm:text-lg md:text-xl font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center"
      >
        <Image
          src="/google-icon.png"
          alt="Google"
          width={16}
          height={16}
          className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
        />
        <span className="text-sm sm:text-base md:text-lg">Sign up with Google</span>
      </Button>

      <div className="text-center mt-6 sm:mt-8">
        <p className="text-neutral-600 text-xs sm:text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1a97a4] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </>
  )

  // Step 2: OTP Verification
  const renderOtpStep = () => (
    <>
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-semibold text-black leading-tight mb-2">Verify your email</h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-5 sm:leading-6 px-2 sm:px-4">
          We&apos;ve sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-5 sm:space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <Input
              key={`otp-input-${index}-${digit}`}
              name={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-base sm:text-lg md:text-xl font-semibold bg-[#e9edf0] border-none rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
              maxLength={1}
            />
          ))}
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full h-10 sm:h-12 md:h-14 bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white text-base sm:text-lg md:text-xl font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] transition-all"
        >
          Verify & Continue
        </Button>
      </form>

      <div className="text-center mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-neutral-600">
          Didn&apos;t receive the code?{' '}
          <button className="text-[#1a97a4] font-semibold hover:underline">
            Resend
          </button>
        </p>
      </div>

      <div className="text-center mt-3 sm:mt-4">
        <button 
          onClick={() => setCurrentStep('credentials')}
          className="text-xs sm:text-sm text-neutral-600 hover:text-black"
        >
          ← Back to sign up
        </button>
      </div>
    </>
  )

  // Step 3: Information Form
  const renderInformationStep = () => (
    <>
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-semibold text-black leading-tight mb-2">Complete your profile</h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-5 sm:leading-6 px-2 sm:px-4">Tell us about yourself to get personalized mentor recommendations.</p>
      </div>

      <form onSubmit={handleInformationSubmit} className="space-y-4 sm:space-y-5">
        {/* Profile Photo Upload */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#e9edf0] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {photoPreview ? (
                <Image 
                  src={photoPreview} 
                  alt="Profile" 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-[#919191]" />
              )}
            </div>
            <label 
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#1a97a4] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#1a97a4]/90 transition-all"
            >
              <span className="text-white text-xs sm:text-sm md:text-lg font-bold">+</span>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Name Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
            <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#919191]" />
          </div>
          <Input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 md:pl-16 pr-3 sm:pr-4 md:pr-6 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
            required
          />
        </div>

        {/* Email Field (Auto-filled, read-only) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-6 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#919191]" />
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            readOnly
            className="h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 md:pl-16 pr-3 sm:pr-4 md:pr-6 bg-[#f5f5f5] border-none rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg placeholder:text-[#919191] text-[#666] cursor-not-allowed"
          />
        </div>

        {/* Phone Number */}
        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 sm:h-12 md:h-14 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent px-3 sm:px-4 md:px-6"
          required
        />

        {/* Profession */}
        <Input
          type="text"
          placeholder="Profession (e.g., Software Engineer)"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="h-10 sm:h-12 md:h-14 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent px-3 sm:px-4 md:px-6"
          required
        />

        {/* Domain */}
        <Input
          type="text"
          placeholder="Domain (e.g., Technology, Healthcare)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-10 sm:h-12 md:h-14 bg-[#e9edf0] border-none rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent px-3 sm:px-4 md:px-6"
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full h-10 sm:h-12 md:h-14 bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white text-base sm:text-lg md:text-xl font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] transition-all mt-4 sm:mt-6"
        >
          Complete Sign Up
        </Button>
      </form>

      <div className="text-center mt-3 sm:mt-4">
        <button 
          onClick={() => setCurrentStep('otp')}
          className="text-xs sm:text-sm text-neutral-600 hover:text-black"
        >
          ← Back to verification
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 text-black" style={{
      backgroundImage: "linear-gradient(135deg, #265d90 0%, #183c5d 50%, #122b44 75%, #0b1b2a 100%)"
    }}>
      <div className="w-full max-w-[90vw] sm:max-w-[85vw] md:max-w-md mx-auto">
        {/* Sign Up Form */}
        <div className="bg-white/70 backdrop-blur-[115px] rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="flex flex-row items-end justify-center gap-1 mb-6 sm:mb-8 md:mb-12">
            <div className="relative">
              <Image
                src="/mas-logo.svg"
                alt="MAS Logo"
                width={32}
                height={32}
                className="drop-shadow-md w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-[36px] font-['Goldman'] text-black leading-none tracking-[-4px] sm:tracking-[-6px] md:tracking-[-8px]">
              MAS
            </h1>
          </div>

          {/* Render current step */}
          {currentStep === 'credentials' && renderCredentialsStep()}
          {currentStep === 'otp' && renderOtpStep()}
          {currentStep === 'information' && renderInformationStep()}
        </div>
      </div>
    </div>
  )
}

export default SignUp