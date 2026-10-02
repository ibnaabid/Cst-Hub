'use client';

import React from 'react';
import { GraduationCap, Mail, MapPin } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate && onNavigate('landing')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">CST HUB</span>
                <span className="block text-[10px] text-indigo-400 font-semibold -mt-1 tracking-wider uppercase">Academic Workspace</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your complete student hub for Computer Science & Technology. Study materials, notices, routines, and AI assistance all in one secure workspace.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Dinajpur Polytechnic Institute, Dinajpur</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate && onNavigate('landing')} className="hover:text-indigo-400 transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('features')} className="hover:text-indigo-400 transition-colors">Features</button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('about')} className="hover:text-indigo-400 transition-colors">About Us</button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('register')} className="hover:text-indigo-400 transition-colors">Get Started</button>
              </li>
            </ul>
          </div>

          {/* Academic Hubs */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Study Materials (PDF)</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Class Routines</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Group A & B Notices</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">AI Study Assistant</li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Class Representative (CR)</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer">Student Community</li>
              <li className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> support@csthub.live
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CST HUB. All rights reserved. Built for CST Students.</p>
          <p className="text-indigo-400 font-medium">Dinajpur Polytechnic Institute</p>
        </div>

      </div>
    </footer>
  );
}