import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface WelcomeBannerProps {
  customerName?: string;
  onExplore?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  customerName = "Valued Citizen",
  onExplore,
}) => {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl border border-blue-800/40">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Welcome to Success MP Online
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {customerName}! 🎉
          </h2>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
            Your single portal to apply for PAN Card, Gumasta License, MSME Registration & track your document status securely online.
          </p>
        </div>

        {onExplore && (
          <button
            onClick={onExplore}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
          >
            Explore Services <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
