import { Resend } from "resend";
import { supabaseAdmin } from "./supabaseAdmin";
import pug from "pug";
import path from "path";

// Helper function to chunk arrays (instead of using lodash)
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export type MessageChannel = "email";

export interface MessageData {
  recipients: string[];
  subject: string;
  message: string;
  channel: MessageChannel;
  variables?: Record<string, unknown>;
  type?: string;
}

export interface MessageResponse {
  success: boolean;
  successCount?: number;
  totalCount?: number;
  messageId?: string;
  error?: string;
}

// Define interfaces for user data
interface UserData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface UserVariables {
  user: UserData;
  [key: string]: unknown;
}

export interface UserPreferences {
  canSendEmail: boolean;
  phoneNumber?: string;
  email?: string;
}

class Messaging {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    // Initialize Resend client
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = "Glow Cosmetics <no-reply@ugosylviacosmetics.co.za>";
  }

  /**
   * Check user notification preferences
   * @param userId User ID to check preferences for
   * @returns Object containing user notification preferences
   */
  async checkUserPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "email, email_notifications_enabled",
      )
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user preferences:", error);
      return { canSendEmail: false };
    }

    return {
      canSendEmail: !!data.email && !!data.email_notifications_enabled,
      email: data.email,
    };
  }

  /**
   * Substitute variables in template
   * @param text Template text with variables in {{variable}} format
   * @param variables Object containing variable values
   * @param userId Optional user ID for recipient-specific variables
   * @returns Text with variables substituted
   */
  substituteVariables(
    text: string,
    variables: Record<string, unknown> = {},
    userId?: string,
  ): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split(".");
      let value: unknown = variables;

      // If userId is provided and variables has that key, use recipient-specific variables
      if (
        userId && typeof variables === "object" && variables !== null &&
        userId in variables
      ) {
        value = variables[userId];
      }

      // Navigate through the object structure using the key path
      for (const k of keys) {
        if (value === undefined || value === null) return match;
        value = (value as Record<string, unknown>)[k];
      }

      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Send email to recipients
   * @param messageData Message data including recipients, subject, message, and variables
   * @returns Message response with success status and message ID
   */
  async sendEmail(messageData: MessageData): Promise<MessageResponse> {
    const { recipients, subject, message, variables } = messageData;
    try {
      // Create a map of user emails to user IDs based on variables
      const userEmailMap: Record<string, string> = {};
      if (typeof variables === "object" && variables !== null) {
        Object.keys(variables).forEach((userId) => {
          const userData = variables[userId] as UserVariables;
          if (userData?.user?.email) {
            userEmailMap[userData.user.email] = userId;
          }
        });
      }

      // Map through each recipient and send email individually
      const sendEmailPromises = recipients.map(async (email) => {
        // Look up the user identifier based on the email address
        const userId = userEmailMap[email];

        // Process subject and message individually using user-specific variables
        const processedSubject = this.substituteVariables(
          subject,
          variables,
          userId,
        );
        const processedMessage = this.substituteVariables(
          message,
          variables,
          userId,
        );

        // Default htmlContent is the processed plain message
        let htmlContent = processedMessage;

        if (processedMessage.startsWith("pug-template/")) {
          // If the message starts with 'pug-template/', render it using Pug
          const templatePath = path.join(
            process.cwd(),
            processedMessage,
          );
          htmlContent = pug.renderFile(templatePath, {
            ...variables,
          });
        } else if (/<[a-z][\s\S]*>/i.test(processedMessage)) {
          const templatePath = path.join(
            process.cwd(),
            "pug-template/emails/layout.pug",
          );
          htmlContent = pug.renderFile(templatePath, {
            bodyContent: processedMessage,
            ...variables,
          });
        }

        // Send the email for this recipient
        return await this.resend.emails.send({
          from: this.fromEmail,
          to: email,
          subject: processedSubject,
          html: htmlContent,
        });
      });

      // Wait for all emails to be sent
      const results = await Promise.all(sendEmailPromises);

      return { success: true, messageId: results[0]?.data?.id };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to send email" };
    }
  }

  /**
   * Send message with fallback to another channel if primary fails
   * @param userId User ID to send message to
   * @param subject Email subject
   * @param message Message content
   * @param variables Template variables
   * @param channel Preferred channel (email)
   * @returns Message response
   */

  async sendMessageWithFallback({
    userId,
    subject,
    message,
    variables = {},
    channel,
  }: {
    userId: string;
    subject: string;
    message: string;
    variables: Record<string, unknown>;
    channel?: MessageChannel;
  }): Promise<MessageResponse> {
    const {
      canSendEmail,
      email,
    } = await this.checkUserPreferences(userId);

    if (channel === "email" && canSendEmail && email) {
      const result = await this.sendEmail({
        recipients: [email],
        subject,
        message,
        channel: "email",
        variables,
      });
      if (result.success) return result;

      return {
        success: false,
        error: "Sending email failed.",
      };
    }

    // If no preferred channel provided, pick whichever is available
    if (canSendEmail && email) {
      return await this.sendEmail({
        recipients: [email],
        subject,
        message,
        channel: "email",
        variables,
      });
    }

    return {
      success: false,
      error: "No communication channel available.",
    };
  }

  /**
   * Send batch messages to multiple recipients
   * @param messageData Message data including recipients, subject, message, channel, and variables
   * @returns Array of message responses
   */
  async sendBatchMessages(
    messageData: MessageData,
  ): Promise<MessageResponse[]> {
    const { recipients, subject, message, channel, variables } = messageData;

    const chunks = chunkArray(recipients, 10);
    const results: MessageResponse[] = [];

    for (const recipientChunk of chunks) {
      const chunkPromises = recipientChunk.map((recipient) => {
        if (channel === "email") {
          const emailData = {
            recipients: [recipient],
            subject,
            message,
            channel,
            variables,
          };
          return this.sendEmail(emailData);
        } else {
          return { success: false, error: "Invalid Channel" };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);

      // Add a small delay between chunks to prevent rate limiting
      if (chunks.indexOf(recipientChunk) < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter((r) => r.success).length;

    // Return the total number of successful messages and first message ID
    return [{
      success: true,
      messageId: results[0]?.messageId,
      successCount: successCount,
      totalCount: recipients.length,
    }];
  }
}

// Create and export a singleton instance
const messaging = new Messaging();

// Export the singleton instance as default and individual methods
export default messaging;

// For backward compatibility, export individual functions
export const checkUserPreferences = messaging.checkUserPreferences.bind(
  messaging,
);
export const sendEmail = messaging.sendEmail.bind(messaging);
export const sendMessageWithFallback = messaging.sendMessageWithFallback.bind(
  messaging,
);
export const sendBatchMessages = messaging.sendBatchMessages.bind(messaging);
export const substituteVariables = messaging.substituteVariables.bind(
  messaging,
);
