import React, { useState } from "react";
import VerificationStatusBadge from "./VerificationStatusBadge";
import StatusBadge from "./StatusBadge";
import QRCodeCard from "./QRCodeCard";

function CropCard({ crop }) {
  const auctionStatus =
    crop.auction_status ||
    (crop.verification_status === "verified"
      ? "active"
      : "pending");

  const tid = crop.qr_traceability_id || crop.traceability_id || crop.id;
  
  const computedStatus = crop.current_status || (
    crop.verification_status === "verified"
      ? (auctionStatus === "active" ? "Auction Active font-bold" : "Verified")
      : "Listed"
  );

  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 flex flex-col justify-between border border-gray-100">
      <div>
        <div className="relative mb-4">
          <img
            src={crop.image_url || "https://placehold.co/600x400"}
            alt={crop.crop_name}
            className="h-48 w-full object-cover rounded-2xl"
          />
          <div className="absolute top-3 right-3">
            <StatusBadge status={computedStatus} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-green-700">
          {crop.crop_name}
        </h2>

        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex flex-wrap gap-2 items-center">
            <VerificationStatusBadge status={crop.verification_status || "pending"} />
            {crop.verification_status === "verified" && (
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Verified by Karnataka PFO
              </span>
            )}
          </div>

          <p><strong className="text-gray-900">Variety:</strong> {crop.crop_variety || "-"}</p>
          <p><strong className="text-gray-900">Quantity:</strong> {crop.quantity} {crop.unit}</p>
          <p><strong className="text-gray-900">Base Auction Price:</strong> ₹{crop.expected_price}</p>
          
          {crop.quality_grade && (
            <p><strong className="text-gray-900">Quality Grade:</strong> {crop.quality_grade}</p>
          )}

          {crop.pfo_remarks && (
            <p><strong className="text-gray-900">Remarks:</strong> {crop.pfo_remarks}</p>
          )}

          {crop.rejection_reason && (
            <p className="text-red-600"><strong className="text-red-700">Rejection:</strong> {crop.rejection_reason}</p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <QRCodeCard
          qrBase64={crop.qr_base64}
          traceabilityId={tid}
          cropName={crop.crop_name}
        />
      </div>
    </div>
  );
}

export default CropCard;