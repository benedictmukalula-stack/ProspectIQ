import { ResendProvider } from "./providers/resend";
export function getEmailProvider() {
    return new ResendProvider();
}
