import { trackEvent }
  from "./events";

export async function simulateEngagement(
  messageId: string
) {
  await trackEvent({
    type: "delivered",
    messageId,
  });

  const opened =
    Math.random() > 0.3;

  if (opened) {
    await trackEvent({
      type: "opened",
      messageId,
    });
  }

  const clicked =
    Math.random() > 0.6;

  if (clicked) {
    await trackEvent({
      type: "clicked",
      messageId,
    });
  }
}
