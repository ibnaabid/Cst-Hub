"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineDocumentText,
} from "react-icons/hi";

const API_URL = "https://csthub-backend.vercel.app";

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/notes`);

      if (!res.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await res.json();

      setNotes(
        Array.isArray(data)
          ? data
          : data.notes || []
      );

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete note"
        );
      }

      setNotes((prev) =>
        prev.filter((note) => note._id !== id)
      );

    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <HiOutlineArrowLeft />
            Back
          </button>

          <div className="flex gap-3">

            <button
              onClick={fetchNotes}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <HiOutlineRefresh
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() =>
                router.push("/cr-dashboard/notes/add")
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
            >
              <HiOutlinePlusCircle />
              Add Note
            </button>

          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            All Study Notes
          </h1>

          <p className="text-slate-400 mt-1">
            Manage all uploaded PDF notes
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No notes found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead className="bg-slate-950 border-b border-slate-800">
                  <tr>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      NOTE
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      SUBJECT
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      GROUP
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      SEMESTER
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      UPLOADED BY
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      PDF
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      DATE
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      ACTIONS
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">

                  {notes.map((note, index) => (
                    <tr
                      key={note._id}
                      className="hover:bg-slate-800/40"
                    >

                      {/* # */}
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      {/* Note */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <HiOutlineDocumentText className="text-indigo-400 text-xl" />
                          </div>

                          <div className="max-w-[220px]">
                            <p className="font-semibold text-slate-200 truncate">
                              {note.title || "Untitled Note"}
                            </p>

                            <p className="text-xs text-slate-500 truncate">
                              {note.fileName || "PDF"}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Subject */}
                      <td className="px-5 py-4 text-slate-300">
                        {note.subject || "General"}
                      </td>

                      {/* Group */}
                      <td className="px-3 max-w-full py-5">
                        <span className="mx-1 rounded-xl bg-purple-500/10  border-purple-800/20 border-2 font-bold text-purple-400 text-xs">
                          {note.group || "All"}
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="px-5 py-4 text-slate-400">
                        {note.semester || "N/A"}
                      </td>

                      {/* Uploaded By */}
                      <td className="px-5 py-4 text-slate-300">
                        {note.uploadedBy || "CR"}
                      </td>

                      {/* PDF */}
                      <td className="px-5 py-4">

                        {note.fileUrl ? (
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                          >
                            <HiOutlineExternalLink />
                            Open PDF
                          </a>
                        ) : (
                          <span className="text-slate-600">
                            No PDF
                          </span>
                        )}

                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {note.createdAt
                          ? new Date(
                              note.createdAt
                            ).toLocaleDateString("en-BD")
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          {/* <button
                            onClick={() =>
                              router.push(
                                `/cr-dashboard/notes/edit/${note._id}`
                              )
                            }
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                            title="Edit"
                          >
                            <HiOutlinePencil />
                          </button> */}

                          <button
                            onClick={() =>
                              handleDelete(note._id)
                            }
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                            title="Delete"
                          >
                            <HiOutlineTrash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}