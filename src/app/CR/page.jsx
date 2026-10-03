"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";

const crs = [
  {
    name: "Tasfik",
    group: "Group B",
    whatsapp: "8801882002787",
    image: "/cr/ChatGPT Image Oct 3, 2026, 11_17_59 AM.png",
  },
  {
    name: "Ratul",
    group: "Group A",
    whatsapp: "8801610349009",
    image: "/cr/ChatGPT Image Oct 3, 2026, 11_19_47 AM.png",
  },
];

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-60 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40"
          >
            <div className="border-b border-slate-800 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Message a CR
              </p>
            </div>

            {crs.map((cr) => (
              <a
                key={cr.name}
                href={`https://wa.me/${cr.whatsapp}?text=Hi%20${cr.name}%2C%20I%20need%20help%20regarding%20CST%20HUB`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-800"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-700">
                  <Image
                    src={cr.image}
                    alt={cr.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white transition-colors group-hover:text-emerald-400">
                    {cr.name}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    {cr.group}
                  </p>
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close CR contacts" : "Open CR contacts"}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all ${
          open
            ? "bg-slate-700 shadow-slate-700/30"
            : "bg-emerald-500 shadow-emerald-500/40 hover:bg-emerald-400"
        }`}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6 animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}