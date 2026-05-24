export type Provider = "resend" | "postmark" | "sendgrid";

type Protection = {
  throttle: boolean;
  switchProvider: boolean;
};

export function selectProvider(
  current: Provider,
  protection?: Protection
): Provider {
  if (!protection?.switchProvider) return current;

  if (current === "resend") return "postmark";
  if (current === "postmark") return "sendgrid";
  return "resend";
}
