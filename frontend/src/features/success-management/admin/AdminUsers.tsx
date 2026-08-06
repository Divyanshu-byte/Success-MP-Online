import React, { useEffect, useState } from "react";
import { Search, User as UserIcon, FileText, CheckCircle2, ShieldCheck, X, Loader2 } from "lucide-react";
import { fetchAdminUsers, fetchAdminUserById } from "./admin-api";
import { RegisteredUser, UserDetailProfile } from "../types";

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserDetailProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  const loadUsers = async (query?: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers(query);
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    loadUsers(q);
  };

  const handleOpenUser = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingProfile(true);
    setUserProfile(null);
    try {
      const profile = await fetchAdminUserById(userId);
      setUserProfile(profile);
    } catch (err) {
      console.error("Failed to load user profile", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            Registered Citizen Users Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search registered users, view profiles, and inspect application history
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 shadow-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading registered users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No registered users found matching "{search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Total Apps</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{u.fullName || "User"}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4 text-slate-600">{u.phone || "—"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === "SUPER_ADMIN" || u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {u.totalApplications}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenUser(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Drawer / Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 relative animate-in slide-in-from-right duration-200">
            <button
              onClick={() => setSelectedUserId(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingProfile || !userProfile ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-xs">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading user profile...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {(userProfile.fullName || userProfile.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {userProfile.fullName || "User Profile"}
                    </h3>
                    <p className="text-xs text-slate-500">{userProfile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 font-semibold block">Phone</span>
                    <span className="font-bold text-slate-900">{userProfile.phone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Role</span>
                    <span className="font-bold text-slate-900 uppercase">{userProfile.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">State</span>
                    <span className="font-bold text-slate-900">{userProfile.state || "Madhya Pradesh"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Completed Apps</span>
                    <span className="font-bold text-emerald-600">{userProfile.completedApplicationsCount}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-3">
                    Application History ({userProfile.applications?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {userProfile.applications?.length === 0 ? (
                      <p className="text-xs text-slate-400">No applications submitted yet.</p>
                    ) : (
                      userProfile.applications?.map((app: any) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-blue-700">
                              {app.applicationNo || app.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900">{app.service?.name}</p>
                          <p className="text-slate-400 text-[10px]">
                            Submitted on {new Date(app.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
