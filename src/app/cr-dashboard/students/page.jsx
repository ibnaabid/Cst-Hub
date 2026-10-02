"use client";

import React, { useEffect, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineRefresh } from "react-icons/hi";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/students`);

      if (!res.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await res.json();

      const studentList = Array.isArray(data)
        ? data
        : data.students || [];

      setStudents(studentList);
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <HiOutlineArrowLeft className="text-lg" />
            Back
          </button>

          <button
            onClick={fetchStudents}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition text-sm font-medium"
          >
            <HiOutlineRefresh
              className={`text-lg ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            All Students
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Registered CST HUB students
          </p>
        </div>

        {/* Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-4">
          <p className="text-sm text-slate-400">
            Total Students
          </p>

          <p className="text-2xl font-bold text-indigo-400 mt-1">
            {students.length}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">

                {/* Table Head */}
                <thead className="bg-slate-950/70 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      Student Name
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      Roll
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      Group
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      Role
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-800">

                  {students.map((student, index) => (
                    <tr
                      key={student._id || index}
                      className="hover:bg-slate-800/40 transition"
                    >
                      {/* Number */}
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold">
                            {student.name
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </div>

                          <div>
                            <p className="font-medium text-slate-200">
                              {student.name || "Unknown"}
                            </p>

                            <p className="text-xs text-slate-500">
                              Student
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-slate-300">
                        {student.email || "N/A"}
                      </td>

                      {/* Roll */}
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
                          {student.roll || "N/A"}
                        </span>
                      </td>

                      {/* Group */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            student.group === "Group A"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {student.group || "N/A"}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          {student.role || "student"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-slate-400">
                        {student.createdAt
                          ? new Date(
                              student.createdAt
                            ).toLocaleDateString("en-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
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