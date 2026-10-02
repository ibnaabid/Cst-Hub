"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  User,
  FileText,
  Loader2,
  Search,
  ArrowUpRight,
  Megaphone,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:8000";

export default function AllNotices() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/notices`);

        if (!res.ok) {
          throw new Error("Failed to fetch notices");
        }

        const data = await res.json();

        const noticeList = Array.isArray(data)
          ? data
          : Array.isArray(data.notices)
          ? data.notices
          : [];

        setNotices(noticeList);
        setFilteredNotices(noticeList);
      } catch (error) {
        console.error("Notice loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // SEARCH
  useEffect(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      setFilteredNotices(notices);
      return;
    }

    const filtered = notices.filter((notice) => {
      return (
        notice.title?.toLowerCase().includes(searchText) ||
        notice.description?.toLowerCase().includes(searchText) ||
        notice.content?.toLowerCase().includes(searchText) ||
        notice.category?.toLowerCase().includes(searchText) ||
        notice.priority?.toLowerCase().includes(searchText) ||
        notice.type?.toLowerCase().includes(searchText)
      );
    });

    setFilteredNotices(filtered);
  }, [search, notices]);

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "Date not available";

    try {
      return new Date(date).toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  // NOTICE STYLE
  const getNoticeStyle = (notice) => {
    const priority = String(
      notice.priority ||
        notice.type ||
        notice.category ||
        ""
    ).toLowerCase();

    // URGENT
    if (
      priority.includes("urgent") ||
      priority.includes("emergency") ||
      priority.includes("critical")
    ) {
      return {
        color: "red",

        card:
          "border-red-500/30 hover:border-red-500/60 hover:shadow-red-500/10",

        top:
          "bg-gradient-to-r from-red-600 via-rose-500 to-red-400",

        icon:
          "bg-red-500/10 ring-red-500/20 text-red-400",

        title:
          "group-hover:text-red-400",

        badge:
          "border-red-500/20 bg-red-500/10 text-red-400",

        button:
          "hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400",

        Icon: AlertTriangle,

        label: "URGENT",
      };
    }

    // IMPORTANT
    if (
      priority.includes("important") ||
      priority.includes("warning")
    ) {
      return {
        color: "amber",

        card:
          "border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/10",

        top:
          "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400",

        icon:
          "bg-amber-500/10 ring-amber-500/20 text-amber-400",

        title:
          "group-hover:text-amber-400",

        badge:
          "border-amber-500/20 bg-amber-500/10 text-amber-400",

        button:
          "hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400",

        Icon: AlertTriangle,

        label: "IMPORTANT",
      };
    }

    // ACADEMIC
    if (
      priority.includes("academic") ||
      priority.includes("exam") ||
      priority.includes("class")
    ) {
      return {
        color: "green",

        card:
          "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/10",

        top:
          "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400",

        icon:
          "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400",

        title:
          "group-hover:text-emerald-400",

        badge:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

        button:
          "hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400",

        Icon: CheckCircle2,

        label: "ACADEMIC",
      };
    }

    // GENERAL
    return {
      color: "indigo",

      card:
        "border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-500/10",

      top:
        "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500",

      icon:
        "bg-indigo-500/10 ring-indigo-500/20 text-indigo-400",

      title:
        "group-hover:text-indigo-300",

      badge:
        "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",

      button:
        "hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300",

      Icon: Bell,

      label: "GENERAL",
    };
  };

  return (
    <div className="min-h-screen bg-[#0b1120] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
              <Bell className="h-5 w-5 text-indigo-400" />
            </div>

            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              CST Department
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            All Notices
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Stay updated with the latest CST department announcements
            and important information.
          </p>
        </div>

        {/* SEARCH + COUNT */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#111827] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111827] px-4 py-3">
            <Megaphone className="h-4 w-4 text-indigo-400" />

            <span className="text-sm text-slate-400">
              Total Notices:
            </span>

            <span className="font-semibold text-white">
              {filteredNotices.length}
            </span>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />

              <p className="text-sm text-slate-400">
                Loading notices...
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredNotices.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#111827] px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
              <Bell className="h-7 w-7 text-slate-500" />
            </div>

            <h2 className="text-lg font-semibold text-white">
              No notices found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "No notice matches your search."
                : "There are no notices available right now."}
            </p>
          </div>
        )}

        {/* NOTICE GRID */}
        {!loading && filteredNotices.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredNotices.map((notice, index) => {
              const style = getNoticeStyle(notice);
              const NoticeIcon = style.Icon;

              return (
                <motion.div
                  key={notice._id || notice.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                  }}
                  className="group"
                >
                  <div
                    className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[#111827] transition duration-300 hover:-translate-y-1 hover:shadow-xl ${style.card}`}
                  >

                    {/* TOP COLOR */}
                    <div className={`h-1 w-full ${style.top}`} />

                    <div className="flex flex-1 flex-col p-5">

                      {/* ICON + TYPE */}
                      <div className="mb-5 flex items-center justify-between">

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${style.icon}`}
                        >
                          <NoticeIcon className="h-5 w-5" />
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider ${style.badge}`}
                        >
                          {notice.priority ||
                            notice.type ||
                            style.label}
                        </span>
                      </div>

                      {/* TITLE */}
                      <h2
                        className={`line-clamp-2 text-lg font-semibold leading-7 text-white transition ${style.title}`}
                      >
                        {notice.title || "Untitled Notice"}
                      </h2>

                      {/* DESCRIPTION */}
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">
                        {notice.description ||
                          notice.content ||
                          notice.message ||
                          "No description available for this notice."}
                      </p>

                      {/* META */}
                      <div className="mt-auto pt-6">

                        <div className="mb-4 h-px bg-slate-800" />

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          {/* DATE */}
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays className="h-4 w-4" />

                            <span>
                              {formatDate(
                                notice.createdAt ||
                                  notice.date ||
                                  notice.created_at
                              )}
                            </span>
                          </div>

                          {/* AUTHOR */}
                          {(notice.author ||
                            notice.createdBy ||
                            notice.postedBy) && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <User className="h-4 w-4" />

                              <span className="max-w-[120px] truncate">
                                {typeof notice.author === "object"
                                  ? notice.author.name
                                  : notice.author ||
                                    notice.createdBy ||
                                    notice.postedBy}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* READ BUTTON */}
                        <button
                          type="button"
                          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-200 transition ${style.button}`}
                        >
                          Read Notice

                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}