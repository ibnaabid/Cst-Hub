"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  BookOpen,
  Hash,
  UserRound,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";

const teachers = [
  {
    code: "25831",
    subject: "Business Communication",
    teacher: "GT-4 (RS)",
    acronym: "—",
    phone: "",
  },
  {
    code: "28541",
    subject: "Java Programming",
    teacher: "Md. Tareque Rahman",
    acronym: "TR",
    phone: "01727134045",
  },
  {
    code: "28542",
    subject: "Data Structure & Algorithm",
    teacher: "Suborna Roy",
    acronym: "SR",
    phone: "01764992614",
  },
  {
    code: "28543",
    subject: "Computer Peripherals & Interfacing",
    teacher: "Hriday Chandra Dev",
    acronym: "HCD",
    phone: "01747484520",
  },
  {
    code: "28544",
    subject: "Web Design & Development-I",
    teacher: "Md. Mukmenur Akash",
    acronym: "MA",
    phone: "01580987349",
  },
  {
    code: "26841",
    subject: "Digital Electronics-II",
    teacher: "Mahen Roy",
    acronym: "MR",
    phone: "01750875384",
  },
  {
    code: "29041",
    subject: "Environmental Studies",
    teacher: "Md. Moniruzzaman",
    acronym: "MM",
    phone: "01722575772",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function TeachersPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 sm:px-6 lg:px-8">
      {/* ================= HEADER ================= */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8"
        >
          {/* Background Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <GraduationCap
                  size={28}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <p className="text-sm text-indigo-400 font-medium mb-1">
                  CST • 4th Semester
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold">
                  Our Teachers
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                  Subject teachers and contact information
                </p>
              </div>
            </div>

            {/* Teacher Count */}
            <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <UserRound
                  size={20}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total Teachers
                </p>

                <p className="text-xl font-bold">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= TABLE ================= */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm shadow-2xl shadow-black/20">
          {/* Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

          {/* Table Scroll */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse">
              {/* ================= TABLE HEAD ================= */}
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70">
                  <th className="px-5 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </span>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <UserRound
                        size={15}
                        className="text-indigo-400"
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Teacher
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        size={15}
                        className="text-violet-400"
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Subject
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Hash
                        size={15}
                        className="text-slate-500"
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Code
                      </span>
                    </div>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Acronym
                    </span>
                  </th>

                  <th className="px-5 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Phone
                        size={15}
                        className="text-emerald-400"
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Contact
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* ================= TABLE BODY ================= */}
              <tbody>
                {teachers.map((teacher, index) => (
                  <motion.tr
                    key={teacher.code}
                    variants={rowVariants}
                    className="group border-b border-slate-800/70 last:border-0 hover:bg-indigo-500/[0.04] transition-colors duration-200"
                  >
                    {/* Number */}
                    <td className="px-5 py-5">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* Teacher */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <UserRound
                            size={18}
                            className="text-indigo-400"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-white transition">
                            {teacher.teacher}
                          </p>

                          <p className="text-xs text-slate-600 mt-0.5">
                            Teacher
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-5 py-5">
                      <div className="max-w-[280px]">
                        <p className="text-sm font-medium text-slate-300 leading-relaxed">
                          {teacher.subject}
                        </p>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-5 py-5">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-400">
                        {teacher.code}
                      </span>
                    </td>

                    {/* Acronym */}
                    <td className="px-5 py-5">
                      {teacher.acronym !== "—" ? (
                        <span className="inline-flex items-center justify-center min-w-10 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                          {teacher.acronym}
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-5">
                      {teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-3 py-2.5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition group/phone"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Phone
                              size={14}
                              className="text-emerald-400"
                            />
                          </div>

                          <div className="text-left">
                            <p className="text-xs font-medium text-slate-300">
                              {teacher.phone}
                            </p>

                            <p className="text-[10px] text-slate-600">
                              Tap to call
                            </p>
                          </div>

                          <ArrowUpRight
                            size={14}
                            className="text-slate-600 group-hover/phone:text-emerald-400 transition"
                          />
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                            <Phone
                              size={14}
                              className="text-slate-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-slate-600">
                              Not available
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ================= FOOTER ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="max-w-7xl mx-auto mt-6"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-center">
          <p className="text-xs text-slate-500">
            Computer Science & Technology • 4th Semester
          </p>
        </div>
      </motion.div>
    </main>
  );
}