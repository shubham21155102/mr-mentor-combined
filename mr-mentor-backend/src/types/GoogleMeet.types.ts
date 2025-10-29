export interface GoogleMeetConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface CreateMeetingRequest {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  attendees?: string[]; // Array of email addresses
  timezone?: string;
  location?: string;
  sendNotifications?: boolean; // Whether to send email notifications to attendees
  sendUpdates?: 'all' | 'externalOnly' | 'none'; // Who to send updates to
  enableRecording?: boolean; // Whether to enable recording for this meeting
  recordingInstructions?: string; // Instructions for recording
}

export interface MeetingResponse {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  hangoutLink?: string;
  meetLink?: string;
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  location?: string;
  status: string;
  htmlLink: string;
}

export interface RecordingInfo {
  meetingId: string;
  recordingUrl?: string;
  recordingStatus: 'available' | 'processing' | 'unavailable' | 'not_recorded';
  duration?: number;
  fileSize?: number;
  createdTime?: string;
  driveFileId?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  recordingInstructions?: string;
  isRecordingEnabled?: boolean;
}

export interface DriveRecordingFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  parents: string[];
}

export interface RecordingSettings {
  enableRecording: boolean;
  recordingInstructions?: string;
  autoStartRecording?: boolean;
  notifyParticipants?: boolean;
  saveToDrive?: boolean;
  driveFolderId?: string;
}

export interface JoinMeetingRequest {
  meetingId: string;
  attendeeEmail: string;
  attendeeName?: string;
}

export interface JoinMeetingResponse {
  joinUrl: string;
  meetingId: string;
  meetingTitle: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface GoogleMeetError {
  code: number;
  message: string;
  details?: any;
}

export interface ListMeetingsRequest {
  userId: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: 'startTime' | 'updated';
}

export interface ListMeetingsResponse {
  meetings: MeetingResponse[];
  nextPageToken?: string;
  totalItems: number;
}
