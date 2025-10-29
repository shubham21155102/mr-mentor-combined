import { Server } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import { SlotCompletionService } from './services/SlotCompletionService';

interface User {
  id: string;
  name: string;
  socketId: string;
}

interface RoomUsers {
  [roomId: string]: User[];
}

interface RecordingSession {
  roomId: string;
  fileName: string;
  writeStream: fs.WriteStream;
  startTime: number;
  isRecording: boolean;
}

interface MeetingState {
  roomId: string;
  slotId: string;
  mentorId: string;
  studentId: string;
  startTime: Date | null;
  endTime: Date | null;
  participants: Set<string>;
}

const roomUsers: RoomUsers = {};
const recordingSessions: Map<string, RecordingSession> = new Map();
const activeMeetings: Map<string, MeetingState> = new Map();

// Ensure recordings directory exists
const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

export const setupSocket = (io: Server) => {
  const slotCompletionService = new SlotCompletionService();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Initialize meeting tracking
    socket.on('initialize-meeting', async (data: { 
      roomId: string; 
      slotId: string;
      mentorId: string;
      studentId: string;
    }) => {
      const { roomId, slotId, mentorId, studentId } = data;
      
      if (!activeMeetings.has(roomId)) {
        activeMeetings.set(roomId, {
          roomId,
          slotId,
          mentorId,
          studentId,
          startTime: null,
          endTime: null,
          participants: new Set()
        });
        console.log(`✅ Meeting initialized for room ${roomId}, slot ${slotId}`);
        socket.emit('meeting-initialized', { roomId, slotId });
      }
    });

    socket.on('join-room', async (data: { roomId: string; userName: string; userId?: string }) => {
      const { roomId, userName } = data;
      socket.join(roomId);

      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      const user: User = {
        id: socket.id,
        name: userName,
        socketId: socket.id,
      };

      roomUsers[roomId].push(user);

      // Track participant in meeting state and start meeting if first participant
      const meeting = activeMeetings.get(roomId);
      if (meeting) {
        meeting.participants.add(socket.id);
        
        // Start meeting when first participant joins
        if (meeting.participants.size === 1 && !meeting.startTime) {
          try {
            const result = await slotCompletionService.startMeeting(meeting.slotId);
            if (result.success) {
              meeting.startTime = new Date();
              io.to(roomId).emit('meeting-started', { 
                slotId: meeting.slotId,
                startTime: meeting.startTime 
              });
              console.log(`🚀 Meeting started for slot ${meeting.slotId}`);
            }
          } catch (error) {
            console.error('❌ Error starting meeting:', error);
          }
        }
      }

      socket.to(roomId).emit('user-joined', { user });
      socket.emit('room-users', { users: roomUsers[roomId].filter((u) => u.id !== socket.id) });

      console.log(`User ${userName} joined room ${roomId}`);
    });

    socket.on('offer', (data: { roomId: string; offer: any; to: string }) => {
      socket.to(data.to).emit('offer', { offer: data.offer, from: socket.id });
    });

    socket.on('answer', (data: { roomId: string; answer: any; to: string }) => {
      socket.to(data.to).emit('answer', { answer: data.answer, from: socket.id });
    });

    socket.on('ice-candidate', (data: { roomId: string; candidate: any; to: string }) => {
      socket.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
    });

    // End meeting event - credit earnings
    socket.on('end-meeting', async (data: { roomId: string }) => {
      const { roomId } = data;
      const meeting = activeMeetings.get(roomId);

      if (meeting?.startTime) {
        try {
          const result = await slotCompletionService.completeMeeting(
            meeting.slotId,
            new Date()
          );

          if (result.success) {
            meeting.endTime = new Date();
            
            // Notify all participants
            io.to(roomId).emit('meeting-ended', {
              slotId: meeting.slotId,
              duration: result.slot?.durationMinutes,
              earningsCredited: result.earningsCredited,
              earningsAmount: result.earningsAmount,
              message: result.message
            });

            console.log(`✅ Meeting ended for slot ${meeting.slotId}. Earnings credited: ${result.earningsCredited}`);
            
            // Clean up meeting state
            activeMeetings.delete(roomId);
            delete roomUsers[roomId];
          } else {
            socket.emit('meeting-end-error', { error: result.message });
          }
        } catch (error) {
          console.error('❌ Error completing meeting:', error);
          socket.emit('meeting-end-error', { 
            error: 'Failed to complete meeting' 
          });
        }
      } else {
        socket.emit('meeting-end-error', { 
          error: 'Meeting not found or not started' 
        });
      }
    });


    socket.on('chat-message', (data: { roomId: string; message: string; userName: string }) => {
      const messageData = {
        id: Date.now().toString(),
        userId: socket.id,
        userName: data.userName,
        content: data.message,
        timestamp: new Date(),
      };
      io.to(data.roomId).emit('chat-message', messageData);
    });

    // Recording events
    socket.on('start-recording', (data: { roomId: string }) => {
      const { roomId } = data;
      const sessionId = `${roomId}-${Date.now()}`;
      const fileName = `recording-${roomId}-${Date.now()}.webm`;
      const filePath = path.join(RECORDINGS_DIR, fileName);
      
      const writeStream = fs.createWriteStream(filePath);
      
      const session: RecordingSession = {
        roomId,
        fileName,
        writeStream,
        startTime: Date.now(),
        isRecording: true,
      };
      
      recordingSessions.set(sessionId, session);
      
      socket.emit('recording-started', { sessionId, fileName });
      socket.to(roomId).emit('recording-status', { status: 'started', sessionId });
      
      console.log(`Recording started for room ${roomId}, session: ${sessionId}`);
    });

    socket.on('recording-chunk', (data: { sessionId: string; chunk: ArrayBuffer }) => {
      const session = recordingSessions.get(data.sessionId);
      
      if (session && session.isRecording) {
        const buffer = Buffer.from(data.chunk);
        session.writeStream.write(buffer);
      }
    });

    socket.on('stop-recording', (data: { sessionId: string }) => {
      const session = recordingSessions.get(data.sessionId);
      
      if (session) {
        session.isRecording = false;
        session.writeStream.end(() => {
          const duration = Math.floor((Date.now() - session.startTime) / 1000);
          const filePath = path.join(RECORDINGS_DIR, session.fileName);
          const fileSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
          
          socket.emit('recording-stopped', {
            sessionId: data.sessionId,
            fileName: session.fileName,
            duration,
            fileSize,
          });
          
          socket.to(session.roomId).emit('recording-status', { 
            status: 'stopped', 
            sessionId: data.sessionId,
            fileName: session.fileName,
          });
          
          recordingSessions.delete(data.sessionId);
          console.log(`Recording stopped for session ${data.sessionId}`);
        });
      }
    });

    socket.on('pause-recording', (data: { sessionId: string }) => {
      const session = recordingSessions.get(data.sessionId);
      if (session) {
        session.isRecording = false;
        socket.emit('recording-paused', { sessionId: data.sessionId });
      }
    });

    socket.on('resume-recording', (data: { sessionId: string }) => {
      const session = recordingSessions.get(data.sessionId);
      if (session) {
        session.isRecording = true;
        socket.emit('recording-resumed', { sessionId: data.sessionId });
      }
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up any active recording sessions
      recordingSessions.forEach((session, sessionId) => {
        if (session?.isRecording) {
          session.writeStream.end();
          recordingSessions.delete(sessionId);
        }
      });
      
      // Handle meeting participant leaving
      for (const roomId of Object.keys(roomUsers)) {
        const userIndex = roomUsers[roomId].findIndex((u) => u.socketId === socket.id);
        if (userIndex !== -1) {
          const user = roomUsers[roomId][userIndex];
          roomUsers[roomId].splice(userIndex, 1);
          io.to(roomId).emit('user-left', { userId: socket.id, userName: user.name });
          
          // Check if this was a meeting room and handle auto-completion
          const meeting = activeMeetings.get(roomId);
          if (meeting) {
            meeting.participants.delete(socket.id);
            
            // Auto-end meeting when last person leaves
            if (meeting.participants.size === 0 && meeting.startTime && !meeting.endTime) {
              try {
                const result = await slotCompletionService.completeMeeting(
                  meeting.slotId,
                  new Date()
                );
                
                if (result.success) {
                  console.log(`🔄 Meeting auto-ended for slot ${meeting.slotId} (all participants left). Earnings: ${result.earningsCredited ? 'credited' : 'already credited'}`);
                  activeMeetings.delete(roomId);
                }
              } catch (error) {
                console.error('❌ Error auto-ending meeting:', error);
              }
            }
          }
          
          if (roomUsers[roomId].length === 0) {
            delete roomUsers[roomId];
          }
        }
      }
    });
  });
};

export type { User };