"use client";
import Link from "next/link";
import { keyValueData } from "@/constants/data";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import AdminFooter from "@/components/admin/admin-footer"; // Assuming this component exists and is styled
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <AdminFooter />;
  }
  const MainFooter = () => (
    <footer className="bg-green-light text-gray-600 pb-16 md:pb-0 inset-shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 xl:gap-12">
          <div className="md:col-span-4 lg:col-span-5 text-center md:text-left">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary font-montserrat tracking-tight">
                Glow by UgoSylvia
              </span>
            </Link>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              Your premier destination for expert permanent makeup
              (Microblading, Ombre, Eyeliner, Lip Blush), stunning lash
              extensions, and professional makeup services. Discover our curated
              collection of high-quality skincare, makeup, beauty supplements,
              and unique jewellery.
            </p>
          </div>

          <div className="flex md:col-span-8 lg:col-span-6 justify-around">
            <div className="text-left">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
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
            <div className="text-left">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
                Connect & Legal
              </h3>
              <ul className="space-y-2 mb-6">
                <li>
                  <FooterLink href="/terms">Terms of Service</FooterLink>
                </li>
                <li>
                  <FooterLink href="/terms#returnno">Return Policy</FooterLink>
                </li>
                <li>
                  <FooterLink href="/privacy">Privacy Policy</FooterLink>
                </li>
              </ul>
              <div className="flex  space-x-5">
                <SocialLink href={keyValueData.instagram} ariaLabel="Instagram">
                  <FaInstagram className="h-6 w-6" />
                </SocialLink>
                <SocialLink href={keyValueData.facebook} ariaLabel="Facebook">
                  <FaFacebookF className="h-6 w-6" />
                </SocialLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200/20 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Glow by UgoSylvia. All rights
            reserved.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Website built with ♥ by{" "}
            <FooterLink
              href="https://wa.me/2347066765698
"
            >
              Damian
            </FooterLink>
          </p>
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
      className="text-sm text-gray-600 hover:text-primary hover:underline transition-colors duration-200"
    >
      {children}
    </Link>
  );

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

  return (
    <>
      <MainFooter />
    </>
  );
};

export default Footer;
