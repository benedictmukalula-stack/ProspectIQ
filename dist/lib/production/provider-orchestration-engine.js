const PROVIDERS = {
    mock: [],
    resend: ["RESEND_API_KEY"],
    postmark: ["POSTMARK_SERVER_TOKEN"],
    sendgrid: ["SENDGRID_API_KEY"],
};
export function getProviderStatus() {
    return Object.entries(PROVIDERS).map(([provider, envKeys]) => {
        const configured = envKeys.every((key) => Boolean(process.env[key]));
        return {
            provider: provider,
            configured: provider === "mock" ? true : configured,
            mode: provider === "mock"
                ? "simulation"
                : configured
                    ? "production-ready"
                    : "missing-config",
            requiredEnv: envKeys,
        };
    });
}
export function selectEmailProvider(preferred) {
    const statuses = getProviderStatus();
    if (preferred) {
        const selected = statuses.find((item) => item.provider === preferred);
        if (selected?.configured)
            return selected;
    }
    return (statuses.find((item) => item.provider !== "mock" && item.configured) || statuses.find((item) => item.provider === "mock"));
}
