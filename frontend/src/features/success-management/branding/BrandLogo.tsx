import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface BrandLogoProps {
  variant?: "light" | "dark" | "compact";
  showTagline?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "light",
  showTagline = true,
  isAdmin = false,
  className = "",
}) => {
  const isDark = variant === "dark";
  const isCompact = variant === "compact";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`rounded-xl flex items-center justify-center font-bold shadow-md transition-transform duration-200 hover:scale-105 ${
          isCompact ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"
        } ${
          isDark
            ? "bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-700 text-white shadow-blue-500/20"
            : "bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white shadow-blue-600/25"
        }`}
      >
        <ShieldCheck className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-tight ${
              isCompact ? "text-sm" : "text-base sm:text-lg"
            } ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Success MP Online
          </span>

          {isAdmin && (
            <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" /> ADMIN
            </span>
          )}
        </div>

        {showTagline && !isCompact && (
          <p
            className={`text-[11px] font-medium tracking-wide ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Government Services Portal
          </p>
        )}
      </div>
    </div>
  );
};
