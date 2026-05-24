export function generateFollowUpDraft({ classification, body, }) {
    if (classification === "interested") {
        return {
            subject: "Re: ProspectIQ demo",
            body: "Hi there,\n\n" +
                "Thanks for the interest. A short demo would be a good next step.\n\n" +
                "I can walk you through how ProspectIQ helps with lead intelligence, CRM workflows, AI-assisted outreach, and outbound automation.\n\n" +
                "Would tomorrow or later this week work for a quick call?\n\n" +
                "Best regards,\nProspectIQ Team",
        };
    }
    if (classification === "pricing_question") {
        return {
            subject: "Re: ProspectIQ pricing",
            body: "Hi there,\n\n" +
                "Thanks for asking. ProspectIQ has flexible plans depending on the level of automation, team access, and AI workflow volume required.\n\n" +
                "The best next step would be to understand your team size and outbound workflow needs so we can recommend the right plan.\n\n" +
                "Would you like a quick pricing overview?\n\n" +
                "Best regards,\nProspectIQ Team",
        };
    }
    if (classification === "not_now") {
        return {
            subject: "Re: ProspectIQ follow-up",
            body: "Hi there,\n\n" +
                "Thanks for letting me know. I understand the timing may not be right now.\n\n" +
                "I can follow up later when improving sales intelligence, enrichment, or outbound automation becomes more relevant.\n\n" +
                "Best regards,\nProspectIQ Team",
        };
    }
    return null;
}
