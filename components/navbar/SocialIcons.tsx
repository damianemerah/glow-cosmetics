import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export const SocialIcons = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <Link
      href="https://instagram.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
    >
      <Instagram className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
    </Link>
    <Link
      href="https://facebook.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
    >
      <Facebook className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
    </Link>
  </div>
);
