"use client";

import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaPinterest,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url: string;
  title?: string;
  className?: string;
}

export function SocialShare({ url, title = "", className }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const sharePlatforms = [
    {
      name: "Facebook",
      Icon: FaFacebookF,
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgColorClass: "bg-[#1877F2] hover:bg-[#166bda]",
      ariaLabel: "Share this page on Facebook",
    },
    {
      name: "Twitter",
      Icon: FaTwitter,
      shareUrl: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bgColorClass: "bg-[#1A1A1A] hover:bg-[#000000]",
      ariaLabel: "Share this page on X (formerly Twitter)",
    },
    {
      name: "WhatsApp",
      Icon: FaWhatsapp,
      shareUrl: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bgColorClass: "bg-[#25D366] hover:bg-[#1ebe57]",
      ariaLabel: "Share this page via WhatsApp",
    },
    {
      name: "Pinterest",
      Icon: FaPinterest,
      shareUrl: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      bgColorClass: "bg-[#BD081C] hover:bg-[#990818]",
      ariaLabel: "Share this page on Pinterest",
    },
  ];

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {sharePlatforms.map((platform) => (
        <Button
          key={platform.name}
          variant="default"
          size="icon"
          className={cn(
            "rounded-full text-white size-8",
            platform.bgColorClass
          )}
          onClick={() => handleShare(platform.shareUrl!)}
          aria-label={platform.ariaLabel}
          title={platform.ariaLabel}
        >
          <platform.Icon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
        </Button>
      ))}
    </div>
  );
}
