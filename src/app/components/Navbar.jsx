"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // ড্যাশবোর্ড পাথ চেক করার জন্য

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  useEffect(() => {
    const checkUser = () => {
      const localUser = localStorage.getItem("currentUser");
      const sessionUser = sessionStorage.getItem("currentUser");

      const storedUser = localUser || sessionUser;

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Failed to parse user data:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // প্রথমবার check
    checkUser();

    // Login হলে instantly update
    window.addEventListener("userLogin", checkUser);

    // Logout হলে instantly update
    window.addEventListener("userLogout", checkUser);

    // অন্য tab/window থেকে storage change হলে update
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

    // Navbar state instantly clear
    setUser(null);

    // অন্য component-কে জানানো
    window.dispatchEvent(new Event("userLogout"));

    setDropdownOpen(false);
    setMobileMenuOpen(false);

    toast.success("Logged out successfully!");

    router.push("/Login");
  };

  // ==========================================
  // DASHBOARD LINK
  // ==========================================

  const dashboardLink =
    user?.role === "cr"
      ? "/cr-dashboard"
      : "/Student-dashboard";

  // ড্যাশবোর্ড পেজে থাকলে এই গ্লোবাল নেভবারটি রেন্ডার হবে না (ড্যাশবোর্ডের নিজস্ব সাইডবার/লেআউট দেখাবে)
  if (pathname?.includes("Student-dashboard") || pathname?.includes("cr-dashboard")) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ==========================================
              LOGO
          ========================================== */}

          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div>
              <span className="font-bold text-base text-white tracking-tight">
                CST HUB
              </span>

              <span className="block text-[9px] text-indigo-400 font-semibold -mt-1 tracking-wider uppercase">
                Dinajpur Polytechnic
              </span>
            </div>
          </Link>

          {/* ==========================================
              DESKTOP NAV LINKS
          ========================================== */}

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">

            <Link
              href="/"
              className="hover:text-indigo-400 transition-colors"
            >
              Home
            </Link>

            <Link
              href="/About"
              className="hover:text-indigo-400 transition-colors"
            >
              About
            </Link>

            <Link
              href="/routine"
              className="hover:text-indigo-400 transition-colors"
            >
              Routine
            </Link>

            {/* Dashboard */}
            {user && (
              <Link
                href={dashboardLink}
                className="hover:text-indigo-400 transition-colors"
              >
                {user.role === "cr" ? "CR Panel" : "Dashboard"}
              </Link>
            )}
          </div>

          {/* ==========================================
              DESKTOP RIGHT SIDE
          ========================================== */}

          <div className="hidden md:flex items-center gap-4">

            {user ? (
              <div className="relative">

                {/* User Button */}

                <button
                  onClick={() =>
                    setDropdownOpen(!dropdownOpen)
                  }
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    <User className="w-3.5 h-3.5" />
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-semibold max-w-[120px] truncate block">
                      {user.name}
                    </span>

                    {user.role === "cr" && (
                      <span className="text-[9px] text-indigo-400 font-medium">
                        CR
                      </span>
                    )}
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* ==========================================
                    DROPDOWN
                ========================================== */}

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-50">

                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-[10px] text-slate-400">
                        Signed in as
                      </p>

                      <p className="text-xs font-bold text-white truncate">
                        {user.name}
                      </p>

                      {user.role === "cr" && (
                        <p className="text-[10px] text-indigo-400 font-medium mt-0.5">
                          Class Representative
                        </p>
                      )}
                    </div>

                    <Link
                      href={dashboardLink}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      {user.role === "cr"
                        ? "CR Dashboard"
                        : "Dashboard"}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />

                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ==========================================
                  NOT LOGGED IN
              ========================================== */

              <div className="flex items-center gap-3">

                <Link
                  href="/Login"
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all border border-slate-800"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Sign Up
                </Link>

              </div>
            )}
          </div>

          {/* ==========================================
              MOBILE MENU BUTTON
          ========================================== */}

          <div className="md:hidden flex items-center">

            <button
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
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
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">

          {/* Links */}

          <div className="flex flex-col space-y-2 text-sm text-slate-300">

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400"
            >
              Home
            </Link>

            <Link
              href="/About"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400"
            >
              About
            </Link>

            {user && (
              <Link
                href={dashboardLink}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-indigo-400"
              >
                {user.role === "cr"
                  ? "CR Panel"
                  : "Dashboard"}
              </Link>
            )}

            <Link
              href="/routine"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400"
            >
              Routine
            </Link>

            <Link
              href="/notes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400"
            >
              Notes
            </Link>
          </div>

          {/* ==========================================
              MOBILE USER
          ========================================== */}

          <div className="pt-3 border-t border-slate-800">

            {user ? (
              <div className="space-y-3">

                {/* User Info */}

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">

                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    <User className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {user.name}
                    </p>

                    <p className="text-[10px] text-slate-400 truncate">
                      {user.role === "cr"
                        ? `${user.group || "Group"} · CR`
                        : user.email || user.roll || "Student"}
                    </p>
                  </div>
                </div>

                {/* Logout */}

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />

                  <span>Log Out</span>
                </button>

              </div>
            ) : (
              /* ==========================================
                  MOBILE LOGIN
              ========================================== */

              <div className="grid grid-cols-2 gap-2">

                <Link
                  href="/Login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-semibold border border-slate-800 text-slate-300 bg-slate-950"
                >
                  Log In
                </Link>

                <Link
                  href="/Signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
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