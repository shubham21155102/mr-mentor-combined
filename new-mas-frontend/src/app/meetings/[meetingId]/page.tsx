"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  X
} from "lucide-react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { fetchMeetingDetails } from "../actions"
import { useUser } from "@/contexts/UserContext"
import { useSession } from "next-auth/react"
import { WebRTCDebugger } from "@/components/WebRTCDebugger"
import { ServerRecordingControls } from "@/components/recording /server-recording-controls"
interface Meeting {
  id: string
  title: string
  description?: string
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  host: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
}

interface Message {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}

export default function MeetingRoom() {
  const params = useParams()
  const router = useRouter()
  const { isLoggedIn, isLoading: userLoading, user } = useUser()
  const { data: session } = useSession()
  const meetingId = params.meetingId as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false) // Default to closed on mobile
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null)
  // Use the logged in user's full name as the meeting display name.
  // Fallback to a short generated name if user isn't available yet.
  const userName = user?.fullName || `User-${Math.floor(Math.random() * 1000)}`

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})

  const {
    remoteStreams,
    remoteScreenStreams,
    participants,
    messages,
    sendMessage: sendWebRTCMessage,
    socketConnected,
    webRTCStatus,
    testConnectivity,
    getConnectionStats,
    socket,
    peerConnections,
    meetingStarted,
    meetingEnded,
    earningsCredited,
    meetingDuration,
    initializeMeeting,
    endMeeting,
  } = useWebRTC(meetingId, userName, localStream)

  const [streamsToRecord, setStreamsToRecord] = useState<MediaStream[]>([])

  useEffect(() => {
    const remoteStreamValues = Object.values(remoteStreams)
    const allStreams: (MediaStream | null)[] = [
      localStream,
      ...remoteStreamValues
    ]
    setStreamsToRecord(allStreams.filter((s): s is MediaStream => s !== null))
  }, [localStream, remoteStreams])

  // Redirect to home if not logged in
  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, userLoading, router])

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!meetingId || !isLoggedIn) return
      
      try {
        const token = session?.backendToken;
        const result = await fetchMeetingDetails(meetingId, token)
        if (result.success && result.data) {
          const meetingData: Meeting = {
            id: result.data.id || meetingId,
            title: `Meeting with ${result.data.mentor?.fullName || 'Mentor'}`,
            description: `Scheduled meeting`,
            status: result.data.status,
            host: {
              id: result.data.mentor?.id || '',
              name: result.data.mentor?.fullName || '',
              email: result.data.mentor?.email || '',
              avatar: result.data.mentor?.profilePhoto || ''
            }
          }
          setMeeting(meetingData)
          
          // Initialize meeting tracking with correct IDs
          if (result.data.mentor?.id && result.data.student?.id) {
            console.log('Initializing meeting with:', {
              slotId: result.data.id || meetingId,
              mentorId: result.data.mentor.id,
              studentId: result.data.student.id
            });
            initializeMeeting(
              result.data.id || meetingId,
              result.data.mentor.id,
              result.data.student.id
            )
          } else {
            console.warn('Missing mentor or student ID for meeting initialization:', result.data);
          }
        } else {
          console.error("Failed to fetch meeting:", result.error)
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching meeting:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    if (meetingId && isLoggedIn && !userLoading) {
      fetchMeeting()
    }
  }, [meetingId, isLoggedIn, userLoading, router, initializeMeeting])

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    initializeMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const el = localVideoRef.current
    if (el && localStream) {
      // Only set srcObject if it's different to prevent re-renders
      if (el.srcObject !== localStream) {
        try {
          el.srcObject = localStream
          el.play().catch(() => {})
        } catch (err) {
          console.error("Error attaching local stream to video element:", err)
        }
      }
    }
  }, [localStream])

  useEffect(() => {
    const el = screenVideoRef.current
    if (el && screenStream) {
      // Only set srcObject if it's different to prevent re-renders
      if (el.srcObject !== screenStream) {
        try {
          el.srcObject = screenStream
          el.play().catch(() => {})
        } catch (err) {
          console.error("Error attaching screen stream to video element:", err)
        }
      }
    }
  }, [screenStream])

  useEffect(() => {
    Object.entries(remoteStreams).forEach(([socketId, stream]) => {
      const videoElement = remoteVideoRefs.current[socketId]
      if (videoElement) {
        // Only set srcObject if it's different to prevent re-renders
        if (videoElement.srcObject !== stream) {
          try {
            videoElement.srcObject = stream
            videoElement.play().catch(() => {})
          } catch (err) {
            console.error(`Error attaching remote stream to element ${socketId}:`, err)
          }
        }
      }
    })
  }, [remoteStreams])

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const newScreenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        
        const screenTrack = newScreenStream.getVideoTracks()[0]
        
        // Add screen track to all existing peer connections and renegotiate
        if (peerConnections && socket) {
          for (const [socketId, pc] of Object.entries(peerConnections)) {
            try {
              // Add the screen track
              pc.addTrack(screenTrack, newScreenStream)
              console.log('Added screen track to peer connection:', socketId)
              
              // Create new offer and send it to renegotiate
              const offer = await pc.createOffer()
              await pc.setLocalDescription(offer)
              
              // Send the new offer to the peer
              socket.emit('offer', {
                roomId: meetingId,
                offer: pc.localDescription,
                to: socketId
              })
              
              console.log('Sent renegotiation offer to:', socketId)
            } catch (error) {
              console.error('Error adding screen track to peer:', socketId, error)
            }
          }
        }
        
        setScreenStream(newScreenStream)
        setIsScreenSharing(true)
        
        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          stopScreenShare()
        }
      } else {
        stopScreenShare()
      }
    } catch (error) {
      console.error("Error toggling screen share:", error)
    }
  }

  const stopScreenShare = async () => {
    if (screenStream && peerConnections && socket) {
      const screenTrack = screenStream.getVideoTracks()[0]
      
      // Remove screen track from all peer connections and renegotiate
      for (const [socketId, pc] of Object.entries(peerConnections)) {
        try {
          const senders = pc.getSenders()
          const screenSender = senders.find(sender => sender.track === screenTrack)
          if (screenSender) {
            pc.removeTrack(screenSender)
            console.log('Removed screen track from peer connection:', socketId)
            
            // Create new offer and send it to renegotiate
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            
            // Send the new offer to the peer
            socket.emit('offer', {
              roomId: meetingId,
              offer: pc.localDescription,
              to: socketId
            })
            
            console.log('Sent renegotiation offer after removing screen to:', socketId)
          }
        } catch (error) {
          console.error('Error removing screen track from peer:', socketId, error)
        }
      }
      
      // Stop all tracks in screen stream
      screenStream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      setScreenStream(null)
      setIsScreenSharing(false)
    }
  }

  const leaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
    router.push("/")
  }

  const handleEndMeeting = () => {
    if (confirm('Are you sure you want to end this meeting? This will credit earnings to the mentor.')) {
      endMeeting()
      // Wait a bit for the server to process, then leave
      setTimeout(() => {
        leaveMeeting()
      }, 2000)
    }
  }

  const sendMessage = (message: string) => {
    if (message.trim()) {
      sendWebRTCMessage(message)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (userLoading || loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading meeting...</div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Meeting not found</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-white font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {meeting.title}
          </h1>
          <Badge variant="secondary">Live</Badge>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                socketConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-300 hidden sm:inline">{webRTCStatus}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-white">
            {participants.length + 1} participants
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsParticipantsOpen(true)}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-4">
          {/* Main Video Section */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden">
            {(() => {
              const pinnedStream = 
                pinnedParticipantId === "local"
                  ? localStream
                  : pinnedParticipantId === "screen"
                  ? screenStream
                  : remoteStreams[pinnedParticipantId || ""] || remoteScreenStreams?.[pinnedParticipantId || ""] || localStream
              
              const mainStreamName = 
                pinnedParticipantId === "local"
                  ? `You (${userName})`
                  : pinnedParticipantId === "screen"
                  ? "Your Screen"
                  : participants.find(p => p.socketId === pinnedParticipantId)?.name || 
                    (remoteScreenStreams?.[pinnedParticipantId || ""] ? 
                      `${participants.find(p => p.socketId === pinnedParticipantId)?.name || 'User'}'s Screen` : 
                      "You")

              return pinnedStream ? (
                <div className="relative w-full h-full max-w-5xl aspect-video">
                  <video
                    ref={(el) => {
                      if (el && pinnedStream && el.srcObject !== pinnedStream) {
                        try {
                          el.srcObject = pinnedStream
                          // Mute if showing local stream or screen share to prevent echo
                          const shouldMute = pinnedStream === localStream || pinnedStream === screenStream
                          el.muted = shouldMute
                          el.play().catch(() => {})
                        } catch (err) {
                          console.error("Error attaching pinned stream:", err)
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    muted={pinnedStream === localStream || pinnedStream === screenStream}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {mainStreamName}
                  </div>
                  {pinnedParticipantId && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => setPinnedParticipantId(null)}
                    >
                      Unpin
                    </Button>
                  )}
                  {(pinnedParticipantId === "local" || (!pinnedParticipantId && localStream)) && (
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {!isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                      {!isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400">Click a participant to pin them</div>
              )
            })()}
          </div>

          {/* Thumbnail Grid */}
          <div className="flex justify-center gap-2 p-2 overflow-x-auto bg-gray-800 rounded-lg">
            {/* Local video thumbnail */}
            <div
              onClick={() => setPinnedParticipantId("local")}
              className={`relative w-32 h-24 bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all 
                ${pinnedParticipantId === "local" ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"}
              `}
            >
              <video
                ref={(el) => {
                  if (el) {
                    localVideoRef.current = el
                    if (localStream && el.srcObject !== localStream) {
                      try {
                        el.srcObject = localStream
                        el.muted = true
                        el.play().catch(() => {})
                      } catch (err) {
                        console.error("Error attaching local stream in thumbnail:", err)
                      }
                    }
                  } else {
                    localVideoRef.current = null
                  }
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                You
              </div>
              <div className="absolute top-1 right-1 flex space-x-1">
                {!isAudioEnabled && <MicOff className="h-3 w-3 text-red-500" />}
                {!isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
              </div>
            </div>

            {/* Screen share thumbnail */}
            {isScreenSharing && screenStream && (
              <div
                onClick={() => setPinnedParticipantId("screen")}
                className={`relative w-32 h-24 bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all 
                  ${pinnedParticipantId === "screen" ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"}
                `}
              >
                <video
                  ref={(el) => {
                    if (el) {
                      screenVideoRef.current = el
                      if (screenStream && el.srcObject !== screenStream) {
                        try {
                          el.srcObject = screenStream
                          el.play().catch(() => {})
                        } catch (err) {
                          console.error("Error attaching screen stream in thumbnail:", err)
                        }
                      }
                    } else {
                      screenVideoRef.current = null
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  Screen
                </div>
                <div className="absolute top-1 right-1 flex items-center space-x-1 bg-green-600 px-1 rounded">
                  <Monitor className="h-3 w-3 text-white" />
                </div>
              </div>
            )}

            {/* Remote participants */}
            {Object.entries(remoteStreams).map(([socketId, stream]) => (
              <div
                key={socketId}
                onClick={() => setPinnedParticipantId(socketId)}
                className={`relative w-32 h-24 bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all 
                  ${pinnedParticipantId === socketId ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"}
                `}
              >
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current[socketId] = el
                      if (stream && el.srcObject !== stream) {
                        try {
                          el.srcObject = stream
                          el.play().catch(() => {})
                        } catch (err) {
                          console.error(`Error attaching remote stream in thumbnail ${socketId}:`, err)
                        }
                      }
                    } else {
                      delete remoteVideoRefs.current[socketId]
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {participants.find(p => p.socketId === socketId)?.name || `User ${socketId.slice(0, 4)}`}
                </div>
              </div>
            ))}

            {/* Remote screen shares */}
            {Object.entries(remoteScreenStreams || {}).map(([socketId, screenStream]) => (
              <div
                key={`screen-${socketId}`}
                onClick={() => setPinnedParticipantId(socketId)}
                className={`relative w-32 h-24 bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all 
                  ${pinnedParticipantId === socketId ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105"}
                `}
              >
                <video
                  ref={(el) => {
                    if (el && screenStream && el.srcObject !== screenStream) {
                      try {
                        el.srcObject = screenStream
                        el.play().catch(() => {})
                      } catch (err) {
                        console.error(`Error attaching remote screen stream in thumbnail ${socketId}:`, err)
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {participants.find(p => p.socketId === socketId)?.name || 'User'}'s Screen
                </div>
                <div className="absolute top-1 right-1 flex items-center space-x-1 bg-blue-600 px-1 rounded">
                  <Monitor className="h-3 w-3 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel - Chat */}
        <ServerRecordingControls streams={streamsToRecord} roomId={meetingId} socket={socket} />
        {isChatOpen && (
          <div className="w-full md:w-96 bg-gray-800 flex flex-col border-t md:border-t-0 md:border-l border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Chat</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsChatOpen(false)}
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          message.userName === userName
                            ? "text-blue-400"
                            : "text-white"
                        }`}
                      >
                        {message.userName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(new Date(message.timestamp))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement
                      sendMessage(target.value)
                      target.value = ""
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Type a message..."]'
                    ) as HTMLInputElement
                    if (input) {
                      sendMessage(input.value)
                      input.value = ""
                    }
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-2 sm:px-4 py-3">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto py-1">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="sm"
            onClick={toggleAudio}
            className="flex-shrink-0"
          >
            {isAudioEnabled ? (
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="hidden sm:inline ml-2">
              {isAudioEnabled ? "Mute" : "Unmute"}
            </span>
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="sm"
            onClick={toggleVideo}
            className="flex-shrink-0"
          >
            {isVideoEnabled ? (
              <Video className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="hidden sm:inline ml-2">
              {isVideoEnabled ? "Stop Video" : "Start Video"}
            </span>
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="sm"
            onClick={toggleScreenShare}
            className="flex-shrink-0"
          >
            {isScreenSharing ? (
              <MonitorOff className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="hidden sm:inline ml-2">
              {isScreenSharing ? "Stop Share" : "Share Screen"}
            </span>
          </Button>

          <Button
            variant={isChatOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex-shrink-0"
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline ml-2">Chat</span>
          </Button>

          <Separator orientation="vertical" className="h-6 sm:h-8" />

          {/* End Meeting Button - Credits earnings */}
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleEndMeeting}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700"
            disabled={meetingEnded}
          >
            <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline ml-2">End Meeting</span>
          </Button>

          {/* Leave Button - Just leaves without ending */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={leaveMeeting} 
            className="flex-shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline ml-2">Leave</span>
          </Button>

          {/* Meeting Status Badges */}
          {meetingStarted && !meetingEnded && (
            <Badge variant="default" className="flex-shrink-0 bg-green-600">
              Active
            </Badge>
          )}
          {meetingEnded && (
            <Badge variant="secondary" className="flex-shrink-0">
              Ended
            </Badge>
          )}
        </div>
      </div>
      
      {/* WebRTC Debugger - Only show in development or when needed */}
      {process.env.NODE_ENV === 'development' && (
        <WebRTCDebugger
          webRTCStatus={webRTCStatus}
          socketConnected={socketConnected}
          participants={participants}
          testConnectivity={testConnectivity}
          getConnectionStats={getConnectionStats}
        />
      )}
    </div>
  )
}