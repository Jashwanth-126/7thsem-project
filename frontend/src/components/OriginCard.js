import React from "react";
import { MapPin, User, Calendar, CheckCircle } from "lucide-react";

function OriginCard({ farmerName, village, district, state, harvestDate, listingDate, verifiedBy, verifiedDistrict }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-5">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Farm Origin & Harvest</h3>
          <p className="text-xs text-gray-500">Verified Geographical Location</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-emerald-600 mt-1" />
          <div>
            <span className="text-xs text-gray-400 block uppercase">Farmer Name</span>
            <span className="font-semibold text-gray-800">{farmerName || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
          <div>
            <span className="text-xs text-gray-400 block uppercase">Location</span>
            <span className="font-semibold text-gray-800">
              {village ? `${village}, ` : ""}{district || "N/A"}, {state || "Karnataka"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-emerald-600 mt-1" />
          <div>
            <span className="text-xs text-gray-400 block uppercase">Harvest Date</span>
            <span className="font-semibold text-gray-800">{harvestDate || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-1" />
          <div>
            <span className="text-xs text-gray-400 block uppercase">Verification Region</span>
            <span className="font-semibold text-gray-800">
              {verifiedDistrict || district || "Karnataka"} PFO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OriginCard;
