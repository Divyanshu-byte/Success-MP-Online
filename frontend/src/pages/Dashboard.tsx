import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Building2,
  Store,
  Factory,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Save,
  User as UserIcon,
  Copy,
  Check,
  Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { SERVICES } from "@/lib/services";
import { formatApplicationId, downloadReceipt } from "@/lib/receipt";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import { normalizeApplication, type Application } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  CreditCard,
  Building2,
  Store,
  Factory,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Flow all application requests through NestJS API backend
      const data = await apiRequest<any[]>("/applications");
      const fetched = (data || []).map(normalizeApplication);
      setApplications(fetched);
      
      // Populate initial admin notes
      const notesMap: Record<string, string> = {};
      fetched.forEach((app) => {
        notesMap[app.id] = app.admin_notes || "";
      });
      setAdminNotes(notesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, isAdmin]);

  const handleUpdateStatus = async (appId: string, newStatus: "pending" | "approved" | "rejected") => {
    setUpdatingId(appId);
    try {
      const notes = adminNotes[appId] || "";
      const nestStatus = newStatus === "approved" ? "APPROVED" : newStatus === "rejected" ? "REJECTED" : "UNDER_REVIEW";

      const data = await apiRequest<any>(`/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nestStatus,
          adminNotes: notes,
        }),
      });

      if (data) {
        const normalized = normalizeApplication(data);
        setApplications((prev) =>
          prev.map((item) => (item.id === appId ? normalized : item))
        );
        if (selectedApp?.id === appId) {
          setSelectedApp(normalized);
        }
      }
    } catch (err) {
      alert(`Error updating status: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    setUpdatingId(appId);
    try {
      const notes = adminNotes[appId] || "";
      const currentApp = applications.find((a) => a.id === appId);
      const currentStatus = currentApp?.status === "approved" ? "APPROVED" : currentApp?.status === "rejected" ? "REJECTED" : "UNDER_REVIEW";

      await apiRequest<any>(`/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: currentStatus,
          adminNotes: notes,
        }),
      });

      setApplications((prev) =>
        prev.map((item) =>
          item.id === appId ? { ...item, admin_notes: notes } : item
        )
      );
    } catch (err: any) {
      alert(`Failed to save notes: ${err.message || String(err)}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic for Admin view
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const applicantName =
      app.form_data?.applicant_name ||
      app.applicant_name ||
      app.profiles?.full_name ||
      "";
    const appEmail = app.profiles?.full_name || app.form_data?.email || "";
    const matchesSearch =
      searchQuery === "" ||
      formatApplicationId(app.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              )}
              <span className="text-xs font-semibold text-blue-100 tracking-wide">
                {isAdmin ? "Admin Management Console" : "Citizen Services Portal"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {isAdmin
                ? `Welcome back, ${profile?.full_name || user?.email?.split("@")[0] || "Admin"}`
                : "Welcome back"}
            </h1>
            <p className="text-blue-100/90 mt-2 max-w-3xl text-sm sm:text-base leading-relaxed">
              {isAdmin
                ? "Review and update all citizen applications, manage approval statuses, and append official staff notes."
                : "Choose a service below to start a new application. Your applications are processed securely and you'll receive a digital receipt instantly after payment."}
            </p>
          </div>
        </div>

        {/* ADMIN PANELS */}
        {isAdmin && (
          <div className="mb-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Applications
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {applications.length}
                </p>
              </div>
              <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 shadow-sm">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Pending Review
                </p>
                <p className="text-2xl font-extrabold text-amber-700 mt-1">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 shadow-sm">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Approved
                </p>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {approvedCount}
                </p>
              </div>
              <div className="bg-red-50/70 p-5 rounded-2xl border border-red-200/80 shadow-sm">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Rejected
                </p>
                <p className="text-2xl font-extrabold text-red-700 mt-1">
                  {rejectedCount}
                </p>
              </div>
            </div>

            {/* Admin Header & Search/Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  All System Applications
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage citizen service submissions across Madhya Pradesh
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, name..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                  <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                      statusFilter === "all"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                      statusFilter === "pending"
                        ? "bg-amber-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter("approved")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                      statusFilter === "approved"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setStatusFilter("rejected")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                      statusFilter === "rejected"
                        ? "bg-red-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Applications List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading applications...
                </div>
              ) : error ? (
                <div className="p-12 text-center text-red-600 text-sm">
                  Error loading applications: {error}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  No applications match your current search/filter.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => {
                    const isUpdating = updatingId === app.id;
                    const applicant =
                      app.form_data?.applicant_name ||
                      app.applicant_name ||
                      app.profiles?.full_name ||
                      "Applicant";
                    const serviceConfig = SERVICES.find(
                      (s) => s.id === app.service_type
                    );

                    return (
                      <div
                        key={app.id}
                        className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {formatApplicationId(app.id)}
                            </span>
                            <span className="font-semibold text-slate-900 text-sm">
                              {serviceConfig?.name || app.service_type}
                            </span>
                            <StatusBadge status={app.status} />
                          </div>

                          <div className="text-xs text-slate-500 flex items-center gap-3 pt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                              {applicant}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(app.created_at).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                            {app.form_data?.amount && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-slate-800">
                                  &#8377;{app.form_data.amount}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Admin Notes Box */}
                          <div className="mt-3 pt-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={adminNotes[app.id] ?? ""}
                                onChange={(e) =>
                                  setAdminNotes((prev) => ({
                                    ...prev,
                                    [app.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add admin internal note / remarks..."
                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600"
                              />
                              <button
                                onClick={() => handleSaveNotes(app.id)}
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                                title="Save Note"
                              >
                                <Save className="w-3.5 h-3.5" /> Save
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Status Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <button
                            onClick={() => handleUpdateStatus(app.id, "approved")}
                            disabled={isUpdating || app.status === "approved"}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              app.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 opacity-60 cursor-default"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(app.id, "rejected")}
                            disabled={isUpdating || app.status === "rejected"}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              app.status === "rejected"
                                ? "bg-red-100 text-red-800 opacity-60 cursor-default"
                                : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            Reject
                          </button>

                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="View Full Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service cards for citizens */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available Services
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select a service to begin your application
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SERVICES.map((svc) => {
            const Icon = ICONS[svc.icon] ?? CreditCard;
            return (
              <button
                key={svc.id}
                onClick={() => navigate(`/service/${svc.id}`)}
                className="group relative text-left bg-white rounded-3xl border border-slate-200/80 p-6 hover:shadow-xl hover:shadow-slate-300/40 hover:-translate-y-1 hover:border-transparent transition-all duration-300 ease-out flex flex-col overflow-hidden"
              >
                {/* Decorative circle in top-right corner */}
                <div
                  className={`absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br ${svc.accent} opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none z-0`}
                />

                {/* Compact icon in top-left corner */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br ${svc.accent} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-all duration-300 shrink-0`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Service Name & Content */}
                <h3 className="relative z-10 font-bold text-slate-900 text-lg leading-snug">
                  {svc.name}
                </h3>
                <p className="relative z-10 text-xs text-slate-400 mt-1 mb-3 font-semibold uppercase tracking-wider">
                  {svc.tagline}
                </p>
                <p className="relative z-10 text-sm text-slate-600 leading-relaxed flex-1">
                  {svc.description}
                </p>

                {/* Card Footer */}
                <div className="relative z-10 mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-medium">Fee</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      &#8377;{svc.fee}
                    </span>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${svc.accent} bg-clip-text text-transparent group-hover:gap-2.5 transition-all`}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Recent applications */}
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          {isAdmin ? "My Submitted Applications" : "Recent Applications"}
        </h2>
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              No applications found. Choose a service above to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => {
                const svc = SERVICES.find((s) => s.id === app.service_type);
                const applicantName =
                  app.form_data?.applicant_name ||
                  app.applicant_name ||
                  profile?.full_name ||
                  "Applicant";
                const amount = app.form_data?.amount || svc?.fee || 0;
                const paymentStatus = app.form_data?.payment_status || "paid";

                return (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-xs">
                          {formatApplicationId(app.application_no || app.id)}
                        </span>
                        <button
                          onClick={() => {
                            const appNo = formatApplicationId(app.application_no || app.id);
                            navigator.clipboard.writeText(appNo);
                            setCopiedId(app.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="p-1 hover:bg-slate-200/80 rounded text-slate-400 hover:text-slate-600 transition"
                          title="Copy Application ID"
                        >
                          {copiedId === app.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {svc?.name || app.service_type} · {applicantName}
                      </p>
                      {app.admin_notes && (
                        <p className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                          Note: {app.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                      <span className="text-sm text-slate-700 font-medium">
                        &#8377;{Number(amount).toLocaleString("en-IN")}
                      </span>
                      <StatusBadge status={app.status} payment={paymentStatus} />
                      <button
                        onClick={() => downloadReceipt(app)}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Application {formatApplicationId(selectedApp.id)}
                </h3>
                <p className="text-xs text-slate-500">
                  Service: {SERVICES.find((s) => s.id === selectedApp.service_type)?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <StatusBadge status={selectedApp.status} />
                </div>
                <div>
                  <span className="text-slate-400 block">Submitted At</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedApp.created_at).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Form Details
                </h4>
                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                  {Object.entries(selectedApp.form_data || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200/50 pb-1 last:border-0">
                      <span className="text-slate-500 font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-slate-900 font-semibold max-w-[200px] truncate">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApp.admin_notes && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
                    Admin Notes
                  </h4>
                  <p className="text-xs bg-blue-50 text-blue-900 p-3 rounded-xl border border-blue-100">
                    {selectedApp.admin_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <WhatsAppWidget />
    </div>
  );
}

function StatusBadge({
  status,
  payment,
}: {
  status: string;
  payment?: string;
}) {
  if (payment && payment !== "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
        <Clock className="w-3 h-3" /> Payment due
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
      {status}
    </span>
  );
}
