"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Lock, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

const LogInForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Canvas captcha state
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

  // draw function
  const drawCaptchaToCanvas = (text: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = (canvas.width = 260)
    const height = (canvas.height = 80)

    // clear
    ctx.clearRect(0, 0, width, height)

    // background gradient
    const g = ctx.createLinearGradient(0, 0, width, height)
    g.addColorStop(0, '#f7fafb')
    g.addColorStop(1, '#eef2f4')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)

    // small speckle noise
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

    // draw each char
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

  // regenerate captcha
  const regenerateCaptcha = () => {
    const t = makeCaptchaText()
    setCaptchaText(t)
    setUserCaptcha('')
    setCaptchaValid(false)
    setSeed(Math.random())
  }

  // redraw when captchaText or seed changes
  useEffect(() => {
    drawCaptchaToCanvas(captchaText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captchaText, seed])

  const handleCaptchaChange = (value: string) => {
    setUserCaptcha(value)
    // Case-sensitive comparison as requested
    setCaptchaValid(value.trim() === captchaText)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaValid) return
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Either Username or Password is incorrect')
      } else if (result?.ok) {
        router.push('/')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
      
      {/* Email */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-[#919191]" />
        </div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 sm:h-14 pl-12 sm:pl-16 pr-4 sm:pr-6 bg-[#e9edf0] border-none rounded-xl text-lg sm:text-xl placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4]"
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-[#919191]" />
        </div>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 sm:h-14 pl-12 sm:pl-16 pr-12 sm:pr-14 bg-[#e9edf0] border-none rounded-xl text-lg sm:text-xl placeholder:text-[#919191] focus:ring-2 focus:ring-[#1a97a4]"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 sm:pr-6 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#919191]" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#919191]" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs sm:text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Forgot Password */}
      <div className="text-right">
        <Link href="/forgot-password" className="text-[#45414b] text-xs sm:text-sm font-semibold hover:underline">
          Forgot password?
        </Link>
      </div>

      {/* Custom Captcha */}
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
            <RefreshCw size={20} />
          </button>
        </div>

        <Input
          type="text"
          placeholder="Type the characters shown above"
          value={userCaptcha}
          onChange={(e) => handleCaptchaChange(e.target.value)}
          className={`h-12 bg-[#e9edf0] border-none rounded-xl text-lg placeholder:text-[#919191] focus:ring-2 ${
            captchaValid ? 'focus:ring-green-500' : 'focus:ring-[#1a97a4]'
          }`}
          required
        />
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        disabled={!captchaValid || loading}
        className={`w-full h-12 sm:h-14 text-white text-lg sm:text-xl font-medium rounded-[30px] shadow transition-all ${
          captchaValid
            ? 'bg-[#1a97a4] hover:bg-[#1a97a4]/90'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}

export default LogInForm
