import React, { useState } from "react";
import { X, Upload, FileText, Send, Loader2, AlertTriangle } from "lucide-react";
import { deliverDocument } from "./document-delivery-api";
import { DeliveryResultModal } from "./DeliveryResultModal";
import { DeliveryResult } from "../types";

interface DeliverDocumentModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: DeliveryResult) => void;
}

export const DeliverDocumentModal: React.FC<DeliverDocumentModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [delivering, setDelivering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(false);
  const [result, setResult] = useState<DeliveryResult | null>(null);

  if (!isOpen || !application) return null;

  const isAlreadyCompleted = application.status?.toLowerCase() === "completed";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files (.pdf) are allowed.");
        setFile(null);
        return;
      }
      if (selected.size > 15 * 1024 * 1024) {
        setError("File size exceeds the maximum limit of 15MB.");
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF document to upload.");
      return;
    }

    setDelivering(true);
    setError(null);

    try {
      const res = await deliverDocument(application.id, file, overwrite);
      setResult(res);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setDelivering(false);
    }
  };

  if (result) {
    return (
      <DeliveryResultModal
        result={result}
        onClose={() => {
          setResult(null);
          onClose();
        }}
      />
    );
  }

  const applicantName =
    application.form_data?.applicant_name ||
    application.form_data?.fullName ||
    application.applicant_name ||
    application.profiles?.full_name ||
    application.user?.profile?.fullName ||
    "Customer";

  const serviceName = application.service?.name || application.service_name || "Service";
  const appNo = application.application_no || application.applicationNo || application.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={delivering}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Deliver Final Document
            </h3>
            <p className="text-xs text-slate-500">
              Automated 1-click notification & delivery system
            </p>
          </div>
        </div>

        {/* Application details badge */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Service:</span>
            <span className="font-bold text-slate-900">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Customer:</span>
            <span className="font-bold text-slate-900">{applicantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Application ID:</span>
            <span className="font-mono font-bold text-blue-700">{appNo}</span>
          </div>
        </div>

        {isAlreadyCompleted && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application already completed!</p>
              <label className="inline-flex items-center gap-1.5 mt-1 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Confirm overwrite and re-deliver document
              </label>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Final PDF Document
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-500 transition bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="final-pdf-upload"
              />
              <label
                htmlFor="final-pdf-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {file ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                    <span className="text-slate-400 font-normal">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Click to choose PDF file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF format up to 15MB allowed
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={delivering}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={delivering || !file || (isAlreadyCompleted && !overwrite)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 disabled:opacity-50 transition"
            >
              {delivering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Delivering...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> 🚀 Deliver Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
