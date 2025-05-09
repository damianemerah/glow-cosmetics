import Link from "next/link";

interface NavLink {
  name: string;
  href: string;
}

interface DesktopNavLinksProps {
  navLinks: NavLink[];
}

export const DesktopNavLinks = ({ navLinks }: DesktopNavLinksProps) => (
  <nav className="hidden lg:flex items-center space-x-6">
    {navLinks.map((link) => (
      <Link
        key={link.name}
        href={link.href}
        className="text-sm font-medium font-montserrat text-gray-700 hover:text-primary transition-colors"
      >
        {link.name}
      </Link>
    ))}
  </nav>
);
