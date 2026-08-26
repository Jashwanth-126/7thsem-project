import {
  useEffect,
  useState
} from "react";

import Sidebar
from "../components/Sidebar";

import CreatePFOForm
from "../components/CreatePFOForm";

import PFOList
from "../components/PFOList";

import AdminAuctionCard
from "../components/AdminAuctionCard";

import PendingEscrowCard
from "../components/PendingEscrowCard";

import EscrowQRUpload
from "../components/EscrowQRUpload";

import API
from "../services/api";

import TraceabilitySearchBar from "../components/TraceabilitySearchBar";

function AdminDashboard() {

  // ======================================
  // STATES
  // ======================================

  const [pfos, setPFOs] =
    useState([]);

  const [
    completedAuctions,
    setCompletedAuctions
  ] = useState([]);

  const [
    pendingPayments,
    setPendingPayments
  ] = useState([]);

  // ======================================
  // FETCH PFOs
  // ======================================

  const fetchPFOs =
    async () => {

      try {

        const response =
          await API.get(
            "/api/pfo/all"
          );

        setPFOs(
          response.data || []
        );

      } catch (error) {

        console.log(
          "PFO FETCH ERROR:",
          error
        );
      }
    };

  // ======================================
  // FETCH COMPLETED AUCTIONS
  // ======================================

  const fetchCompletedAuctions =
    async () => {

      try {

        const response =
          await API.get(

            "/api/admin/completed-auctions"
          );

        console.log(
          "COMPLETED AUCTIONS:",
          response.data
        );

        setCompletedAuctions(
          response.data || []
        );

      } catch (error) {

        console.log(

          "COMPLETED AUCTION ERROR:",

          error
        );
      }
    };

  // ======================================
  // FETCH PENDING PAYMENTS
  // ======================================

  const fetchPendingPayments =
    async () => {

      try {

        const response =
          await API.get(

            "/api/payment/admin/pending-payments"
          );

        console.log(
          "PENDING PAYMENTS:",
          response.data
        );

        setPendingPayments(
          response.data.data || []
        );

      } catch (error) {

        console.log(

          "PAYMENT FETCH ERROR:",

          error
        );
      }
    };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchPFOs();

    fetchCompletedAuctions();
    fetchPendingPayments();

    const interval = setInterval(() => {
      fetchCompletedAuctions();
      fetchPendingPayments();
    }, 10000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="
      flex
      bg-gradient-to-br
      from-green-100
      via-white
      to-green-50
      min-h-screen
    ">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <div className="
        flex-1
        p-6
        space-y-10
        overflow-y-auto
      ">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="
          bg-white/30
          backdrop-blur-lg
          rounded-3xl
          shadow-xl
          p-8
        ">

          <h1 className="
            text-5xl
            font-bold
            text-green-700
          ">

            Admin Dashboard

          </h1>

          <p className="
            text-gray-600
            mt-3
            text-lg
          ">

            Manage PFO accounts,
            district allocation,
            auctions,
            escrow payments,
            and crop dispatch workflow

          </p>

          <div className="mt-6 max-w-2xl">
            <TraceabilitySearchBar />
          </div>

        </div>

        {/* ================================= */}
        {/* ESCROW QR UPLOAD */}
        {/* ================================= */}
        
        <EscrowQRUpload />

        {/* ================================= */}
        {/* CREATE PFO */}
        {/* ================================= */}

        <div className="
          bg-white/20
          backdrop-blur-lg
          rounded-3xl
          shadow-xl
          p-6
        ">

          <CreatePFOForm
            refreshPFOs={fetchPFOs}
          />

        </div>

        {/* ================================= */}
        {/* PFO LIST */}
        {/* ================================= */}

        <div className="
          bg-white/20
          backdrop-blur-lg
          rounded-3xl
          shadow-xl
          p-6
        ">

          <PFOList

            pfos={pfos}

            refreshPFOs={
              fetchPFOs
            }
          />

        </div>

        {/* ================================= */}
        {/* COMPLETED AUCTIONS */}
        {/* ================================= */}

        <div>

          <div className="
            mb-8
          ">

            <h2 className="
              text-5xl
              font-bold
              text-green-700
            ">

              Completed Auction Results

            </h2>

            <p className="
              text-gray-600
              mt-3
              text-lg
            ">

              View finalized auctions,
              winning bids,
              farmer details,
              escrow status,
              and dispatch workflow

            </p>

          </div>

          {/* EMPTY */}

          {completedAuctions.length === 0 && (

            <div className="
              bg-yellow-100
              text-yellow-700
              p-6
              rounded-3xl
              text-xl
              font-semibold
            ">

              No completed auctions available

            </div>
          )}

          {/* AUCTIONS */}

          <div className="
            grid
            md:grid-cols-2
            gap-8
          ">

            {completedAuctions.map(

              (result) => (

                <AdminAuctionCard

                  key={result.id}

                  result={result}
                />
              )
            )}

          </div>

        </div>

        {/* ================================= */}
        {/* PENDING ESCROW PAYMENTS */}
        {/* ================================= */}

        <div className="mt-16">

          <div className="
            mb-8
          ">

            <h2 className="
              text-5xl
              font-bold
              text-green-700
            ">

              Pending Escrow Payments

            </h2>

            <p className="
              text-gray-600
              mt-3
              text-lg
            ">

              Verify dealer/retailer
              payment proofs before
              enabling crop dispatch

            </p>

          </div>

          {/* EMPTY */}

          {pendingPayments.length === 0 && (

            <div className="
              bg-yellow-100
              text-yellow-700
              p-6
              rounded-3xl
              text-xl
              font-semibold
            ">

              No pending escrow payments

            </div>
          )}

          {/* PAYMENT CARDS */}

          <div className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-8
          ">

            {pendingPayments.map(

              (payment) => (

                <PendingEscrowCard

                  key={payment.id}

                  payment={payment}

                  refresh={
                    fetchPendingPayments
                  }
                />
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;