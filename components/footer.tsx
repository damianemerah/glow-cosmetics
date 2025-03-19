import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#5a6b47] text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-8">
            <Link href="/">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xl font-bold font-montserrat">AB</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            <Link href="/about" className="text-sm hover:underline">
              About
            </Link>
            <Link href="/services" className="text-sm hover:underline">
              Services
            </Link>
            <Link href="/skincare" className="text-sm hover:underline">
              Skincare
            </Link>
            <Link href="/contact" className="text-sm hover:underline">
              Contact
            </Link>
            <Link href="/booking" className="text-sm hover:underline">
              Book
            </Link>
          </div>

          <div className="flex space-x-4 mb-8">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-5 w-5 text-white hover:text-gray-200 transition-colors" />
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-5 w-5 text-white hover:text-gray-200 transition-colors" />
            </Link>
          </div>

          <div className="text-center text-sm text-white/70">
            <p>
              © {new Date().getFullYear()} Glow by UgoSylvia | All rights
              reserved
            </p>
            <p className="mt-1">Website designed with ♥</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
