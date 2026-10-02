'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Code, Users, Target, ShieldCheck, Heart, ArrowRight, Link } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function AboutPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold tracking-wide">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dinajpur Polytechnic Institute</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">CST HUB</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            A dedicated digital academic ecosystem built specifically for Computer Science & Technology (CST) students to collaborate, share resources, and excel together.
          </p>
        </motion.div>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50 shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              To eliminate communication gaps between students and class representatives (CRs), provide seamless access to class notes, routines, and important notices, and empower every CST student to focus more on learning and building tech skills.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all"></div>
            <div className="w-12 h-12 rounded-2xl bg-violet-950 text-violet-400 flex items-center justify-center border border-violet-800/50 shadow-md">
              <Code className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Built by Developers</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Crafted with modern web technologies like Next.js, Tailwind CSS, and Framer Motion. CST Hub represents what diploma engineering students can achieve when they combine technical knowledge with real-world problem solving.
            </p>
          </motion.div>
        </div>

        {/* Core Values / Highlights */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What Drives Us</h2>
            <p className="text-slate-400 text-sm mt-1">Core pillars of the CST Hub platform</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Group Collaboration", desc: "Organized seamlessly for Group A and Group B students to stay synchronized." },
              { icon: ShieldCheck, title: "Reliable & Secure", desc: "Trusted notices, verified study materials, and a safe student community space." },
              { icon: Heart, title: "Student Centric", desc: "Designed keeping the everyday challenges of diploma student life in mind." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-800/50">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-10 rounded-3xl bg-gradient-to-r from-indigo-900 to-violet-900 text-center space-y-6 border border-indigo-700/40 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Be Part of the CST Hub Community</h2>
            <p className="text-indigo-200 text-sm">Join your classmates, access materials instantly, and make your academic journey smoother.</p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
             <Link href="/register"> <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('register')}
                className="px-7 py-3.5 rounded-xl bg-white text-indigo-900 font-bold text-sm shadow-xl flex items-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </motion.button></Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}