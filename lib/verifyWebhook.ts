import * as crypto from "crypto";

interface VerifySignatureParams {
    payload: string;
    signature: string;
    secret: string;
}

/**
 * Verifies the webhook signature from Resend
 *
 * @param payload - The raw payload string
 * @param signature - The signature from the Resend-Signature header
 * @param secret - The webhook secret
 * @returns boolean indicating if the signature is valid
 */
export function verifySignature(
    { payload, signature, secret }: VerifySignatureParams,
): boolean {
    try {
        // Parse the signature header
        const [timestamp, signatureHash] = signature.split(",");

        // Extract the t value
        const t = timestamp.split("=")[1];

        // Extract the v1 value
        const v1 = signatureHash.split("=")[1];

        // Calculate the expected signature
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${t}.${payload}`);
        const expectedSignature = hmac.digest("hex");

        // Compare signatures
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(v1),
        );
    } catch (error) {
        console.error("Error verifying signature:", error);
        return false;
    }
}
