import AuctionTimer
from "./AuctionTimer";
import { useState } from "react";
import BidHistoryModal from "./BidHistoryModal";

function PFOAuctionCard({

  auctionData,

  closeAuction,

  finalizeAuction

}) {
  const [showHistory, setShowHistory] = useState(false);

  const {

    crop,

    highest_bid,

    total_bidders,

    auction

  } = auctionData;

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      overflow-hidden
      shadow-2xl
    ">

      {/* IMAGE */}
      <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
        <img
          src={
            crop.image_url ||
            "https://placehold.co/600x400?text=No+Crop+Image"
          }
          alt={crop.crop_name || "Crop"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400?text=No+Crop+Image";
          }}
          className="
            w-full
            h-full
            object-cover
            object-center
          "
        />
      </div>

      <div className="p-6">

        <h2 className="
          text-4xl
          font-bold
          text-green-700
          mb-4
        ">

          {crop.crop_name}

        </h2>

        <div className="
          space-y-3
        ">

          <p>
            District:
            {" "}
            {crop.district}
          </p>

          <p>
            Quality:
            {" "}
            {crop.quality_grade}
          </p>

          <p>
            Highest Bid:
            {" "}

            {
              highest_bid
              ? `₹${highest_bid.bid_amount}`
              : "No bids"
            }
          </p>

          <p>
            Total Bidders:
            {" "}
            {total_bidders}
          </p>

          <p>
            Auction Status:
            {" "}
            {
              auction?.auction_status
            }
          </p>

        </div>

        {/* TIMER */}
        <div className="mt-5">

          <AuctionTimer
            auctionEnd={
              auction?.auction_end
            }
            status={
              auction?.auction_status
            }
          />

        </div>

        {/* ACTIONS */}
        <div className="
          flex
          gap-4
          mt-6
        ">

          <button
            onClick={() =>
              closeAuction(crop.id)
            }
            disabled={auction?.auction_status !== "active"}
            className={`
              flex-1
              py-4
              rounded-xl
              font-bold
              text-white
              transition-all
              ${auction?.auction_status === "active" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-gray-400 cursor-not-allowed"}
            `}
          >

            Close Auction

          </button>

          <button
            onClick={() =>
              finalizeAuction(crop.id)
            }
            disabled={auction?.auction_status !== "closed"}
            className={`
              flex-1
              py-4
              rounded-xl
              font-bold
              text-white
              transition-all
              ${auction?.auction_status === "closed" 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gray-400 cursor-not-allowed"}
            `}
          >

            Finalize Winner

          </button>

        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
        >
          View Bid History
        </button>

      </div>

      {showHistory && (
        <BidHistoryModal
          cropId={crop.id}
          closeModal={() => setShowHistory(false)}
        />
      )}

    </div>
  );
}

export default PFOAuctionCard;