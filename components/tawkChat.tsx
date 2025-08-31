"use client";

import Script from "next/script";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const TawkChatComponent = () => {
  const pathname = usePathname();

  // Tawk.to script properties
  const tawkSrc = "https://embed.tawk.to/68b3a4c06351f6191fe69971/1j3urn4dp";

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Script
        id="tawk-chat-widget"
        strategy="lazyOnload"
        src={tawkSrc}
        charSet="UTF-8"
      />
    </>
  );
};

const TawkChat = dynamic(() => Promise.resolve(TawkChatComponent), {
  ssr: false,
});

export default TawkChat;
