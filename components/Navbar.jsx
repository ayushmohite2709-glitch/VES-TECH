"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;

  const role = user?.publicMetadata?.role;
  const isAdmin = role === "admin" || role === "subadmin";

  const closeMenu = () => setIsMenuOpen(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="w-full">
      <nav className="bg-white">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" aria-label="Go to dashboard">
              <Image
                className="hidden md:block cursor-pointer"
                src="/brand.jpeg"
                alt="Brand Logo"
                width={180}
                height={10}
                priority
              />
            </Link>
            <Link href="/dashboard" aria-label="Go to dashboard">
              <Image
                className="md:hidden cursor-pointer"
                src="/brand-mini.png"
                alt="Brand Mini Logo"
                width={48}
                height={37}
                priority
              />
            </Link>
          </div>

          <div className="hidden md:flex font-semibold text-base space-x-8 lg:space-x-12">
            <NavLink href="/dashboard" aria-label="Go to dashboard">
              Dashboard
            </NavLink>
            <NavLink href="/assign-card" aria-label="Go to courses">
              Assign Card
            </NavLink>
            <NavLink href="/data-stream" aria-label="Go to learning">
              OpenCV Data
            </NavLink>
            {isAdmin && (
              <NavLink
                href="/subadmin/users"
                aria-label="Go to admin dashboard"
              >
                Admin Dashboard
              </NavLink>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center border border-gray-300 rounded-full px-4 py-2 bg-gray-50 transition-all focus-within:border-indigo-500">
              <input
                type="search"
                name="Mysearch"
                id="search"
                placeholder="Search courses..."
                className="focus:outline-none bg-gray-50 w-40 text-sm"
              />
              {/* <Search className="h-5 w-5 text-gray-500 ml-2 cursor-pointer" /> */}
            </div>

            <div className="hidden md:block">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button
                    className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 transition-all duration-300 font-semibold text-sm shadow-md"
                    type="button"
                  >
                    Get Started
                  </button>
                </SignInButton>
              )}
            </div>

            <button
              onClick={toggleMenu}
              className="block md:hidden p-1 text-gray-700 hover:text-black transition-colors"
              aria-label="Toggle Menu"
              aria-expanded={isMenuOpen}
              type="button"
            >
              {/* {isMenuOpen ? <X size={24} /> : <Menu size={24} />} */}
            </button>

            {isSignedIn && (
              <button
                className="block md:hidden text-gray-700 hover:text-black transition-colors"
                type="button"
              >
                <UserButton afterSignOutUrl="/"/>
              </button>
            )}
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed top-[56px] sm:top-[64px] left-0 right-0 bg-white z-40 md:hidden shadow-xl border-t border-gray-100">
          <div className="flex flex-col p-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 mb-4">
              <input
                type="search"
                placeholder="Search..."
                className="focus:outline-none bg-gray-50 w-full text-sm"
              />
              <Search className="h-5 w-5 text-gray-500 ml-2" />
            </div>

            <MobileNavLink
              href="/dashboard"
              aria-label="Go to dashboard"
              onClick={closeMenu}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              href="/courses"
              aria-label="Go to courses"
              onClick={closeMenu}
            >
              Courses
            </MobileNavLink>
            <MobileNavLink
              href="/user"
              aria-label="Go to user page"
              onClick={closeMenu}
            >
              My Learning
            </MobileNavLink>

            {!isSignedIn && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button
                    onClick={closeMenu}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors text-center"
                    type="button"
                  >
                    Get Started
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NavLink = ({ href, children }) => (
  <Link
    href={href}
    className="relative text-gray-700 hover:text-indigo-600 transition-colors duration-200 cursor-pointer group py-2"
  >
    {children}
    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-indigo-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
  </Link>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className="text-gray-700 hover:text-indigo-600 py-3 border-b border-gray-100 text-base font-medium transition-colors"
  >
    {children}
  </Link>
);

export default Navbar;