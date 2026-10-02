'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/About' },
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-xl border-b border-slate-800 text-slate-100 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"
            >
              <GraduationCap className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">CST HUB</span>
              <span className="block text-[10px] text-indigo-400 font-semibold -mt-1 tracking-wider uppercase">Academic Hub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors relative"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">

            {/* Login Button */}
            <Link href="/Login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-colors px-3 py-2 cursor-pointer"
              >
                Login
              </motion.div>
            </Link>

            {/* Register Button */}
            <Link href="/Signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer inline-block"
              >
                Sign Up
              </motion.div>
            </Link>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-slate-800/60 border border-slate-700/60 py-1.5 px-3 rounded-full"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  A
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 overflow-hidden z-50"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors"
                    >
                      Profile Settings
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-5 shadow-2xl overflow-hidden"
          >
            {/* Mobile Navigation */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-3 text-sm font-medium text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg px-3 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Links */}
            <div className="pt-4 mt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Dashboard Link */}
            <div className="mt-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-medium text-indigo-400 hover:bg-indigo-600/10 rounded-xl transition-colors"
              >
                Dashboard
              </Link>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}