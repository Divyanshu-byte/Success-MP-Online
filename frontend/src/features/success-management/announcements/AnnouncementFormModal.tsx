import React, { useState } from "react";
import { X, Megaphone, Send, Loader2, CheckCircle2 } from "lucide-react";
import { createAnnouncement } from "./announcements-api";

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("/#services");
  const [targetType, setTargetType] = useState("ALL");
  const [serviceId, setServiceId] = useState("");
  const [userId, setUserId] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please fill out both the title and message fields.");
      return;
    }

    setPublishing(true);
    setError(null);
    setResultMsg(null);

    try {
      const res = await createAnnouncement({
        title,
        message,
        actionUrl,
        targetType,
        serviceId: targetType === "SERVICE" ? serviceId : undefined,
        userId: targetType === "USER" ? userId : undefined,
        sendEmail,
      });

      setResultMsg(
        `Announcement published successfully to ${res.dispatchedCount} user(s).`,
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={publishing}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Create Smart Announcement
            </h3>
            <p className="text-xs text-slate-500">
              Broadcast updates & new feature announcements to citizens
            </p>
          </div>
        </div>

        {resultMsg ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900">{resultMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🎉 New Tracking Feature Available"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Enter detailed notification content for citizens..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none font-medium"
                >
                  <option value="ALL">All Registered Users</option>
                  <option value="SERVICE">Users of Specific Service</option>
                  <option value="USER">Specific User ID</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Action Link URL
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="/#my-applications"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none font-medium"
                />
              </div>
            </div>

            {targetType === "SERVICE" && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Service ID / Code
                </label>
                <input
                  type="text"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="e.g. pan_card"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none"
                />
              </div>
            )}

            {targetType === "USER" && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User UUID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-none font-mono"
                />
              </div>
            )}

            <div className="pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Send email notification along with in-app alert
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200">
                {error}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={publishing}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={publishing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Publish Announcement
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
