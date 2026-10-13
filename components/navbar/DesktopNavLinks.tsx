import Link from "next/link";

interface NavLink {
  name: string;
  href: string;
}

interface DesktopNavLinksProps {
  navLinks: NavLink[];
}

export const DesktopNavLinks = ({ navLinks }: DesktopNavLinksProps) => (
  <nav className="hidden lg:flex items-center gap-8">
    {navLinks.map((link) => (
      <Link
        key={link.name}
        href={link.href}
        className="relative py-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-primary after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-highlight after:transition-transform after:duration-300 hover:after:scale-x-100"
      >
        {link.name}
      </Link>
    ))}
  </nav>
);
