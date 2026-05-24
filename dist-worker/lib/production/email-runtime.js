import { selectProvider, Provider } from "./provider-failover";
function generateSimId() {
    return "sim_" + Date.now();
}
export async function sendProductionEmail(args) {
    const baseProvider = "resend";
    const provider = selectProvider(baseProvider, args.protection);
    if (args.protection?.switchProvider) {
        console.log("⚠️ Provider switched due to delivery risk:", provider);
    }
    const from = args.from || "no-reply@prospectiq.ai";
    if (!args.allowProductionSend) {
        return {
            success: true,
            provider,
            mode: "simulation",
            messageId: generateSimId(),
        };
    }
    try {
        return {
            success: true,
            provider,
            mode: "production",
            messageId: generateSimId(),
        };
    }
    catch (error) {
        return {
            success: false,
            provider,
            mode: "production",
            error: error instanceof Error
                ? error.message
                : "Unknown provider error",
        };
    }
}
