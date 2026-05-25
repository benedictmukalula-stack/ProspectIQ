import { NextResponse } from "next/server";
import { createActivityEvent } from "../activity/events";

type ResendWebhookEvent = {
  type: string;
  data: {
    email_id: string;
    recipient_email: string[];
    from: string;
    subject?: string;
  };
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const events: ResendWebhookEvent[] = Array.isArray(payload)
      ? payload
      : [payload];

    for (const event of events) {
      const email = event.data?.recipient?.[0];

      let type = "email_event";
      let severity: "info" | "success" | "warning" = "info";
      let title = "Email event received";

      if (event.type === "email.delivered") {
        type = "email_delivered";
        severity = "success";
        title = "Email delivered";
      }

      if (event.type === "email.opened") {
        type = "email_opened";
        severity = "info";
        title = "Email opened";
      }

      if (event.type === "email.clicked") {
        type = "email_clicked";
        severity = "info";
        title = "Email link clicked";
      }

      if (event.type === "email.bounced") {
        type = "email_bounced";
        severity = "warning";
        title = "Email bounced";
      }

      await createActivityEvent({
        type,
        severity,
        title,
        description: `${event.type} for ${email}`,
        metadata: {
          provider: "resend",
          eventType: event.type,
          messageId: event.data?.email_id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
