"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Sparkles,
  Loader2,
  Send,
  RotateCcw,
  Bot,
} from "lucide-react";
import { AiFillRobot } from "react-icons/ai";

export default function AskWithImage() {
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // OPEN / CLOSE
  // =========================

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const closePopup = () => {
    if (loading) return;
    setOpen(false);
  };

  // =========================
  // IMAGE SELECT
  // =========================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setAnswer("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(file);

    setImage(file);
    setPreview(imageUrl);
  };

  // =========================
  // REMOVE IMAGE
  // =========================

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setAnswer("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================
  // ASK GEMINI
  // =========================

  const handleAskGemini = async () => {
    if (!image) {
      setError("First upload an image.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const formData = new FormData();

      formData.append("image", image);

      formData.append(
        "question",
        question.trim() || "এই ছবিটা সহজভাবে বুঝিয়ে দাও।"
      );

      const response = await fetch(
        "http://localhost:8000/api/ai/explain-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

   if (!response.ok) {
  if (response.status === 429) {
    throw new Error(
      "Gemini Free Tier-এর daily limit শেষ হয়েছে। Limit reset হলে আবার test করতে পারবে."
    );
  }

  throw new Error(
    data.message || "Failed to analyze image."
  );
}

      if (!data.answer) {
        throw new Error(
          "Gemini did not return an answer."
        );
      }

      setAnswer(data.answer);
    } catch (error) {
      console.error("Gemini Error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET
  // =========================

  const handleReset = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setQuestion("");
    setAnswer("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    // bottom-24 = WhatsApp button-এর উপরে থাকবে
    <div className="fixed pt-10 mt-12 bottom-24 right-6 z-[9998] flex flex-col items-end">
      {/* ================= AI POPUP ================= */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.92,
            }}
            transition={{
              duration: 0.25,
            }}
            className="mb-3 w-[340px] mt-12 overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950 shadow-2xl shadow-purple-950/40 sm:w-[380px]"
          >
            {/* ================= HEADER ================= */}

            <div className="flex  items-center justify-between border-b border-slate-800 bg-purple-600/10 px-4 py-3">
              <div className="flex  items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Ask with Image
                  </h3>

                  <p className="text-[10px] text-slate-500">
                    CST HUB AI Assistant
                  </p>
                </div>
              </div>

              <button
                onClick={closePopup}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* ================= BODY ================= */}

            <div className="max-h-[75vh] overflow-y-auto p-4">
              {/* ================= IMAGE ================= */}

              {!preview ? (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 px-4 py-7 transition hover:border-purple-500 hover:bg-purple-500/10"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/15 text-purple-400">
                    <Upload size={22} />
                  </div>

                  <p className="text-sm font-semibold text-white">
                    Upload Image
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Math • Code • Diagram • Notes
                  </p>
                </button>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <img
                    src={preview}
                    alt="Selected study"
                    className="max-h-[220px] w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* ================= QUESTION ================= */}

              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="এই ছবিটা সম্পর্কে কিছু জিজ্ঞেস করো..."
                rows={3}
                className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
              />

              {/* ================= QUICK QUESTIONS ================= */}

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "এই ছবিটা সহজভাবে বুঝিয়ে দাও।"
                    )
                  }
                  className="rounded-full border border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 transition hover:border-purple-500 hover:text-purple-400"
                >
                  সহজভাবে বুঝাও
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "এই math problem টি step by step solve করো।"
                    )
                  }
                  className="rounded-full border border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 transition hover:border-purple-500 hover:text-purple-400"
                >
                  Solve করো
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "এই code-এর error কোথায় এবং কীভাবে fix করব?"
                    )
                  }
                  className="rounded-full border border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 transition hover:border-purple-500 hover:text-purple-400"
                >
                  Code Error
                </button>
              </div>

              {/* ================= ERROR ================= */}

              {error && (
                <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-400">
                  {error}
                </div>
              )}

              {/* ================= ASK BUTTON ================= */}

              <button
                type="button"
                onClick={handleAskGemini}
                disabled={!image || loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Gemini is thinking...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />

                    Ask Gemini

                    <Send size={15} />
                  </>
                )}
              </button>

              {/* ================= ANSWER ================= */}

              {answer && (
                <div className="mt-4 overflow-hidden rounded-xl border border-purple-500/20 bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white">
                        <Bot size={14} />
                      </div>

                      <span className="text-xs font-semibold text-white">
                        Gemini AI
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-slate-500 transition hover:bg-slate-800 hover:text-white"
                    >
                      <RotateCcw size={12} />

                      Reset
                    </button>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto p-3">
                    <div className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
                      {answer}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================= FOOTER ================= */}

            <div className="border-t border-slate-800 px-4 py-2 text-center">
              <p className="text-[9px] text-slate-600">
                ✨ Powered by Gemini • CST HUB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FLOATING AI BUTTON ================= */}

      <motion.button
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.94,
        }}
        onClick={toggleOpen}
        aria-label={
          open ? "Close AI Assistant" : "Ask with Image"
        }
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all ${
          open
            ? "bg-slate-700 shadow-slate-700/40"
            : "bg-purple-600 shadow-purple-600/50 hover:bg-purple-500"
        }`}
      >
        {!open && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-purple-500 opacity-20" />
        )}

        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <AiFillRobot className="h-7 w-7 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}