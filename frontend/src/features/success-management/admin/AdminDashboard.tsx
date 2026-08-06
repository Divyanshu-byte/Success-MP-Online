import React, { useEffect, useState } from "react";
import { Users, FileText, Clock, CheckCircle2, DollarSign, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { fetchAdminStats } from "./admin-api";
import { AdminDashboardStats } from "../types";
import { BrandLogo } from "../branding/BrandLogo";

interface AdminDashboardProps {
  onDeliverClick?: (app: any) => void;
  onViewUserClick?: (userId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onDeliverClick,
  onViewUserClick,
}) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Loading Admin Dashboard statistics...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 bg-red-50 rounded-3xl border border-red-200 text-center">
        <p className="text-xs text-red-600 font-bold">Error: {error}</p>
        <button
          onClick={loadStats}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <BrandLogo variant="dark" isAdmin={true} />
          <h2 className="text-xl sm:text-2xl font-extrabold mt-3">
            Executive Admin Control Console
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time citizen application tracking, single-click PDF document delivery, and smart notification monitoring across Madhya Pradesh.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-700 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Registered Users
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {stats?.totalUsers || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Applications
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {stats?.totalApplications || 0}
          </p>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/70 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 w-fit mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Pending Submissions
          </p>
          <p className="text-2xl font-black text-amber-800 mt-1">
            {stats?.pendingCount || 0}
          </p>
        </div>

        <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-200/70 shadow-sm">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 w-fit mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
            Under Processing
          </p>
          <p className="text-2xl font-black text-sky-800 mt-1">
            {stats?.processingCount || 0}
          </p>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/70 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 w-fit mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Completed / Delivered
          </p>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {stats?.completedCount || 0}
          </p>
        </div>
      </div>

      {/* Service-wise statistics */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          Service-wise Application Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats?.serviceWiseStats?.map((st) => (
            <div
              key={st.serviceId}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{st.serviceName}</p>
                <p className="text-[10px] text-slate-400 font-mono">{st.serviceCode}</p>
              </div>
              <span className="text-lg font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                {st.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Row: Recent Submissions & Recent Completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Submitted */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Recently Submitted Applications
          </h3>
          <div className="divide-y divide-slate-100">
            {stats?.recentlySubmitted?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No recent submissions.
              </p>
            ) : (
              stats?.recentlySubmitted?.map((app: any) => {
                const name =
                  app.user?.profile?.fullName || app.form_data?.applicant_name || "Applicant";
                return (
                  <div
                    key={app.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-700">
                        {app.applicationNo || app.id}
                      </span>
                      <p className="font-semibold text-slate-900">{name}</p>
                      <p className="text-[10px] text-slate-400">
                        {app.service?.name || "Service"}
                      </p>
                    </div>
                    {onDeliverClick && app.status !== "COMPLETED" && (
                      <button
                        onClick={() => onDeliverClick(app)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition"
                      >
                        🚀 Deliver
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recently Completed Deliveries */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Recently Delivered Documents
          </h3>
          <div className="divide-y divide-slate-100">
            {stats?.recentlyCompleted?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No completed deliveries yet.
              </p>
            ) : (
              stats?.recentlyCompleted?.map((app: any) => {
                const name =
                  app.user?.profile?.fullName || app.form_data?.applicant_name || "Applicant";
                return (
                  <div
                    key={app.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700">
                          {app.applicationNo || app.id}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          COMPLETED
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">{name}</p>
                      <p className="text-[10px] text-slate-400">
                        {app.service?.name || "Service"}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(app.updatedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
