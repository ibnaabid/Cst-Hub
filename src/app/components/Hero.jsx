'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  BookOpen, Bell, FileText, Calendar, Users, Bot, 
  ArrowRight, CheckCircle2, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-indigo-900/40 to-violet-900/30 blur-3xl -z-10 rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold tracking-wide shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next-Gen Academic Workspace for CST Students</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">CST Student Hub</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Study materials, class notices, assignments, routine and student communication — all in one place, organized seamlessly by group.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link href="/register">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('features')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all shadow-sm"
                >
                  Explore Features
                </motion.button>
              </motion.div>

              <motion.div variants={fadeIn} className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Group A & B Verified</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> PDF Notes & Routine</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> AI Study Assistant</span>
              </motion.div>
            </motion.div>

            {/* Right Side Dashboard Image Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="lg:col-span-5"
            >
              <div className="bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-10 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                  Live Preview
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md">CST 4th Semester • Group A</span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 group-hover:scale-[1.02] transition-transform duration-500">
                  <Image
                    height={500}
                    width={500} 
                    src="/images.jpg"
                    alt="AI Powered CST Hub"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Core Features</h2>
            <h3 className="text-3xl font-bold text-white">Everything You Need for Your CST Journey</h3>
            <p className="text-slate-400 text-sm">Designed specifically to streamline academic life for diploma computer science students.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Study Materials", desc: "Access class PDFs, notes and learning resources uploaded by your CR." },
              { icon: Bell, title: "Class Notices", desc: "Never miss important class announcements and urgent deadlines." },
              { icon: FileText, title: "Assignments", desc: "Track assignments, project briefs, and submission status easily." },
              { icon: Calendar, title: "Class Routine", desc: "Quickly check your upcoming classes, room numbers, and schedules." },
              { icon: Users, title: "Student Community", desc: "Connect with classmates and your class representative securely." },
              { icon: Bot, title: "AI Study Assistant", desc: "Get instant help understanding difficult technical topics and summaries." },
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-800/50 shadow-md">
                  <f.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white mb-2">{f.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CST HUB Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Why CST HUB?</h2>
            <h3 className="text-3xl font-bold text-white">Everything your CST class needs, organized in one place</h3>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Class-specific materials", "Group-wise notices", "Assignment tracking",
              "Easy routine access", "Student communication", "AI-powered study assistance"
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-indigo-500/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/50">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-200 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Workflow</h2>
            <h3 className="text-3xl font-bold text-white">How It Works</h3>
            <p className="text-slate-400 text-sm">Get started in 4 simple steps.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Create Account", desc: "Sign up with your semester and group details." },
              { step: "02", title: "Join Your Group", desc: "Automatically connect with Group A or Group B peers." },
              { step: "03", title: "Access Study Hub", desc: "Browse routine, notes, notices and previous questions." },
              { step: "04", title: "Study & Connect", desc: "Collaborate with classmates and utilize AI assistance." },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all"
              >
                <span className="text-3xl font-black text-indigo-900/60 group-hover:text-indigo-600/40 transition-colors">{item.step}</span>
                <h4 className="font-bold text-white mt-2 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-violet-900 text-white border-y border-indigo-700/40">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          >
            Ready to make your CST life easier?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-indigo-200 max-w-xl mx-auto text-sm"
          >
            Join your classmates and keep your academic life organized in one powerful workspace.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
           <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('register')}
              className="px-8 py-4 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-sm shadow-2xl transition-all"
            >
              Join CST HUB
            </motion.button></Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}