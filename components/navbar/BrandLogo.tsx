import Link from "next/link";
import Image from "next/image";

const actualLogoWidth = 180;
const actualLogoHeight = 45;

export const BrandLogo = () => (
  <Link
    href="/"
    className="flex items-center"
    aria-label="Glow by UgoSylvia Home"
  >
    <Image
      src="/images/glowLogo.png"
      alt="Glow by UgoSylvia Logo"
      width={actualLogoWidth}
      height={actualLogoHeight}
      priority
      className="h-10 w-auto md:h-20"
    />
  </Link>
);
