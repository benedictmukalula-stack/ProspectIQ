export function selectProvider(current, protection) {
    if (!protection?.switchProvider)
        return current;
    if (current === "resend")
        return "postmark";
    if (current === "postmark")
        return "sendgrid";
    return "resend";
}
