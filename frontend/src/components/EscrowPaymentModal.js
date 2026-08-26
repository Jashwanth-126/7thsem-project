import {
  useState,
  useEffect
} from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

function EscrowPaymentModal({

  auction,
  onClose

}) {

  const user = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  )?.user;

  const [utrNumber,
    setUtrNumber] =
      useState("");

  const [remarks,
    setRemarks] =
      useState("");

  const [screenshot,
    setScreenshot] =
      useState(null);

  const [loading, setLoading] = useState(false);
  const [adminQR, setAdminQR] = useState(null);

  // ======================================
  // FETCH ESCROW DETAILS (ADMIN QR)
  // ======================================
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await API.get(`/api/payment/dealer/escrow-details/${auction.auction_id}`);
        if (response.data.success && response.data.admin_qr) {
          setAdminQR(response.data.admin_qr);
        }
      } catch (error) {
        console.error("Failed to fetch admin QR:", error);
      }
    };
    fetchDetails();
  }, [auction.auction_id]);

  // ======================================
  // SUBMIT PAYMENT
  // ======================================

  const submitPayment =
    async () => {

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "auction_id",
          auction.auction_id
        );

        formData.append(
          "dealer_id",
          user.id
        );

        formData.append(
          "utr_number",
          utrNumber
        );

        formData.append(
          "remarks",
          remarks
        );

        formData.append(
          "payment_screenshot",
          screenshot
        );

        await API.post(

          "/api/payment/submit-payment-proof",

          formData
        );

        toast.success(
          "Payment Submitted"
        );

        onClose();

      } catch (error) {

        console.log(error);

        toast.error(
          "Submission failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      justify-center
      items-center
      z-50
    ">

      <div className="
        bg-white
        rounded-3xl
        p-8
        w-full
        max-w-2xl
      ">

        <h2 className="
          text-4xl
          font-bold
          text-green-700
          mb-6
        ">

          Escrow Payment

        </h2>

        {adminQR ? (
          <img
            src={adminQR}
            alt="Admin Escrow QR"
            className="w-72 h-72 object-contain rounded-2xl mb-6 mx-auto border-4 border-green-200"
          />
        ) : (
          <div className="w-72 h-72 bg-red-50 rounded-2xl mb-6 mx-auto flex flex-col items-center justify-center border-4 border-dashed border-red-300 text-center p-4">
            <span className="text-red-500 font-bold text-xl mb-2">QR Unavailable</span>
            <span className="text-red-400 text-sm">The platform Admin has not uploaded an active Escrow QR yet. Please wait.</span>
          </div>
        )}

        <input
          type="text"
          placeholder="UTR Number"
          value={utrNumber}
          onChange={(e) =>
            setUtrNumber(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
            mb-4
          "
        />

        <textarea
          placeholder="Remarks"
          value={remarks}
          onChange={(e) =>
            setRemarks(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
            mb-4
          "
        />

        <input
          type="file"
          onChange={(e) =>
            setScreenshot(
              e.target.files[0]
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            border
            mb-6
          "
        />

        <div className="
          flex
          gap-4
        ">

          <button

            onClick={submitPayment}

            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded-2xl
              font-bold
            "
          >

            {loading

              ? "Submitting..."

              : "Submit Payment"}

          </button>

          <button

            onClick={onClose}

            className="
              bg-red-500
              text-white
              px-6
              py-3
              rounded-2xl
              font-bold
            "
          >

            Close

          </button>

        </div>

      </div>

    </div>
  );
}

export default EscrowPaymentModal;