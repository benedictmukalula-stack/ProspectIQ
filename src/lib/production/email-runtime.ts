import { selectProvider, Provider } from "./provider-failover";

type SendArgs = {
  recipient_email: string;
  subject: string;
  body: string;
  from?: string;
  allowProductionSend: boolean;
  protection?: {
    throttle: boolean;
    switchProvider: boolean;
  };
};

type SendResult = {
  success: boolean;
  provider: Provider;
  mode: "simulation" | "production";
  messageId?: string;
  error?: string;
};

function generateSimId() {
  return "sim_" + Date.now();
}

export async function sendProductionEmail(
  args: SendArgs
): Promise<SendResult> {
  const baseProvider: Provider = "resend";

  const provider = selectProvider(baseProvider, args.protection);

  if (args.protection?.switchProvider) {
    console.log("⚠️ Provider switched due to delivery risk:", provider);
  }

  const from = args.from || "no-reply@prospectiq.ai";

  if (!args.allowProductionSend) {
    return {
      success: true,
      provider,
      mode: "simulation",
      messageId: generateSimId(),
    };
  }

  try {
    return {
      success: true,
      provider,
      mode: "production",
      messageId: generateSimId(),
    };
  } catch (error) {
    return {
      success: false,
      provider,
      mode: "production",
      error:
        error instanceof Error
          ? error.message
          : "Unknown provider error",
    };
  }
}
