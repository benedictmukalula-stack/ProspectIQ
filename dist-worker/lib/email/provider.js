import { getEmailProvider } from "../lib/email";
export async function sendEmail(payload) {
    const provider = getEmailProvider();
    return provider.send(payload);
}
