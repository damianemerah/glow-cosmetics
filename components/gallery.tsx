// components/EmbedInstagram.tsx
import { useEffect } from "react";
import Script from "next/script";

type EmbedInstagramProps = {
  url: string;
};

const EmbedInstagram: React.FC<EmbedInstagramProps> = ({ url }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as Window & {
        instgrm?: { Embeds: { process(): void } };
      };
      win.instgrm?.Embeds.process();
    }
  }, [url]);

  return (
    <>
      <blockquote
        className="instagram-media mx-auto"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          width: "100%",
          margin: "1rem auto",
          maxWidth: "540px",
        }}
      ></blockquote>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export default EmbedInstagram;

// components/InstagramEmbedGrid.tsx
// import EmbedInstagram from "./EmbedInstagram";

// const INSTAGRAM_POSTS = [
//   "https://www.instagram.com/p/CODE1/",
//   "https://www.instagram.com/p/CODE2/",
//   "https://www.instagram.com/p/CODE3/",
//   "https://www.instagram.com/p/CODE4/",
// ];

// type InstagramEmbedGridProps = {};

// const InstagramEmbedGrid: React.FC<InstagramEmbedGridProps> = () => {
//   return (
//     <div className="container mx-auto p-4">
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {INSTAGRAM_POSTS.map((url) => (
//           <div key={url} className="flex justify-center">
//             <EmbedInstagram url={url} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default InstagramEmbedGrid;
