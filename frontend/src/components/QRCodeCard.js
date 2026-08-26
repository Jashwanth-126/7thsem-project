import React, { useState } from "react";
import { Copy, Download, ExternalLink, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

function QRCodeCard({ qrBase64, traceabilityId, cropName }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    if (!traceabilityId) return;
    navigator.clipboard.writeText(traceabilityId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrBase64) return;
    const link = document.createElement("a");
    link.href = qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`;
    link.download = `crop-qr-${traceabilityId || "traceability"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewTraceability = () => {
    if (traceabilityId) {
      navigate(`/traceability/${encodeURIComponent(traceabilityId)}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-5 flex flex-col items-center text-center">
      <div className="bg-emerald-50 p-3 rounded-2xl mb-3 border border-emerald-200">
        {qrBase64 ? (
          <img
            src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
            alt="Crop Traceability QR Code"
            className="w-36 h-36 object-contain rounded-lg shadow-xs"
          />
        ) : (
          <div className="w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
            No QR Code
          </div>
        )}
      </div>

      <div className="w-full">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Traceability ID</p>
        <p className="text-base font-bold text-gray-800 font-mono select-all my-1 bg-gray-50 py-1 px-2 rounded border border-gray-200 break-all">
          {traceabilityId || "N/A"}
        </p>

        <div className="flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy ID"}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!qrBase64}
              className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-3 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download QR</span>
            </button>
          </div>

          <button
            onClick={handleViewTraceability}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Traceability</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRCodeCard;
