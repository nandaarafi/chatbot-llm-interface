import { useState, useEffect, useRef } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ToggleButton from "@/components/ui/toggle-button";
import { Menu, X } from 'lucide-react';
import ButtonSignin from '@/components/landing-page/button-sign-in'

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/#pricing",
    label: "Pricing",
  },
  {
    href: "/tools",
    label: "Free Tools",
  },
  {
    href: "/#testimonials",
    label: "Reviews",
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/#faq",
    label: "FAQ",
  },
];

const cta: JSX.Element = <ButtonSignin 
  extraStyle="flex items-center gap-2 rounded-full px-6 py-2
  bg-muted text-foreground hover:bg-primary-foreground hover:text-foreground"
/>

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full backdrop-blur-md ${scrolled ? 'bg-background/80 dark:bg-background/80 shadow-lg dark:shadow-white/10' : 'bg-background/60 dark:bg-background/60'}`}
      >
        <div className="flex items-center justify-between">
          <nav
            className="container flex items-center justify-between px-8 py-3 mx-auto"
            aria-label="Global"
          >
            {/* Logo section */}
            <div className="flex lg:flex-1">
              <Link
                className="flex items-center gap-2 shrink-0"
                href="/"
                // title={`${config.appName} homepage`}
              >
                {/* <Image
                  src="/icon.png"
                  alt="Command Your Chatbot logo"
                  className="w-8"
                  placeholder="blur"
                  priority={true}
                  width={32}
                  height={32}
                /> */}
                <span className='font-extrabold'>Command Your Chatbot</span>
              </Link>
            </div>

            {/* Burger menu */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
              >
                <span className="sr-only">{isOpen ? "Close menu" : "Open main menu"}</span>
                {isOpen ? (
                  <X className="text-foreground h-6 w-6" />
                ) : (
                  <Menu className="text-foreground h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:block">
              <div className="flex space-x-6">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="px-4 py-2 relative group"
                    title={link.label}
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 transform -translate-x-1/2 group-hover:w-3/4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="hidden lg:flex lg:justify-end lg:flex-1">
              <div className="flex items-center gap-3">
                {cta}
                {typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard') && (
                  <ToggleButton />
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden pt-20 px-6">
          <div className="flex flex-col items-center space-y-6 text-lg font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 w-full border-t border-border">
              <div className="flex flex-col items-center mt-6 gap-6">
                {cta}
                <ToggleButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;