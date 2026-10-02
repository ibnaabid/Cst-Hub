'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload, FileText, X, CheckCircle2, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublishNotePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    group: 'All',
    semester: '4th Semester',
  });

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem('currentUser') || 
      sessionStorage.getItem('currentUser') || 
      'null'
    );
    if (!user || user.role !== 'cr') {
      toast.error('Access denied! CR only.');
      router.push('/login');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('description', formData.description);
      data.append('group', formData.group);
      data.append('semester', formData.semester);
      data.append('uploadedBy', currentUser?.name || 'CR');
      data.append('uploadedByEmail', currentUser?.email || '');
      data.append('file', selectedFile); // ব্যাকএন্ডে upload.single("file") এর সাথে ম্যাচ করা

      const res = await fetch('http://localhost:8000/notes', {
        method: 'POST',
        body: data, // FormData পাঠানোর সময় headers-এ 'Content-Type': 'application/json' দেওয়া যাবে না!
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Note published successfully!');
        setFormData({ title: '', subject: '', description: '', group: 'All', semester: '4th Semester' });
        setSelectedFile(null);
      } else {
        toast.error(result.message || 'Failed to publish');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      
      {/* ========== Welcome Section ========== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold">
            Notes Management
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Publish Study Notes 📚
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload PDF, notes and study materials for your class students.
        </p>
      </motion.div>

      {/* ========== Form Card ========== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Note Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. HTML & CSS Chapter 05"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Web Development"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Group + Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Group *</label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Groups</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Short description about this note..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Upload File * (PDF, DOC, PPT — Max 10MB)</label>
            
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all group">
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                <p className="text-sm text-slate-400 group-hover:text-slate-300">Click to upload file</p>
                <p className="text-[11px] text-slate-600 mt-1">PDF, DOC, DOCX, PPT, PPTX</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Publish Note
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}