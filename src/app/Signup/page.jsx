'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, User, Mail, Lock, Users, ArrowRight, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage({ onNavigate }) {
    const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    group: 'Group A',
    roll: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your signup logic here
    console.log('Signup Data:', formData);
    toast.success('Account created successfully! Please log in.');
    router.push('/Login'); // Redirect to login page after successful signup
    
    if (onNavigate) onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center selection:bg-indigo-500 selection:text-white lg:py-12">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-12 bg-slate-900 border border-slate-800 lg:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Section: Branding & Highlights (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Top Logo */}
          <div className="relative z-10">
            <div 
              onClick={() => onNavigate && onNavigate('landing')} 
              className="inline-flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">CST HUB</span>
                <span className="block text-[10px] text-indigo-400 font-semibold -mt-1 tracking-wider uppercase">Dinajpur Polytechnic</span>
              </div>
            </div>
          </div>

          {/* Middle Content */}
          <div className="relative z-10 my-10 space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
                Student Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Join the ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">CST Ecosystem</span>.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect with your classmates, access verified notes, routines, and stay updated with everything happening in the department.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {[
                { title: "Instant Access to Notes & Routines", desc: "Never miss an update from Group A or Group B." },
                { title: "Collaborative Student Network", desc: "Build tech skills together with peers and seniors." },
                { title: "Secure & Verified Profile", desc: "Tailored specifically for diploma engineering students." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 pt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-between">
            <span>© 2026 CST Hub DPI</span>
            <span className="text-indigo-400 font-medium">Made by Students</span>
          </div>
        </div>

        {/* Right Section: Sign Up Form (7 Cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-slate-900">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create an Account</h2>
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/login" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('login'); }} className="text-indigo-400 font-semibold hover:underline">
                  Log in here
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Md Ibna Abid"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Group & Roll Number Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Select Group</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <select 
                      value={formData.group}
                      onChange={(e) => setFormData({...formData, group: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Group A">Group A</option>
                      <option value="Group B">Group B</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Class Roll / ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      placeholder="e.g. 654321"
                      value={formData.roll}
                      onChange={(e) => setFormData({...formData, roll: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
<div className="text-[11px] text-slate-500 text-center leading-relaxed">
    Go to login page? <Link href="/Login" className="text-indigo-400 font-semibold hover:underline">Login</Link>
</div>

              </div>


              {/* Submit Button */}
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

            </form>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              By signing up, you agree to follow the community guidelines of Dinajpur Polytechnic Institute CST Department.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}