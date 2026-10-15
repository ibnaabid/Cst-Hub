// ```jsx
"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Users,
  BrainCircuit,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=85",
    eyebrow: "YOUR ACADEMIC COMPANION",
    title: "Your Complete",
    highlight: "CST Student Hub",
    description:
      "Your entire academic life, organized in one place. Discover study materials, follow class updates, and learn better together.",
    label: "A smarter way to study",
    number: "01",
  },
  {
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=85",
    eyebrow: "LEARN WITHOUT LIMITS",
    title: "Better Learning,",
    highlight: "Stronger Together",
    description:
      "Connect with classmates, join study rooms, and share knowledge through a collaborative space built for CST students.",
    label: "Learn together",
    number: "02",
  },
  {
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=85",
    eyebrow: "EVERYTHING IN ORDER",
    title: "Stay Focused,",
    highlight: "Stay Ahead",
    description:
      "Keep your notes, class routines, assignments, and important CR notices organized throughout the semester.",
    label: "Your semester, simplified",
    number: "03",
  },
  {
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=85",
    eyebrow: "BUILD YOUR FUTURE",
    title: "Study Smarter,",
    highlight: "Dream Bigger",
    description:
      "Explore useful resources and AI-assisted explanations to understand difficult topics and move forward with confidence.",
    label: "Your future starts here",
    number: "04",
  },
];

const features = [
  {
    icon: BookOpen,
    title: "Study Materials",
    description: "Notes, PDFs & resources",
  },
  {
    icon: Users,
    title: "Study Rooms",
    description: "Learn with classmates",
  },
  {
    icon: CalendarDays,
    title: "Class Updates",
    description: "Notices & routines",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slide = slides[current];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#F7F4FC] px-3 pb-8 pt-3 sm:px-5 sm:pb-12 lg:px-8 lg:pt-6">
      <div
        className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[26px] bg-[#211633] shadow-2xl shadow-[#38205A]/10 sm:rounded-[34px] lg:rounded-[40px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background image */}
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.image}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            <Image
              src={slide.image}
              alt={slide.highlight}
              fill
              priority={current === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Solid violet overlays, no gradients */}
        <div className="absolute inset-0 bg-[#211633]/75" />
        <div className="absolute inset-0 bg-[#130D20]/15" />

        {/* Subtle decorative outlines */}
        <div className="pointer-events-none absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-[320px] w-[320px] rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-[340px] w-[340px] rounded-full border border-white/[0.06]" />

        {/* Main content */}
        <div className="relative z-10 flex min-h-[650px] flex-col justify-center px-5 pb-24 pt-16 sm:px-10 sm:pb-28 sm:pt-20 lg:min-h-[730px] lg:px-16 xl:px-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
            <div className="max-w-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.number}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Eyebrow */}
                  <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#D8C9FF]/20 bg-[#D8C9FF]/10 px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-[#E4D9FF] shadow-lg shadow-black/5 backdrop-blur-xl sm:text-xs">
                    <Sparkles className="h-4 w-4 text-[#C4A7FF]" />
                    {slide.eyebrow}
                  </div>

                  {/* Heading */}
                  <h1 className="max-w-3xl text-[2.8rem] font-bold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[82px]">
                    {slide.title}
                    <span className="mt-1 block text-[#D8C9FF]">
                      {slide.highlight}
                    </span>
                  </h1>

                  <p className="mt-7 max-w-xl text-base leading-8 text-white/75 sm:text-lg sm:leading-9">
                    {slide.description}
                  </p>

                  {/* CTA buttons */}
                  <div className="mt-9 flex flex-col gap-3 min-[430px]:flex-row">
                    <Link
                      href="/Signup"
                      className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-2xl border border-[#C4A7FF] bg-[#8B5CF6] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-black/10 transition duration-300 hover:border-[#D8C9FF] hover:bg-[#7C3AED] active:scale-[0.98] sm:px-7"
                    >
                      Get Started Free
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/Features"
                      className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-2xl border border-white/25 bg-white/[0.08] px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl transition duration-300 hover:border-[#D8C9FF]/50 hover:bg-white/[0.15] active:scale-[0.98] sm:px-7"
                    >
                      <BookOpen className="h-4 w-4 text-[#D8C9FF]" />
                      Explore Features
                    </Link>
                  </div>

                  {/* Trust line */}
                  <div className="mt-9 flex flex-wrap items-center gap-3 text-sm text-white/65">
                    <div className="flex -space-x-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#39274F] bg-[#D8C9FF] text-[#382451]">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#39274F] bg-[#BBA2F6] text-[#382451]">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#39274F] bg-[#E9DFFF] text-[#382451]">
                        <Users className="h-4 w-4" />
                      </span>
                    </div>
                    <span>Designed for CST students, by students.</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right glass panel - desktop */}
            <div className="relative hidden min-h-[390px] items-center justify-center lg:flex">
              <motion.div
                key={`panel-${current}`}
                initial={{ opacity: 0, x: 20, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="relative w-full max-w-[365px]"
              >
                <div className="rounded-[28px] border border-white/[0.18] bg-[#2C1E40]/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl xl:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#D8C9FF]/65">
                        YOUR WORKSPACE
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                        Made for your growth
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D8C9FF]/20 bg-[#8B5CF6]/20 text-[#D8C9FF]">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;

                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.18 + index * 0.1,
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.045] p-3.5 transition-colors hover:bg-white/[0.09]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D8C9FF]/10 bg-[#8B5CF6]/20 text-[#D8C9FF]">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">
                              {feature.title}
                            </p>
                            <p className="mt-1 text-xs text-white/50">
                              {feature.description}
                            </p>
                          </div>

                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C4A7FF]" />
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-white/50">
                      One hub. More possibilities.
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#D8C9FF]">
                      <span className="h-2 w-2 rounded-full bg-[#BCA1FF]" />
                      Ready to learn
                    </span>
                  </div>
                </div>

                {/* Floating lavender card */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-7 -top-7 flex items-center gap-3 rounded-2xl border border-[#E7DFFF] bg-[#F7F4FC] px-4 py-3 shadow-xl xl:-right-10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8DEFF] text-[#7042C5]">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#30213F]">
                      Smart learning
                    </p>
                    <p className="mt-1 text-[10px] text-[#796A8A]">
                      Your learning companion
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#8B5CF6]" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom slider navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-white/10 bg-[#170F22]/50 px-5 py-4 backdrop-blur-xl sm:px-10 lg:px-16 xl:px-24">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="text-sm font-semibold tabular-nums text-white">
              {slide.number}
            </span>

            <div className="flex items-center gap-1.5">
              {slides.map((item, index) => (
                <button
                  key={item.number}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === current ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === current
                      ? "w-9 bg-[#D8C9FF]"
                      : "w-3 bg-white/35 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <span className="hidden truncate text-xs text-white/55 sm:inline">
              {slide.label}
            </span>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white transition hover:bg-white/[0.15] active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C4A7FF]/40 bg-[#8B5CF6] text-white transition hover:bg-[#7C3AED] active:scale-95"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="mx-auto mt-5 grid max-w-[1500px] grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-7">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group flex items-center gap-4 rounded-2xl border border-[#E9E1F3] bg-white px-5 py-4 transition duration-300 hover:border-[#CBB8F0] hover:shadow-xl hover:shadow-[#62418B]/[0.07] sm:px-6 sm:py-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#EAE1FA] bg-[#F1EBFF] text-[#7042C5] transition-colors group-hover:bg-[#E6DBFF]">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#30213F]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs text-[#887B96]">
                  {feature.description}
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4 text-[#A89AB9] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
