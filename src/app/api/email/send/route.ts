import { NextResponse } from "next/server";

type SendEmailRequest = {
  recipient_email: string;
  from: string;
  subject: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SendEmailRequest;

    if (!body.recipient || !body.from || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Missing required email fields." },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: body.from,
        recipient_email: [body.recipient],
        subject: body.subject,
        text: body.message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.message || "Email provider rejected the request." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: result.id,
      status: "Sent",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to send email." },
      { status: 500 }
    );
  }
}
