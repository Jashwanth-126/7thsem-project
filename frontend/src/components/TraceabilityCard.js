import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { QrCode, ExternalLink, User, ShieldCheck } from "lucide-react";

function TraceabilityCard({ traceabilityId, status, currentOwner, qrBase64, cropName }) {
  const navigate = useNavigate();

  const handleView = () => {
    if (traceabilityId) {
      navigate(`/traceability/${encodeURIComponent(traceabilityId)}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between gap-3">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-mono font-bold text-gray-800">
            {traceabilityId || "N/A"}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center gap-3">
        {qrBase64 ? (
          <img
            src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
            alt="QR Code"
            className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0">
            <QrCode className="w-7 h-7" />
          </div>
        )}

        <div className="flex-1 text-xs space-y-1">
          {cropName && <p className="font-bold text-gray-900 text-sm truncate">{cropName}</p>}
          <p className="flex items-center gap-1 text-gray-600">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Owner: <strong className="text-gray-900">{currentOwner || "Farmer"}</strong></span>
          </p>
        </div>
      </div>

      <button
        onClick={handleView}
        className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>View Traceability</span>
      </button>
    </div>
  );
}

export default TraceabilityCard;
