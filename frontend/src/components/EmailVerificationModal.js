import { useState, useEffect } from "react";

function EmailVerificationModal({

  open,

  otp,

  setOtp,

  verifyOtp,

  resendOtp,

  loading

}) {

  const [timer, setTimer] =
    useState(300);

  useEffect(() => {

    if (!open) return;

    const interval = setInterval(() => {

      setTimer((prev) => {

        if (prev <= 1) {

          clearInterval(interval);

          return 0;
        }

        return prev - 1;
      });

    }, 1000);

    return () =>
      clearInterval(interval);

  }, [open]);

  if (!open) return null;

  return (

    <div className="
      fixed
      inset-0
      bg-black/40
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
        max-w-md
        shadow-2xl
      ">

        <h2 className="
          text-3xl
          font-bold
          text-green-700
          mb-4
        ">

          Verify OTP

        </h2>

        <p className="
          text-gray-600
          mb-5
        ">

          Enter the OTP sent to your email

        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value)
          }
          placeholder="Enter 4-digit OTP"
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
          mb-5
        ">

          OTP expires in:
          {" "}
          {Math.floor(timer / 60)}:
          {(timer % 60)
            .toString()
            .padStart(2, "0")}

        </p>

        <button
          onClick={verifyOtp}
          className="
            w-full
            bg-green-600
            hover:bg-green-700
            text-white
            p-3
            rounded-xl
            mb-3
          "
        >

          {loading
            ? "Verifying..."
            : "Verify OTP"}

        </button>

        <button
          onClick={resendOtp}
          className="
            w-full
            border
            border-green-600
            text-green-700
            p-3
            rounded-xl
          "
        >

          Resend OTP

        </button>

      </div>

    </div>
  );
}

export default EmailVerificationModal;