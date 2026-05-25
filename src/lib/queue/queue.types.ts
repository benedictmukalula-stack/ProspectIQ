export type QueueProtection = {
  throttle: boolean;
  switchProvider: boolean;
};

export type QueueJob = {
  id: string;
  workspaceId: string;

  email: string;
  recipient_email: string;

  subject?: string;
  body?: string;

  attempts: number;

  protection?: QueueProtection;
};
