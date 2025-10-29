export interface RecordingOptions {
  mimeType?: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
}

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private stream: MediaStream | null = null
  private isRecording = false
  private startTime: Date | null = null

  constructor(stream: MediaStream, options: RecordingOptions = {}) {
    this.stream = stream
    this.initializeRecorder(options)
  }

  private initializeRecorder(options: RecordingOptions) {
    if (!this.stream) {
      throw new Error("No media stream provided")
    }

    const defaultOptions: MediaRecorderOptions = {
      mimeType: this.getSupportedMimeType(),
      videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
      audioBitsPerSecond: options.audioBitsPerSecond || 128000
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, defaultOptions)
      this.setupEventListeners()
    } catch (error) {
      console.error("Error initializing MediaRecorder:", error)
      throw new Error("Failed to initialize recorder")
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm'
  }

  private setupEventListeners() {
    if (!this.mediaRecorder) return

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data)
      }
    }

    this.mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event)
      this.isRecording = false
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"))
        return
      }

      if (this.isRecording) {
        reject(new Error("Already recording"))
        return
      }

      try {
        this.recordedChunks = [];
        this.mediaRecorder.start()
        this.isRecording = true
        this.startTime = new Date()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error("MediaRecorder not initialized"));
      }

      if (!this.isRecording) {
        return reject(new Error("Not recording"));
      }

      this.mediaRecorder.addEventListener(
        "stop",
        () => {
          const blob = new Blob(this.recordedChunks, {
            type: this.mediaRecorder?.mimeType || "video/webm",
          });
          this.recordedChunks = [];
          this.isRecording = false;
          resolve(blob);
        },
        { once: true }
      );

      this.mediaRecorder.addEventListener('error', (err) => {
        reject(err)
      }, { once: true });

      try {
        this.mediaRecorder.stop();
      } catch (error) {
        reject(error);
      }
    });
  }

  pause(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"))
        return
      }

      if (!this.isRecording) {
        reject(new Error("Not recording"))
        return
      }

      try {
        this.mediaRecorder.pause()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  resume(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"))
        return
      }

      if (!this.isRecording) {
        reject(new Error("Not recording"))
        return
      }

      try {
        this.mediaRecorder.resume()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  getRecordingState(): 'inactive' | 'recording' | 'paused' {
    return this.mediaRecorder?.state || 'inactive'
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording
  }

  getDuration(): number {
    if (!this.startTime) return 0
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000)
  }

  destroy() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }
    this.recordedChunks = []
    this.isRecording = false
    this.startTime = null
    this.mediaRecorder = null
    this.stream = null
  }
}