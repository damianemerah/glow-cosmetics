import { Resend } from "resend";
import { Twilio } from "twilio";

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export type MessageChannel = "email" | "sms" | "whatsapp";

export interface MessageData {
  recipients: string[];
  subject: string;
  message: string;
  channel: MessageChannel;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  recipients: string[],
  subject: string,
  message: string
): Promise<MessageResponse> {
  //Get and set recipients
  try {
    const { data, error } = await resend.emails.send({
      from: "Glow Cosmetics <noreply@glowcosmetics.com>",
      to: recipients,
      subject,
      html: message,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendSMS(
  recipients: string[],
  message: string
): Promise<MessageResponse> {
  console.log(recipients, message, "recipients, message🎈");
  try {
    const results = await Promise.all(
      ["+2347048927075"].map((to) =>
        twilioClient.messages.create({
          body: message,
          to,
          from: process.env.TWILIO_PHONE_NUMBER,
        })
      )
    );

    return { success: true, messageId: results[0]?.sid };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to send SMS" };
  }
}

export async function sendWhatsApp(
  recipients: string[],
  message: string
): Promise<MessageResponse> {
  try {
    const results = await Promise.all(
      recipients.map((to) =>
        twilioClient.messages.create({
          body: message,
          to: `whatsapp:${to}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        })
      )
    );

    return { success: true, messageId: results[0]?.sid };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to send WhatsApp message" };
  }
}

export async function sendMessage(data: MessageData): Promise<MessageResponse> {
  switch (data.channel) {
    case "email":
      return sendEmail(data.recipients, data.subject, data.message);
    case "sms":
      return sendSMS(data.recipients, data.message);
    case "whatsapp":
      return sendWhatsApp(data.recipients, data.message);
    default:
      return { success: false, error: "Invalid message channel" };
  }
}
