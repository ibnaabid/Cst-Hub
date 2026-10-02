"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePlusCircle,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import EditNoticeForm from "@/app/notesmodal/page";

const API_URL = "http://localhost:8000";

export default function NoticesPage() {
  const router = useRouter();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/notices`);

      if (!res.ok) {
        throw new Error("Failed to fetch notices");
      }

      const data = await res.json();

      setNotices(
        Array.isArray(data)
          ? data
          : data.notices || []
      );

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API_URL}/notices/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete notice"
        );
      }

      setNotices((prev) =>
        prev.filter((notice) => notice._id !== id)
      );

    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed!");
    }
  };

  const getCategoryStyle = (category) => {
    if (category === "urgent") {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }

    if (category === "academic") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }

    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
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
              onClick={fetchNotices}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <HiOutlineRefresh
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() =>
                router.push("/cr-dashboard/notices/add")
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500"
            >
              <HiOutlinePlusCircle />
              Add Notice
            </button>

          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            All Notices
          </h1>

          <p className="text-slate-400 mt-1">
            Manage all published notices
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
              Loading notices...
            </div>
          ) : notices.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No notices found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead className="bg-slate-950 border-b border-slate-800">
                  <tr>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      TITLE
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      CATEGORY
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      PUBLISHER
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-slate-400">
                      DESCRIPTION
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

                  {notices.map((notice, index) => (
                    <tr
                      key={notice._id}
                      className="hover:bg-slate-800/40"
                    >

                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {notice.title}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg border text-xs capitalize ${getCategoryStyle(
                            notice.category
                          )}`}
                        >
                          {notice.category || "general"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {notice.publisher || "CR Office"}
                      </td>

                      <td className="px-5 py-4 max-w-[300px]">
                        <p className="line-clamp-2 text-slate-400">
                          {notice.description}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {notice.createdAt
                          ? new Date(
                              notice.createdAt
                            ).toLocaleDateString("en-BD")
                          : "N/A"}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">
                            <EditNoticeForm notice={notice}/>

                          

                          <button
                            onClick={() =>
                              handleDelete(notice._id)
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