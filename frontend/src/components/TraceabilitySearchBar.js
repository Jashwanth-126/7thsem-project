import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, QrCode } from "lucide-react";
import QRScannerModal from "./QRScannerModal";
import API from "../services/api";

function TraceabilitySearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e?.preventDefault();
    const cleanQ = query.trim();
    if (!cleanQ) return;

    setLoading(true);
    setError("");

    try {
      // First try quick lookup via API search endpoint
      const res = await API.get(`/api/traceability/search/${encodeURIComponent(cleanQ)}`);
      if (res.data && res.data.traceability_id) {
        navigate(`/traceability/${res.data.traceability_id}`);
      } else {
        navigate(`/traceability/${cleanQ}`);
      }
    } catch (err) {
      // Direct navigation as fallback
      navigate(`/traceability/${cleanQ}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (scannedText) => {
    setShowScanner(false);
    if (!scannedText) return;

    let tid = scannedText;

    // Check if scanned text contains Traceability ID substring
    if (scannedText.includes("Traceability ID:")) {
      const parts = scannedText.split("Traceability ID:");
      if (parts.length > 1) {
        tid = parts[1].trim().split("\n")[0];
      }
    } else if (scannedText.includes("KM-TRC-")) {
      const match = scannedText.match(/KM-TRC-[A-Za-z0-9]+/);
      if (match) tid = match[0];
    }

    navigate(`/traceability/${encodeURIComponent(tid)}`);
  };

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <form onSubmit={handleSearch} className="relative flex items-center shadow-md rounded-2xl bg-white border border-emerald-200 p-1.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
        <div className="pl-3 pr-2 text-emerald-600">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Traceability ID (e.g. KM-TRC-1029)"
          className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm md:text-base py-2 pr-2"
        />

        <button
          type="button"
          onClick={() => setShowScanner(true)}
          title="Scan Crop QR Code"
          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold mr-1 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan QR</span>
        </button>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs"
        >
          {loading ? "Searching..." : "Track Crop"}
        </button>
      </form>

      {error && <p className="text-xs text-red-600 mt-1 pl-3">{error}</p>}

      {showScanner && (
        <QRScannerModal
          mode="traceability"
          onScan={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default TraceabilitySearchBar;
