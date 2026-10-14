
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  BookOpen,
  Info,
  CalendarDays,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import NotificationSetup from "./NotificationSetup";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

    toast.success("Logged out successfully!");
    router.push("/Login");
  };

  if (
    pathname?.includes("Student-dashboard") ||
    pathname?.includes("cr-dashboard")
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
    `relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive(href)
        ? "text-white bg-indigo-500/15 border border-indigo-400/40"
        : "text-slate-300 border border-transparent hover:text-white hover:bg-indigo-500/10 hover:border-indigo-400/40"
    }`;

  return (
    <nav className="fixed top-3 left-3 right-3 z-50 rounded-2xl border border-slate-700/50 bg-slate-950/90 shadow-xl backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-2">
          {/* LOGO */}
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/30 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <span className="block text-base font-bold tracking-tight text-white">
                CST HUB
              </span>
              <span className="block whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-indigo-400">
                Dinajpur Polytechnic
              </span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden items-center gap-1.5 md:flex">
            {navLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={getNavLinkClass(href)}
              >
                <Icon className="h-3.5 w-3.5" />
                {name}
              </Link>
            ))}

            {user && (
              <Link
                href={dashboardLink}
                className={getNavLinkClass(dashboardLink)}
              >
                {user.role === "cr" ? (
                  <Users className="h-3.5 w-3.5" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
                {user.role === "cr" ? "CR Panel" : "Dashboard"}
              </Link>
            )}
          </div>

          {/* DESKTOP USER */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-white"
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  <span className="max-w-[120px] truncate text-xs">
                    {user.name || "Student"}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-xl">
                    <p className="truncate px-3 py-2 text-xs text-slate-400">
                      {user.email || user.name}
                    </p>
                    <Link
                      href={dashboardLink}
                      onClick={() => setDropdownOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
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
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/Signup"
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-xs text-white hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* DESKTOP NOTIFICATION */}
            <NotificationSetup user={user} />
          </div>

          {/* MOBILE ACTIONS */}
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <NotificationSetup user={user} />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="rounded-xl border border-slate-700 bg-slate-900/80 p-2.5 text-slate-300 hover:text-white"
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
        <div className="border-t border-slate-800 bg-slate-950 px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1.5">
            {navLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm ${
                  isActive(href)
                    ? "border border-indigo-400/30 bg-indigo-500/10 text-white"
                    : "text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            ))}

            {user && (
              <Link
                href={dashboardLink}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white"
              >
                <BookOpen className="h-4 w-4" />
                {user.role === "cr" ? "CR Panel" : "Dashboard"}
              </Link>
            )}
          </div>

          <div className="mt-3 border-t border-slate-800 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                  <User className="h-5 w-5 shrink-0 text-indigo-400" />
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/Login"
                  className="rounded-xl border border-slate-700 py-3 text-center text-sm text-slate-300"
                >
                  Log In
                </Link>
                <Link
                  href="/Signup"
                  className="rounded-xl bg-indigo-600 py-3 text-center text-sm text-white"
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
