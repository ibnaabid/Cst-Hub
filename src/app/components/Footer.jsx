'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Mail, MapPin, 
  BookOpen, Bell, Calendar, Users,
  ArrowRight, Heart
} from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/Features' },
    { name: 'About', href: '/About' },
    { name: 'Notes', href: '/Student-dashboard/notes' },
    { name: 'Routine', href: '/routine' },
  ];

  const resources = [
    { name: 'Class Notices', href: '/Student-dashboard/notices', icon: Bell },
    { name: 'Class Routine', href: '/routine', icon: Calendar },
    { name: 'Community', href: '/About', icon: Users },
  ];

  return (
    <footer className="relative bg-slate-950 overflow-hidden">
      
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* ========== CTA Banner ========== */}
      <div className="relative border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-8 sm:p-12 text-center sm:text-left"
          >
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Ready to level up your CST journey?
                </h3>
                <p className="text-indigo-100 text-sm mt-2 max-w-md">
                  Join hundreds of students already organizing notes, notices and routines in one place.
                </p>
              </div>
              <Link
                href="/Signup"
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-slate-100 shadow-xl shadow-indigo-900/30 transition-all active:scale-95"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========== Main Footer Grid ========== */}
      <div className="border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-base tracking-tight">CST HUB</span>
                  <p className="text-[10px] text-indigo-400 font-semibold -mt-0.5 tracking-wider uppercase">
                    Dinajpur Polytechnic
                  </p>
                </div>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
                The complete academic workspace for CST diploma students — notes, notices, routine & more.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Dinajpur, Bangladesh
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-indigo-400 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                    >
                      <item.icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact / Auth */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Account
              </h4>
              <ul className="space-y-2.5 mb-6">
                <li>
                  <Link href="/Login" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/Signup" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Support</span>
                </div>
                <p className="text-xs text-slate-500">mdibnaabid123@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Bottom Bar ========== */}
      <div className="border-t border-slate-900">
        <div className="max-w-6xl text-center  mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px]  text-slate-600">
            © 2026 CST HUB · All rights reserved
          </p>
          <p className="text-[11px] text-slate-600 flex items-center gap-1">
            Made with <Heart className="w-6 h-3 text-rose-500 fill-rose-500" /> for DPI CST Students
          </p>
        </div>
      </div>
    </footer>
  );
}