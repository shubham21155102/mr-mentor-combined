import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { DriveRecordingFile, RecordingInfo } from '../types/GoogleMeet.types';

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: drive_v3.Drive;

  constructor(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Search for Google Meet recordings in Drive
   */
  async searchMeetRecordings(meetingTitle?: string, limit: number = 10): Promise<DriveRecordingFile[]> {
    try {
      let query = "name contains 'Meet Recording' and mimeType='video/mp4'";
      
      if (meetingTitle) {
        // Escape special characters in the meeting title for the query
        const escapedTitle = meetingTitle.replace(/['"]/g, '\\$&');
        query += ` and name contains '${escapedTitle}'`;
      }

      const response = await this.drive.files.list({
        q: query,
        orderBy: 'createdTime desc',
        pageSize: limit,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)'
      });

      return response.data.files?.map(file => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || '0',
        createdTime: file.createdTime || '',
        modifiedTime: file.modifiedTime || '',
        webViewLink: file.webViewLink || '',
        webContentLink: file.webContentLink || '',
        thumbnailLink: file.thumbnailLink || undefined,
        parents: file.parents || []
      })) || [];

    } catch (error) {
      console.error('Error searching Meet recordings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get recording by Drive file ID
   */
  async getRecordingById(fileId: string): Promise<DriveRecordingFile | null> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents'
      });

      if (!response.data) {
        return null;
      }

      return {
        id: response.data.id || '',
        name: response.data.name || '',
        mimeType: response.data.mimeType || '',
        size: response.data.size || '0',
        createdTime: response.data.createdTime || '',
        modifiedTime: response.data.modifiedTime || '',
        webViewLink: response.data.webViewLink || '',
        webContentLink: response.data.webContentLink || '',
        thumbnailLink: response.data.thumbnailLink || undefined,
        parents: response.data.parents || []
      };

    } catch (error) {
      console.error('Error getting recording by ID:', error);
      return null;
    }
  }

  /**
   * Get recordings from Meet Recordings folder
   */
  async getMeetRecordingsFromFolder(limit: number = 10): Promise<DriveRecordingFile[]> {
    try {
      // First, find the "Meet Recordings" folder
      const folderResponse = await this.drive.files.list({
        q: "name='Meet Recordings' and mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id)'
      });

      if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
        return [];
      }

      const folderId = folderResponse.data.files[0].id;

      // Get recordings from the folder
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='video/mp4'`,
        orderBy: 'createdTime desc',
        pageSize: limit,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents)'
      });

      return response.data.files?.map(file => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || '0',
        createdTime: file.createdTime || '',
        modifiedTime: file.modifiedTime || '',
        webViewLink: file.webViewLink || '',
        webContentLink: file.webContentLink || '',
        thumbnailLink: file.thumbnailLink || undefined,
        parents: file.parents || []
      })) || [];

    } catch (error) {
      console.error('Error getting recordings from folder:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate download URL for a recording
   */
  async getDownloadUrl(fileId: string): Promise<string | null> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webContentLink'
      });

      return response.data.webContentLink || null;

    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  }

  /**
   * Get file permissions
   */
  async getFilePermissions(fileId: string): Promise<any[]> {
    try {
      const response = await this.drive.permissions.list({
        fileId: fileId
      });

      return response.data.permissions || [];

    } catch (error) {
      console.error('Error getting file permissions:', error);
      return [];
    }
  }

  /**
   * Share recording with specific users
   */
  async shareRecording(fileId: string, emailAddresses: string[], role: 'reader' | 'writer' | 'commenter' = 'reader'): Promise<void> {
    try {
      for (const email of emailAddresses) {
        await this.drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: role,
            type: 'user',
            emailAddress: email
          }
        });
      }
    } catch (error) {
      console.error('Error sharing recording:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Convert Drive file to RecordingInfo
   */
  convertToRecordingInfo(meetingId: string, driveFile: DriveRecordingFile): RecordingInfo {
    return {
      meetingId: meetingId,
      recordingUrl: driveFile.webViewLink,
      downloadUrl: driveFile.webContentLink,
      thumbnailUrl: driveFile.thumbnailLink,
      recordingStatus: 'available',
      duration: undefined, // Would need to extract from video metadata
      fileSize: parseInt(driveFile.size) || 0,
      createdTime: driveFile.createdTime,
      driveFileId: driveFile.id
    };
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): Error {
    console.error('Google Drive Service Error:', error);
    
    if (error.response) {
      return new Error(`Google Drive API Error: ${error.response.data?.error?.message || error.message}`);
    }
    
    return new Error(error.message || 'Unknown error occurred');
  }
}
