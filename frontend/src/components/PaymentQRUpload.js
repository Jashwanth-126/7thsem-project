import {
  useEffect,
  useState
} from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

function PaymentQRUpload({

  auctionId,
  farmerId

}) {

  const [qrImage,
    setQrImage] =
      useState(null);

  const [preview,
    setPreview] =
      useState("");

  const [loading,
    setLoading] =
      useState(false);

  const [alreadyUploaded,
    setAlreadyUploaded] =
      useState(false);

  const [uploadedQR,
    setUploadedQR] =
      useState("");

  // ======================================
  // CHECK EXISTING QR
  // ======================================

  const checkExistingQR =
    async () => {

      try {

        const response =
          await API.get(

            `/api/payment/farmer-qr/${auctionId}`
          );

        if (
          response.data &&
          response.data.length > 0
        ) {

          setAlreadyUploaded(true);

          setUploadedQR(
            response.data[0].qr_url
          );
        }

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    checkExistingQR();

  }, []);

  // ======================================
  // HANDLE IMAGE
  // ======================================

  const handleImage =
    (e) => {

      const file =
        e.target.files[0];

      setQrImage(file);

      setPreview(

        URL.createObjectURL(file)
      );
    };

  // ======================================
  // UPLOAD QR
  // ======================================

  const uploadQR =
    async () => {

      if (!qrImage) {

        toast.error(
          "Select QR image"
        );

        return;
      }

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "auction_id",
          auctionId
        );

        formData.append(
          "farmer_id",
          farmerId
        );

        formData.append(
          "qr_image",
          qrImage
        );

        const response =
          await API.post(

            "/api/payment/farmer/upload-qr",

            formData
          );

        toast.success(
          "Payment QR Uploaded"
        );

        setAlreadyUploaded(true);

        setUploadedQR(
          response.data.qr_url
        );

      } catch (error) {

        console.log(error);

        toast.error(

          error.response?.data?.error ||

          "Upload failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      shadow-2xl
      p-6
      mt-8
    ">

      <h2 className="
        text-3xl
        font-bold
        text-green-700
        mb-6
      ">

        Upload Payment QR

      </h2>

      {/* ================================= */}
      {/* ALREADY UPLOADED */}
      {/* ================================= */}

      {alreadyUploaded && (

        <div className="
          bg-green-100
          text-green-700
          p-4
          rounded-2xl
          font-semibold
          mb-6
        ">

          QR Already Uploaded

        </div>
      )}

      {/* ================================= */}
      {/* FILE INPUT */}
      {/* ================================= */}

      <input
        type="file"
        accept="image/*"

        disabled={alreadyUploaded}

        onChange={handleImage}

        className="
          w-full
          p-3
          rounded-xl
          bg-white
          mb-4
        "
      />

      {/* ================================= */}
      {/* PREVIEW */}
      {/* ================================= */}

      {preview && !alreadyUploaded && (

        <img
          src={preview}
          alt="QR Preview"
          className="
            w-64
            rounded-2xl
            shadow-lg
            mb-4
          "
        />
      )}

      {/* ================================= */}
      {/* UPLOADED QR */}
      {/* ================================= */}

      {uploadedQR && (

        <img
          src={uploadedQR}
          alt="Uploaded QR"
          className="
            w-64
            rounded-2xl
            shadow-lg
            mb-4
          "
        />
      )}

      {/* ================================= */}
      {/* BUTTON */}
      {/* ================================= */}

      <button

        onClick={uploadQR}

        disabled={
          loading ||
          alreadyUploaded
        }

        className={`

          px-6
          py-3
          rounded-2xl
          font-bold
          text-white

          ${alreadyUploaded

            ? "bg-gray-400 cursor-not-allowed"

            : "bg-green-600 hover:bg-green-700"}
        `}
      >

        {alreadyUploaded

          ? "QR Already Uploaded"

          : loading

            ? "Uploading..."

            : "Upload QR"}

      </button>

    </div>
  );
}

export default PaymentQRUpload;