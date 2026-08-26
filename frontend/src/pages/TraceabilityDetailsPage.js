import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import TraceabilitySearchBar from "../components/TraceabilitySearchBar";
import QRCodeCard from "../components/QRCodeCard";
import OriginCard from "../components/OriginCard";
import PriceTimeline from "../components/PriceTimeline";
import JourneyTimeline from "../components/JourneyTimeline";
import HistoryTable from "../components/HistoryTable";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import { ShieldCheck, ArrowLeft, Cpu, Sparkles, CheckCircle2, UserCheck, DollarSign } from "lucide-react";

function TraceabilityDetailsPage() {
  const { traceability_id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!traceability_id) return;
    fetchTraceabilityData();
  }, [traceability_id]);

  const fetchTraceabilityData = async () => {
    setLoading(true);
    setError("");

    try {
      const [detailsRes, historyRes] = await Promise.all([
        API.get(`/api/traceability/${encodeURIComponent(traceability_id)}`),
        API.get(`/api/traceability/history/${encodeURIComponent(traceability_id)}`)
      ]);

      if (detailsRes.data && detailsRes.data.success) {
        setDetails(detailsRes.data);
      } else {
        setError(detailsRes.data?.message || "Failed to load crop details.");
      }

      if (historyRes.data && historyRes.data.history) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      console.error("Error fetching traceability details:", err);
      setError("Traceability record not found for this ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Header */}
      <header className="bg-emerald-800 text-white py-6 px-4 md:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors text-white"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
                <h1 className="text-xl md:text-2xl font-bold">Crop Traceability Verification</h1>
              </div>
              <p className="text-xs text-emerald-200">Official Farm-to-Fork Authenticity Certificate</p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <TraceabilitySearchBar className="max-w-md" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-gray-500 text-sm mt-3 font-medium">Retrieving immutable traceability records...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-md text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Record Not Found</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : details ? (
          <div className="space-y-6">

            {/* Banner / Overview Header */}
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Crop Image & Badges */}
                <div className="flex flex-col md:flex-row items-center gap-5 lg:col-span-2">
                  <img
                    src={details.crop_image || "https://placehold.co/600x400?text=Crop+Image"}
                    alt={details.crop_name}
                    className="w-full md:w-44 h-44 object-cover rounded-2xl border border-gray-200 shadow-sm"
                  />

                  <div className="space-y-3 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {details.category}
                      </span>
                      <StatusBadge status={details.current_status} />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                      {details.crop_name}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs md:text-sm">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-2xs uppercase font-medium">Quantity</span>
                        <span className="font-bold text-gray-800">{details.quantity} {details.unit}</span>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-2xs uppercase font-medium">Base Price</span>
                        <span className="font-bold text-emerald-700 font-mono">₹{details.expected_price}/{details.unit}</span>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                        <span className="text-gray-400 block text-2xs uppercase font-medium">Current Owner</span>
                        <span className="font-bold text-gray-800 truncate block">{details.current_owner}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Component */}
                <div>
                  <QRCodeCard
                    qrBase64={details.qr_base64}
                    traceabilityId={details.traceability_id}
                    cropName={details.crop_name}
                  />
                </div>
              </div>
            </div>

            {/* AI Insights & Verification Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Predictions */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-3 right-3 text-emerald-400 opacity-20">
                  <Sparkles className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-emerald-300" />
                  <h3 className="text-lg font-bold">AI Analytics & Market Intelligence</h3>
                </div>

                <div className="space-y-4 relative z-10 text-sm">
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                    <span className="text-xs text-emerald-200 block font-medium">AI Yield Quality Prediction</span>
                    <span className="text-base font-bold text-white">{details.ai_yield_prediction}</span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                    <span className="text-xs text-emerald-200 block font-medium">Predicted Market Valuation</span>
                    <span className="text-base font-bold text-emerald-300 font-mono">{details.predicted_market_price}</span>
                  </div>
                </div>
              </div>

              {/* Stakeholders Breakdown */}
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-md p-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-gray-800">Stakeholder Summary</h3>
                </div>

                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Farmer:</span>
                    <span className="font-semibold text-gray-800">{details.farmer_name} ({details.district})</span>
                  </div>

                  {details.dealer_name && (
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Dealer (Auction Winner):</span>
                      <span className="font-semibold text-gray-800">{details.dealer_name} (₹{details.dealer_purchase_price})</span>
                    </div>
                  )}

                  {details.retailer_name && (
                    <div className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-500">Retailer:</span>
                      <span className="font-semibold text-gray-800">{details.retailer_name} (₹{details.retailer_purchase_price})</span>
                    </div>
                  )}

                  {details.customer_name && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-semibold text-gray-800">{details.customer_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Farm Origin */}
            <OriginCard
              farmerName={details.farmer_name}
              village={details.village}
              district={details.district}
              state={details.state}
              harvestDate={details.harvest_date}
              listingDate={details.listing_date}
              verifiedBy={details.verified_by}
              verifiedDistrict={details.verified_district}
            />

            {/* Price Timeline */}
            <PriceTimeline priceHistory={details.price_history} unit={details.unit} />

            {/* Full Journey Stepper */}
            <JourneyTimeline history={history} />

            {/* Raw Event History Table */}
            <HistoryTable history={history} />

          </div>
        ) : null}
      </main>
    </div>
  );
}

export default TraceabilityDetailsPage;
