// components/TawkChat.tsx
"use client";

import Script from "next/script";
import dynamic from "next/dynamic";

// 1. Define the actual component implementation with a distinct name
const TawkChatComponent = () => {
  // Fetch IDs from environment variables
  const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  if (!tawkPropertyId || !tawkWidgetId) {
    console.warn(
      "Tawk.to Property ID or Widget ID is not set in environment variables. Chat widget will not load."
    );
    return null;
  }

  const tawkSrc = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;

  return (
    <>
      {/* Initialize Tawk_API object */}
      {/* <Script id="tawk-init" strategy="afterInteractive">
        {`
          var Tawk_API = Tawk_API || {};
          var Tawk_LoadStart = new Date();
          // Add other Tawk_API configurations here if needed
        `}
      </Script> */}

      {/* Load the main Tawk.to embed script */}
      <Script
        id="tawk-chat-widget"
        strategy="afterInteractive"
        src={tawkSrc}
        crossOrigin="anonymous"
        onLoad={() => {
          console.log("Tawk.to main script loaded.");
        }}
        onError={(e) => {
          console.error("Error loading Tawk.to script:", e);
        }}
      />
    </>
  );
};

// 2. Use dynamic import, but resolve directly to the component defined above
//    Wrapping with Promise.resolve() satisfies the dynamic import signature.
const TawkChat = dynamic(() => Promise.resolve(TawkChatComponent), {
  ssr: false, // Keep SSR false as it's a client-side script component
});

// 3. Default export the dynamically loaded component
export default TawkChat;
