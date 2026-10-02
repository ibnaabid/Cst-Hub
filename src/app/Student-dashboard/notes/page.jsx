
"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  FileText,
  Eye,
  X,
  Loader2,
  BookOpen,
  Users,
  CalendarDays,
  User,
} from "lucide-react";

const API_URL = "http://localhost:8000";

export default function AllNotes() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedPdf, setSelectedPdf] = useState(null);

  // =====================================================
  // FETCH NOTES
  // =====================================================

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/notes`);

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();

      // Backend directly returns array
      const notesData = Array.isArray(data)
        ? data
        : data.notes || [];

      setNotes(notesData);
      setFilteredNotes(notesData);
    } catch (error) {
      console.error(error);

      setError(
        "Notes load করতে সমস্যা হয়েছে। Backend server চলছে কিনা check করো."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter((note) => {
      return (
        note.title?.toLowerCase().includes(query) ||
        note.subject?.toLowerCase().includes(query) ||
        note.description?.toLowerCase().includes(query) ||
        note.group?.toLowerCase().includes(query) ||
        note.semester?.toLowerCase().includes(query) ||
        note.fileName?.toLowerCase().includes(query)
      );
    });

    setFilteredNotes(filtered);
  }, [search, notes]);

  // =====================================================
  // OPEN PDF
  // =====================================================

  const handleOpenPdf = (note) => {
    if (!note.fileUrl) {
      alert("PDF URL পাওয়া যায়নি!");
      return;
    }

    setSelectedPdf({
      title: note.title,
      url: note.fileUrl,
    });
  };

  // =====================================================
  // CLOSE PDF
  // =====================================================

  const closePdf = () => {
    setSelectedPdf(null);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    try {
      return new Date(date).toLocaleDateString(
        "en-BD",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "Unknown date";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />

          <p className="text-sm text-gray-400">
            Loading study materials...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <main className="min-h-screen bg-[#080b12] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="mb-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
                  <BookOpen className="h-4 w-4" />
                  Study Materials
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Class Notes
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  তোমার semester-এর notes, PDFs এবং study
                  materials এখান থেকে সহজে পড়তে পারবে।
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-xs text-gray-500">
                  Total Materials
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {notes.length}
                </p>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search notes, subject, semester..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500/50 focus:bg-white/[0.06]"
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {!error && filteredNotes.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>

              <h2 className="text-lg font-semibold">
                No notes found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Search দিয়ে অন্য কিছু try করো।"
                  : "এখনও কোনো study material upload করা হয়নি।"}
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* NOTES GRID */}
          {/* ================================================= */}

          {filteredNotes.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <div
                  key={
                    note._id ||
                    note.id ||
                    note.fileUrl
                  }
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-white/[0.055]"
                >
                  {/* TOP */}
                  <div className="p-5">

                    {/* PDF ICON + TYPE */}

                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                        <FileText className="h-6 w-6 text-red-400" />
                      </div>

                      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-300">
                        PDF
                      </span>
                    </div>

                    {/* TITLE */}

                    <h2 className="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-white">
                      {note.title || "Untitled Note"}
                    </h2>

                    {/* DESCRIPTION */}

                    {note.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                        {note.description}
                      </p>
                    )}

                    {/* INFO */}

                    <div className="mt-5 space-y-2.5">

                      {/* SUBJECT */}

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <BookOpen className="h-4 w-4 text-indigo-400" />

                        <span className="truncate">
                          {note.subject || "General"}
                        </span>
                      </div>

                      {/* SEMESTER */}

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CalendarDays className="h-4 w-4 text-emerald-400" />

                        <span>
                          {note.semester ||
                            "4th Semester"}
                        </span>
                      </div>

                      {/* GROUP */}

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="h-4 w-4 text-violet-400" />

                        <span>
                          Group {note.group || "All"}
                        </span>
                      </div>

                      {/* UPLOADED BY */}

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <User className="h-4 w-4 text-orange-400" />

                        <span className="truncate">
                          {note.uploadedBy || "CR"}
                        </span>
                      </div>

                    </div>

                    {/* DATE */}

                    <div className="mt-5 border-t border-white/5 pt-4 text-xs text-gray-600">
                      Uploaded{" "}
                      {formatDate(note.createdAt)}
                    </div>
                  </div>

                  {/* VIEW BUTTON */}

                  <div className="border-t border-white/5 bg-black/10 p-4">
                    <button
                      onClick={() =>
                        handleOpenPdf(note)
                      }
                      disabled={!note.fileUrl}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Eye className="h-4 w-4" />

                      {note.fileUrl
                        ? "View PDF"
                        : "PDF Unavailable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* =================================================== */}
      {/* PDF VIEWER MODAL */}
      {/* =================================================== */}

      {selectedPdf && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm">

          {/* MODAL HEADER */}

          <div className="absolute left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#090c13]/95 px-4 sm:px-6">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <FileText className="h-5 w-5 text-red-400" />
              </div>

              <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                {selectedPdf.title}
              </h2>
            </div>

            {/* ONLY CLOSE BUTTON */}

            <button
              onClick={closePdf}
              className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close PDF"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* PDF */}

          <div className="absolute inset-x-0 bottom-0 top-16 p-2 sm:p-4">

            <div className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white">

              <iframe
                src={selectedPdf.url}
                title={selectedPdf.title}
                className="h-full w-full"
              />

            </div>
          </div>
        </div>
      )}
    </>
  );
}
