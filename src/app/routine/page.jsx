'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Download,
  User,
} from 'lucide-react';

const staticRoutines = [
  {
    id: 1,
    title: 'ক্লাস রুটিন ২০২৬ — প্রথম শিফট',
    group: 'গ্রুপ A',
    description:
      'সিএসটি টেকনোলজির ৪র্থ পর্ব গ্রুপ A শিক্ষার্থীদের নিয়মিত ক্লাস রুটিন।',
    fileType: 'PDF',
    fileUrl:
      '/WhatsApp Image 2026-10-02 at 12.12.32.jpeg',
    uploadedBy: 'CR — RATUL',
    date: '০২ অক্টোবর ২০২৬',
  },
  {
    id: 2,
    title: 'ক্লাস রুটিন ২০২৬ — দ্বিতীয় শিফট',
    group: 'গ্রুপ B',
    description:
      'সিএসটি টেকনোলজির ৪র্থ পর্ব গ্রুপ B শিক্ষার্থীদের নিয়মিত ক্লাস রুটিন।',
    fileType: 'Image',
    fileUrl: '/WhatsApp Image 2026-10-02 at 12.12.31.jpeg',
    uploadedBy: 'CR — TASFIK',
    date: '০১ অক্টোবর ২০২৬',
  },
];

export default function StaticRoutinesPage() {
  return (
    <main className="min-h-screen mt-10 bg-slate-950 px-3 py-8 text-white sm:px-5 sm:py-10 md:px-8 lg:px-10">
      <div className="mx-auto  pt-8 w-full max-w-6xl">

        {/* Header */}
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 sm:h-16 sm:w-16">
            <CalendarDays className="h-7 w-7 text-emerald-400 sm:h-8 sm:w-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            ক্লাস রুটিন
          </h1>

          <p className="mx-auto mt-2 max-w-xl px-2 text-xs leading-5 text-slate-400 sm:mt-3 sm:text-sm md:text-base md:leading-6">
            সিএসটি শিক্ষার্থীদের জন্য ২০২৬ সালের ক্লাস রুটিন
          </p>
        </div>

        {/* Routine Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
          {staticRoutines.map((routine, index) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/[0.06] sm:rounded-3xl sm:p-5 md:p-6"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 sm:h-12 sm:w-12 sm:rounded-2xl">
                  {routine.fileType === 'PDF' ? (
                    <FileText className="h-5 w-5 text-emerald-400 sm:h-6 sm:w-6" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-emerald-400 sm:h-6 sm:w-6" />
                  )}
                </div>

                <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 sm:px-3 sm:text-xs">
                  {routine.group}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="mt-5 break-words text-lg font-semibold leading-7 text-white sm:text-xl sm:leading-8">
                  {routine.title}
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-400 sm:mt-3 sm:text-sm sm:leading-6">
                  {routine.description}
                </p>
              </div>

              {/* Info */}
              <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 sm:mt-6 sm:space-y-3 sm:pt-5">
                <div className="flex min-w-0 items-center gap-2.5 text-xs text-slate-400 sm:gap-3 sm:text-sm">
                  <User className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">{routine.uploadedBy}</span>
                </div>

                <div className="flex min-w-0 items-center gap-2.5 text-xs text-slate-400 sm:gap-3 sm:text-sm">
                  <CalendarDays className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">{routine.date}</span>
                </div>
              </div>

              {/* Button */}
              <a
                href={routine.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98] sm:mt-6 sm:rounded-2xl sm:text-base"
              >
                {routine.fileType === 'PDF' ? (
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}

                রুটিন দেখুন

                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}