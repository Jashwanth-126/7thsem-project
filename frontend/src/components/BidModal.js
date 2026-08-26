import { useState }
from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

function BidModal({

  crop,

  user,

  closeModal

}) {

  const [bidAmount,
    setBidAmount] =
      useState("");

  const placeBid =
    async () => {

      const amount = Number(bidAmount);

      // Parse base price from string like "20/kg"
      const basePriceStr = crop.expected_price;
      const basePrice = basePriceStr.includes('/') ? 
        Number(basePriceStr.split('/')[0]) : 
        Number(basePriceStr);

      if (!amount || amount <= basePrice) {

        toast.error(
          "Enter a bid above the base price"
        );

        return;
      }

      if (crop.auction_status !== "active") {

        toast.error(
          "Auction is not active"
        );

        return;
      }

      try {

        await API.post(

          "/api/bid/place",

          {

            crop_id:
              crop.id,

            bidder_id:
              user.id,

            bidder_role:
              user.role,

            bid_amount:
              amount
          }
        );

        toast.success(
          "Bid Placed"
        );

        closeModal();

      } catch (error) {

        toast.error(

          error.response?.data?.message
          || "Bid failed"
        );
      }
    };

  const isSubmitDisabled =
    crop.auction_status !== "active" ||
    Number(bidAmount) <= (crop.expected_price.includes('/') ? 
      Number(crop.expected_price.split('/')[0]) : 
      Number(crop.expected_price));

  return (

    <div className="
      fixed
      inset-0
      bg-black/40
      flex
      items-center
      justify-center
      z-50
    ">

      <div className="
        bg-white
        p-8
        rounded-3xl
        w-[90%]
        max-w-lg
      ">

        <h2 className="
          text-3xl
          font-bold
          text-green-700
          mb-6
        ">

          Place Bid

        </h2>

        <p className="mb-4">

          Base Price:
          {' '}₹{crop.expected_price}

        </p>

        <input
          type="number"
          placeholder="Enter Bid Amount"
          value={bidAmount}
          onChange={(e) =>
            setBidAmount(e.target.value)
          }
          className="
            w-full
            p-4
            rounded-xl
            border
            mb-4
          "
        />

        <p className="
          text-sm
          text-gray-500
          mb-6
        ">
          Enter a value greater than the base price.
        </p>

        <button
          onClick={placeBid}
          disabled={isSubmitDisabled}
          className={
            `w-full py-4 rounded-xl font-bold text-white ${isSubmitDisabled
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            }`
          }
        >

          Submit Bid

        </button>

      </div>

    </div>
  );
}

export default BidModal;