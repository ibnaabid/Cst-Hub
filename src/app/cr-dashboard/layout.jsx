'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Bell, Users, LogOut,
  LayoutDashboard, BookOpen, Calendar, Home, Menu, X,
  BookBookmark,
  BookLockIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CRLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem('currentUser') || 
      sessionStorage.getItem('currentUser') || 
      'null'
    );

    if (!user || user.role !== 'cr') {
      toast.error('Access denied! CR only.');
      router.push('/Login');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
    router.push('/Login');
  };

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/cr-dashboard' },
    { id: 'Add notes', label: 'Notes', icon: BookOpen, href: '/cr-dashboard/notes' },
      { id: 'All Notes', label: 'All-Notes', icon: BookBookmark, href: '/cr-dashboard/Allnotes' },
    { id: 'Add notices', label: 'Notices', icon: Bell, href: '/cr-dashboard/notices' },
    { id: 'All Notices', label: 'All-Notices', icon:BookLockIcon , href: '/cr-dashboard/Allnotices' },
    { id: 'students', label: 'Students', icon: Users, href: '/cr-dashboard/students' },
  ];
// icon: 
  const isActive = (href) => {
    if (href === '/cr-dashboard') return pathname === '/cr-dashboard';
    return pathname.startsWith(href);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      
      {/* ========== Desktop Sidebar ========== */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900/80 border-r border-slate-800 fixed h-full z-30">
        
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">CST HUB</h1>
              <p className="text-[10px] text-indigo-400 font-medium">CR Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all mt-4"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400">{currentUser.group} · CR</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ========== Main Area ========== */}
      <div className="flex-1 lg:ml-64">
        
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">CR Panel</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden fixed inset-x-0 top-16 z-30 bg-slate-900 border-b border-slate-800 shadow-xl"
            >
              <div className="p-4 space-y-1">
                <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-indigo-400">{currentUser.group} · CR</p>
                  </div>
                </div>

                {sidebarLinks.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}