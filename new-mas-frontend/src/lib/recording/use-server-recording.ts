"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { io, Socket } from "socket.io-client"

export interface UseServerRecordingOptions {
  roomId: string
  socket?: Socket | null  // Make socket optional for backward compatibility
  socketUrl?: string
  onRecordingStart?: () => void
  onRecordingStop?: (result: { fileName: string; duration: number; fileSize: number }) => void
  onRecordingError?: (error: Error) => void
}

export function useServerRecording(
  streams: (MediaStream | null)[],
  options: UseServerRecordingOptions
) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [recordingResult, setRecordingResult] = useState<{
    fileName: string
    duration: number
    fileSize: number
  } | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const videoElementsRef = useRef<HTMLVideoElement[]>([])
  const sessionIdRef = useRef<string | null>(null) // Use ref for immediate access
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null)

  // Initialize socket connection
  useEffect(() => {
    // Use provided socket or create a new one
    if (options.socket) {
      console.log('Using provided socket for recording')
      socketRef.current = options.socket
    } else {
      console.log('Creating new socket for recording')
      const socketUrl = options.socketUrl || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
      socketRef.current = io(socketUrl)
    }

    const socket = socketRef.current

    socket.on('recording-stopped', (data: { sessionId: string; fileName: string; duration: number; fileSize: number }) => {
      console.log('Recording stopped on server:', data)
      setRecordingResult({
        fileName: data.fileName,
        duration: data.duration,
        fileSize: data.fileSize,
      })
      options.onRecordingStop?.(data)
    })

    socket.on('recording-paused', () => {
      console.log('Recording paused on server')
    })

    socket.on('recording-resumed', () => {
      console.log('Recording resumed on server')
    })

    return () => {
      // Only disconnect if we created the socket ourselves
      if (!options.socket) {
        socketRef.current?.disconnect()
      }
    }
  }, [options.socket, options.socketUrl, options.roomId])

  // Helper function to calculate video layout
  const calculateLayout = (
    count: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    interface LayoutItem {
      x: number
      y: number
      width: number
      height: number
    }

    const layout: LayoutItem[] = []
    if (count === 0) return layout
    const cols = Math.ceil(Math.sqrt(count))
    const rows = Math.ceil(count / cols)
    const itemWidth = canvasWidth / cols
    const itemHeight = canvasHeight / rows
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      layout.push({
        x: col * itemWidth,
        y: row * itemHeight,
        width: itemWidth,
        height: itemHeight,
      })
    }
    return layout
  }

  // Combine streams (video + audio)
  useEffect(() => {
    const validStreams = streams.filter(
      (s): s is MediaStream => !!s && s.active
    )

    if (validStreams.length === 0) {
      if (combinedStream) {
        combinedStream.getTracks().forEach((track) => track.stop())
        setCombinedStream(null)
      }
      return
    }

    // --- Video merging ---
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas")
      canvasRef.current.width = 1280
      canvasRef.current.height = 720
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      options.onRecordingError?.(new Error("Could not create canvas context"))
      return
    }

    videoElementsRef.current.forEach((video) => video.remove())
    videoElementsRef.current = validStreams
      .filter((stream) => stream.getVideoTracks().length > 0)
      .map((stream) => {
        const video = document.createElement("video")
        video.srcObject = stream
        video.muted = true
        video.play().catch((e) =>
          console.error("Failed to play video for recording:", e)
        )
        return video
      })

    const drawVideos = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const videosToDraw = videoElementsRef.current.filter(
        (v) => v.readyState >= 2
      )
      const layout = calculateLayout(
        videosToDraw.length,
        canvas.width,
        canvas.height
      )

      videosToDraw.forEach((video, index) => {
        const { x, y, width, height } = layout[index]
        ctx.drawImage(video, x, y, width, height)
      })

      animationFrameRef.current = requestAnimationFrame(drawVideos)
    }
    drawVideos()

    const canvasStream = canvas.captureStream(30)
    const videoTrack = canvasStream.getVideoTracks()[0]

    // --- Audio merging ---
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioContext()
    }
    const audioContext = audioContextRef.current
    const audioDestination = audioContext.createMediaStreamDestination()
    const audioStreams = validStreams.filter(
      (s) => s.getAudioTracks().length > 0
    )

    audioStreams.forEach((stream) => {
      try {
        const source = audioContext.createMediaStreamSource(stream)
        source.connect(audioDestination)
      } catch (e) {
        console.error("Error creating audio source node:", e)
      }
    })

    const audioTrack = audioDestination.stream.getAudioTracks()[0]

    // --- Combine streams ---
    const finalStream = new MediaStream()
    if (videoTrack) finalStream.addTrack(videoTrack)
    if (audioTrack) finalStream.addTrack(audioTrack)
    setCombinedStream(finalStream)

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current
          .close()
          .catch((e) => console.error("Failed to close AudioContext:", e))
      }
      videoElementsRef.current.forEach((video) => video.remove())
      videoElementsRef.current = []
      finalStream.getTracks().forEach((track) => track.stop())
    }
  }, [streams])

  const startRecording = useCallback(async () => {
    if (!combinedStream || !socketRef.current) {
      options.onRecordingError?.(
        new Error("Recording service not available. No streams to record.")
      )
      return
    }

    try {
      // Create MediaRecorder to capture chunks
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && sessionIdRef.current && !isPaused) {
          // Send chunk to server via socket
          event.data.arrayBuffer().then((buffer) => {
            socketRef.current?.emit('recording-chunk', {
              sessionId: sessionIdRef.current,
              chunk: buffer,
            })
          })
        }
      }

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
        options.onRecordingError?.(new Error('MediaRecorder error'))
      }

      // Wait for server confirmation before starting recorder
      const startPromise = new Promise<void>((resolve, reject) => {
        // Check if socket is connected
        if (!socketRef.current?.connected) {
          reject(new Error('Socket is not connected. Please wait for connection to be established.'))
          return
        }

        const timeout = setTimeout(() => {
          console.error('Timeout waiting for recording-started event. Socket connected:', socketRef.current?.connected, 'Socket ID:', socketRef.current?.id)
          reject(new Error('Server did not respond to start-recording'))
        }, 5000)

        const handler = (data: { sessionId: string; fileName: string }) => {
          clearTimeout(timeout)
          sessionIdRef.current = data.sessionId
          setSessionId(data.sessionId)
          console.log('Recording started on server:', data)
          socketRef.current?.off('recording-started', handler)
          resolve()
        }

        socketRef.current?.once('recording-started', handler)
      })

      // Request server to start recording
      console.log('Emitting start-recording event. Socket connected:', socketRef.current?.connected, 'Socket ID:', socketRef.current?.id, 'Room ID:', options.roomId)
      socketRef.current?.emit('start-recording', { roomId: options.roomId })

      // Wait for server confirmation
      await startPromise

      // Start recording with chunks every 1 second
      mediaRecorder.start(1000)

      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)
      startTimeRef.current = Date.now()
      setRecordingResult(null)

      durationIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 1000)

      options.onRecordingStart?.()
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [combinedStream, isPaused, options])

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !sessionIdRef.current) {
      options.onRecordingError?.(new Error("Recording not active"))
      return
    }

    try {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }

      // Notify server to stop recording
      socketRef.current?.emit('stop-recording', { sessionId: sessionIdRef.current })
      sessionIdRef.current = null
      setSessionId(null)
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const pauseRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !sessionIdRef.current) {
      options.onRecordingError?.(new Error("Recording not active"))
      return
    }
    try {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      socketRef.current?.emit('pause-recording', { sessionId: sessionIdRef.current })
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const resumeRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !sessionIdRef.current) {
      options.onRecordingError?.(new Error("Recording not active"))
      return
    }
    try {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      socketRef.current?.emit('resume-recording', { sessionId: sessionIdRef.current })
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"

    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return {
    isRecording,
    isPaused,
    duration,
    recordingResult,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatDuration,
    formatFileSize,
  }
}
