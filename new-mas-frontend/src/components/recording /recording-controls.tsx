"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Circle,
  Square,
  Pause,
  Play,
  UploadCloud,
  Check,
  X
} from "lucide-react"
import { useRecording } from "@/lib/recording/use-recording"

interface RecordingControlsProps {
  streams: MediaStream[]
  onRecordingComplete?: (blob: Blob) => void
}

type UploadStatus = {
  success: boolean
  filename?: string
  error?: string
  driveLink?: string
  directLink?: string
  fileId?: string
}

export function RecordingControls({
  streams,
  onRecordingComplete
}: RecordingControlsProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)

  const {
    isRecording,
    isPaused,
    isUploading,
    duration,
    recordingSize,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatDuration,
    formatFileSize
  } = useRecording(streams, {
    onRecordingStop: onRecordingComplete,
    onUploadComplete: (result: any) => {
      if (result.success) {
        setUploadStatus({ 
          success: true, 
          filename: result.filename,
          driveLink: result.driveLink,
          directLink: result.directLink,
          fileId: result.fileId
        })
      } else {
        setUploadStatus({ success: false, error: "Upload failed" })
      }
    },
    onRecordingError: (error) => {
      console.error(error)
      setUploadStatus({ success: false, error: error.message })
    }
  })

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
      setUploadStatus(null)
    }
  }


  const handlePauseToggle = () => {
    if (isPaused) {
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Circle className="h-5 w-5" />
          <span>Recording</span>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Status */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Status:</span>
            <span
              className={
                isRecording ? "text-red-600 font-medium" : "text-gray-600"
              }
            >
              {isUploading
                ? "Uploading..."
                : isRecording
                ? isPaused
                  ? "Paused"
                  : "Recording"
                : "Not Recording"}
            </span>
          </div>


          {isRecording && (
            <>
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span className="font-mono">{formatDuration(duration)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Size:</span>
                <span className="font-mono">
                  {formatFileSize(recordingSize)}
                </span>
              </div>
            </>
          )}
        </div>


        {/* Progress Bar */}
        {(isRecording || isUploading) && (
          <div className="space-y-1">
            <Progress
              value={isPaused ? 0 : 100}
              className={`h-2 ${isUploading ? "animate-pulse" : ""}`}
            />
            <p className="text-xs text-gray-500 text-center">
              {isUploading
                ? "Uploading your recording, please wait..."
                : isPaused
                ? "Recording Paused"
                : "Recording in Progress"}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleRecordToggle}
            variant={isRecording ? "destructive" : "default"}
            className="flex-1"
            disabled={streams.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <UploadCloud className="h-4 w-4 mr-2 animate-bounce" />
                Uploading
              </>
            ) : isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-2" />
                Record
              </>
            )}
          </Button>


          {isRecording && (
            <Button
              onClick={handlePauseToggle}
              variant="outline"
              size="icon"
              disabled={isUploading}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>


        {/* Upload Status */}
        {uploadStatus && !isRecording && !isUploading && (
          <div
            className={`text-sm p-3 rounded-lg flex items-start space-x-2 ${
              uploadStatus.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {uploadStatus.success ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {uploadStatus.success ? "Upload Successful" : "Upload Failed"}
              </p>
              {uploadStatus.success && uploadStatus.driveLink ? (
                <div className="space-y-1">
                  <a
                    href={uploadStatus.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline hover:text-green-900 block"
                  >
                    🎥 View in Google Drive
                  </a>
                  {uploadStatus.directLink && (
                    <a
                      href={uploadStatus.directLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline hover:text-green-900 block"
                    >
                      ⬇️ Download Recording
                    </a>
                  )}
                  <p className="text-xs text-green-700 mt-1">
                    File: {uploadStatus.filename}
                  </p>
                </div>
              ) : uploadStatus.success ? (
                <a
                  href={`/recordings/${uploadStatus.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:text-green-900"
                >
                  View recording: {uploadStatus.filename}
                </a>
              ) : (
                <p className="text-xs">{uploadStatus.error}</p>
              )}
            </div>
          </div>
        )}

        {/* Recording Info */}
        {!isRecording && !isUploading && !uploadStatus && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Recording Features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>High-quality video and audio</li>
              <li>Pause and resume functionality</li>
              <li>Recordings are saved on the server</li>
              <li>WebM format for compatibility</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}