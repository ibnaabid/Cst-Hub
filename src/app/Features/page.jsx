'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Bell, FileText, Calendar, Users, Bot } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Study Materials', desc: 'Access class PDFs, notes and resources uploaded by your CR.' },
  { icon: Bell, title: 'Class Notices', desc: 'Never miss important announcements and urgent deadlines.' },
  { icon: FileText, title: 'Assignments', desc: 'Track assignments, project briefs and submission status.' },
  { icon: Calendar, title: 'Class Routine', desc: 'Quickly check upcoming classes, rooms and schedules.' },
  { icon: Users, title: 'Student Community', desc: 'Connect with classmates and your class representative.' },
  { icon: Bot, title: 'AI Study Assistant', desc: 'Get instant help with difficult topics and summaries.' },
];

export default function Features() {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Core Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Designed for diploma CST students to keep academic life simple.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}