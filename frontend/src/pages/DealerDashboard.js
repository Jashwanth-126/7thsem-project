import {
  useEffect,
  useState
} from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

import CropRequestForm
from "../components/CropRequestForm";

import RequestCard
from "../components/RequestCard";

import Marketplace
from "./Marketplace";

import MatchedCropCard
from "../components/MatchedCropCard";

import EscrowPaymentModal from "../components/EscrowPaymentModal";
import QRScannerModal from "../components/QRScannerModal";
import DeliveryTimeline from "../components/DeliveryTimeline";
import TraceabilitySearchBar from "../components/TraceabilitySearchBar";

function DealerDashboard() {

  // ======================================
  // USER
  // ======================================

  const storedUser = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  );

  const user = storedUser?.user;

  // ======================================
  // STATES
  // ======================================

  const [requests,
    setRequests] =
      useState([]);

  const [matches,
    setMatches] =
      useState([]);

  const [notifications,
    setNotifications] =
      useState([]);

  const [selectedAuction,
    setSelectedAuction] =
      useState(null);

  const [editingRequest, setEditingRequest] = useState(null);
  const [scanningAuction, setScanningAuction] = useState(null);

  // ======================================
  // FETCH REQUESTS
  // ======================================

  const fetchRequests =
    async () => {

      try {

        const response =
          await API.get(
            `/api/dealer/requests/${user.id}`
          );

        setRequests(
          response.data.requests || []
        );

      } catch (error) {

        console.log(
          "REQUEST FETCH ERROR:",
          error
        );
      }
    };

  // ======================================
  // FETCH MATCHES
  // ======================================

  const fetchMatches =
    async () => {

      try {

        const response =
          await API.get(
            `/api/matches/dealer/${user.id}`
          );

        setMatches(
          response.data.matches || []
        );

      } catch (error) {

        console.log(
          "MATCH FETCH ERROR:",
          error
        );
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
            `/api/notifications/dealer/${user.id}`
          );

        console.log(
          "DEALER NOTIFICATIONS:",
          response.data
        );

        setNotifications([
          ...(response.data.notifications || [])
        ]);

      } catch (error) {

        console.log(
          "NOTIFICATION ERROR:",
          error
        );
      }
    };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    if (!user?.id) return;

    fetchRequests();

    fetchMatches();

    fetchNotifications();

    // ==================================
    // AUTO REFRESH
    // ==================================

    const interval =
      setInterval(() => {

        fetchNotifications();

      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  // ======================================
  // DELETE REQUEST
  // ======================================

  const deleteRequest =
    async (id) => {

      try {

        await API.delete(
          `/api/dealer/delete-request/${id}`
        );

        toast.success(
          "Request Deleted"
        );

        fetchRequests();

      } catch (error) {

        console.log(error);

        toast.error(
          "Delete failed"
        );
      }
    };

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-blue-100
      to-white
      p-6
    ">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <h1 className="
        text-5xl
        font-bold
        text-blue-700
        mb-8
      ">

        Dealer Dashboard

      </h1>

      <div className="mb-8 max-w-2xl">
        <TraceabilitySearchBar />
      </div>

      {/* ================================= */}
      {/* AUCTION NOTIFICATIONS */}
      {/* ================================= */}

      <div className="mb-16">

        <h2 className="
          text-5xl
          font-bold
          text-blue-700
          mb-8
        ">

          Auction Win Notifications

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
              text-xl
              font-semibold
            ">

              No auction notifications yet.

            </div>

          ) : (

            notifications.map(

              (notification, index) => (

                <div

                  key={
                    notification.id ||
                    index
                  }

                  className="
                    bg-white/20
                    backdrop-blur-lg
                    rounded-3xl
                    p-8
                    shadow-2xl
                    border
                    border-white/20
                  "
                >

                  {/* ====================== */}
                  {/* TITLE */}
                  {/* ====================== */}

                  <h2 className="
                    text-4xl
                    font-bold
                    text-blue-700
                    mb-6
                  ">

                    Auction Won

                  </h2>

                  {/* ====================== */}
                  {/* DETAILS */}
                  {/* ====================== */}

                  <div className="
                    space-y-4
                    text-gray-700
                    text-lg
                  ">

                    <p>
                      <span className="font-bold">
                        Crop:
                      </span>
                      {" "}
                      {notification.crop_name}
                    </p>

                    <p>
                      <span className="font-bold">
                        Category:
                      </span>
                      {" "}
                      {notification.crop_category}
                    </p>

                    <p>
                      <span className="font-bold">
                        Quantity:
                      </span>
                      {" "}
                      {notification.crop_quantity}
                    </p>

                    <p>
                      <span className="font-bold">
                        Winning Bid:
                      </span>
                      {" "}
                      ₹{notification.final_bid}
                    </p>

                    <p>
                      <span className="font-bold">
                        Farmer:
                      </span>
                      {" "}
                      {notification.farmer_name}
                    </p>

                    <p>
                      <span className="font-bold">
                        Farmer Email:
                      </span>
                      {" "}
                      {notification.farmer_email}
                    </p>

                    <p>
                      <span className="font-bold">
                        Farmer Phone:
                      </span>
                      {" "}
                      {notification.farmer_phone}
                    </p>

                    <p>
                      <span className="font-bold">
                        District:
                      </span>
                      {" "}
                      {notification.farmer_district}
                    </p>

                    <p>
                      <span className="font-bold">
                        Escrow Status:
                      </span>
                      {" "}
                      {notification.escrow_status}
                    </p>

                  </div>

                  {/* ====================== */}
                  {/* TIMELINE */}
                  {/* ====================== */}
                  <div className="mt-4 mb-6">
                    <DeliveryTimeline auctionId={notification.auction_id} />
                  </div>

                  {/* ====================== */}
                  {/* BUTTONS */}
                  {/* ====================== */}

                  <div className="mt-8 flex flex-wrap gap-4">

                    <button

                      disabled={
                        notification.escrow_enabled !== true || notification.escrow_status === "Verified" || notification.escrow_status === "Payment Submitted"
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
                        transition-all
                        duration-300

                        ${(notification.escrow_enabled === true && notification.escrow_status !== "Verified" && notification.escrow_status !== "Payment Submitted")

                          ? "bg-blue-600 hover:bg-blue-700"

                          : "bg-gray-400 cursor-not-allowed"}
                      `}
                    >

                      {notification.escrow_status === "Verified" || notification.escrow_status === "Payment Submitted"
                        ? "✅ Payment Processed"
                        : notification.escrow_enabled === true
                          ? "Proceed With Payment"
                          : "🔒 Escrow Not Enabled Yet"}

                    </button>

                    <button
                      onClick={() => setScanningAuction(notification)}
                      disabled={notification.delivery_status !== "Delivery QR Generated"}
                      className={`
                        px-6
                        py-3
                        rounded-2xl
                        font-bold
                        text-white
                        transition-all
                        duration-300
                        ${notification.delivery_status === "Delivery QR Generated"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : notification.delivery_status === "QR Verified" || notification.delivery_status === "Delivery Completed" || notification.delivery_status === "Amount Transferred"
                            ? "bg-green-600 cursor-default"
                            : "bg-gray-400 cursor-not-allowed"}
                      `}
                    >
                      {notification.delivery_status === "Amount Transferred"
                        ? "✅ Transaction Fully Completed"
                        : notification.delivery_status === "QR Verified" || notification.delivery_status === "Delivery Completed"
                          ? "✅ Delivery Verified"
                          : notification.delivery_status === "Delivery QR Generated"
                            ? "Verify Receipt (Scan QR)"
                            : "🚚 Waiting for Dispatch"}
                    </button>

                  </div>

                  {/* ====================== */}
                  {/* MODALS */}
                  {/* ====================== */}

                  {selectedAuction?.auction_id === notification.auction_id && (
                    <EscrowPaymentModal
                      auction={notification}
                      onClose={() => setSelectedAuction(null)}
                    />
                  )}

                  {scanningAuction?.auction_id === notification.auction_id && (
                    <QRScannerModal
                      auction={notification}
                      onClose={() => setScanningAuction(null)}
                      refresh={fetchNotifications}
                    />
                  )}

                </div>
              )
            )

          )}

        </div>

      </div>

      {/* ================================= */}
      {/* REQUEST FORM */}
      {/* ================================= */}

      <CropRequestForm

        role="dealer"

        userId={user.id}

        refreshRequests={
          fetchRequests
        }

        editingRequest={
          editingRequest
        }

        setEditingRequest={
          setEditingRequest
        }
      />

      {/* ================================= */}
      {/* MY REQUESTS */}
      {/* ================================= */}

      <h2 className="
        text-4xl
        font-bold
        text-blue-700
        mb-8
      ">

        My Requests

      </h2>

      <div className="
        grid
        md:grid-cols-2
        lg:grid-cols-3
        gap-6
      ">

        {requests.map((request) => (

          <RequestCard

            key={request.id}

            request={request}

            onDelete={
              deleteRequest
            }

            onEdit={
              setEditingRequest
            }
          />
        ))}

      </div>

      {/* ================================= */}
      {/* MATCHED CROPS */}
      {/* ================================= */}

      <div className="mt-16">

        <h2 className="
          text-4xl
          font-bold
          text-blue-700
          mb-8
        ">

          Matched Crop Opportunities

        </h2>

        <div className="
          grid
          md:grid-cols-2
          lg:grid-cols-3
          gap-8
        ">

          {matches.map((crop) => (

            <MatchedCropCard

              key={crop.id}

              crop={crop}
            />
          ))}

        </div>

      </div>

      {/* ================================= */}
      {/* MARKETPLACE */}
      {/* ================================= */}

      <Marketplace />

    </div>
  );
}

export default DealerDashboard;