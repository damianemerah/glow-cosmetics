"use client";

import Script from "next/script";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TawkChatComponent = () => {
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !tawkPropertyId) return;

    const config = {
      collapsedPosition: {
        bottom: "80px",
        right: "20px",
      },
      expandedPosition: {
        bottom: "80px",
        right: "20px",
      },
      mobileBreakpoint: 768,
    };

    const getWidgetContainer = () => {
      return document.querySelector<HTMLElement>('div[id^="h"]:not([id=""])')
        ?.parentElement;
    };

    const repositionWidget = () => {
      const container = getWidgetContainer();
      if (!container) return;

      // Check widget state
      const isExpanded = container.querySelector(
        'iframe[title="chat widget"][height="145px"]'
      );

      // Handle different states
      if (isExpanded) {
        Object.assign(container.style, {
          bottom: config.expandedPosition.bottom,
          right: config.expandedPosition.right,
        });
      } else {
        Object.assign(container.style, {
          bottom: config.collapsedPosition.bottom,
          right: config.collapsedPosition.right,
        });
      }

      // Mobile adjustments
      if (window.innerWidth <= config.mobileBreakpoint) {
        container.style.transform = "scale(0.9)";
        container.style.bottom = "80px";
        container.style.right = "10px";
      }
    };

    const observer = new MutationObserver(repositionWidget);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Handle window resize
    window.addEventListener("resize", repositionWidget);

    // Initial positioning attempt
    const interval = setInterval(() => {
      if (getWidgetContainer()) {
        repositionWidget();
        clearInterval(interval);
      }
    }, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", repositionWidget);
      clearInterval(interval);
    };
  }, [tawkPropertyId]);

  if (!tawkPropertyId || !tawkWidgetId) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Script
        id="tawk-chat-widget"
        strategy="afterInteractive"
        src={`https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`}
      />
      <style jsx global>{`
        /* Target the main container using attribute selector */
        div[id^="h"][class*="widget-visible"] {
          bottom: 80px !important;
          right: 20px !important;
          transition: all 0.3s ease-in-out !important;
          z-index: 9999 !important;
        }

        /* Expanded state positioning */
        div[id^="h"][class*="widget-visible"] iframe[height="145px"] {
          bottom: 80px !important;
          right: 20px !important;
        }

        @media (max-width: 768px) {
          div[id^="h"][class*="widget-visible"] {
            bottom: 80px !important;
            right: 10px !important;
            transform: scale(0.9) !important;
          }

          div[id^="h"][class*="widget-visible"] iframe[height="145px"] {
            bottom: 60px !important;
            right: 10px !important;
          }
        }
      `}</style>
    </>
  );
};

const TawkChat = dynamic(() => Promise.resolve(TawkChatComponent), {
  ssr: false,
});

export default TawkChat;
