import { NextResponse } from "next/server";

type CheckoutRequest = {
  priceId: string;
  userEmail?: string;
};

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CheckoutRequest;

    if (!body.priceId) {
      return NextResponse.json(
        { error: "Stripe price ID is required." },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append("mode", "subscription");
    formData.append("line_items[0][price]", body.priceId);
    formData.append("line_items[0][quantity]", "1");
    formData.append("success_url", `${appUrl}/dashboard/billing?success=true`);
    formData.append("cancel_url", `${appUrl}/dashboard/billing?cancelled=true`);

    if (body.userEmail) {
      formData.append("customer_email", body.userEmail);
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Stripe checkout failed." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      url: data.url,
      id: data.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}
