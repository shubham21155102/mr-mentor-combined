"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Circle, Square } from "lucide-react"
import { useServerRecording } from "@/lib/recording/use-server-recording"
import { Socket } from "socket.io-client"

interface ServerRecordingControlsProps {
  streams: MediaStream[]
  roomId: string
  socket?: Socket | null
  onRecordingComplete?: (result: { fileName: string; duration: number; fileSize: number }) => void
}

export function ServerRecordingControls({
  streams,
  roomId,
  socket,
  onRecordingComplete
}: ServerRecordingControlsProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    isRecording,
    isPaused,
    duration,
    recordingResult,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatDuration,
    formatFileSize
  } = useServerRecording(streams, {
    roomId,
    socket,
    onRecordingStop: (result) => {
      onRecordingComplete?.(result)
    },
    onRecordingError: (error) => {
      console.error(error)
      setError(error.message)
    }
  })

  const handleRecordToggle = () => {
    setError(null)
    if (isRecording) stopRecording()
    else startRecording()
  }

  return (
    <div className="absolute top-4 left-4 z-50 flex items-center space-x-3 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
      {/* Record/Stop Button */}
      <Button
        onClick={handleRecordToggle}
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        disabled={streams.length === 0}
        className="flex items-center space-x-2"
      >
        {isRecording ? (
          <>
            <Square className="h-4 w-4 text-white" />
            <span className="hidden sm:inline">Stop</span>
          </>
        ) : (
          <>
            <Circle className="h-4 w-4 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">Record</span>
          </>
        )}
      </Button>

      {/* Indicator */}
      {isRecording && (
        <div className="flex items-center space-x-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-white font-medium">
            {isPaused ? "Paused" : "Recording"}
          </span>
        </div>
      )}
    </div>
  )
}