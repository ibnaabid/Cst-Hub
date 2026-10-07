'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Phone,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Bell,
  Home,
  ChevronRight,
} from 'lucide-react';

export default function StudentDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const pathname = usePathname();

  // Load user
  useEffect(() => {
    try {
      const localUser = localStorage.getItem('currentUser');
      const sessionUser = sessionStorage.getItem('currentUser');

      const storedUser = localUser || sessionUser;

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/Student-dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Student Directory',
      href: '/Student-dashboard/students',
      icon: Users,
    },
    {
      name: 'Teacher Contact',
      href: '/Student-dashboard/Teacher-Contact',
      icon: Phone,
    },
    {
      name: 'Notices',
      href: '/Student-dashboard/notices',
      icon: FileText,
    },
    {
      name: 'Notes & PDFs',
      href: '/Student-dashboard/notes',
      icon: BookOpen,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');

    window.location.href = '/Login';
  };

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'S';

  const userName = currentUser?.name || 'Student';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden">

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50
          w-[280px] max-w-[85vw]
          bg-slate-900
          border-r border-slate-800
          flex flex-col
          shadow-2xl

          transform transition-transform duration-300 ease-out

          lg:static
          lg:w-64
          lg:max-w-none
          lg:translate-x-0
          lg:shadow-none

          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >

        {/* =========================
            SIDEBAR HEADER
        ========================= */}
        <div className="h-16 min-h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800">

          <Link
            href="/Student-dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-wide truncate">
                CST Portal
              </h1>

              <p className="text-[10px] text-slate-400 truncate">
                Student Dashboard
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="
              lg:hidden
              w-10 h-10
              shrink-0
              rounded-xl
              flex items-center justify-center
              text-slate-400
              hover:text-white
              hover:bg-slate-800
              active:bg-slate-700
              transition
            "
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================
            NAVIGATION
        ========================= */}
        <nav className="flex-1 px-3 sm:px-4 py-5 overflow-y-auto">

          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Menu
          </p>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                (item.href !== '/Student-dashboard' &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group
                    flex items-center
                    gap-3
                    min-h-[46px]
                    px-3 sm:px-4
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all duration-200

                    ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5 shrink-0
                      ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 group-hover:text-slate-200'
                      }
                    `}
                  />

                  <span className="truncate">
                    {item.name}
                  </span>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-slate-800" />

          {/* Back Home */}
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="
              flex items-center
              gap-3
              min-h-[46px]
              px-3 sm:px-4
              rounded-xl
              text-sm
              font-medium
              text-slate-400
              hover:text-white
              hover:bg-slate-800/70
              transition-all
            "
          >
            <Home className="w-5 h-5 shrink-0" />

            <span>
              Back to Home
            </span>
          </Link>
        </nav>

        {/* =========================
            USER / LOGOUT
        ========================= */}
        <div className="p-3 sm:p-4 border-t border-slate-800">

          {/* User info */}
          <div className="mb-2 px-3 py-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userName}
                </p>

                <p className="text-[11px] text-slate-500">
                  Student
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={handleLogout}
            className="
              w-full
              min-h-[46px]
              flex items-center
              gap-3
              px-3 sm:px-4
              rounded-xl
              text-sm
              font-medium
              text-rose-400
              hover:bg-rose-500/10
              active:bg-rose-500/20
              transition-all
            "
          >
            <LogOut className="w-5 h-5 shrink-0" />

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* =========================================
          MAIN AREA
      ========================================= */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* =========================
            TOP NAVBAR
        ========================= */}
        <header
          className="
            h-16
            min-h-16
            sticky top-0
            z-30
            bg-slate-900/90
            backdrop-blur-xl
            border-b border-slate-800
            px-3 sm:px-6 lg:px-8
            flex items-center
            justify-between
          "
        >

          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">

            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                lg:hidden
                w-10 h-10
                shrink-0
                rounded-xl
                flex items-center justify-center
                text-slate-400
                hover:text-white
                hover:bg-slate-800
                active:bg-slate-700
                transition
              "
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Welcome */}
            <div className="hidden sm:block min-w-0">
              <h2 className="text-sm font-semibold text-slate-200 truncate">
                Welcome back, {userName} 👋
              </h2>

              <p className="text-[11px] text-slate-500">
                Student Dashboard
              </p>
            </div>

            {/* Mobile title */}
            <div className="sm:hidden min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                CST Portal
              </h2>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notification */}
            <button
              className="
                relative
                w-10 h-10
                rounded-xl
                bg-slate-800/70
                border border-slate-700/60
                flex items-center justify-center
                text-slate-300
                hover:text-white
                hover:bg-slate-800
                transition
              "
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />

              <span className="
                absolute
                top-2
                right-2
                w-2
                h-2
                rounded-full
                bg-indigo-500
                ring-2 ring-slate-900
              " />
            </button>

            {/* Avatar */}
            <div
              className="
                w-10 h-10
                shrink-0
                rounded-full
                bg-indigo-600/20
                border border-indigo-500/30
                flex items-center justify-center
                text-indigo-400
                font-bold
                text-sm
                uppercase
              "
            >
              {userInitial}
            </div>
          </div>
        </header>

        {/* =========================
            PAGE CONTENT
        ========================= */}
        <main
          className="
            flex-1
            w-full
            min-w-0
            p-3
            sm:p-5
            md:p-6
            lg:p-8
            overflow-x-hidden
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}