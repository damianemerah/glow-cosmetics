import { useState } from "react";
import { toast } from "sonner";
import type { MessageData } from "@/lib/messaging";

interface UseMessagingReturn {
  isLoading: boolean;
  sendMessage: (data: MessageData) => Promise<void>;
  resendMessage: (messageId: string, data: MessageData) => Promise<void>;
}

export function useMessaging(): UseMessagingReturn {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (data: MessageData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result);

      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Message sent successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendMessage = async (messageId: string, data: MessageData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${messageId}/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to resend message");
      }

      toast.success("Message resent successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend message"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, sendMessage, resendMessage };
}
