import toast from "react-hot-toast";
import API from "../services/api";

function PendingEscrowCard({ payment, refresh }) {
  // ======================================
  // VERIFY PAYMENT
  // ======================================
  const verifyPayment = async () => {
    try {
      await API.post("/api/payment/admin/verify-payment", {
        auction_id: payment.auction_id,
        is_verified: true
      });

      toast.success("Payment Verified");
      refresh();
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-6">
      <img
        src={payment.payment_screenshot_url}
        alt="Payment Proof"
        className="w-full h-64 object-cover rounded-2xl mb-5"
      />

      <h2 className="text-2xl font-bold text-green-700 mb-3">
        UTR: {payment.utr_number}
      </h2>

      <p className="text-gray-700 mb-6">
        Auction ID: {payment.auction_id}
      </p>

      <button
        onClick={verifyPayment}
        className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold"
      >
        Verify Payment
      </button>
    </div>
  );
}

export default PendingEscrowCard;