import React from "react";
import { CheckCircle2, Clock, FileCheck, Send, Check } from "lucide-react";

interface ApplicationTimelineProps {
  status: string;
  createdAt: string;
  completedAt?: string | null;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  status,
  createdAt,
  completedAt,
}) => {
  const isCompleted = status.toLowerCase() === "completed" || status.toLowerCase() === "approved";
  const isRejected = status.toLowerCase() === "rejected";

  const formattedCreated = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedCompleted = completedAt
    ? new Date(completedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const steps = [
    { title: "Application Submitted", done: true, date: formattedCreated, icon: Send },
    { title: "Documents Verified", done: true, date: formattedCreated, icon: FileCheck },
    { title: "Application Processing", done: true, date: "In Progress", icon: Clock },
    {
      title: "Document Received",
      done: isCompleted,
      date: isCompleted ? "Received from Authority" : "Awaiting Document",
      icon: CheckCircle2,
    },
    {
      title: "Completed / Delivered",
      done: isCompleted,
      date: formattedCompleted || (isRejected ? "Rejected" : "Pending Final Delivery"),
      icon: Check,
      isFinal: true,
    },
  ];

  return (
    <div className="py-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Application Progress Timeline
      </h4>
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.done;
          return (
            <div key={idx} className="relative flex items-start gap-3 group">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  isDone
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-bold ${
                    isDone ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">{step.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
