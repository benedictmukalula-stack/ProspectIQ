export type EmailJob = {
  recipient_email: string;
  subject: string;
  body: string;
  allowProductionSend: boolean;
  protection: {
    throttle: boolean;
    switchProvider: boolean;
  };
};
