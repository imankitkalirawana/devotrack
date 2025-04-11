'use client';
import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import {
  cn,
  Navbar as NextNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Divider
} from '@heroui/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Logo from '../ui/logo';

const Navbar = ({ session }: { session: any }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const DISABLED_ROUTES = ['/auth', '/dashboard'];

  const isDisabledRoute = DISABLED_ROUTES.some((route) =>
    pathname.includes(route)
  );

  if (isDisabledRoute) return null;

  const menuItems = [
    'About',
    'Blog',
    'Customers',
    'Pricing',
    'Enterprise',
    'Changelog',
    'Documentation',
    'Contact Us'
  ];

  return (
    <NextNavbar
      classNames={{
        base: cn('border-default-100', {
          'bg-default-200/50 dark:bg-default-100/50': isMenuOpen
        }),
        wrapper: 'w-full justify-center',
        item: 'hidden md:flex'
      }}
      height="60px"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Left Content */}
      <NavbarBrand>
        <Link href="/">
          <Logo />
        </Link>
      </NavbarBrand>

      {/* Center Content */}
      <NavbarContent justify="center">
        <NavbarItem>
          <Link className="text-default-500" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-default-500" href="/dashboard">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-default-500" href="/contact">
            Contact
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-default-500" href="/about">
            About Us
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-default-500" href="/integration">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right Content */}
      <NavbarContent className="hidden md:flex" justify="end">
        {session ? (
          <NavbarItem className="ml-2 !flex gap-2">
            <Button
              onPress={() => signOut()}
              className="text-default-500"
              radius="full"
              variant="light"
              color="danger"
            >
              Logout
            </Button>
          </NavbarItem>
        ) : (
          <NavbarItem className="ml-2 !flex gap-2">
            <Button
              className="text-default-500"
              as={Link}
              href="/auth/login"
              radius="full"
              variant="light"
            >
              Login
            </Button>
            <Button
              color="primary"
              endContent={<Icon icon="solar:alt-arrow-right-linear" />}
              radius="full"
              variant="flat"
              as={Link}
              href="/auth/register"
            >
              Get Started
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarMenuToggle className="text-default-400 md:hidden" />

      <NavbarMenu
        className="top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-default-200/50 pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
        motionProps={{
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: {
            ease: 'easeInOut',
            duration: 0.2
          }
        }}
      >
        {session ? (
          <NavbarMenuItem>
            <Button fullWidth variant="faded">
              Logout
            </Button>
          </NavbarMenuItem>
        ) : (
          <>
            <NavbarMenuItem>
              <Button fullWidth as={Link} href="/auth/register" variant="faded">
                Sign In
              </Button>
            </NavbarMenuItem>
            <NavbarMenuItem className="mb-4">
              <Button
                fullWidth
                as={Link}
                className="bg-foreground text-background"
                href="/auth/register"
              >
                Get Started
              </Button>
            </NavbarMenuItem>
          </>
        )}
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link className="mb-2 w-full text-default-500" href="#">
              {item}
            </Link>
            {index < menuItems.length - 1 && <Divider className="opacity-50" />}
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextNavbar>
  );
};

export default Navbar;
