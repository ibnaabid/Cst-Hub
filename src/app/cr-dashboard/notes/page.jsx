"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowLeft,
  HiOutlineBookOpen,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
} from "react-icons/hi";

const API_URL = "http://localhost:8000";

export default function AddNotePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    group: "All",
    semester: "4th Semester",
    uploadedBy: "CR",
    uploadedByEmail: "",
  });

  // =========================
  // Input Change
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // PDF Select
  // =========================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Only PDF
    if (file.type !== "application/pdf") {
      setError("শুধু PDF file upload করতে পারবে!");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    // 60 MB
    if (file.size > 60 * 1024 * 1024) {
      setError("PDF file 60MB-এর বেশি হতে পারবে না!");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Note title দাও!");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Subject দাও!");
      return;
    }

    if (!selectedFile) {
      setError("একটি PDF file select করো!");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // FormData তৈরি
      // =========================

      const data = new FormData();

      data.append("title", formData.title.trim());

      data.append("subject", formData.subject.trim());

      data.append(
        "description",
        formData.description.trim()
      );

      data.append("group", formData.group);

      data.append("semester", formData.semester);

      data.append(
        "uploadedBy",
        formData.uploadedBy
      );

      data.append(
        "uploadedByEmail",
        formData.uploadedByEmail
      );

      // IMPORTANT
      // Backend-এ upload.single("file")
      // তাই এখানেও অবশ্যই "file"
      data.append("file", selectedFile);

      // =========================
      // Backend Request
      // =========================

      const res = await fetch(
        `${API_URL}/notes`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();

      console.log("Backend response:", result);

      if (!res.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to publish note."
        );
      }

      // =========================
      // Success
      // =========================

      setSuccess(
        "✅ PDF successfully published!"
      );

      // Form reset
      setFormData({
        title: "",
        subject: "",
        description: "",
        group: "All",
        semester: "4th Semester",
        uploadedBy: "CR",
        uploadedByEmail: "",
      });

      setSelectedFile(null);

      // File input reset
      const fileInput =
        document.getElementById("pdfFile");

      if (fileInput) {
        fileInput.value = "";
      }

      // 1 second পরে notes page
      setTimeout(() => {
        router.push("/cr-dashboard/notes");
      }, 1000);

    } catch (err) {
      console.error("Publish note error:", err);

      setError(
        err.message ||
          "Something went wrong!"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8">

      <div className="max-w-3xl mx-auto space-y-6">

        {/* =========================
            Back Button
        ========================== */}

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-all text-sm font-medium"
        >
          <HiOutlineArrowLeft className="text-lg" />

          Back
        </button>


        {/* =========================
            Main Card
        ========================== */}

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">

          {/* Header */}

          <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">

            <span className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">

              <HiOutlineBookOpen className="text-2xl" />

            </span>

            <div>

              <h1 className="text-2xl font-bold text-slate-100">
                Upload New Study Note
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Upload a PDF directly for the class
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


          {/* =========================
              Form
          ========================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Title */}

            <div>

              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Note Title
              </label>

              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Data Structure Chapter 1 Note"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />

            </div>


            {/* Subject + Group */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Subject */}

              <div>

                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Data Structure"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />

              </div>


              {/* Group */}

              <div>

                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Group
                </label>

                <select
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                >

                  <option value="All">
                    All Groups
                  </option>

                  <option value="Group A">
                    Group A
                  </option>

                  <option value="Group B">
                    Group B
                  </option>

                </select>

              </div>

            </div>


            {/* Semester */}

            <div>

              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Semester
              </label>

              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
              >

                <option value="1st Semester">
                  1st Semester
                </option>

                <option value="2nd Semester">
                  2nd Semester
                </option>

                <option value="3rd Semester">
                  3rd Semester
                </option>

                <option value="4th Semester">
                  4th Semester
                </option>

                <option value="5th Semester">
                  5th Semester
                </option>

                <option value="6th Semester">
                  6th Semester
                </option>

                <option value="7th Semester">
                  7th Semester
                </option>

                <option value="8th Semester">
                  8th Semester
                </option>

              </select>

            </div>


            {/* Description */}

            <div>

              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Description / Details
              </label>

              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write short details about the note..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />

            </div>


            {/* =========================
                PDF Upload
            ========================== */}

            <div>

              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                PDF File
              </label>

              <label
                htmlFor="pdfFile"
                className="block cursor-pointer"
              >

                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all">

                  <HiOutlineDocumentText className="text-5xl text-indigo-400 mx-auto mb-3" />

                  {!selectedFile ? (
                    <>
                      <p className="text-sm font-medium text-slate-200">
                        Click to select PDF
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        Only PDF • Maximum 60MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-emerald-400 break-all">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        PDF selected successfully
                      </p>
                    </>
                  )}

                </div>

                <input
                  id="pdfFile"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </label>

            </div>


            {/* =========================
                Publish
            ========================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-indigo-500/25 transition-all text-sm flex items-center justify-center gap-2"
            >

              {loading ? (
                "Uploading PDF..."
              ) : (
                <>
                  <HiOutlinePlusCircle className="text-lg" />

                  Publish Note
                </>
              )}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
}