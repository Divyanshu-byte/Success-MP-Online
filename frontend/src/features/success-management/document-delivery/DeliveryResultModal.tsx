import React from "react";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { DeliveryResult } from "../types";

interface DeliveryResultModalProps {
  result: DeliveryResult;
  onClose: () => void;
}

export const DeliveryResultModal: React.FC<DeliveryResultModalProps> = ({
  result,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="font-extrabold text-slate-900 text-xl mb-1">
          Document Delivered Successfully
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Application ID: <span className="font-mono font-bold text-blue-700">{result.applicationNo}</span>
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-3 mb-6 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700">Document Uploaded</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Successful
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700">Application Status</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700">In-App Notification</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Created
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-slate-200/60 pt-2">
            <span className="font-medium text-slate-700">Email Notification</span>
            {result.emailSent ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sent
              </span>
            ) : (
              <span className="text-amber-600 font-bold flex items-center gap-1 shrink-0 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" /> Failed
              </span>
            )}
          </div>

          {result.emailError && !result.emailSent && (
            <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 font-mono">
              Email details: {result.emailError}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md shadow-slate-900/20"
        >
          Done
        </button>
      </div>
    </div>
  );
};
