"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  Info,
  CalendarDays,
  Users,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load logged-in user after mounting.
  useEffect(() => {
    const checkUser = () => {
      const storedUser =
        localStorage.getItem("currentUser") ||
        sessionStorage.getItem("currentUser");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse currentUser:", error);
        setUser(null);
      }
    };

    checkUser();

    window.addEventListener("userLogin", checkUser);
    window.addEventListener("userLogout", checkUser);
    window.addEventListener("storage", checkUser);

    return () => {
      window.removeEventListener("userLogin", checkUser);
      window.removeEventListener("userLogout", checkUser);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  // Close menus when the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    window.dispatchEvent(new Event("userLogout"));

    toast.success("Logged out successfully!", {
      position: "top-center",
    });

    router.push("/Login");
  };

  // Hide navbar on dashboard pages and study rooms.
  if (
    pathname?.includes("Student-dashboard") ||
    pathname?.includes("cr-dashboard") ||
    pathname?.startsWith("/study-room/")
  ) {
    return null;
  }

  const dashboardLink =
    user?.role === "cr" ? "/cr-dashboard" : "/Student-dashboard";

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Study Room", href: "/study-room", icon: Users },
    { name: "About", href: "/About", icon: Info },
    { name: "Routine", href: "/routine", icon: CalendarDays },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const getNavLinkClass = (href) =>
    [
      "flex items-center gap-2 rounded-lg border px-2.5 py-2",
      "text-sm font-medium transition-colors duration-200",
      isActive(href)
        ? "border-indigo-400/30 bg-indigo-500/15 text-white"
        : "border-transparent text-slate-300 hover:border-indigo-400/20 hover:bg-indigo-500/10 hover:text-white",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-50 mx-2 mt-2 rounded-xl border border-slate-700/60 bg-slate-950/95 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-7">
        <div className="flex h-[60px] items-center justify-between gap-2">
          {/* BRAND LOGO */}
          <Link
            href="/"
            aria-label="CST HUB Home"
            className="flex min-w-0 shrink items-center gap-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-400/30 bg-slate-900 shadow-md shadow-indigo-950/20">
              <Image
                src="/images.jpg"
                alt="CST HUB Logo"
                width={36}
                height={36}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <span className="block text-sm font-extrabold tracking-wide text-white sm:text-base">
                CST HUB
              </span>
              <span className="block whitespace-nowrap text-[8px] font-semibold uppercase tracking-wider text-indigo-300 sm:text-[9px]">
                Dinajpur Polytechnic
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-1 xl:flex">
            {navLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={getNavLinkClass(href)}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            ))}

            {user && (
              <Link
                href={dashboardLink}
                className={getNavLinkClass(dashboardLink)}
              >
                {user.role === "cr" ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <LayoutDashboard className="h-4 w-4" />
                )}
                {user.role === "cr" ? "CR Panel" : "Dashboard"}
              </Link>
            )}
          </div>

          {/* DESKTOP ACCOUNT */}
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  className="flex max-w-[180px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-white transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/10"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                    <User className="h-4 w-4" />
                  </span>

                  <span className="max-w-[90px] truncate text-xs font-semibold">
                    {user.name || "Student"}
                  </span>

                  <ChevronDown
                    className={[
                      "h-4 w-4 text-slate-400 transition-transform duration-200",
                      dropdownOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-2xl shadow-black/40"
                  >
                    <div className="border-b border-slate-800 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name || "Student"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {user.email || user.roll || ""}
                      </p>
                    </div>

                    <Link
                      href={dashboardLink}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-indigo-500/10 hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4 text-indigo-300" />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/Login"
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-3 pb-3 pt-2 xl:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
                  "transition-colors duration-200",
                  isActive(href)
                    ? "border-indigo-400/30 bg-indigo-500/10 font-semibold text-white"
                    : "border-transparent text-slate-300 hover:bg-indigo-500/10 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-4 w-4",
                    isActive(href) ? "text-indigo-300" : "text-slate-400",
                  ].join(" ")}
                />
                {name}
              </Link>
            ))}

            {user && (
              <Link
                href={dashboardLink}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-indigo-500/10 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-300" />
                {user.role === "cr" ? "CR Panel" : "Dashboard"}
              </Link>
            )}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {user.name || "Student"}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user.email || user.roll || user.group || ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/15"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/Login"
                  className="rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  className="rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
