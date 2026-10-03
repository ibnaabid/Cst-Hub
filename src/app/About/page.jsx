'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Target, Users, BookOpen, 
  Shield, Sparkles, ArrowRight, Heart 
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: BookOpen, title: 'Organized Learning', desc: 'All notes, routines and notices in one clean place.' },
    { icon: Users, title: 'Student First', desc: 'Built by students, for CST diploma students.' },
    { icon: Shield, title: 'Secure & Simple', desc: 'Group-wise access and CR verified materials.' },
    { icon: Target, title: 'Stay Updated', desc: 'Never miss class updates or assignment deadlines.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-3xl rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              About CST HUB
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Built for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                CST Students
              </span>
            </h1>
            
            <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              CST HUB is a simple academic workspace for Dinajpur Polytechnic Institute 
              Computer Science & Technology students — notes, notices, routine and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                We want every CST student to easily find class materials, stay updated 
                with notices, and never miss important deadlines — without searching 
                through dozens of Messenger groups.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Class Representatives can publish notes and notices, and students get 
                everything organized by group and semester.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-5">
                <GraduationCap className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dinajpur Polytechnic</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Made with care for the CST department students of DPI — 
                Group A & Group B, all semesters.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What We Stand For</h2>
            <p className="text-slate-400 text-sm mt-2">Simple principles that guide CST HUB</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-default group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-8 h-8 text-rose-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Ready to join?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Create your free account and start organizing your CST academic life.
            </p>
            <Link
              href="/Signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}