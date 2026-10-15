// ```jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bell,
  FileText,
  Calendar,
  Users,
  Bot,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Study Materials",
    desc: "Access class PDFs, notes and learning resources uploaded by your CR.",
    number: "01",
  },
  {
    icon: Bell,
    title: "Class Notices",
    desc: "Stay updated with important announcements, class updates and deadlines.",
    number: "02",
  },
  {
    icon: FileText,
    title: "Assignments",
    desc: "Keep track of assignments, project briefs and academic tasks.",
    number: "03",
  },
  {
    icon: Calendar,
    title: "Class Routine",
    desc: "Check your class schedule, upcoming lessons and daily routine.",
    number: "04",
  },
  {
    icon: Users,
    title: "Student Community",
    desc: "Stay connected with classmates and your class representative.",
    number: "05",
  },
  {
    icon: Bot,
    title: "AI Study Assistant",
    desc: "Understand difficult topics with helpful AI-powered explanations.",
    number: "06",
  },
];

export default function Features() {
  return (
    <section className="relative overflow-hidden border-t border-indigo-400/10 bg-slate-950 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Core Features
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything You Need
            <span className="mt-2 block text-indigo-300">
              In One Study Hub
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
            A smarter and simpler learning experience designed for diploma CST
            students to organize academic life in one place.
          </p>
        </motion.div>

        {/* FEATURES GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.number}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.07,
                }}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border border-slate-800/90 bg-slate-900/70 p-6 transition-colors duration-300 hover:border-indigo-400/35 hover:bg-slate-900 sm:p-7"
              >
                {/* TOP ROW */}
                <div className="mb-7 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 text-indigo-300 transition-colors duration-300 group-hover:border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  <span className="text-xs font-semibold tracking-widest text-slate-600 transition-colors group-hover:text-indigo-300/70">
                    {feature.number}
                  </span>
                </div>

                {/* CONTENT */}
                <h3 className="mb-2 flex items-center justify-between gap-3 text-lg font-bold text-white">
                  {feature.title}

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-300" />
                </h3>

                <p className="text-sm leading-7 text-slate-400">
                  {feature.desc}
                </p>

                {/* SUBTLE BOTTOM ACCENT */}
                <div className="mt-6 h-px w-full bg-slate-800 transition-colors duration-300 group-hover:bg-indigo-400/30" />
              </motion.article>
            );
          })}
        </div>

        {/* FOOTER NOTE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-slate-500"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Built for CST students
          <span className="text-slate-700">•</span>
          Learn, connect and grow together
        </motion.div>
      </div>
    </section>
  );
}
