import { useState } from "react";
import { toast } from "sonner";
import type {
  MessageChannel,
  MessageData,
  MessageResponse,
} from "@/lib/messaging";

type sendUserMessageType = {
  userId: string;
  subject: string;
  message: string;
  variables?: Record<string, unknown>;
  channel?: MessageChannel;
  type?: string;
};

interface UseMessagingReturn {
  isLoading: boolean;
  sendMessage: (data: MessageData) => Promise<MessageResponse>;
  resendMessage: (
    messageId: string,
    data: MessageData,
  ) => Promise<MessageResponse>;
  sendUserMessage: (data: sendUserMessageType) => Promise<MessageResponse>;
}

export function useMessaging(): UseMessagingReturn {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (data: MessageData): Promise<MessageResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.json();
        const errMsg = errorText.error || errorText.message;
        throw new Error(errMsg || `Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Message sent successfully");
      return result;
    } catch (error) {
      toast.warning(
        error instanceof Error ? error.message : "Failed to send message",
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendMessage = async (
    messageId: string,
    data: MessageData,
  ): Promise<MessageResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${messageId}/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.error || `Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to resend message");
      }

      toast.success("Message resent successfully");
      return result;
    } catch (error) {
      toast.warning(
        error instanceof Error ? error.message : "Failed to resend message",
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendUserMessage = async (
    data: sendUserMessageType,
  ): Promise<MessageResponse> => {
    setIsLoading(true);
    const { userId, subject, message, variables, channel, type } = data;
    try {
      const response = await fetch("/api/messages/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          subject,
          message,
          variables,
          channel,
          type,
        }),
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.error || `Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to send message to user");
      }

      toast.success("Message sent successfully");
      return result;
    } catch (error) {
      toast.warning(
        error instanceof Error
          ? error.message
          : "Failed to send message to user",
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, sendMessage, resendMessage, sendUserMessage };
}
