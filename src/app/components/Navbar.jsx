// ```jsx
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

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    const checkUser = () => {
      const localUser = localStorage.getItem("currentUser");
      const sessionUser = sessionStorage.getItem("currentUser");

      const storedUser = localUser || sessionUser;

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user:", error);
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

  // ==========================================
  // LOGOUT
  // ==========================================

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

  // ==========================================
  // DASHBOARD
  // ==========================================

  const dashboardLink =
    user?.role === "cr" ? "/cr-dashboard" : "/Student-dashboard";

  // ==========================================
  // HIDE NAVBAR ON DASHBOARD
  // ==========================================

  if (
    pathname?.includes("Student-dashboard") ||
    pathname?.includes("cr-dashboard")
  ) {
    return null;
  }

  // ==========================================
  // NAV LINKS
  // ==========================================

  const navLinks = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Study Room",
      href: "/study-room",
      icon: Users,
    },
    {
      name: "About",
      href: "/About",
      icon: Info,
    },
    {
      name: "Routine",
      href: "/routine",
      icon: CalendarDays,
    },
  ];

  // ==========================================
  // ACTIVE LINK
  // ==========================================

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname?.startsWith(href);
  };

  // ==========================================
  // DESKTOP LINK CLASS
  // ==========================================

  const getNavLinkClass = (href) => {
    if (isActive(href)) {
      return "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-500/15 border border-indigo-400/40 shadow-[0_0_18px_rgba(99,102,241,0.12)] transition-all duration-300";
    }

    return "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 border border-transparent hover:text-white hover:bg-indigo-500/10 hover:border-indigo-400/40 hover:shadow-[0_0_18px_rgba(99,102,241,0.12)] transition-all duration-300";
  };

  return (
    <nav className="fixed top-3 left-3 right-3 z-50 bg-slate-950/75 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.35)]">
      {/* ==========================================
          NAVBAR
      ========================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* ==========================================
              LOGO
          ========================================== */}

          <Link
            href="/"
            className="inline-flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all duration-300">
              <GraduationCap className="w-5 h-5" />

              <span className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div>
              <span className="block font-bold text-base text-white tracking-tight">
                CST HUB
              </span>

              <span className="block text-[9px] text-indigo-400 font-semibold -mt-1 tracking-[0.18em] uppercase">
                Dinajpur Polytechnic
              </span>
            </div>
          </Link>

          {/* ==========================================
              DESKTOP NAV
          ========================================== */}

          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={getNavLinkClass(link.href)}
                >
                  <Icon className="w-3.5 h-3.5" />

                  <span>{link.name}</span>

                  {isActive(link.href) && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                  )}
                </Link>
              );
            })}

            {/* DASHBOARD */}

            {user && (
              <Link
                href={dashboardLink}
                className={getNavLinkClass(dashboardLink)}
              >
                {user.role === "cr" ? (
                  <Users className="w-3.5 h-3.5" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}

                <span>
                  {user.role === "cr" ? "CR Panel" : "Dashboard"}
                </span>
              </Link>
            )}
          </div>

          {/* ==========================================
              DESKTOP RIGHT
          ========================================== */}

          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">

                {/* USER BUTTON */}

                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-700/70 hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-semibold max-w-[120px] truncate block text-white">
                      {user.name}
                    </span>

                    {user.role === "cr" && (
                      <span className="text-[9px] text-indigo-400 font-medium">
                        Class Representative
                      </span>
                    )}
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-950/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-hidden py-1.5">

                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-[10px] text-slate-500">
                        Signed in as
                      </p>

                      <p className="text-sm font-bold text-white truncate mt-0.5">
                        {user.name}
                      </p>

                      {user.role === "cr" && (
                        <p className="text-[10px] text-indigo-400 font-medium mt-1">
                          Class Representative
                        </p>
                      )}
                    </div>

                    <Link
                      href={dashboardLink}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-indigo-500/10 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />

                      {user.role === "cr"
                        ? "CR Dashboard"
                        : "Dashboard"}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />

                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">

                {/* LOGIN */}

                <Link
                  href="/Login"
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl text-slate-300 border border-slate-700/70 hover:text-white hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:shadow-[0_0_18px_rgba(99,102,241,0.12)] transition-all duration-300"
                >
                  Log In
                </Link>

                {/* SIGNUP */}

                <Link
                  href="/Signup"
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-indigo-400/30 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* ==========================================
              MOBILE BUTTON
          ========================================== */}

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2.5 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-700/70 hover:border-indigo-400/40 hover:text-white hover:bg-indigo-500/10 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          MOBILE MENU
      ========================================== */}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl rounded-b-2xl px-4 pt-4 pb-5">

          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    isActive(link.href)
                      ? "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-white bg-indigo-500/10 border border-indigo-400/30 transition-all"
                      : "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-slate-300 border border-transparent hover:text-white hover:bg-indigo-500/10 hover:border-indigo-400/30 transition-all"
                  }
                >
                  <Icon className="w-4 h-4" />

                  {link.name}
                </Link>
              );
            })}

            {/* DASHBOARD */}

            {user && (
              <Link
                href={dashboardLink}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-slate-300 border border-transparent hover:text-white hover:bg-indigo-500/10 hover:border-indigo-400/30 transition-all"
              >
                {user.role === "cr" ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}

                {user.role === "cr"
                  ? "CR Panel"
                  : "Dashboard"}
              </Link>
            )}
          </div>

          {/* MOBILE USER */}

          <div className="pt-4 mt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-3">

                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <User className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user.name}
                    </p>

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {user.role === "cr"
                        ? `${user.group || "Group"} · CR`
                        : user.email || user.roll || "Student"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 hover:border-rose-400/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />

                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">

                <Link
                  href="/Login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 bg-slate-900/70 hover:text-white hover:border-indigo-400/40 hover:bg-indigo-500/10 transition-all"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white border border-indigo-400/30 shadow-lg shadow-indigo-600/20 transition-all"
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
