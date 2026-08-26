import React from "react";

const statusStyles = {
  "Listed": "bg-blue-100 text-blue-800 border-blue-300",
  "Pending": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Verified": "bg-teal-100 text-teal-800 border-teal-300",
  "Auction Active": "bg-purple-100 text-purple-800 border-purple-300",
  "Auction Won": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Auction Completed": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Sold to Dealer": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "Purchased by Retailer": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Purchased by Customer": "bg-green-100 text-green-800 border-green-300",
  "Completed": "bg-green-600 text-white border-green-700 font-bold",
  "Default": "bg-gray-100 text-gray-800 border-gray-300"
};

function StatusBadge({ status }) {
  const currentStatus = status || "Listed";
  const style = statusStyles[currentStatus] || statusStyles["Default"];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border shadow-xs ${style}`}
    >
      <span className="w-2 h-2 mr-1.5 rounded-full bg-current opacity-75 animate-pulse"></span>
      {currentStatus}
    </span>
  );
}

export default StatusBadge;
