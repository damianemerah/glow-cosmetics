"use client";

import Script from "next/script";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const TawkChatComponent = () => {
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
  const pathname = usePathname();

  if (!tawkPropertyId || !tawkWidgetId) return null;
  if (pathname.startsWith("/admin")) return null;

  const tawkSrc = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;

  // Helper that finds the iframe and applies bottom offset
  function reposition() {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe[title='chat widget']"
    );
    if (iframe?.parentElement) {
      // The immediate wrapper is what you actually see on screen
      const container = iframe.parentElement;
      container.style.bottom = "40px";
    }
  }

  // Observe DOM mutations to re-apply `bottom:40px` whenever Tawk moves its widget
  function observeWidget() {
    const observer = new MutationObserver(() => {
      reposition();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  return (
    <>
      <Script
        id="tawk-chat-widget"
        strategy="afterInteractive"
        src={tawkSrc}
        onLoad={() => {
          // Initial reposition once loaded
          reposition();
          // Start observing for any further changes
          observeWidget();
        }}
      />
    </>
  );
};

const TawkChat = dynamic(() => Promise.resolve(TawkChatComponent), {
  ssr: false,
});

export default TawkChat;
