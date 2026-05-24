export type QueueItem = {
  id: string;
  email: string;
  status: string;
  scheduled_for: string;
  attempts: number;
  metadata?: any;
};
