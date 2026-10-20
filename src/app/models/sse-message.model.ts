export interface SseMessage {
  id: number;
  online: boolean;
  lastSeen: string | null;
  timestamp: string;
}
