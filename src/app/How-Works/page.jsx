'use client';

import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up with your semester and group details.' },
  { step: '02', title: 'Join Your Group', desc: 'Automatically connect with Group A or Group B peers.' },
  { step: '03', title: 'Access Study Hub', desc: 'Browse routine, notes, notices and materials.' },
  { step: '04', title: 'Study & Connect', desc: 'Collaborate with classmates and use AI help.' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
          <p className="text-slate-400 text-sm mt-2">Get started in 4 simple steps</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all"
            >
              <span className="text-4xl font-black text-indigo-500/20">{item.step}</span>
              <h3 className="font-bold text-white mt-2 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}