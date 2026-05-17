export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: string
}) {
  if (process.env.DISABLE_REAL_EMAIL === "true" || !process.env.RESEND_API_KEY) {
    return {
      provider: "mock",
      messageId: `mock_${Date.now()}`,
      status: "sent",
      simulated: true,
    }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "ProspectIQ <onboarding@resend.dev>",
      to,
      subject,
      text: body,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || "Email provider send failed")
  }

  return {
    provider: "resend",
    messageId: data.id,
    status: "sent",
    simulated: false,
  }
}
