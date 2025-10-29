export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database?: {
    connected: boolean;
    type: string;
  };
}
