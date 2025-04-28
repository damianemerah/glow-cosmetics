import Link from "next/link";

interface NavLink {
  name: string;
  href: string;
}

interface MobileNavLinksProps {
  navLinks: NavLink[];
  onLinkClick: () => void; // To close the sheet on navigation
}

export const MobileNavLinks = ({
  navLinks,
  onLinkClick,
}: MobileNavLinksProps) => (
  <>
    {navLinks.map((link) => (
      <Link
        key={link.name}
        href={link.href}
        className="text-lg font-medium text-gray-700 hover:text-primary transition-colors"
        onClick={onLinkClick}
      >
        {link.name}
      </Link>
    ))}
  </>
);
