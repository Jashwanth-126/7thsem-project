import {
  useState
} from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

import DeliveryQRModal
from "./DeliveryQRModal";

function SendCropsForm({

  auction

}) {

  const user = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  )?.user;

  const [travelerNumber,
    setTravelerNumber] =
      useState("");

  const [deliveryPerson,
    setDeliveryPerson] =
      useState("");

  const [vehicleNumber,
    setVehicleNumber] =
      useState("");

  const [dispatchNotes,
    setDispatchNotes] =
      useState("");

  const [loadingImage,
    setLoadingImage] =
      useState(null);

  const [proofImage,
    setProofImage] =
      useState(null);

  const [receiptImage,
    setReceiptImage] =
      useState(null);

  const [deliveryQR,
    setDeliveryQR] =
      useState(null);

  // ======================================
  // SEND CROPS
  // ======================================

  const sendCrops =
    async () => {

      try {

        const formData =
          new FormData();

        formData.append(
          "auction_id",
          auction.auction_id
        );

        formData.append(
          "farmer_id",
          user.id
        );

        formData.append(
          "dealer_id",
          auction.winner_id
        );

        formData.append(
          "crop_id",
          auction.crop_id
        );

        formData.append(
          "traveler_number",
          travelerNumber
        );

        formData.append(
          "delivery_person_name",
          deliveryPerson
        );

        formData.append(
          "vehicle_number",
          vehicleNumber
        );

        formData.append(
          "dispatch_notes",
          dispatchNotes
        );

        formData.append(
          "loading_image",
          loadingImage
        );

        formData.append(
          "delivery_proof",
          proofImage
        );

        formData.append(
          "transport_receipt",
          receiptImage
        );

        const response =
          await API.post(

            "/api/payment/farmer/dispatch",

            formData
          );

        setDeliveryQR(
          response.data
        );

        toast.success(
          "Delivery QR Generated"
        );

      } catch (error) {

        console.log(error);

        console.log(error);
        const errorMsg = error.response?.data?.message || "Dispatch failed";
        toast.error(errorMsg);
      }
    };

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      shadow-2xl
      p-8
      mt-10
    ">

      <h2 className="
        text-4xl
        font-bold
        text-green-700
        mb-6
      ">

        Send Crops

      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Traveler Number / Tracking ID</label>
        <input
          type="text"
          placeholder="Enter Traveler Number"
          onChange={(e) =>
            setTravelerNumber(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
          "
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Delivery Person Name</label>
        <input
          type="text"
          placeholder="Enter Name"
          onChange={(e) =>
            setDeliveryPerson(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
          "
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Vehicle Number</label>
        <input
          type="text"
          placeholder="e.g. KA-01-AB-1234"
          onChange={(e) =>
            setVehicleNumber(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
          "
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Dispatch Notes</label>
        <textarea
          placeholder="Any additional info..."
          onChange={(e) =>
            setDispatchNotes(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
          "
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Loading Image (Proof of Load)</label>
        <input
          type="file"
          onChange={(e) =>
            setLoadingImage(
              e.target.files[0]
            )
          }
          className="
            w-full
            p-4
            border
            rounded-2xl
          "
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Delivery Image (Package Proof)</label>
        <input
          type="file"
          onChange={(e) =>
            setProofImage(
              e.target.files[0]
            )
          }
          className="
            w-full
            p-4
            border
            rounded-2xl
          "
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2 ml-1">Transport Receipt / Lorry Receipt</label>
        <input
          type="file"
          onChange={(e) =>
            setReceiptImage(
              e.target.files[0]
            )
          }
          className="
            w-full
            p-4
            border
            rounded-2xl
          "
        />
      </div>

      <button

        onClick={sendCrops}

        className="
          bg-green-600
          text-white
          px-8
          py-3
          rounded-2xl
          font-bold
        "
      >

        Send Crops

      </button>

      {deliveryQR && (

        <DeliveryQRModal

          qrData={deliveryQR}
        />
      )}

    </div>
  );
}

export default SendCropsForm;