'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Layers, Mail, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersTablePage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    // ব্যাকএন্ড থেকে ইউজার ডেটা ফেচ করা
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/students');
        const data = await res.json();

        if (data.success && Array.isArray(data.allUsers)) {
          setStudents(data.allUsers);
          setFilteredStudents(data.allUsers);
        } else {
          setStudents([]);
          setFilteredStudents([]);
          toast.error('No users found in database');
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        toast.error('Failed to connect to backend server!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // সার্চ এবং ফিল্টারিং লজিক
  useEffect(() => {
    let result = students;

    // গ্রুপ ফিল্টার
    if (selectedGroup !== 'All') {
      result = result.filter((student) => student.group === selectedGroup);
    }

    // রোল ফিল্টার
    if (selectedRole !== 'All') {
      result = result.filter((student) => student.role === selectedRole);
    }

    // সার্চ ফিল্টার (নাম, ইমেইল বা রোল দিয়ে)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.name?.toLowerCase().includes(term) ||
          student.email?.toLowerCase().includes(term) ||
          student.roll?.toString().includes(term)
      );
    }

    setFilteredStudents(result);
  }, [searchTerm, selectedGroup, selectedRole, students]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              Live Database Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              All Registered Students 👨‍🎓
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Showing total <span className="text-emerald-400 font-bold">{filteredStudents.length}</span> students from server.
            </p>
          </div>
        </motion.div>

        {/* Filters & Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg"
        >
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Group Filter */}
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="All">All Groups</option>
              <option value="Group A">Group A</option>
              <option value="Group B">Group B</option>
            </select>
            <Layers className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="All">All Roles</option>
              <option value="cr">CR Only</option>
              <option value="student">Student Only</option>
            </select>
            <Shield className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </motion.div>

        {/* Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-slate-400 text-xs">Loading students from database...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No students found!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Roll</th>
                    <th className="py-3.5 px-4">Group</th>
                    <th className="py-3.5 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm text-slate-300">
                  {filteredStudents.map((student, index) => (
                    <tr 
                      key={student._id || index} 
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase shrink-0">
                          {student.name ? student.name.charAt(0) : 'S'}
                        </div>
                        <span className="truncate">{student.name || 'N/A'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{student.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-300 font-semibold">
                        {student.roll || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          student.group === 'Group A' 
                            ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                            : student.group === 'Group B'
                            ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {student.group || 'All'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${
                          student.role === 'cr' 
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {student.role === 'cr' && <Shield className="w-3 h-3 text-amber-400" />}
                          {student.role || 'student'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}