import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { DocumentRequirement } from "@/lib/types";
import { getStoredToken } from "@/lib/apiClient";

export interface UploadedDoc {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}

interface Props {
  doc: DocumentRequirement;
  userId: string;
  applicationId: string;
  uploaded: UploadedDoc | null;
  onUploaded: (docName: string, doc: UploadedDoc) => void;
  onRemoved: (docName: string) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "application/pdf"];
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.pdf";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000/api/v1";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "done" }
  | { status: "error"; message: string };

export default function DocumentUpload({
  doc,
  userId,
  applicationId,
  uploaded,
  onUploaded,
  onRemoved,
}: Props) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = useCallback(
    async (file: File) => {
      const typeOk = ACCEPTED.includes(file.type);
      if (!typeOk) {
        setState({
          status: "error",
          message: "Only JPG, PNG, and PDF files are accepted.",
        });
        return;
      }
      if (file.size > MAX_SIZE) {
        setState({
          status: "error",
          message: "File too large. Maximum size is 10 MB.",
        });
        return;
      }

      setState({ status: "uploading", progress: 30 });

      try {
        // Upload via NestJS backend — POST /api/v1/documents/upload/:applicationId
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", doc.name);

        const token = getStoredToken();
        const response = await fetch(
          `${API_BASE_URL}/documents/upload/${applicationId}`,
          {
            method: "POST",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          },
        );

        setState({ status: "uploading", progress: 80 });

        if (!response.ok) {
          let errorMsg = "Upload failed. Please try again.";
          try {
            const errJson = await response.json();
            errorMsg = errJson.message || errorMsg;
          } catch {
            // use default
          }
          setState({ status: "error", message: errorMsg });
          return;
        }

        const result = await response.json();
        const filePath = result.fileKey || `${userId}/${applicationId}/${doc.name}-${Date.now()}`;

        onUploaded(doc.name, {
          fileName: file.name,
          filePath,
          fileSize: file.size,
          fileType: file.type,
        });
        setState({ status: "done" });
      } catch (err: any) {
        console.error("Document upload error:", err);
        setState({
          status: "error",
          message: err?.message || "Upload failed. Check your connection and try again.",
        });
      }
    },
    [doc.name, userId, applicationId, onUploaded],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    // Local removal only — the backend record remains but is superseded on re-upload
    onRemoved(doc.name);
    reset();
  };

  const isImage = uploaded?.fileType.startsWith("image/");

  return (
    <div className="group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {doc.label}
            {doc.required && <span className="text-red-500"> *</span>}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>
        </div>
        {uploaded && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0 ml-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
          </span>
        )}
      </div>

      {uploaded ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
          <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {isImage ? (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            ) : (
              <FileText className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-700 truncate">
              {uploaded.fileName}
            </p>
            <p className="text-xs text-slate-400">
              {formatSize(uploaded.fileSize)} ·{" "}
              {uploaded.fileType.includes("pdf") ? "PDF" : "Image"}
            </p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition shrink-0"
            title="Replace file"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXT}
            onChange={onChange}
            className="hidden"
          />

          {state.status === "uploading" ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div className="w-full max-w-[160px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(state.progress, 30)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Uploading...</p>
            </div>
          ) : state.status === "error" ? (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-xs text-red-600 font-medium">{state.message}</p>
              <p className="text-xs text-slate-400">Click to try again</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                <UploadCloud className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                <span className="text-blue-600">Click to upload</span> or drag
                &amp; drop
              </p>
              <p className="text-xs text-slate-400">
                JPG, PNG, or PDF &middot; max 10 MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
