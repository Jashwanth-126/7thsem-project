import {
  useEffect,
  useState
} from "react";

import API
from "../services/api";

import CropListingForm
from "../components/CropListingForm";

import CropCard
from "../components/CropCard";

import AuctionTimer
from "../components/AuctionTimer";

import NotificationCard
from "../components/NotificationCard";

import PaymentQRUpload
from "../components/PaymentQRUpload";

import BidHistoryModal from "../components/BidHistoryModal";

import TransactionHistoryCard from "../components/TransactionHistoryCard";

import SendCropsForm from "../components/SendCropsForm";
import DeliveryTimeline from "../components/DeliveryTimeline";
import TraceabilitySearchBar from "../components/TraceabilitySearchBar";

function FarmerDashboard() {

  // ======================================
  // USER
  // ======================================

  const user = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  )?.user;

  // ======================================
  // STATES
  // ======================================

  const [crops, setCrops] =
    useState([]);

  const [liveBids,
    setLiveBids] =
      useState([]);

  const [notifications,
    setNotifications] =
      useState([]);

  const [selectedAuction,
    setSelectedAuction] =
      useState(null);

  const [showHistory, setShowHistory] = useState(null); // cropId

  const [transactionHistory, setTransactionHistory] = useState([]);

  // ======================================
  // FETCH CROPS
  // ======================================

  const fetchCrops = async () => {

    try {

      const response = await API.get(
        `/api/farmer/dashboard/${user.id}`
      );

      setCrops(
        response.data.crops || []
      );

    } catch (error) {

      console.log(error);
    }
  };

  // ======================================
  // FETCH LIVE BIDS
  // ======================================

  const fetchLiveBids = async () => {

    try {

      const response = await API.get(
        `/api/farmer/live-bids/${user.id}`
      );

      setLiveBids(
        response.data.live_bids || []
      );

    } catch (error) {

      console.log(error);
    }
  };

  // ======================================
  // FETCH NOTIFICATIONS
  // ======================================

  const fetchNotifications =
    async () => {

      try {

        const response =
          await API.get(

            `/api/farmer/notifications/${user.id}`
          );

        setNotifications(
          response.data || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchCrops();

    fetchLiveBids();

    fetchNotifications();

    fetchTransactionHistory();

    const interval = setInterval(() => {

      fetchLiveBids();

      fetchNotifications();
      fetchTransactionHistory();

    }, 15000);

    return () => clearInterval(interval);

  }, []);

  // ======================================
  // FETCH TRANSACTION HISTORY
  // ======================================

  const fetchTransactionHistory = async () => {
    try {
      const response = await API.get(`/api/farmer/transaction-history/${user.id}`);
      setTransactionHistory(response.data || []);
    } catch (error) {
      console.log("HISTORY FETCH ERROR:", error);
    }
  };

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-green-100
      to-white
      p-6
    ">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8">

        <h1 className="
          text-5xl
          font-bold
          text-green-700
        ">

          Welcome Farmer

        </h1>

        <p className="
          text-xl
          text-gray-700
          mt-3
        ">

          {user.username}

        </p>

        <div className="mt-6 max-w-xl">
          <TraceabilitySearchBar />
        </div>

      </div>

      {/* ================================= */}
      {/* NOTIFICATIONS */}
      {/* ================================= */}

      <div className="mb-16">

        <h2 className="
          text-5xl
          font-bold
          text-green-700
          mb-8
        ">

          Auction Notifications

        </h2>

        <div className="
          grid
          md:grid-cols-2
          gap-8
        ">

          {notifications.length === 0 ? (

            <div className="
              bg-white/20
              backdrop-blur-lg
              rounded-3xl
              p-8
              shadow-2xl
              text-gray-700
            ">

              No auction notifications yet.

            </div>

          ) : (

            notifications.map(

              (notification) => (

                <div
                  key={notification.id}
                  className="
                    bg-white/20
                    backdrop-blur-lg
                    rounded-3xl
                    p-8
                    shadow-2xl
                  "
                >

                  <NotificationCard
                    notification={notification}
                  />

                  {/* PAYMENT QR */}

                  <div className="mt-8">

                    <button

                      disabled={
                        !notification.farmer_qr_enabled
                      }

                      onClick={() =>
                        setSelectedAuction(
                          notification
                        )
                      }

                      className={`
                        px-6
                        py-3
                        rounded-2xl
                        font-bold
                        text-white
                        mr-4

                        ${notification.farmer_qr_enabled

                          ? "bg-green-600 hover:bg-green-700"

                          : "bg-gray-400 cursor-not-allowed"}
                      `}
                    >

                      {notification.farmer_qr_enabled

                        ? "Upload Payment QR"

                        : "🔒 Upload Payment QR"}

                    </button>

                    {/* SEND CROPS */}

                    <button

                      disabled={
                        !notification.send_crops_enabled
                      }

                      onClick={() =>
                        setSelectedAuction(
                          notification
                        )
                      }

                      className={`
                        px-6
                        py-3
                        rounded-2xl
                        font-bold
                        text-white

                        ${notification.send_crops_enabled

                          ? "bg-blue-600 hover:bg-blue-700"

                          : "bg-gray-400 cursor-not-allowed"}
                      `}
                    >

                      {notification.send_crops_enabled

                        ? "Send Crops"
                        : "🔒 Send Crops"}
                    </button>

                    {/* STATUS MESSAGE FOR COMPLETED */}
                    {notification.delivery_status === "Amount Transferred" && (
                      <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-2xl font-bold text-center border-2 border-green-200">
                        ✅ Transaction Fully Completed & Payment Received
                      </div>
                    )}
                  </div>

                  {/* TIMELINE */}
                  <div className="mt-4 mb-6">
                    <DeliveryTimeline auctionId={notification.auction_id} />
                  </div>

                  {/* PAYMENT QR COMPONENT */}

                  {selectedAuction?.auction_id ===
                    notification.auction_id

                    &&

                    notification.farmer_qr_enabled && (

                    <PaymentQRUpload

                      auctionId={
                        notification.auction_id
                      }

                      farmerId={user.id}
                    />
                  )}

                  {/* SEND CROPS FORM */}

                  {selectedAuction?.auction_id ===
                    notification.auction_id

                    &&

                    notification.send_crops_enabled && (

                    <SendCropsForm

                      auction={notification}
                    />
                  )}

                </div>
              )
            )

          )}

        </div>

      </div>

      {/* ================================= */}
      {/* CROP FORM */}
      {/* ================================= */}

      <CropListingForm
        onCropAdded={() => {

          fetchCrops();

          fetchLiveBids();
        }}
      />

      {/* ================================= */}
      {/* MY CROPS */}
      {/* ================================= */}

      <div className="mt-12">

        <h2 className="
          text-4xl
          font-bold
          text-green-700
          mb-8
        ">

          My Listed Crops

        </h2>

        <div className="
          grid
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">

          {crops.map((crop) => (

            <CropCard
              key={crop.id}
              crop={crop}
            />
          ))}

        </div>

      </div>

      {/* ================================= */}
      {/* LIVE BIDS */}
      {/* ================================= */}

      <div className="mt-16">

        <h2 className="
          text-5xl
          font-bold
          text-green-700
          mb-8
        ">

          Live Crop Bids

        </h2>

        <div className="
          grid
          md:grid-cols-2
          gap-8
        ">

          {liveBids.length === 0 ? (

            <div className="
              bg-white/20
              backdrop-blur-lg
              rounded-3xl
              p-8
              shadow-2xl
              text-gray-700
            ">

              No live bids yet.

            </div>

          ) : (

            liveBids.map((item, index) => {

              const bids = item.bids || [];

              const highestBid = bids[0];

              const latestBid = [
                ...bids
              ].sort(
                (a, b) =>
                  new Date(
                    b.created_at
                  ) - new Date(
                    a.created_at
                  )
              )[0];

              const totalBidders = new Set(
                bids.map(
                  (bid) => bid.bidder_id
                )
              ).size;

              return (

                <div
                  key={index}
                  className="
                    bg-white/20
                    backdrop-blur-lg
                    rounded-3xl
                    p-8
                    shadow-2xl
                  "
                >

                  <div className="
                    flex
                    items-center
                    justify-between
                    mb-4
                  ">

                    <h3 className="
                      text-3xl
                      font-bold
                      text-green-700
                    ">

                      {item.crop.crop_name}

                    </h3>

                    <span className="
                      inline-flex
                      items-center
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      font-semibold
                      bg-green-600
                      text-white
                    ">

                      {item.auction?.auction_status || "active"}

                    </span>

                  </div>

                  <div className="space-y-3 text-gray-700">

                    <p>
                      Quantity:
                      {" "}
                      {item.crop.quantity}
                      {" "}
                      {item.crop.unit}
                    </p>

                    <p>
                      Base Auction Price:
                      {" "}
                      ₹{item.crop.expected_price}
                    </p>

                    {item.auction?.auction_end && (

                      <div className="mt-4">

                        <AuctionTimer
                          auctionEnd={
                            item.auction?.auction_end
                          }
                          status={
                            item.auction?.auction_status
                          }
                        />

                      </div>
                    )}

                    <p>
                      Highest Bid:
                      {" "}

                      {highestBid

                        ? `₹${highestBid.bid_amount}`

                        : "No bids yet"}
                    </p>

                    <p>
                      Latest Bid:
                      {" "}

                      {latestBid

                        ? `₹${latestBid.bid_amount} by ${latestBid.bidder_role}`

                        : "No updates"}
                    </p>

                    <p>
                      Total Bidders:
                      {" "}
                      {totalBidders}
                    </p>

                    <button
                      onClick={() => setShowHistory(item.crop.id)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      View Bid History
                    </button>

                  </div>

                </div>
              );

            })

          )}

        </div>

      </div>

      {showHistory && (
        <BidHistoryModal
          cropId={showHistory}
          closeModal={() => setShowHistory(null)}
        />
      )}

      {/* ================================= */}
      {/* TRANSACTION HISTORY */}
      {/* ================================= */}

      <div className="mt-20 mb-20">
        <h2 className="text-5xl font-bold text-green-700 mb-10">
          Transaction History
        </h2>

        {transactionHistory.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-10 text-center text-gray-600 text-xl font-semibold shadow-xl border border-white/20">
            No completed transactions yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {transactionHistory.map((transaction) => (
              <TransactionHistoryCard 
                key={transaction.id} 
                result={transaction} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default FarmerDashboard;