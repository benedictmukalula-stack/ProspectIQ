import { NextResponse } from "next/server";
import { sendProductionEmail } from "../production/email-runtime";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await sendProductionEmail({
      recipient_email: body.recipient,
      subject: body.subject,
      body: body.body,
      from: body.from,
      allowProductionSend: body.allowProductionSend === true,
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      mode: result.mode,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
