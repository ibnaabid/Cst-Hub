"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Activity,
  StickyNote,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_URL = "https://csthub-backend-dw3l.onrender.com";

export default function DynamicDashboardHomePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalNotes: 0,
    totalNotices: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // ================= AUTH CHECK =================
  useEffect(() => {
    const storedUser =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/Login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      // শুধু student role থাকলেই ঢুকতে দিবে
      if (parsedUser.role !== "student") {
        router.push("/Login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      router.push("/Login");
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

  // ================= DASHBOARD DATA =================
  useEffect(() => {
    // Auth check শেষ না হলে data fetch করবে না
    if (authLoading || !user) return;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [studentsRes, noticesRes, notesRes] = await Promise.all([
          fetch(`${API_URL}/students`),
          fetch(`${API_URL}/notices`),
          fetch(`${API_URL}/notes`),
        ]);

        const studentsData = await studentsRes.json();
        const noticesData = await noticesRes.json();
        const notesData = await notesRes.json();

        // ================= STUDENTS =================
        const studentCount = Array.isArray(studentsData)
          ? studentsData.length
          : Array.isArray(studentsData.students)
          ? studentsData.students.length
          : Array.isArray(studentsData.allStudents)
          ? studentsData.allStudents.length
          : 0;

        // ================= NOTICES =================
        const noticeCount = Array.isArray(noticesData)
          ? noticesData.length
          : Array.isArray(noticesData.notices)
          ? noticesData.notices.length
          : 0;

        // ================= NOTES =================
        const noteCount = Array.isArray(notesData)
          ? notesData.length
          : Array.isArray(notesData.notes)
          ? notesData.notes.length
          : 0;

        setStats({
          totalStudents: studentCount,
          totalNotes: noteCount,
          totalNotices: noticeCount,
        });
      } catch (error) {
        console.error("Dashboard data loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, user]);

  // ================= CHART DATA =================
  const chartData = [
    {
      name: "Students",
      value: stats.totalStudents,
    },
    {
      name: "Notes",
      value: stats.totalNotes,
    },
    {
      name: "Notices",
      value: stats.totalNotices,
    },
  ];

  // ================= STAT CARDS =================
  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Registered students",
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconBorder: "border-blue-500/20",
      iconColor: "text-blue-400",
      glow: "hover:shadow-blue-500/10",
    },
    {
      title: "Total Notes",
      value: stats.totalNotes,
      description: "Available study notes",
      icon: StickyNote,
      iconBg: "bg-violet-500/10",
      iconBorder: "border-violet-500/20",
      iconColor: "text-violet-400",
      glow: "hover:shadow-violet-500/10",
    },
    {
      title: "Total Notices",
      value: stats.totalNotices,
      description: "Published notices",
      icon: FileText,
      iconBg: "bg-emerald-500/10",
      iconBorder: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      glow: "hover:shadow-emerald-500/10",
    },
  ];

  // ================= LOADING / AUTH GUARD =================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Login page-এ চলে যাবে
  }

  return (
    <div className="min-h-full space-y-6 pb-8">

      {/* ================= WELCOME ================= */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0b1120] shadow-2xl"
      >
        {/* Background Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl transition-all duration-700 group-hover:bg-indigo-600/15" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_35%)]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.08] px-3.5 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
                </span>
                <span className="text-[11px] font-semibold tracking-wide text-indigo-300">
                  Spring 2026 Semester
                </span>
              </div>

              <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px]">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  {user.name}
                </span>
                <span className="ml-2">🚀</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-[15px]">
                Manage students, notes, notices and department information from one centralized dashboard.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium text-slate-400">
                    Smart Department Management
                  </span>
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="shrink-0">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      System Status
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <p className="text-sm font-semibold text-emerald-400">
                        All Systems Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]/90 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl ${stat.glow}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div className="mt-2 flex min-h-[42px] items-center">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                    ) : (
                      <h2 className="text-3xl font-extrabold tracking-tight text-white">
                        {stat.value.toLocaleString()}
                      </h2>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${stat.iconBg} ${stat.iconBorder} ${stat.iconColor} transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className={`absolute bottom-0 left-0 h-[2px] w-full ${stat.iconBg}`} />
            </motion.div>
          );
        })}
      </div>

      {/* ================= CHART ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="overflow-hidden rounded-[26px] border border-slate-800/80 bg-[#0f172a]/90 shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-800/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
              <TrendingUp className="h-[18px] w-[18px] text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white sm:text-lg">
                Department Overview
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Current database statistics
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-slate-400">Live Data</span>
          </div>
        </div>

        {/* CHART */}
        <div className="h-[320px] w-full p-4 sm:h-[350px] sm:p-5">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                </div>
                <p className="text-xs text-slate-500">Loading statistics...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0b1120",
                    border: "1px solid #334155",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    boxShadow: "0 15px 40px rgba(0,0,0,0.45)",
                  }}
                  labelStyle={{
                    color: "#cbd5e1",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                  itemStyle={{
                    color: "#818cf8",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                  formatter={(value) => [value, "Total"]}
                />
                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={70}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.section>

      {/* ================= QUICK ACTION ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
      >
        <Link
          href="/Student-dashboard/notes"
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]/90 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#111827]"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl transition-all duration-500 group-hover:bg-violet-500/10" />

          <div className="relative z-10 flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 transition-transform duration-300 group-hover:scale-105">
              <StickyNote className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-white transition-colors group-hover:text-violet-400">
                Browse Study Notes
              </h4>
              <p className="mt-1 truncate text-xs text-slate-500">
                View all available CST study notes and PDFs
              </p>
            </div>
          </div>

          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500 transition-all duration-300 group-hover:border-violet-500/20 group-hover:bg-violet-500/10 group-hover:text-violet-400">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </Link>
      </motion.div>

    </div>
  );
}