'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublishNoticePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'General', // General, Exam, Routine, Emergency
    group: 'All',        // All, Group A, Group B
    description: '',
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
      if (file.size > 15 * 1024 * 1024) {
        toast.error('File size must be less than 15MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const postData = {
        title: formData.title,
        category: formData.category,
        group: formData.group,
        description: formData.description,
        publishedBy: currentUser?.name || 'CR',
        publishedByEmail: currentUser?.email || '',
        createdAt: new Date(),
      };

      const res = await fetch('http://localhost:8000/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // যেহেতু ফাইল নেই, তাই JSON হেডার দিতে হবে
        },
        body: JSON.stringify(postData),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Notice published successfully!');
        setFormData({ title: '', category: 'General', group: 'All', description: '' });
      } else {
        toast.error(result.message || 'Failed to publish notice');
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
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-semibold">
            Notice Board Management
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Bell className="w-7 h-7 text-violet-400" />
          <span>Publish New Notice 📢</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Broadcast important updates, routines, and exam notices to students.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Notice Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-term Exam Routine 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>

          {/* Category + Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
              >
                <option value="General">General Notice</option>
                <option value="Exam">Exam Update</option>
                <option value="Routine">Class Routine</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Group *</label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
              >
                <option value="All">All Students</option>
                <option value="Group A">Group A Only</option>
                <option value="Group B">Group B Only</option>
              </select>
            </div>
          </div>

          {/* Notice Description / Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Notice Description / Details *</label>
            <textarea
              rows={4}
              required
              placeholder="Write full details of the notice here..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
            />
          </div>

          {/* Optional Attachment File (PDF or Image) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Attachment File (Optional PDF/Image)</label>
            
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 hover:border-violet-500/50 rounded-xl cursor-pointer bg-slate-950/50 transition-all group">
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-violet-400 mb-1 transition-colors" />
                <p className="text-xs text-slate-400">Click to attach notice file (PDF / Image)</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <FileText className="w-5 h-5 text-violet-400 shrink-0" />
                <span className="text-xs font-medium text-white truncate flex-1">{selectedFile.name}</span>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-rose-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Notice...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Publish Notice
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}