import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export class RecordingRoutes {
  public router: Router;
  private recordingsDir: string;

  constructor() {
    this.router = Router();
    this.recordingsDir = path.join(__dirname, '..', '..', 'recordings');
    
    // Ensure recordings directory exists
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
    }
    
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get list of recordings
    this.router.get('/recordings', this.getRecordings.bind(this));
    
    // Download a specific recording
    this.router.get('/recordings/:filename', this.downloadRecording.bind(this));
    
    // Delete a recording
    this.router.delete('/recordings/:filename', this.deleteRecording.bind(this));
  }

  /**
   * Get list of all recordings
   */
  private async getRecordings(req: Request, res: Response): Promise<void> {
    try {
      const files = fs.readdirSync(this.recordingsDir);
      const recordings = files
        .filter(file => file.endsWith('.webm'))
        .map(file => {
          const filePath = path.join(this.recordingsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          };
        });
      
      res.status(200).json({
        success: true,
        recordings,
      });
    } catch (error) {
      console.error('Error getting recordings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recordings',
      });
    }
  }

  /**
   * Download a specific recording
   */
  private async downloadRecording(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      
      // Validate filename to prevent path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        res.status(400).json({
          success: false,
          error: 'Invalid filename',
        });
        return;
      }
      
      const filePath = path.join(this.recordingsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'Recording not found',
        });
        return;
      }
      
      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading recording:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download recording',
      });
    }
  }

  /**
   * Delete a recording
   */
  private async deleteRecording(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      
      // Validate filename to prevent path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        res.status(400).json({
          success: false,
          error: 'Invalid filename',
        });
        return;
      }
      
      const filePath = path.join(this.recordingsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'Recording not found',
        });
        return;
      }
      
      fs.unlinkSync(filePath);
      
      res.status(200).json({
        success: true,
        message: 'Recording deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting recording:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete recording',
      });
    }
  }
}
