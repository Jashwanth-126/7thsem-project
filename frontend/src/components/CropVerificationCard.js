import { useState } from "react";

import toast from "react-hot-toast";

import API from "../services/api";

import VerificationStatusBadge
from "./VerificationStatusBadge";

import ImageReviewModal
from "./ImageReviewModal";

function CropVerificationCard({

  crop,

  refresh,

  pfo

}) {

  const [remarks, setRemarks] =
    useState("");

  const [rejectionReason,
    setRejectionReason] =
    useState("");

  const [qualityGrade,
    setQualityGrade] =
    useState("Green");

  const [loading, setLoading] =
    useState(false);

  const [showImage,
    setShowImage] =
    useState(false);

  // VERIFY
  const verifyCrop = async (
    status
  ) => {

    try {

      setLoading(true);

      await API.post(

        "/api/pfo/verify-crop",

        {

          crop_id:
            crop.id,

          farmer_id:
            crop.farmer_id,

          pfo_id:
            pfo.id,

          verification_status:
            status,

          quality_grade:
            qualityGrade,

          remarks,

          rejection_reason:
            rejectionReason,

          verified_by:
            pfo.username,

          verified_district:
            pfo.district
        }
      );

      toast.success(
        "Verification Updated"
      );

      refresh();

    } catch (error) {

      toast.error(
        "Verification failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <>
      <div className="
        bg-white/20
        backdrop-blur-lg
        rounded-3xl
        p-6
        shadow-xl
      ">

        <div className="relative h-56 w-full mb-5 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 shadow-inner">
          <img
            src={crop.image_url || "https://placehold.co/600x400?text=No+Crop+Image"}
            alt={crop.crop_name || "Crop"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=No+Crop+Image";
            }}
            className="
              h-full
              w-full
              object-cover
              object-center
              transition-all
              hover:scale-105
              cursor-pointer
            "
            onClick={() =>
              setShowImage(true)
            }
          />
        </div>

        <h2 className="
          text-3xl
          font-bold
          text-green-700
        ">

          {crop.crop_name}

        </h2>

        <div className="
          mt-4
          space-y-2
        ">

          <p>
            Farmer:
            {" "}
            {crop.farmer_name}
          </p>

          <p>
            Category:
            {" "}
            {crop.crop_category}
          </p>

          <p>
            Quantity:
            {" "}
            {crop.quantity}
            {" "}
            {crop.unit}
          </p>

          <p>
            Harvest:
            {" "}
            {crop.harvest_date}
          </p>

          <VerificationStatusBadge
            status={
              crop.verification_status
            }
          />

        </div>

        {/* Quality */}
        <select
          value={qualityGrade}
          onChange={(e) =>
            setQualityGrade(
              e.target.value
            )
          }
          className="
            w-full
            p-3
            rounded-xl
            border
            mt-5
          "
        >

          <option>
            Green
          </option>

          <option>
            Blue
          </option>

          <option>
            Red
          </option>

        </select>

        {/* Remarks */}
        <textarea
          placeholder="PFO Remarks"
          value={remarks}
          onChange={(e) =>
            setRemarks(
              e.target.value
            )
          }
          className="
            w-full
            p-3
            rounded-xl
            border
            mt-4
          "
        />

        {/* Rejection */}
        <textarea
          placeholder="Rejection Reason"
          value={rejectionReason}
          onChange={(e) =>
            setRejectionReason(
              e.target.value
            )
          }
          className="
            w-full
            p-3
            rounded-xl
            border
            mt-4
          "
        />

        {/* Buttons */}
        <div className="
          flex
          gap-4
          mt-5
        ">

          <button
            onClick={() =>
              verifyCrop(
                "verified"
              )
            }
            disabled={loading}
            className="
              flex-1
              bg-green-600
              text-white
              p-3
              rounded-xl
            "
          >

            Approve

          </button>

          <button
            onClick={() =>
              verifyCrop(
                "rejected"
              )
            }
            disabled={loading}
            className="
              flex-1
              bg-red-600
              text-white
              p-3
              rounded-xl
            "
          >

            Reject

          </button>

        </div>

      </div>

      <ImageReviewModal
        open={showImage}
        image={crop.image_url}
        onClose={() =>
          setShowImage(false)
        }
      />
    </>
  );
}

export default CropVerificationCard;