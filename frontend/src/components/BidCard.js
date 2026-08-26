import {
  useEffect,
  useState
} from "react";

import API
from "../services/api";

import VerificationBadge
from "./VerificationBadge";

import AuctionTimer
from "./AuctionTimer";

import BidModal
from "./BidModal";

import BidHistoryModal
from "./BidHistoryModal";

function BidCard({

  crop,

  user

}) {

  const [highestBid,
    setHighestBid] =
      useState(null);

  const [totalBidders,
    setTotalBidders] =
      useState(0);

  const [showBidModal,
    setShowBidModal] =
      useState(false);

  const [showHistory,
    setShowHistory] =
      useState(false);

  const fetchBidData =
    async () => {

      try {

        const highest =
          await API.get(

            `/api/bid/highest/${crop.id}`
          );

        const bidders =
          await API.get(

            `/api/bid/total-bidders/${crop.id}`
          );

        setHighestBid(

          highest.data.highest_bid
        );

        setTotalBidders(

          bidders.data.total_bidders
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    fetchBidData();

    const interval =
      setInterval(

        fetchBidData,

        5000
      );

    return () =>
      clearInterval(interval);

  }, []);

  const isAuctionActive =
    crop.auction_status === "active";

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      overflow-hidden
      shadow-2xl
    ">

      {/* IMAGE */}
      <img
        src={
          crop.image_url ||

          "https://placehold.co/600x400"
        }
        alt={crop.crop_name}
        className="
          w-full
          h-64
          object-cover
        "
      />

      <div className="p-6">

        <div className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        ">

          <VerificationBadge />

          <span className="
            inline-flex
            items-center
            px-4
            py-2
            rounded-full
            text-sm
            font-semibold
            bg-white/20
            text-green-700
            border
            border-green-200
          ">
            {crop.auction_status || "pending"}
          </span>

        </div>

        <h2 className="
          text-4xl
          font-bold
          text-green-700
          mt-5
          mb-4
        ">

          {crop.crop_name}

        </h2>

        {crop.auction_end && (
          <div className="mt-5">
            <AuctionTimer auctionEnd={crop.auction_end} status={crop.auction_status} />
          </div>
        )}

        <div className="
          space-y-3
          text-gray-700
        ">

          <p>
            Quantity:
            {" "}
            {crop.quantity}
            {" "}
            {crop.unit}
          </p>

          <p>
            Base Price:
            ₹{crop.expected_price}
          </p>

          <p>
            Quality Grade:
            {" "}
            {crop.quality_grade}
          </p>

          <p>
            District:
            {" "}
            {crop.district}
          </p>

          <p>
            Pickup:
            {' '}
            {crop.pickup_option}
          </p>

          {crop.verified_by && (
            <p>
              Verified by:
              {' '}
              {crop.verified_by}
            </p>
          )}

          {crop.verified_district && (
            <p>
              PFO District:
              {' '}
              {crop.verified_district}
            </p>
          )}

          {crop.verified_at && (
            <p>
              Verified on:
              {' '}
              {new Date(
                crop.verified_at
              ).toLocaleString()}
            </p>
          )}

          {crop.qr_traceability_id && (
            <p>
              QR Traceability:
              {' '}
              {crop.qr_traceability_id}
            </p>
          )}

          <p>
            Highest Bid:
            {' '}
            {highestBid
              ? `₹${highestBid.bid_amount}`
              : "No bids yet"}
          </p>

          <p>
            Total Bidders:
            {' '}
            {totalBidders}
          </p>

        </div>

        {/* TIMER */}
        <div className="mt-5">

          <AuctionTimer
            auctionEnd={
              crop.auction_end
            }
            status={
              crop.auction_status
            }
          />

        </div>

        {/* BUTTONS */}
        <div className="
          flex
          gap-4
          mt-6
        ">

          <button
            onClick={() =>
              setShowBidModal(true)
            }
            disabled={!isAuctionActive}
            className={
              `flex-1 py-4 rounded-xl font-bold text-white ${isAuctionActive
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
              }`
            }
          >

            Place Bid

          </button>

          {user.role !== "dealer" && user.role !== "retailer" && (
            <button
              onClick={() =>
                setShowHistory(true)
              }
              className="
                flex-1
                bg-blue-600
                hover:bg-blue-700
                text-white
                py-4
                rounded-xl
                font-bold
              "
            >

              Bid History

            </button>
          )}

          <button
            onClick={() => {
              const tid = crop.qr_traceability_id || crop.traceability_id || crop.crop_qr_traceability_id || crop.id;
              window.location.href = `/traceability/${encodeURIComponent(tid)}`;
            }}
            className="
              flex-1
              bg-emerald-700
              hover:bg-emerald-800
              text-white
              py-4
              rounded-xl
              font-bold
            "
          >
            View Journey
          </button>

        </div>

        {!isAuctionActive && (
          <p className="
            mt-4
            text-sm
            text-red-600
          ">
            Bidding is not active for this crop.
          </p>
        )}

      </div>

      {/* BID MODAL */}
      {showBidModal && (

        <BidModal

          crop={crop}

          user={user}

          closeModal={() =>
            setShowBidModal(false)
          }
        />
      )}

      {/* HISTORY */}
      {showHistory && (

        <BidHistoryModal

          cropId={crop.id}

          closeModal={() =>
            setShowHistory(false)
          }
        />
      )}

    </div>
  );
}

export default BidCard;