import {
  useEffect,
  useState
} from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

import PendingRequests
from "../components/PendingRequests";

import PFOCropVerification
from "./PFOCropVerification";

import PFOAuctionCard
from "../components/PFOAuctionCard";

import TransactionHistoryCard from "../components/TransactionHistoryCard";

function PFODashboard() {

  // ======================================
  // LOGGED USER
  // ======================================

  const storedUser = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  );

  const user = storedUser?.user;

  // ======================================
  // STATES
  // ======================================

  const [farmers, setFarmers] =
    useState([]);

  const [dealers, setDealers] =
    useState([]);

  const [liveAuctions,
    setLiveAuctions] =
      useState([]);

  const [transactionHistory, setTransactionHistory] = useState([]);

  // ======================================
  // FETCH REQUESTS
  // ======================================

  const fetchRequests =
    async () => {

      try {

        const response =
          await API.get(

            `/api/pfo/pending/${user.district}`
          );

        setFarmers(
          response.data.farmers || []
        );

        setDealers(
          response.data.dealers || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  // ======================================
  // FETCH LIVE AUCTIONS
  // ======================================

  const fetchLiveAuctions =
    async () => {

      try {

        const response =
          await API.get(

            `/api/pfo/live-auctions/${user.district}`
          );

        setLiveAuctions(
          response.data.auctions || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  // ======================================
  // CLOSE AUCTION
  // ======================================

  const closeAuction =
    async (cropId) => {

      try {

        await API.post(

          `/api/auction/close/${cropId}`
        );

        toast.success(
          "Auction Closed"
        );

        fetchLiveAuctions();

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to close auction"
        );
      }
    };

  // ======================================
  // FINALIZE AUCTION
  // ======================================

  const finalizeAuction =
    async (cropId) => {

      try {

        await API.post(

          `/api/auction/finalize/${cropId}`
        );

        toast.success(
          "Winner Finalized"
        );

        fetchLiveAuctions();
        fetchTransactionHistory();

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to finalize winner"
        );
      }
    };

  // ======================================
  // FETCH TRANSACTION HISTORY
  // ======================================

  const fetchTransactionHistory = async () => {
    try {
      const response = await API.get(`/api/pfo/transaction-history/${user.district}`);
      setTransactionHistory(response.data || []);
    } catch (error) {
      console.log("HISTORY FETCH ERROR:", error);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    fetchRequests();
    fetchLiveAuctions();
    fetchTransactionHistory();

    const interval = setInterval(() => {
      fetchLiveAuctions();
      fetchTransactionHistory();
    }, 15000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-green-100
      via-white
      to-green-50
      p-6
    ">

      {/* ================================= */}
      {/* WELCOME SECTION */}
      {/* ================================= */}

      <div className="
        bg-white
        rounded-3xl
        shadow-lg
        p-8
        mb-8
      ">

        <h1 className="
          text-4xl
          font-bold
          text-green-700
          mb-4
        ">

          Welcome PFO

        </h1>

        <div className="
          grid
          md:grid-cols-2
          gap-6
        ">

          {/* Username */}
          <div className="
            bg-green-50
            p-5
            rounded-2xl
          ">

            <p className="
              text-gray-500
              mb-1
            ">

              Username

            </p>

            <h2 className="
              text-2xl
              font-bold
              text-green-700
            ">

              {user?.username}

            </h2>

          </div>

          {/* District */}
          <div className="
            bg-green-50
            p-5
            rounded-2xl
          ">

            <p className="
              text-gray-500
              mb-1
            ">

              Allocated District

            </p>

            <h2 className="
              text-2xl
              font-bold
              text-green-700
            ">

              {user?.district}

            </h2>

          </div>

        </div>

      </div>

      {/* ================================= */}
      {/* FARMER REQUESTS */}
      {/* ================================= */}

      <PendingRequests
        requests={farmers}
        role="farmer"
        refreshRequests={fetchRequests}
        pfoId={user.id}
      />

      {/* ================================= */}
      {/* DEALER REQUESTS */}
      {/* ================================= */}

      <div className="mt-8">

        <PendingRequests
          requests={dealers}
          role="dealer"
          refreshRequests={fetchRequests}
          pfoId={user.id}
        />

      </div>

      {/* ================================= */}
      {/* CROP VERIFICATION */}
      {/* ================================= */}

      <div className="mt-10">

        <PFOCropVerification />

      </div>

      {/* ================================= */}
      {/* LIVE AUCTION MONITORING */}
      {/* ================================= */}

      <div className="mt-16">

        <h1 className="
          text-5xl
          font-bold
          text-green-700
          mb-8
        ">

          Live Auction Monitoring

        </h1>

        <div className="
          grid
          md:grid-cols-2
          lg:grid-cols-3
          gap-8
        ">

          {liveAuctions.map((auction) => (

            <PFOAuctionCard

              key={auction.crop.id}

              auctionData={auction}

              closeAuction={
                closeAuction
              }

              finalizeAuction={
                finalizeAuction
              }
            />

          ))}

        </div>

      </div>

      {/* ================================= */}
      {/* TRANSACTION HISTORY */}
      {/* ================================= */}

      <div className="mt-20 mb-20">
        <h2 className="text-5xl font-bold text-green-700 mb-10">
          Transaction History
        </h2>

        {transactionHistory.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-10 text-center text-gray-600 text-xl font-semibold shadow-xl border border-white/20">
            No completed transactions yet in this district.
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

export default PFODashboard;