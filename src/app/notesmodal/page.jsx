"use client";

import React, { useState } from "react";
import {
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineCheck,
} from "react-icons/hi";

const API_URL = "http://localhost:8000";

export default function EditNoticeForm({ notice }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: notice?.title || "",
    description: notice?.description || "",
    category: notice?.category || "general",
    publisher: notice?.publisher || "",
    group: notice?.group || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpen = () => {
    setFormData({
      title: notice?.title || "",
      description: notice?.description || "",
      category: notice?.category || "general",
      publisher: notice?.publisher || "",
      group: notice?.group || "",
    });

    setError("");
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;

    setIsOpen(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required!");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/notices/${notice._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            publisher: formData.publisher.trim(),
            group: formData.group,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update notice!"
        );
      }

      setIsOpen(false);

      // Reload page so updated notice appears immediately
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* EDIT BUTTON */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
        title="Edit"
      >
        <HiOutlinePencil className="text-lg" />
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* BACKDROP */}
          <div
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* MODAL BOX */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl">
            
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Edit Notice
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Update notice information
                </p>
              </div>

              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <HiOutlineX className="text-xl" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              {/* ERROR */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notice Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter notice title"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Write notice description..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* CATEGORY + GROUP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CATEGORY */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-blue-500"
                  >
                    <option value="general">
                      General
                    </option>

                    <option value="academic">
                      Academic
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </div>

                {/* GROUP */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Group
                  </label>

                  <input
                    type="text"
                    name="group"
                    value={formData.group}
                    onChange={handleChange}
                    placeholder="Example: All Students"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* PUBLISHER */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Publisher
                </label>

                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  placeholder="Example: CR Office"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck className="text-lg" />
                      Update Notice
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}