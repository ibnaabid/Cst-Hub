

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  PlusCircle,
  LogIn,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function StudyMeetHub() {
  const router = useRouter();

  const [joinId, setJoinId] = useState("");
  const [creating, setCreating] = useState(false);

  // ==========================================
  // JOIN EXISTING ROOM
  // ==========================================

  const handleJoinRoom = (e) => {
    e.preventDefault();

    const roomId = joinId.trim();

    if (!roomId) {
      toast.error("দয়া করে Room ID দিন!");
      return;
    }

    if (roomId.length < 4) {
      toast.error("সঠিক Room ID দিন!");
      return;
    }

    router.push(`/study-room/${roomId}`);
  };

  // ==========================================
  // CREATE NEW ROOM
  // ==========================================

  const handleCreateRoom = () => {
    setCreating(true);

    // Unique Room ID
    const randomId =
      "cst-" + Math.random().toString(36).substring(2, 8);

    // Small delay for better UX
    setTimeout(() => {
      router.push(
        `/study-room/${randomId}?topic=CST+Group+Study`
      );
    }, 400);
  };

  return (
    <div className="min-h-screen  bg-slate-950 text-slate-100 flex items-center justify-center px-4 pt-20 pb-10">

      {/* Background Glow */}

      <div className="fixed inset-0  pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full" />

        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-xl w-full">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="text-center py-4 mt-8">

          {/* Icon */}

          <div className="relative inline-flex mb-4">

            <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.12)]">
              <Video className="w-7 h-7" />
            </div>

            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>

          </div>

          <div className="flex items-center justify-center gap-2 mb-2">

            <h1 className="text-2xl font-bold text-white">
              CST HUB Study Room
            </h1>

            <Sparkles className="w-4 h-4 text-indigo-400" />

          </div>

          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            সহপাঠীদের সাথে লাইভ কোডিং, ল্যাব,
            অ্যাসাইনমেন্ট ও পড়াশোনা নিয়ে আলোচনা করো।
          </p>

        </div>

        {/* ==========================================
            MAIN CARD
        ========================================== */}

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">

          {/* ==========================================
              CREATE ROOM
          ========================================== */}

          <button
            onClick={handleCreateRoom}
            disabled={creating}
            className="w-full group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-indigo-600/15 to-violet-600/10 border border-indigo-500/30 hover:border-indigo-400/60 hover:bg-indigo-500/15 transition-all duration-300 text-left disabled:opacity-70"
          >

            {/* Hover Glow */}

            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600/30 transition-all">

                  {creating ? (
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}

                </div>

                <div>

                  <h2 className="text-sm font-bold text-white">
                    {creating
                      ? "Creating Room..."
                      : "Create New Room"}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    নতুন একটি study session শুরু করো
                  </p>

                </div>

              </div>

              <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />

            </div>

          </button>

          {/* ==========================================
              DIVIDER
          ========================================== */}

          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-slate-800" />

            <span className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">
              OR
            </span>

            <div className="flex-1 h-px bg-slate-800" />

          </div>

          {/* ==========================================
              JOIN ROOM
          ========================================== */}

          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LogIn className="w-4 h-4" />
              </div>

              <div>

                <h2 className="text-sm font-bold text-white">
                  Join Existing Room
                </h2>

                <p className="text-[10px] text-slate-500 mt-0.5">
                  বন্ধুর দেওয়া Room ID ব্যবহার করো
                </p>

              </div>

            </div>

            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col sm:flex-row gap-2"
            >

              <input
                type="text"
                placeholder="e.g. cst-84291"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono"
              />

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 transition-all"
              >
                Join Room
              </button>

            </form>

          </div>

          {/* ==========================================
              INFO
          ========================================== */}

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">

              <Users className="w-4 h-4 text-indigo-400 mb-2" />

              <p className="text-[10px] text-slate-500">
                Group Study
              </p>

              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                Study Together
              </p>

            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">

              <BookOpenIcon />

              <p className="text-[10px] text-slate-500">
                Discussion
              </p>

              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                Learn Together
              </p>

            </div>

          </div>

        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <p className="text-center text-[10px] text-slate-600 mt-5">
          CST HUB • Dinajpur Polytechnic
        </p>

      </div>
    </div>
  );
}

// Small icon component
function BookOpenIcon() {
  return (
    <div className="w-4 h-4 text-violet-400 mb-2">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4"
      >
        <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 1 2 17.5v-13Z" />
        <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5a2.5 2.5 0 0 0 2.5-2.5v-13Z" />
      </svg>
    </div>
  );
}