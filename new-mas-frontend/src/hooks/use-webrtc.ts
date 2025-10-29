"use client"

import { API_BASE_URL } from '@/lib/api'
import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface PeerConnection {
  [socketId: string]: RTCPeerConnection
}

interface RemoteStream {
  [socketId: string]: MediaStream
}

interface RemoteScreenStream {
  [socketId: string]: MediaStream
}

export const useWebRTC = (roomId: string, userName: string, localStream: MediaStream | null) => {
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream>({})
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<RemoteScreenStream>({})
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [webRTCStatus, setWebRTCStatus] = useState<string>('Initializing...')
  
  // Meeting state management
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [meetingEnded, setMeetingEnded] = useState(false)
  const [earningsCredited, setEarningsCredited] = useState(false)
  const [meetingDuration, setMeetingDuration] = useState<number | null>(null)
  
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionsRef = useRef<PeerConnection>({})
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteTracksRef = useRef<{ [socketId: string]: MediaStreamTrack[] }>({})
  const meetingInitializedRef = useRef(false)
  const pendingMeetingInitRef = useRef<{
    slotId: string;
    mentorId: string;
    studentId: string;
  } | null>(null)

  useEffect(() => {
    localStreamRef.current = localStream
  }, [localStream])

  useEffect(() => {
    // Wait for local stream to be ready
    if (!localStream || !roomId || !userName) {
      console.log('WebRTC: Missing localStream, roomId, or userName. Waiting...', { hasLocalStream: !!localStream, roomId, userName })
      return
    }

    console.log('WebRTC: Initializing for room:', roomId, 'user:', userName, 'with local stream.')
    setWebRTCStatus('Connecting to server...')

    // Initialize Socket.IO - Always connect to backend server
    const socketUrl = API_BASE_URL
    
    console.log('WebRTC: Connecting to socket server:', socketUrl)
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 15000,
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 1000,
      forceNew: true,
      path: '/socket.io'
    })

    const socket = socketRef.current

    // Socket connection events
    socket.on('connect', () => {
      console.log('WebRTC: Socket connected:', socket.id)
      setSocketConnected(true)
      setWebRTCStatus('Connected to server')
      
      // Join room
      console.log('WebRTC: Joining room:', roomId)
      socket.emit('join-room', { roomId, userName })
      
      // Send pending meeting initialization if exists
      if (pendingMeetingInitRef.current && !meetingInitializedRef.current) {
        const { slotId, mentorId, studentId } = pendingMeetingInitRef.current
        console.log('WebRTC: Sending pending meeting initialization:', { roomId, slotId, mentorId, studentId })
        socket.emit('initialize-meeting', {
          roomId,
          slotId,
          mentorId,
          studentId
        })
        meetingInitializedRef.current = true
      }
    })

    socket.on('disconnect', () => {
      console.log('WebRTC: Socket disconnected')
      setSocketConnected(false)
      setWebRTCStatus('Disconnected from server')
    })

    socket.on('connect_error', (error) => {
      console.error('WebRTC: Socket connection error:', error)
      setWebRTCStatus('Connection error: ' + error.message)
      console.log('WebRTC: Connection error details:', {
        message: error.message,
        description: (error as any).description,
        type: (error as any).type
      })
    })

    socket.on('error', (error) => {
      console.error('WebRTC: Socket error:', error)
      setWebRTCStatus('Socket error: ' + error.message)
    })

    // Handle user joined
    socket.on('user-joined', (data: { user: any; users: any[] }) => {
      console.log('WebRTC: User joined:', data.user)
      setParticipants(prev => [...prev, data.user])
      setWebRTCStatus('Peer joined, establishing connection...')
      
      // Create peer connection for new user
      if (localStreamRef.current) {
        createPeerConnection(data.user.socketId, false)
      }
    })

    // Handle room users (existing users when joining)
    socket.on('room-users', (data: { users: any[] }) => {
      console.log('WebRTC: Room users:', data.users)
      setParticipants(data.users)
      setWebRTCStatus(`Found ${data.users.length} existing users`)
      
      // Create peer connections for existing users
      if (localStreamRef.current && data.users.length > 0) {
        setWebRTCStatus('Establishing peer connections...')
        data.users.forEach((user: any) => {
          createPeerConnection(user.socketId, true)
        })
      }
    })

    // Handle WebRTC offer
    socket.on('offer', async (data: { offer: RTCSessionDescription; from: string }) => {
      console.log('WebRTC: Received offer from:', data.from)
      setWebRTCStatus('Received offer, sending answer...')
      
      const pc = peerConnectionsRef.current[data.from]
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          
          // Use the current socket reference
          const currentSocket = socketRef.current
          if (currentSocket) {
            currentSocket.emit('answer', {
              roomId,
              answer: pc.localDescription,
              to: data.from
            })
          }
          console.log('WebRTC: Answer sent to:', data.from)
          setWebRTCStatus('Connection established!')
        } catch (error) {
          console.error('WebRTC: Error handling offer:', error)
          setWebRTCStatus('Error: ' + (error as Error).message)
        }
      } else {
        console.error('WebRTC: No peer connection found for:', data.from)
      }
    })

    // Handle WebRTC answer
    socket.on('answer', async (data: { answer: RTCSessionDescription; from: string }) => {
      console.log('WebRTC: Received answer from:', data.from)
      setWebRTCStatus('Received answer, finalizing connection...')
      
      const pc = peerConnectionsRef.current[data.from]
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
          console.log('WebRTC: Connection completed with:', data.from)
          setWebRTCStatus('Connection established!')
        } catch (error) {
          console.error('WebRTC: Error handling answer:', error)
          setWebRTCStatus('Error: ' + (error as Error).message)
        }
      }
    })

    // Handle ICE candidates
    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidate; from: string }) => {
      console.log('WebRTC: Received ICE candidate from:', data.from)
      
      const pc = peerConnectionsRef.current[data.from]
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          console.log('WebRTC: ICE candidate added for:', data.from)
        } catch (error) {
          console.error('WebRTC: Error handling ICE candidate:', error)
        }
      }
    })

    // Handle chat messages
    socket.on('chat-message', (message: any) => {
      console.log('WebRTC: Received chat message:', message)
      setMessages(prev => [...prev, message])
    })

    // Handle user left
    socket.on('user-left', (data: { userId: string; userName: string }) => {
      console.log('WebRTC: User left:', data)
      setParticipants(prev => prev.filter(p => p.socketId !== data.userId))
      
      // Clean up peer connection
      const pc = peerConnectionsRef.current[data.userId]
      if (pc) {
        pc.close()
        delete peerConnectionsRef.current[data.userId]
      }

      // Clean up remote stream
      setRemoteStreams(prev => {
        const updated = { ...prev }
        delete updated[data.userId]
        return updated
      })

      // Clean up remote screen stream
      setRemoteScreenStreams(prev => {
        const updated = { ...prev }
        delete updated[data.userId]
        return updated
      })
    })

    // Meeting state events
    socket.on('meeting-initialized', (data: { roomId: string; slotId: string }) => {
      console.log('✅ Meeting initialized confirmed by server:', data)
      meetingInitializedRef.current = true
      setWebRTCStatus('Meeting initialized and ready')
    })

    socket.on('meeting-started', (data: { slotId: string; startTime: Date }) => {
      console.log('Meeting started:', data)
      setMeetingStarted(true)
      setWebRTCStatus('Meeting in progress')
    })

    socket.on('meeting-ended', (data: { 
      slotId: string; 
      duration: number | undefined; 
      earningsCredited: boolean | undefined;
      earningsAmount: number | undefined;
      message: string;
    }) => {
      console.log('Meeting ended:', data)
      setMeetingEnded(true)
      setEarningsCredited(data.earningsCredited || false)
      setMeetingDuration(data.duration || null)
      setWebRTCStatus('Meeting ended')
      
      // Show notification
      if (data.earningsCredited) {
        alert(`✅ ${data.message}\nDuration: ${data.duration} minutes\nEarnings: ₹${data.earningsAmount}`)
      } else {
        alert(`Meeting ended.\n${data.message}`)
      }
    })

    socket.on('meeting-end-error', (data: { error: string }) => {
      console.error('Meeting end error:', data.error)
      alert(`❌ Error ending meeting: ${data.error}`)
    })

    return () => {
      console.log('WebRTC: Cleaning up...')
      // Clean up
      if (socket) {
        socket.disconnect()
      }
      
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        pc.close()
      })
      peerConnectionsRef.current = {}
      
      // Reset meeting initialization state
      meetingInitializedRef.current = false
      pendingMeetingInitRef.current = null
    }
  }, [roomId, userName, localStream])

  const createPeerConnection = (socketId: string, isInitiator: boolean) => {
    console.log(`WebRTC: Creating peer connection with ${socketId}, initiator: ${isInitiator}`)
    
    if (!localStreamRef.current) {
      console.error('WebRTC: No local stream available')
      return
    }

    try {
      const pc = new RTCPeerConnection({
        iceServers: [
            {
              urls: [
                "stun:52.66.253.64:3478",
                "turn:52.66.253.64:3478?transport=udp",
                "turn:52.66.253.64:3478?transport=tcp"
              ],
              username: "webrtcuser",
              credential: "webrtccred"
            },
          // Google STUN servers
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          
          // Additional STUN servers for better coverage
          { urls: 'stun:stun.stunprotocol.org:3478' },
          { urls: 'stun:stun.voiparound.com' },
          { urls: 'stun:stun.voipbuster.com' },
          { urls: 'stun:stun.voipstunt.com' },
          { urls: 'stun:stun.counterpath.com' },
          { urls: 'stun:stun.1und1.de' },
          { urls: 'stun:stun.gmx.net' },
          { urls: 'stun:stun.schlund.de' },
          { urls: 'stun:stun.voiparound.com' },
          { urls: 'stun:stun.voipbuster.com' },
          { urls: 'stun:stun.voipstunt.com' },
          { urls: 'stun:stun.counterpath.com' },
          { urls: 'stun:stun.1und1.de' },
          { urls: 'stun:stun.gmx.net' },
          { urls: 'stun:stun.schlund.de' },
          
          // // TURN servers for NAT traversal (free public servers)
          // {
          //   urls: 'turn:openrelay.metered.ca:80',
          //   username: 'openrelayproject',
          //   credential: 'openrelayproject'
          // },
          // {
          //   urls: 'turn:openrelay.metered.ca:443',
          //   username: 'openrelayproject',
          //   credential: 'openrelayproject'
          // },
          // {
          //   urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          //   username: 'openrelayproject',
          //   credential: 'openrelayproject'
          // },
          // // Additional TURN servers
          // {
          //   urls: 'turn:freeturn.tel:3478',
          //   username: 'freeturn',
          //   credential: 'freeturn'
          // },
          // {
          //   urls: 'turn:freeturn.tel:3478?transport=tcp',
          //   username: 'freeturn',
          //   credential: 'freeturn'
          // }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      })

      // Add local stream to peer connection
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('WebRTC: Received remote track from:', socketId, 'kind:', event.track.kind, 'streams:', event.streams.length)
        
        // Initialize tracks array for this peer if not exists
        if (!remoteTracksRef.current[socketId]) {
          remoteTracksRef.current[socketId] = []
        }
        
        // Add the track to our tracking
        remoteTracksRef.current[socketId].push(event.track)
        
        // Get all video tracks for this peer
        const videoTracks = remoteTracksRef.current[socketId].filter(t => t.kind === 'video')
        const audioTracks = remoteTracksRef.current[socketId].filter(t => t.kind === 'audio')
        
        console.log(`WebRTC: Peer ${socketId} now has ${videoTracks.length} video tracks and ${audioTracks.length} audio tracks`)
        
        // If we have 1 video track, it's the camera
        if (videoTracks.length === 1) {
          const cameraStream = new MediaStream()
          videoTracks.forEach(track => cameraStream.addTrack(track))
          audioTracks.forEach(track => cameraStream.addTrack(track))
          
          setRemoteStreams(prev => ({
            ...prev,
            [socketId]: cameraStream
          }))
        }
        
        // If we have 2 video tracks, the second one is the screen share
        if (videoTracks.length === 2) {
          const screenStream = new MediaStream()
          screenStream.addTrack(videoTracks[1]) // Second video track is screen
          
          setRemoteScreenStreams(prev => ({
            ...prev,
            [socketId]: screenStream
          }))
        }
        
        // Handle track ended
        event.track.onended = () => {
          console.log('WebRTC: Track ended from:', socketId, 'kind:', event.track.kind)
          // Remove the track from our tracking
          if (remoteTracksRef.current[socketId]) {
            remoteTracksRef.current[socketId] = remoteTracksRef.current[socketId].filter(t => t !== event.track)
            
            // If it was a video track and we now have only 1 video track, remove screen share
            const remainingVideoTracks = remoteTracksRef.current[socketId].filter(t => t.kind === 'video')
            if (remainingVideoTracks.length === 1) {
              setRemoteScreenStreams(prev => {
                const newStreams = { ...prev }
                delete newStreams[socketId]
                return newStreams
              })
            }
          }
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const currentSocket = socketRef.current
          if (currentSocket) {
            console.log('WebRTC: Sending ICE candidate to:', socketId)
            currentSocket.emit('ice-candidate', {
              roomId,
              candidate: event.candidate,
              to: socketId
            })
          }
        }
      }

      // Handle connection state change
      pc.onconnectionstatechange = () => {
        console.log('WebRTC: Connection state with', socketId, ':', pc.connectionState)
        if (pc.connectionState === 'connected') {
          setWebRTCStatus('Connected to peer!')
        } else if (pc.connectionState === 'failed') {
          setWebRTCStatus('Connection failed - attempting to reconnect...')
          // Attempt to restart ICE gathering
          setTimeout(() => {
            if (pc.connectionState === 'failed') {
              console.log('WebRTC: Restarting ICE for', socketId)
              pc.restartIce()
            }
          }, 2000)
        } else if (pc.connectionState === 'connecting') {
          setWebRTCStatus('Connecting to peer...')
        } else if (pc.connectionState === 'disconnected') {
          setWebRTCStatus('Peer disconnected')
        }
      }

      pc.oniceconnectionstatechange = () => {
        console.log('WebRTC: ICE connection state with', socketId, ':', pc.iceConnectionState)
        if (pc.iceConnectionState === 'failed') {
          setWebRTCStatus('ICE connection failed - trying alternative routes...')
          // Restart ICE gathering when connection fails
          setTimeout(() => {
            if (pc.iceConnectionState === 'failed') {
              console.log('WebRTC: Restarting ICE gathering for', socketId)
              pc.restartIce()
            }
          }, 3000)
        } else if (pc.iceConnectionState === 'connected') {
          setWebRTCStatus('ICE connection established!')
        } else if (pc.iceConnectionState === 'checking') {
          setWebRTCStatus('Checking connectivity...')
        } else if (pc.iceConnectionState === 'completed') {
          setWebRTCStatus('ICE connection completed!')
        }
      }

      // Handle ICE gathering state changes
      pc.onicegatheringstatechange = () => {
        console.log('WebRTC: ICE gathering state with', socketId, ':', pc.iceGatheringState)
        if (pc.iceGatheringState === 'gathering') {
          setWebRTCStatus('Gathering ICE candidates...')
        } else if (pc.iceGatheringState === 'complete') {
          setWebRTCStatus('ICE gathering complete')
        }
      }

      // Handle ICE candidates gathering errors
      pc.onicecandidateerror = (event) => {
        console.error('WebRTC: ICE candidate error for', socketId, ':', event)
        setWebRTCStatus('ICE candidate error - trying alternative servers...')
      }

      peerConnectionsRef.current[socketId] = pc

      // If initiator, create offer
      if (isInitiator) {
        createOffer(socketId)
      }

      return pc
    } catch (error) {
      console.error('WebRTC: Error creating peer connection:', error)
      setWebRTCStatus('Error creating connection: ' + (error as Error).message)
      return null
    }
  }

  const createOffer = async (socketId: string, retryCount = 0) => {
    console.log('WebRTC: Creating offer for:', socketId, retryCount > 0 ? `(retry ${retryCount})` : '')
    setWebRTCStatus('Creating offer...')
    
    const pc = peerConnectionsRef.current[socketId]
    const currentSocket = socketRef.current
    if (!pc || !currentSocket) {
      console.error('WebRTC: No peer connection or socket available')
      return
    }

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: retryCount > 0
      })
      await pc.setLocalDescription(offer)
      
      console.log('WebRTC: Offer created, sending to:', socketId)
      currentSocket.emit('offer', {
        roomId,
        offer: pc.localDescription,
        to: socketId
      })
      setWebRTCStatus('Offer sent, waiting for answer...')
      
      // Set up a timeout to retry if no answer is received
      setTimeout(() => {
        if (pc.connectionState !== 'connected' && pc.connectionState !== 'connecting' && retryCount < 3) {
          console.log('WebRTC: No response to offer, retrying...', retryCount + 1)
          createOffer(socketId, retryCount + 1)
        }
      }, 10000) // 10 second timeout
      
    } catch (error) {
      console.error('WebRTC: Error creating offer:', error)
      setWebRTCStatus('Error creating offer: ' + (error as Error).message)
      
      // Retry on error
      if (retryCount < 3) {
        setTimeout(() => {
          console.log('WebRTC: Retrying offer creation...', retryCount + 1)
          createOffer(socketId, retryCount + 1)
        }, 2000)
      }
    }
  }

  const sendMessage = useCallback((message: string) => {
    const currentSocket = socketRef.current
    if (currentSocket && message.trim()) {
      console.log('WebRTC: Sending message:', message)
      currentSocket.emit('chat-message', {
        roomId,
        message,
        userName
      })
    }
  }, [roomId, userName])

  const testConnectivity = async () => {
    console.log('WebRTC: Testing connectivity...')
    setWebRTCStatus('Testing connectivity...')
    
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('WebRTC: Connectivity test - ICE candidate found:', event.candidate.type)
        }
      }
      
      pc.onicegatheringstatechange = () => {
        console.log('WebRTC: Connectivity test - ICE gathering state:', pc.iceGatheringState)
        if (pc.iceGatheringState === 'complete') {
          console.log('WebRTC: Connectivity test completed successfully')
          setWebRTCStatus('Connectivity test passed')
          pc.close()
        }
      }
      
      // Create a data channel to trigger ICE gathering
      const dataChannel = pc.createDataChannel('test')
      dataChannel.onopen = () => {
        console.log('WebRTC: Data channel opened - connectivity test successful')
        dataChannel.close()
        pc.close()
      }
      
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
    } catch (error) {
      console.error('WebRTC: Connectivity test failed:', error)
      setWebRTCStatus('Connectivity test failed: ' + (error as Error).message)
    }
  }

  const getConnectionStats = async () => {
    const stats: Record<string, any> = {}
    for (const [socketId, pc] of Object.entries(peerConnectionsRef.current)) {
      try {
        const connectionStats = await pc.getStats()
        const statsArray = Array.from(connectionStats.values())
        stats[socketId] = {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          iceGatheringState: pc.iceGatheringState,
          stats: statsArray
        }
      } catch (error) {
        console.error('WebRTC: Error getting stats for', socketId, ':', error)
      }
    }
    console.log('WebRTC: Connection stats:', stats)
    return stats
  }

  // Initialize meeting tracking
  const initializeMeeting = useCallback((slotId: string, mentorId: string, studentId: string) => {
    console.log('initializeMeeting called with:', { slotId, mentorId, studentId, socketConnected: !!socketRef.current, initialized: meetingInitializedRef.current })
    
    // Store the initialization data
    pendingMeetingInitRef.current = { slotId, mentorId, studentId }
    
    // If socket is already connected, send immediately
    if (socketRef.current?.connected && !meetingInitializedRef.current) {
      console.log('WebRTC: Socket already connected, sending initialization immediately')
      socketRef.current.emit('initialize-meeting', {
        roomId,
        slotId,
        mentorId,
        studentId
      })
      meetingInitializedRef.current = true
      console.log('Meeting initialization sent:', { roomId, slotId, mentorId, studentId })
    } else {
      console.log('WebRTC: Socket not connected yet, will send on connect')
    }
  }, [roomId])

  // End meeting and credit earnings
  const endMeeting = useCallback(() => {
    if (!meetingInitializedRef.current) {
      console.error('Cannot end meeting: Meeting was not initialized')
      alert('❌ Cannot end meeting: Meeting was not properly initialized. Please refresh and try again.')
      return
    }
    
    if (socketRef.current) {
      console.log('Sending end-meeting request for room:', roomId)
      socketRef.current.emit('end-meeting', { roomId })
    } else {
      console.error('Cannot end meeting: Socket not connected')
      alert('❌ Cannot end meeting: Not connected to server. Please check your connection.')
    }
  }, [roomId])

  return {
    remoteStreams,
    remoteScreenStreams,
    participants,
    messages,
    sendMessage,
    socketConnected,
    webRTCStatus,
    testConnectivity,
    getConnectionStats,
    socket: socketRef.current,
    peerConnections: peerConnectionsRef.current,
    // Meeting state
    meetingStarted,
    meetingEnded,
    earningsCredited,
    meetingDuration,
    initializeMeeting,
    endMeeting,
  }
}