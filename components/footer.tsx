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
    <footer className="bg-primary text-primary-foreground/75 pb-16 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 xl:gap-12">
          <div className="md:col-span-4 lg:col-span-5 text-center md:text-left">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-medium text-primary-foreground font-heading">
                Glow by UgoSylvia
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-md mx-auto md:mx-0">
              Your premier destination for expert permanent makeup
              (Microblading, Ombre, Eyeliner, Lip Blush), stunning lash
              extensions, and professional makeup services. Discover our curated
              collection of high-quality skincare, makeup and beauty
              supplements.
            </p>
          </div>

          <div className="flex md:col-span-8 lg:col-span-6 justify-around">
            <div className="text-left">
              <h3 className="eyebrow mb-5 text-highlight">
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
              <h3 className="eyebrow mb-5 text-highlight">
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
              <div className="flex gap-3">
                <SocialLink href={keyValueData.instagram} ariaLabel="Instagram">
                  <FaInstagram className="h-4 w-4" />
                </SocialLink>
                <SocialLink href={keyValueData.facebook} ariaLabel="Facebook">
                  <FaFacebookF className="h-4 w-4" />
                </SocialLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/15 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Glow by UgoSylvia. All rights
            reserved.
          </p>
          <p className="mt-1 text-xs text-primary-foreground/50">
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
      className="text-sm text-primary-foreground/75 hover:text-highlight transition-colors duration-200"
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 hover:border-highlight hover:text-highlight transition-colors duration-200"
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
