'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const reasons = [
  'Class-specific study materials',
  'Group-wise notices & updates',
  'Easy assignment tracking',
  'Quick routine access',
  'Secure student communication',
  'AI-powered study help',
];

export default function WhySection() {
  return (
    <section className="py-20 bg-slate-900/50 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Why CST HUB?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything your class needs, in one place
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}