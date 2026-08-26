import {
  useEffect,
  useState
} from "react";

import toast from "react-hot-toast";

import API from "../services/api";
import DeliveryTimeline, { getStageIndex } from "./DeliveryTimeline";

function AdminAuctionCard({ result }) {

  // ======================================
  // STATES
  // ======================================

  const [qrData, setQrData] = useState(null);
  const [timelineStatus, setTimelineStatus] = useState(result.escrow_status || "Waiting For Farmer Payment QR");

  const fetchTimeline = async () => {
    try {
      const response = await API.get(`/api/payment/timeline/${result.auction_id}`);
      if (response.data.success) {
        setTimelineStatus(response.data.status);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================
  // FETCH FARMER QR
  // ======================================

  const fetchQR = async () => {

    try {

      const response =
        await API.get(
          `/api/payment/farmer-qr/${result.auction_id}`
        );

      if (
        response.data &&
        response.data.length > 0
      ) {

        setQrData(
          response.data[0]
        );

      } else {

        setQrData(null);
      }

    } catch (error) {

      console.log(
        "QR FETCH ERROR:",
        error
      );
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchQR();
    fetchTimeline();
    
    const interval = setInterval(fetchTimeline, 3000);
    return () => clearInterval(interval);
  }, []);

  // ======================================
  // REQUEST FARMER QR
  // ======================================

  const requestFarmerQR =
    async () => {

      try {

        await API.post(
          "/api/payment/admin/request-farmer-qr",
          {
            auction_id: result.auction_id,
            farmer_id: result.farmer_id,
            dealer_id: result.winner_id
          }
        );

        toast.success(
          "Farmer QR upload enabled"
        );

        await fetchQR();
        await fetchTimeline();

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to enable QR upload"
        );
      }
    };

  // ======================================
  // ENABLE ESCROW PAYMENT
  // ======================================

  const enableEscrow =
    async () => {

      try {

        await API.post(
          "/api/payment/admin/enable-escrow",
          {
            auction_id: result.auction_id
          }
        );

        toast.success(
          "Escrow payment enabled"
        );

        await fetchTimeline();

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to enable escrow"
        );
      }
    };

  // ======================================
  // NOTIFY FARMER
  // ======================================

  const notifyFarmer =
    async () => {

      try {

        await API.post(
          "/api/payment/admin/enable-dispatch",
          {
            auction_id: result.auction_id
          }
        );

        toast.success(
          "Farmer notified to send crops"
        );

        await fetchTimeline();

      } catch (error) {

        console.log(error);

        toast.error(
          "Notification failed"
        );
      }
    };

  // ======================================
  // FINALIZE TRANSACTION
  // ======================================

  const finalizeTransaction = async () => {
    try {
      await API.post("/api/payment/admin/finalize-transaction", {
        auction_id: result.auction_id
      });
      toast.success("Transaction successfully completed. Farmer notified.");
      await fetchTimeline();
    } catch (error) {
      console.log(error);
      toast.error("Failed to finalize transaction");
    }
  };

  const currentIndex = getStageIndex(timelineStatus);

  const canRequestQR = currentIndex === -1;
  const isQRRequested = currentIndex >= 0;

  const canEnableEscrow = currentIndex === 1;
  const isEscrowEnabled = currentIndex >= 2;

  const canNotifyFarmer = currentIndex === 4;
  const isFarmerNotified = currentIndex >= 5;

  const canFinalize = currentIndex === 7;
  const isFinalized = currentIndex >= 8;

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      p-8
      shadow-2xl
      border
      border-white/20
    ">

      {/* ================================= */}
      {/* AUCTION HEADER */}
      {/* ================================= */}

      <div className="
        flex
        justify-between
        items-center
        mb-6
        flex-wrap
        gap-4
      ">

        <h2 className="
          text-3xl
          font-bold
          text-green-700
        ">

          Auction #
          {result.auction_id}

        </h2>

        <div className={`
          px-4
          py-2
          rounded-2xl
          font-semibold
          ${isFinalized ? "bg-green-100 text-green-800 border border-green-300" : "bg-yellow-100 text-yellow-700"}
        `}>

          {isFinalized ? "Transaction Completed" : timelineStatus}

        </div>

      </div>

      <DeliveryTimeline auctionId={result.auction_id} />

      {/* ================================= */}
      {/* ADMIN PAYMENT CONTROLS */}
      {/* ================================= */}

      <div className="
        grid
        md:grid-cols-3
        gap-4
        mb-10
      ">

        {/* REQUEST FARMER QR */}

        <button
          onClick={requestFarmerQR}
          disabled={!canRequestQR}
          className={`
            py-3
            px-4
            rounded-2xl
            font-bold
            shadow-lg
            transition-all
            duration-300
            ${canRequestQR ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"}
          `}
        >
          {isQRRequested ? "✓ Farmer QR Requested" : "Request Farmer Payment QR"}
        </button>

        {/* ENABLE ESCROW */}

        <button
          onClick={enableEscrow}
          disabled={!canEnableEscrow}
          className={`
            py-3
            px-4
            rounded-2xl
            font-bold
            shadow-lg
            transition-all
            duration-300
            ${canEnableEscrow ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer animate-bounce" : "bg-gray-200 text-gray-500 cursor-not-allowed"}
          `}
        >
          {isEscrowEnabled ? "✓ Escrow Payment Enabled" : "Enable Escrow Payment"}
        </button>

        {/* NOTIFY FARMER */}

        <button
          onClick={notifyFarmer}
          disabled={!canNotifyFarmer}
          className={`
            py-3
            px-4
            rounded-2xl
            font-bold
            shadow-lg
            transition-all
            duration-300
            ${canNotifyFarmer ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer animate-bounce" : "bg-gray-200 text-gray-500 cursor-not-allowed"}
          `}
        >
          {isFarmerNotified ? "✓ Farmer Notified to Send" : "Notify Farmer To Send Crops"}
        </button>

        {/* FINALIZE TRANSACTION */}

        <button
          onClick={finalizeTransaction}
          disabled={!canFinalize}
          className={`
            py-3
            px-4
            rounded-2xl
            font-bold
            shadow-lg
            transition-all
            duration-300
            ${canFinalize ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer animate-bounce" : isFinalized ? "bg-green-600 text-white cursor-default" : "bg-gray-300 text-gray-500 cursor-not-allowed"}
          `}
        >
          {isFinalized ? "✓ Amount Transferred To Farmer" : "Amount Transferred To Farmer"}
        </button>

        <button
          onClick={() => {
            const tid = result.qr_traceability_id || result.traceability_id || result.crop_qr_traceability_id || result.crop_id || result.auction_id;
            window.location.href = `/traceability/${encodeURIComponent(tid)}`;
          }}
          className="
            bg-emerald-800
            hover:bg-emerald-900
            text-white
            py-3
            px-4
            rounded-2xl
            font-bold
            shadow-lg
            transition-all
            duration-300
            flex
            items-center
            justify-center
            gap-2
          "
        >
          🔍 View Traceability
        </button>

      </div>

      {/* ================================= */}
      {/* FARMER QR VIEW */}
      {/* ================================= */}

      {qrData && qrData.qr_url && (

        <div className="
          bg-white
          rounded-3xl
          p-6
          mb-10
          flex
          flex-col
          items-center
          shadow-xl
        ">

          <h3 className="
            text-3xl
            font-bold
            text-green-700
            mb-6
          ">

            Farmer Payment QR

          </h3>

          <img

            src={qrData.qr_url}

            alt="Farmer QR"

            onError={(e) => {

              console.log(
                "IMAGE LOAD FAILED"
              );

              e.target.src =
                "https://via.placeholder.com/300x300?text=QR+Not+Found";
            }}

            className="
              w-72
              h-72
              object-contain
              rounded-2xl
              border-4
              border-green-200
              shadow-2xl
              bg-white
              p-3
            "
          />

          <p className="
            mt-4
            text-gray-500
            text-sm
            break-all
            text-center
          ">

            {qrData.qr_url}

          </p>

        </div>
      )}

      {/* ================================= */}
      {/* CROP DETAILS */}
      {/* ================================= */}

      <div className="mb-8">

        <h3 className="
          text-2xl
          font-bold
          text-green-700
          mb-4
        ">

          Auction Details

        </h3>

        <div className="
          grid
          md:grid-cols-2
          gap-4
          text-gray-700
        ">

          <p>
            Crop:
            {" "}
            {result.crop_name}
          </p>

          <p>
            Category:
            {" "}
            {result.crop_category}
          </p>

          <p>
            Quantity:
            {" "}
            {result.crop_quantity}
          </p>

          <p>
            Base Price:
            ₹{result.base_price}
          </p>

          <p>
            Final Bid:
            ₹{result.final_bid}
          </p>

          <p>
            Auction Start:
            {" "}
            {result.auction_start}
          </p>

          <p>
            Auction End:
            {" "}
            {result.auction_end}
          </p>

          <p>
            Winning Time:
            {" "}
            {result.winning_timestamp}
          </p>

        </div>

      </div>

      {/* ================================= */}
      {/* FARMER DETAILS */}
      {/* ================================= */}

      <div className="mb-8">

        <h3 className="
          text-2xl
          font-bold
          text-green-700
          mb-4
        ">

          Farmer Details

        </h3>

        <div className="
          grid
          md:grid-cols-2
          gap-4
          text-gray-700
        ">

          <p>
            Name:
            {" "}
            {result.farmer_name}
          </p>

          <p>
            Username:
            {" "}
            {result.farmer_username}
          </p>

          <p>
            District:
            {" "}
            {result.farmer_district}
          </p>

          <p>
            Email:
            {" "}
            {result.farmer_email}
          </p>

          <p>
            Phone:
            {" "}
            {result.farmer_phone}
          </p>

        </div>

      </div>

      {/* ================================= */}
      {/* WINNER DETAILS */}
      {/* ================================= */}

      <div className="mb-8">

        <h3 className="
          text-2xl
          font-bold
          text-green-700
          mb-4
        ">

          Winner Details

        </h3>

        <div className="
          grid
          md:grid-cols-2
          gap-4
          text-gray-700
        ">

          <p>
            Name:
            {" "}
            {result.winner_name}
          </p>

          <p>
            Role:
            {" "}
            {result.winner_role}
          </p>

          <p>
            Username:
            {" "}
            {result.winner_username}
          </p>

          <p>
            Email:
            {" "}
            {result.winner_email}
          </p>

          <p>
            Phone:
            {" "}
            {result.winner_phone}
          </p>

          <p>
            Institution:
            {" "}
            {result.institution_name}
          </p>

        </div>

      </div>

      {/* ================================= */}
      {/* PFO DETAILS */}
      {/* ================================= */}

      <div>

        <h3 className="
          text-2xl
          font-bold
          text-green-700
          mb-4
        ">

          PFO Details

        </h3>

        <div className="
          grid
          md:grid-cols-2
          gap-4
          text-gray-700
        ">

          <p>
            PFO Name:
            {" "}
            {result.pfo_name}
          </p>

          <p>
            District:
            {" "}
            {result.pfo_district}
          </p>

          <p>
            Verification:
            {" "}
            {result.verification_status}
          </p>

        </div>

      </div>

    </div>
  );
}

export default AdminAuctionCard;