'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80', // আধুনিক স্টুডেন্ট গ্রুপ স্টাডি
    title: 'Your Complete CST Student Hub',
    subtitle: 'Study materials, notices, routine — all in one modern workspace designed for excellence.',
    badge: 'Next-Gen Academic Workspace',
    accentColor: 'from-indigo-500 to-cyan-400',
  },
  {
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80', // প্রফেশনাল কোডিং ও লার্নিং
    title: 'Learn Together, Grow Together',
    subtitle: 'Connect seamlessly with classmates, join study rooms, and stay updated with live CR notices.',
    badge: 'Collaborative Learning',
    accentColor: 'from-violet-500 to-fuchsia-400',
  },
  {
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80', // স্টাডি ডেস্ক ও ল্যাপটপ
    title: 'Never Miss a Deadline',
    subtitle: 'Assignments, exam schedules, and class updates delivered in real-time straight to your dashboard.',
    badge: 'Real-time Updates',
    accentColor: 'from-amber-500 to-orange-400',
  },
  {
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=80', // টেক ও প্রোগ্রামিং ব্যাকগ্রাউন্ড
    title: 'Organized Academic Life',
    subtitle: 'Group-wise semester notes, syllabus, and smart AI assistant tools built specially for CST students.',
    badge: 'Smart Study Tools',
    accentColor: 'from-emerald-500 to-teal-400',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <section 
      className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xl shadow-lg shadow-indigo-500/10"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>{slides[current].badge}</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
              {slides[current].title.split(' ').map((word, idx) => (
                <span key={idx} className={idx >= 2 ? `bg-clip-text text-transparent bg-gradient-to-r ${slides[current].accentColor} drop-shadow-sm` : 'text-white'}>
                  {word}{' '}
                </span>
              ))}
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              {slides[current].subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                href="/Signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-3 group border border-indigo-400/30 active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/Features"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-base backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/40 active:scale-95 shadow-lg shadow-black/20"
              >
                <BookOpen className="w-5 h-5 text-indigo-300" />
                <span>Explore Features</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-slate-900/60 hover:bg-indigo-600/80 border border-white/15 text-white backdrop-blur-xl transition-all duration-300 hidden sm:flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-slate-900/60 hover:bg-indigo-600/80 border border-white/15 text-white backdrop-blur-xl transition-all duration-300 hidden sm:flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-900/40 px-5 py-2.5 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`relative h-2.5 rounded-full transition-all duration-500 overflow-hidden ${
              i === current
                ? 'w-10 bg-indigo-500 shadow-md shadow-indigo-500/50'
                : 'w-2.5 bg-white/30 hover:bg-white/60'
            }`}
          >
            {i === current && !isPaused && (
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute inset-0 bg-white/40 rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}