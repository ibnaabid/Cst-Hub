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
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudyMeetHub() {
  const router = useRouter();

  const [joinId, setJoinId] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  // ==========================================
  // CREATE ROOM → ID generate + copy
  // ==========================================
  const handleCreateRoom = async () => {
    setCreating(true);

    // Unique Room ID
    const randomId = "cst-" + Math.random().toString(36).substring(2, 8);
    setCreatedRoomId(randomId);

    // Clipboard-এ copy
    try {
      await navigator.clipboard.writeText(randomId);
      setCopied(true);
      toast.success(`Room তৈরি হয়েছে! ID: ${randomId} (কপি হয়েছে)`);
    } catch {
      toast.success(`Room ID: ${randomId} — নিজে কপি করে নাও`);
    }

    // Room-এ যাও
    setTimeout(() => {
      router.push(`/study-room/${randomId}?topic=CST+Group+Study`);
    }, 800);
  };

  // Manual copy (যদি দেখানো হয়)
  const handleCopyCreatedId = async () => {
    if (!createdRoomId) return;
    await navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    toast.success("Room ID কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // JOIN ROOM
  // ==========================================
  const handleJoinRoom = (e) => {
    e.preventDefault();

    const roomId = joinId.trim().toLowerCase();

    if (!roomId) {
      toast.error("Room ID দিন!");
      return;
    }

    if (roomId.length < 4) {
      toast.error("সঠিক Room ID দিন!");
      return;
    }

    setJoining(true);
    router.push(`/study-room/${roomId}?topic=Joined+Session`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 pt-20 pb-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-xl w-full">
        {/* Header */}
        <div className="text-center py-4 mt-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 items-center justify-center text-indigo-400 mb-4">
            <Video className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            CST HUB Study Room
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Room তৈরি করো → ID শেয়ার করো → বন্ধুরা Join করবে
          </p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6">
          {/* CREATE */}
          <button
            onClick={handleCreateRoom}
            disabled={creating}
            className="w-full group p-5 rounded-2xl bg-gradient-to-r from-indigo-600/15 to-violet-600/10 border border-indigo-500/30 hover:border-indigo-400/60 transition-all text-left disabled:opacity-70"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {creating ? (
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {creating ? "Creating & Copying ID..." : "Create New Room"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ID auto-copy হবে — বন্ধুদের পাঠিয়ে দাও
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-400" />
            </div>
          </button>

          {/* Created ID show (optional) */}
          {createdRoomId && (
            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-xs text-slate-400">Room ID:</span>
              <code className="flex-1 text-sm font-mono text-indigo-300">
                {createdRoomId}
              </code>
              <button
                onClick={handleCopyCreatedId}
                className="px-2 py-1 rounded-lg bg-slate-800 text-xs flex items-center gap-1"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-600 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* JOIN */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Join with Room ID
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  বন্ধুর কপি করা ID এখানে দাও
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="e.g. cst-a3x9k2"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={joining}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold"
              >
                {joining ? "Joining..." : "Join Room"}
              </button>
            </form>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <Users className="w-4 h-4 text-indigo-400 mb-2" />
              <p className="text-[10px] text-slate-500">Step 1</p>
              <p className="text-xs font-semibold text-slate-300">Create → Copy ID</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <LogIn className="w-4 h-4 text-emerald-400 mb-2" />
              <p className="text-[10px] text-slate-500">Step 2</p>
              <p className="text-xs font-semibold text-slate-300">Share → Join</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-5">
          CST HUB • Dinajpur Polytechnic
        </p>
      </div>
    </div>
  );
}