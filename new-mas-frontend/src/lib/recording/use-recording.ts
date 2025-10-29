"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { RecordingService } from "./recording-service"

export interface UseRecordingOptions {
  onRecordingStart?: () => void
  onRecordingStop?: (blob: Blob) => void
  onRecordingError?: (error: Error) => void
  onUploadComplete?: (response: { success: boolean; filename?: string }) => void
}

export function useRecording(
  streams: (MediaStream | null)[],
  options: UseRecordingOptions = {}
) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recordingSize, setRecordingSize] = useState(0)

  const recordingServiceRef = useRef<RecordingService | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const videoElementsRef = useRef<HTMLVideoElement[]>([])

  const calculateLayout = (
    count: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    interface LayoutItem {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    const layout: LayoutItem[] = [];
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
        height: itemHeight
      })
    }
    return layout
  }

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

    videoElementsRef.current.forEach((video) => video.remove()) // Clean up old videos
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

  useEffect(() => {
    if (combinedStream) {
      recordingServiceRef.current = new RecordingService(combinedStream)
    } else {
      if (recordingServiceRef.current) {
        recordingServiceRef.current.destroy()
        recordingServiceRef.current = null
      }
    }
    return () => {
      if (recordingServiceRef.current) {
        recordingServiceRef.current.destroy()
      }
    }
  }, [combinedStream])

  const startRecording = useCallback(async () => {
    if (!recordingServiceRef.current) {
      options.onRecordingError?.(
        new Error("Recording service not available. No streams to record.")
      )
      return
    }

    try {
      await recordingServiceRef.current.start()
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)
      setRecordingSize(0)

      intervalRef.current = setInterval(() => {
        if (recordingServiceRef.current) {
          setDuration(recordingServiceRef.current.getDuration())
          // setRecordingSize is not implemented in RecordingService, so I'll leave it as is.
        }
      }, 1000)

      options.onRecordingStart?.()
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const stopRecording = useCallback(async () => {
    if (!recordingServiceRef.current) {
      options.onRecordingError?.(new Error("Recording service not available"))
      return
    }

    try {
      const blob = await recordingServiceRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      options.onRecordingStop?.(blob)

      // Upload logic
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", blob, `recording-${Date.now()}.webm`)

      try {
        const response = await fetch("/api/recordings", {
          method: "POST",
          body: formData
        })

        const result = await response.json()
        options.onUploadComplete?.(result)
      } catch (uploadError) {
        options.onRecordingError?.(uploadError as Error)
      } finally {
        setIsUploading(false)
      }
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const pauseRecording = useCallback(async () => {
    if (!recordingServiceRef.current) {
      options.onRecordingError?.(new Error("Recording service not available"))
      return
    }
    try {
      await recordingServiceRef.current.pause()
      setIsPaused(true)
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const resumeRecording = useCallback(async () => {
    if (!recordingServiceRef.current) {
      options.onRecordingError?.(new Error("Recording service not available"))
      return
    }
    try {
      await recordingServiceRef.current.resume()
      setIsPaused(false)
    } catch (error) {
      options.onRecordingError?.(error as Error)
    }
  }, [options])

  const getRecordingState = useCallback(() => {
    if (!recordingServiceRef.current) return "inactive"
    return recordingServiceRef.current.getRecordingState()
  }, [])

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
    isUploading,
    duration,
    recordingSize,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecordingState,
    formatDuration,
    formatFileSize,
    combinedStream // for debugging or preview
  }
}