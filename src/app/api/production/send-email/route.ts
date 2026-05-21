import { NextResponse } from "next/server"

import { sendProductionEmail } from "@/lib/production/email-runtime"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.to || !body.subject || !body.body) {
      return NextResponse.json(
        { success: false, error: "Missing to, subject, or body" },
        { status: 400 }
      )
    }

    const result = await sendProductionEmail({
      to: body.to,
      subject: body.subject,
      body: body.body,
      from: body.from,
      allowProductionSend: body.allowProductionSend === true,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Production email runtime failed",
      },
      { status: 500 }
    )
  }
}
