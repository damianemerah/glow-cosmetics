"use client";
import Link from "next/link";
import { keys } from "@/constants/data";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import AdminFooter from "@/components/admin/admin-footer"; // Assuming this component exists and is styled
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  // Conditionally render AdminFooter if on an admin path
  if (pathname.startsWith("/admin")) {
    return <AdminFooter />;
  }

  // --- Main Footer Section ---
  const MainFooter = () => (
    <footer className="bg-[#4a5a3a] text-gray-200">
      {" "}
      {/* Slightly adjusted darker green */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Grid Layout for Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 xl:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-4 lg:col-span-5 text-center md:text-left">
            <Link href="/" className="inline-block mb-4">
              {/* Use text logo for now */}
              <span className="text-2xl font-bold text-white font-montserrat tracking-tight">
                Glow by UgoSylvia
              </span>
            </Link>
            <p className="text-[13px] text-gray-300 leading-relaxed">
              Your premier destination for expert permanent makeup
              (Microblading, Ombre, Eyeliner, Lip Blush), stunning lash
              extensions, and professional makeup services. Discover our curated
              collection of high-quality skincare, makeup, beauty supplements,
              and unique jewellery.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-4 lg:col-span-3 text-center md:text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <FooterLink href="/about">About Us</FooterLink>
              </li>
              <li>
                <FooterLink href="/services">Services</FooterLink>
              </li>
              <li>
                <FooterLink href="/products">Products</FooterLink>
              </li>
              <li>
                <FooterLink href="/booking">Book Appointment</FooterLink>
              </li>
              <li>
                <FooterLink href="/contact">Contact</FooterLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Social */}
          <div className="md:col-span-4 lg:col-span-4 text-center md:text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Connect & Legal
            </h3>
            <ul className="space-y-2 mb-6">
              <li>
                <FooterLink href="/terms">Terms of Service</FooterLink>
              </li>
              <li>
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
              </li>
            </ul>
            {/* Social Links */}
            <div className="flex justify-center md:justify-start space-x-5">
              <SocialLink href={keys.instagram} ariaLabel="Instagram">
                <FaInstagram className="h-6 w-6" />
              </SocialLink>
              <SocialLink href={keys.facebook} ariaLabel="Facebook">
                <FaFacebookF className="h-6 w-6" />
              </SocialLink>
            </div>
          </div>
        </div>

        {/* Footer Bottom: Copyright */}
        <div className="mt-12 border-t border-gray-200/20 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Glow by UgoSylvia. All rights
            reserved.
          </p>
          {/* Optional: Keep or remove the "designed with" line based on preference */}
          {/* <p className="mt-1 text-xs text-gray-500">Website designed with ♥</p> */}
        </div>
      </div>
    </footer>
  );

  const FooterLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className="text-sm text-gray-300 hover:text-white hover:underline transition-colors duration-200"
    >
      {children}
    </Link>
  );

  // Helper component for social media links
  const SocialLink = ({
    href,
    children,
    ariaLabel,
  }: {
    href: string;
    children: React.ReactNode;
    ariaLabel: string;
  }) => (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="text-gray-400 hover:text-white transition-colors duration-200"
    >
      {children}
    </Link>
  );

  // Render the sections
  return (
    <>
      {/* <CTASection /> */}
      <MainFooter />
    </>
  );
};

export default Footer;
