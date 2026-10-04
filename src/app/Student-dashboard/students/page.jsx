"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Users,
  Loader2,
  UserRound,
  Crown,
} from "lucide-react";

const API_URL = "http://localhost:8000";

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH STUDENTS
  // =========================================================
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/students`);

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();

        // Backend response support:
        // 1. [ ... ]
        // 2. { students: [...] }
        // 3. { allStudents: [...] }
        const studentList = Array.isArray(data)
          ? data
          : data.students || data.allStudents || [];

        setStudents(studentList);
        setFilteredStudents(studentList);
      } catch (error) {
        console.error("Students fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // =========================================================
  // SEARCH + GROUP FILTER
  // =========================================================
  useEffect(() => {
    let result = [...students];

    // Search by name, email, roll
    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((student) => {
        return (
          student.name?.toLowerCase().includes(value) ||
          student.email?.toLowerCase().includes(value) ||
          student.roll?.toString().toLowerCase().includes(value)
        );
      });
    }

    // Group filter
    if (group !== "All") {
      result = result.filter((student) => {
        const studentGroup = student.group?.toString().toLowerCase() || "";

        // "A", "Group A", "group a", "a" — সব match করবে
        return (
          studentGroup === group.toLowerCase() ||
          studentGroup === `group ${group.toLowerCase()}` ||
          studentGroup.includes(group.toLowerCase())
        );
      });
    }

    setFilteredStudents(result);
  }, [search, group, students]);

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading students...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  All Students
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  View all CST students
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <Users className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="text-lg font-bold">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={19}
            />
            <input
              type="text"
              placeholder="Search by name, roll or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* GROUP FILTER */}
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Groups</option>
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* TABLE HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Student List</h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredStudents.length} students
            </p>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Student
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Roll
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Group
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const isCR = student.role?.toLowerCase() === "cr";

                  return (
                    <tr
                      key={student._id || student.id || index}
                      className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/30 transition"
                    >
                      {/* STUDENT */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <UserRound size={18} className="text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {student.name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-slate-500">4th Semester</p>
                          </div>
                        </div>
                      </td>

                      {/* ROLL */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-300">
                          {student.roll || "—"}
                        </span>
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-400">
                          {student.email || "—"}
                        </span>
                      </td>

                      {/* GROUP */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Group {student.group || "—"}
                        </span>
                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4">
                        {isCR ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Crown size={13} />
                            CR
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            Student
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <Users className="text-slate-500" size={24} />
                      </div>
                      <h3 className="font-medium text-slate-300">
                        No students found
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Try another search or group.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden divide-y divide-slate-800">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => {
              const isCR = student.role?.toLowerCase() === "cr";

              return (
                <div
                  key={student._id || student.id || index}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <UserRound size={18} className="text-indigo-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-white truncate">
                          {student.name || "Unknown Student"}
                        </h3>
                        {isCR && (
                          <Crown size={16} className="text-amber-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Roll: {student.roll || "—"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {student.email || "—"}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Group {student.group || "—"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400">
                          4th Semester
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <Users className="mx-auto text-slate-600" size={28} />
              <p className="text-slate-400 mt-3">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}