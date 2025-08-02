"use client";

import Script from "next/script";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const TawkChatComponent = () => {
  const pathname = usePathname();

  // Tawk.to script properties
  const tawkSrc = "https://embed.tawk.to/68097c004667bd190d1c37e8/1ipigop8i";

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
