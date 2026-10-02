'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Bell, 
  Users, 
  PlusCircle, 
  FileText, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CRDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({ notesCount: 0, noticesCount: 0, usersCount: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ইউজারের ডাটা লোকালস্টোরেজ বা সেশনস্টোরেজ থেকে চেক করা
    const user = JSON.parse(
      localStorage.getItem('currentUser') || 
      sessionStorage.getItem('currentUser') || 
      'null'
    );

    if (!user || user.role !== 'cr') {
      toast.error('Access denied! CR login required.');
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // ড্যাশবোর্ডের ডেটা ফেচ করা
    const fetchDashboardData = async () => {
      try {
        const [notesRes, noticesRes, usersRes] = await Promise.all([
          fetch('http://localhost:8000/notes'),
          fetch('http://localhost:8000/notices'),
          fetch('http://localhost:8000/users')
        ]);

        const notesData = await notesRes.json();
        const noticesData = await noticesRes.json();
        const usersData = await usersRes.json();

        setRecentNotes(Array.isArray(notesData) ? notesData.slice(0, 5) : []);
        setStats({
          notesCount: Array.isArray(notesData) ? notesData.length : 0,
          noticesCount: noticesData?.notices?.length || 0,
          usersCount: usersData?.allUsers?.length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-slate-950 px-4 py-6 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-6xl pt-6
       mx-auto space-y-6 sm:space-y-8">
        
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-xl"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                CR Control Center
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, {currentUser.name} 👋
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Manage your class notes, notices, and students efficiently from here.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
                Group: <span className="text-indigo-400 font-bold">{currentUser.group || 'All'}</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Notes Count */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400">Total Notes</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.notesCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Notices Count */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400">Total Notices</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.noticesCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Bell className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Students Count */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg"
          >
            <div>
              <p className="text-xs font-medium text-slate-400">Total Users</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.usersCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </motion.div>

        </div>

        {/* Quick Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/publish-note')}
              className="p-4 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Publish New Note</p>
                  <p className="text-xs text-slate-400">Upload PDF notes for students</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/publish-notice')}
              className="p-4 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Publish Notice</p>
                  <p className="text-xs text-slate-400">Broadcast updates and routines</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Uploads Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Uploaded Notes
            </h2>
            <button 
              onClick={() => router.push('/notes')} 
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentNotes.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-6">No notes uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div 
                  key={note._id} 
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{note.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{note.subject} • {note.semester}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold shrink-0">
                    {note.group || 'All'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}