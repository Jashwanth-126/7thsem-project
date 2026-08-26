import React from "react";
import { TrendingUp, ArrowDown } from "lucide-react";

function PriceTimeline({ priceHistory = [], unit = "kg" }) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-100 p-5 text-center text-gray-500 text-sm">
        No price history recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-5">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Price Evolution Timeline</h3>
          <p className="text-xs text-gray-500">Farm-to-Customer Value Addition</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative py-2">
        {priceHistory.map((item, index) => {
          const isLast = index === priceHistory.length - 1;

          return (
            <React.Fragment key={index}>
              <div className="flex-1 w-full flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-300 transition-all">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                  {item.stage}
                </span>
                <span className="text-xl font-extrabold text-gray-900 my-1 font-mono">
                  ₹{item.price}/{unit}
                </span>
                <span className="text-xs text-gray-500">
                  {item.actor ? `${item.actor} (${item.role})` : item.role}
                </span>
              </div>

              {!isLast && (
                <div className="flex items-center justify-center text-emerald-600 my-1 md:my-0">
                  <ArrowDown className="w-5 h-5 md:-rotate-90 transform" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default PriceTimeline;
