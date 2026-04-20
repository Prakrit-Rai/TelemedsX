import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

import {
  Users,
  User,
  Stethoscope,
  Clock,
  BarChart3,
  UserCheck,
  Heart,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import {
  getStats,
  getPendingDoctors,
  approveDoctor,
  deleteUser,
} from "../api/admin";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);

  const loadData = async () => {
    const statsData = await getStats();
    const doctors = await getPendingDoctors();

    setStats(statsData);
    setPendingDoctors(doctors);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: number) => {
    await approveDoctor(id);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    loadData();
  };

  // 📊 Chart Data
  const chartData = [
    { name: "Patients", value: stats.patients || 0, color: "#4F46E5" },
    { name: "Doctors", value: stats.doctors || 0, color: "#06B6D4" },
    { name: "Total", value: stats.totalUsers || 0, color: "#8B5CF6" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Helper for initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* 🔴 GLOBAL STICKY HEADER (TelePharm) */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="font-bold text-lg tracking-tight">TelePharm Nepal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">System Online</span>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 font-semibold transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 🔵 DASHBOARD CONTENT */}
      <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        {/* 🌟 Dashboard Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <LayoutDashboard size={32} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl fon
              t-bold text-slate-900 flex items-center gap-2">
                Admin <span className="text-indigo-600">Dashboard</span>
              </h1>
              <p className="text-lg font-bold text-slate-600">
                Welcome back! Here's your complete overview of the platform's statistics, real-time analytics, and pending registrations.
              </p>
            </div>
          </div>
        </div>

        {/* 📊 STATS CARDS */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <Card className="p-6 bg-white shadow-md border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-violet-100 rounded-2xl">
                <Users className="text-violet-600" size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-5xl font-black text-slate-900">{stats.totalUsers || 0}</h2>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-2xl">
                <User className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-500 uppercase tracking-wider">Patients</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-5xl font-black text-slate-900">{stats.patients || 0}</h2>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-cyan-100 rounded-2xl">
                <Stethoscope className="text-cyan-600" size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-500 uppercase tracking-wider">Doctors</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-5xl font-black text-slate-900">{stats.doctors || 0}</h2>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-2xl">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-500 uppercase tracking-wider">Pending</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-5xl font-black text-slate-900">{pendingDoctors.length}</h2>
                  {pendingDoctors.length > 0 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full animate-pulse">Action Req</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* 📈 CHART SECTION */}
          <Card className="xl:col-span-2 p-8 bg-white shadow-lg border border-slate-200 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={24} className="text-indigo-500" />
                  System Analytics
                </h2>
                <p className="text-sm text-slate-600 font-semibold mt-1">Distribution of users across the platform</p>
              </div>
            </div>

            {/* Use inline style for height so the chart isn't empty when arbitrary classes fail */}
            <div style={{ height: '380px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                    dy={16}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                    dx={-16}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(226, 232, 240, 0.8)', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      fontWeight: 600
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 👨‍⚕️ PENDING APPROVALS SECTION */}
          <Card className="flex flex-col p-8 bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 border border-slate-200/50 rounded-3xl h-full max-h-[570px] overflow-hidden">
            <div className="mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserCheck size={24} className="text-emerald-500" />
                Pending Approvals
              </h2>
              <p className="text-sm text-slate-500 mt-1">Review and approve new doctors</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {pendingDoctors.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-70">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <UserCheck className="text-slate-400" size={32} />
                  </div>
                  <p className="text-slate-900 font-semibold mb-1">All caught up!</p>
                  <p className="text-slate-500 text-sm">No pending doctor registrations.</p>
                </div>
              ) : (
                pendingDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm">
                        {getInitials(doc.fullName || 'Doctor')}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{doc.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{doc.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(doc.id)}
                        className="flex-1 !bg-emerald-500 hover:!bg-emerald-600 !text-white font-semibold text-xs h-10 rounded-xl shadow-sm"
                      >
                        Approve
                      </Button>

                      <Button
                        onClick={() => handleDelete(doc.id)}
                        variant="outline"
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs h-10 rounded-xl shadow-sm"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {pendingDoctors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center shrink-0">
                <p className="text-xs font-medium text-slate-400">
                  Showing {pendingDoctors.length} {pendingDoctors.length === 1 ? 'request' : 'requests'}
                </p>
              </div>
            )}
          </Card>

        </div>
      </main>
    </div>
  );
}