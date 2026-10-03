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
      // CR LOGIN (Hardcoded)
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
          cr.email.toLowerCase() === formData.email.trim().toLowerCase() &&
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

        window.dispatchEvent(new Event("userLogin"));

        setTimeout(() => {
          router.push("/cr-dashboard");
        }, 600);

        return;
      }

      // ==========================================
      // STUDENT LOGIN FROM BACKEND
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

      const loggedInUser = data.user;

      // Role check
      if (!loggedInUser.role || loggedInUser.role !== "student") {
        toast.error("You are not authorized to access the student dashboard.");
        return;
      }

      toast.success(`Welcome back, ${loggedInUser.name}!`);

      const userData = JSON.stringify(loggedInUser);

      if (formData.rememberMe) {
        localStorage.setItem("currentUser", userData);
        sessionStorage.removeItem("currentUser");
      } else {
        sessionStorage.setItem("currentUser", userData);
        localStorage.removeItem("currentUser");
      }

      window.dispatchEvent(new Event("userLogin"));

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 mb-4">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to CST HUB</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email / Roll */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">
              Email or Roll
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="email@example.com or roll number"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData({ ...formData, rememberMe: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
            />
            <label htmlFor="remember" className="text-xs text-slate-400">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link href="/Signup" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}