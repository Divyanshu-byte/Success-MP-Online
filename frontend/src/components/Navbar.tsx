import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, LifeBuoy, LogOut, User, Check, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo, NotificationBell } from "@/features/success-management";

export default function Navbar() {
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const displayName = profile?.full_name || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleOpenModal = () => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setAddress(profile?.address || "");
    setMsg(null);
    setShowModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      address,
    });
    setSaving(false);
    if (error) {
      setMsg(`Error: ${error}`);
    } else {
      setMsg("Profile updated successfully!");
      setTimeout(() => setShowModal(false), 1200);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <BrandLogo isAdmin={isAdmin} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && <NotificationBell />}

            <a
              href="https://wa.me/919000000000"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition text-sm font-medium"
            >
              <LifeBuoy className="w-4 h-4" /> Support
            </a>

            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer text-left border border-slate-200/60"
              title="Click to view/edit profile"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                {initial}
              </div>
              <div className="hidden sm:block leading-tight max-w-[130px]">
                <p className="text-xs text-slate-900 font-bold truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </button>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">My Profile</h3>
                <p className="text-xs text-slate-500">
                  Update your contact details
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  placeholder="10-digit mobile"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                  placeholder="Enter full address"
                />
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-400">
                  Role:{" "}
                  <span className="font-bold text-slate-700 uppercase">
                    {profile?.role || "user"}
                  </span>
                </p>
              </div>

              {msg && (
                <p
                  className={`text-xs p-2.5 rounded-xl ${
                    msg.includes("Error")
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700 font-semibold"
                  }`}
                >
                  {msg}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-700/20"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
