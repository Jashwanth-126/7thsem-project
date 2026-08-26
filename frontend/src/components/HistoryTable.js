import React from "react";
import StatusBadge from "./StatusBadge";

function HistoryTable({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="text-gray-500 text-sm p-4 text-center">No history logs recorded.</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base font-bold text-gray-800">Event History Log</h3>
        <p className="text-xs text-gray-500">Recorded system audits & transitions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase text-2xs md:text-xs font-semibold">
            <tr>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Performed By</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((row, idx) => {
              const dt = row.created_at ? new Date(row.created_at).toLocaleString() : "N/A";
              return (
                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">{dt}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{row.action}</td>
                  <td className="py-3 px-4">{row.performed_by || "System"}</td>
                  <td className="py-3 px-4 font-medium">{row.role}</td>
                  <td className="py-3 px-4">{row.location || "-"}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {row.price !== null && row.price !== undefined ? `₹${row.price}` : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryTable;
