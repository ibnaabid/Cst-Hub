"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineSpeakerphone,
  HiOutlinePlusCircle,
} from "react-icons/hi";

const API_URL = "http://localhost:8000";

export default function AddNoticePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "urgent",
    publisher: "CR Office",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Notice title দাও!");
      return;
    }

    if (!formData.description.trim()) {
      setError("Notice description দাও!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          publisher: formData.publisher.trim() || "CR Office",
          createdAt: new Date().toISOString(),
        }),
      });

      const result = await res.json();

      console.log("Backend response:", result);

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Failed to publish notice. Please try again."
        );
      }

      setSuccess("✅ Notice published successfully!");

      setFormData({
        title: "",
        description: "",
        category: "urgent",
        publisher: "CR Office",
      });

      setTimeout(() => {
        router.push("/cr-dashboard");
      }, 1000);
    } catch (err) {
      console.error("Publish notice error:", err);

      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-sm font-medium"
        >
          <HiOutlineArrowLeft className="text-lg" />
          Back
        </button>

        {/* Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
            <span className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <HiOutlineSpeakerphone className="text-2xl" />
            </span>

            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Create Official Notice
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Publish announcements for all students
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Notice Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Notice Title
              </label>

              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Semester Final Exam Routine Published"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            {/* Category + Publisher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
                >
                  <option value="urgent">Urgent</option>
                  <option value="academic">Academic</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Publisher */}
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Publisher
                </label>

                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  placeholder="CR Office"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Notice Description
              </label>

              <textarea
                name="description"
                rows="6"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Write full details of the notice..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-all resize-none"
              />
            </div>

            {/* Publish Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-rose-500/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                "Publishing..."
              ) : (
                <>
                  <HiOutlinePlusCircle className="text-lg" />
                  Publish Notice
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}