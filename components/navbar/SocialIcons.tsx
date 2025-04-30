import Link from "next/link";
import { keys } from "@/constants/data";
import { FaInstagram, FaFacebookF } from "react-icons/fa";

export const SocialIcons = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <Link
      href={keys.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
    >
      <FaInstagram className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
    </Link>
    <Link
      href={keys.facebook}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
    >
      <FaFacebookF className="h-5 w-5 text-gray-700 hover:text-primary transition-colors" />
    </Link>
  </div>
);
