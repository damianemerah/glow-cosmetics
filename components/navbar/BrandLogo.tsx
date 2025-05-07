import Link from "next/link";
import Image from "next/image"; // Import the next/image component

// IMPORTANT: Replace these width/height values with the ACTUAL intrinsic dimensions
// of your /public/images/glow-logo.png image file for best results.
// Example: If your image is 180px wide and 45px high:
const actualLogoWidth = 180; // <-- Replace with actual width of glow-logo.png
const actualLogoHeight = 45; // <-- Replace with actual height of glow-logo.png

export const BrandLogo = () => (
  <Link
    href="/"
    className="flex items-center" // Keeps vertical alignment if needed
    aria-label="Glow by UgoSylvia Home" // Accessibility for image-only link
  >
    {/* Use the next/image component */}
    <Image
      src="/images/glow-logo.png" // Path relative to the public folder
      alt="Glow by UgoSylvia Logo" // Descriptive alt text
      width={actualLogoWidth} // Set to the ACTUAL width of the image file
      height={actualLogoHeight} // Set to the ACTUAL height of the image file
      priority // Prioritize loading if logo is in the header (Above The Fold)
      // --- Responsive Size Control ---
      // Use Tailwind classes to control the *rendered* size.
      // Adjust the `h-` value and breakpoints (`md:`, `lg:`) as needed
      // to fit your design. `w-auto` maintains the aspect ratio.
      className="h-10 w-auto md:h-12" // Example: 40px high default, 48px high on medium+ screens
    />
  </Link>
);
