import React from "react";
import { CheckCircle2, Clock, MapPin, Tag, User, ShieldCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";

const getStepIcon = (action = "") => {
  const act = action.toLowerCase();
  if (act.includes("listed") || act.includes("added")) return "🌱";
  if (act.includes("verified")) return "📋";
  if (act.includes("auction started") || act.includes("bidding")) return "⚖";
  if (act.includes("winning bid") || act.includes("won")) return "🏆";
  if (act.includes("dealer")) return "🤝";
  if (act.includes("sent") || act.includes("dispatched")) return "📦";
  if (act.includes("retailer")) return "🏪";
  if (act.includes("customer")) return "🛒";
  if (act.includes("completed")) return "✅";
  return "📍";
};

function JourneyTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 text-center text-gray-500">
        No crop movement events logged yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-5 md:p-6">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-bold text-gray-800">Complete Crop Journey</h3>
          <p className="text-xs text-gray-500">Farm-to-Customer Immutable Lifecycle Log</p>
        </div>
      </div>

      <div className="relative pl-6 md:pl-8 border-l-2 border-emerald-200 space-y-6">
        {history.map((step, idx) => {
          const dateObj = step.created_at ? new Date(step.created_at) : null;
          const formattedDate = dateObj ? dateObj.toLocaleDateString() : "N/A";
          const formattedTime = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
          const icon = getStepIcon(step.action);

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[39px] top-0 w-8 h-8 md:w-9 md:h-9 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-sm shadow-xs group-hover:scale-110 transition-transform">
                <span>{icon}</span>
              </div>

              <div className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-2xl p-4 transition-all shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2 mb-3">
                  <span className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-1.5">
                    {step.action}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {step.status && <StatusBadge status={step.status} />}
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {formattedDate} {formattedTime !== "N/A" ? `• ${formattedTime}` : ""}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>User:</strong> {step.performed_by || "System"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Role:</strong> {step.role || "N/A"}</span>
                  </div>

                  {step.location && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Location:</strong> {step.location}</span>
                    </div>
                  )}

                  {step.price !== undefined && step.price !== null && (
                    <div className="flex items-center gap-1.5 text-gray-700 font-mono font-bold">
                      <span className="text-emerald-700">
                        {step.action === "Auction Won" ? `Winning Price: ₹${step.price}` : `Price: ₹${step.price}`}
                      </span>
                    </div>
                  )}
                </div>

                {step.remarks && (
                  <p className="text-xs text-gray-600 italic mt-2.5 bg-white p-2 rounded-lg border border-emerald-100">
                    "{step.remarks}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default JourneyTimeline;
