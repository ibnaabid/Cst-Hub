"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ==========================================
      // CR LOGIN
      // ==========================================

      const CR_ACCOUNTS = [
        {
          name: "Tasfik",
          email: "tasfik@csthub.com",
          password: "tasfik123",
          role: "cr",
          group: "Group B",
        },
        {
          name: "Ratul",
          email: "ratul@csthub.com",
          password: "ratul123",
          role: "cr",
          group: "Group A",
        },
      ];

      const isCR = CR_ACCOUNTS.find(
        (cr) =>
          cr.email.toLowerCase() ===
            formData.email.trim().toLowerCase() &&
          cr.password === formData.password
      );

      if (isCR) {
        toast.success(`Welcome CR ${isCR.name}!`);

        const userData = JSON.stringify(isCR);

        if (formData.rememberMe) {
          localStorage.setItem("currentUser", userData);
          sessionStorage.removeItem("currentUser");
        } else {
          sessionStorage.setItem("currentUser", userData);
          localStorage.removeItem("currentUser");
        }

        // Navbar-কে সাথে সাথে জানিয়ে দেওয়া
        window.dispatchEvent(new Event("userLogin"));

        setTimeout(() => {
          router.push("/cr-dashboard");
        }, 600);

        return;
      }

      // ==========================================
      // STUDENT LOGIN FROM MONGODB
      // ==========================================

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          emailOrRoll: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid login information!");
        return;
      }

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================

      const loggedInUser = data.user;

      toast.success(`Welcome back, ${loggedInUser.name}!`);

      const userData = JSON.stringify(loggedInUser);

      // Remember me অনুযায়ী user save
      if (formData.rememberMe) {
        localStorage.setItem("currentUser", userData);
        sessionStorage.removeItem("currentUser");
      } else {
        sessionStorage.setItem("currentUser", userData);
        localStorage.removeItem("currentUser");
      }

      // Navbar immediately update হবে
      window.dispatchEvent(new Event("userLogin"));

      // Dashboard এ নিয়ে যাবে
      setTimeout(() => {
        router.push("/Student-dashboard");
      }, 600);
    } catch (error) {
      console.error("Login error:", error);

      toast.error("Server connection failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 mb-6 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
            </Link>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm text-slate-400 mt-1.5">
              Sign in to continue to{" "}
              <span className="text-indigo-400 font-medium">
                CST HUB
              </span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Full Name
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email / Roll */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Email or Roll Number
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  type="text"
                  required
                  placeholder="name@example.com or Roll"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 ml-1">
                  Password
                </label>

                <Link
                  href="/Signup"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Account?
                </Link>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rememberMe: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />

                <span className="text-xs text-slate-400 select-none">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>

            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-500">
                New to CST HUB?
              </span>
            </div>
          </div>

          {/* Signup */}
          <Link
            href="/Signup"
            className="w-full py-3.5 rounded-2xl border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Create an account
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 CST HUB · Dinajpur Polytechnic Institute
        </p>
      </motion.div>
    </div>
  );
}