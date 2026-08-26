import { useState } from "react";
import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import API from "../services/api";

import DistrictDropdown
from "./DistrictDropdown";

import EmailVerificationModal
from "./EmailVerificationModal";

import {
  validatePassword
} from "../utils/validators";

function RegistrationForm() {

  // Role
  const [role, setRole] =
    useState("farmer");

  // Loading
  const [loading, setLoading] =
    useState(false);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] =
    useState(false);

  // OTP
  const [otp, setOtp] =
    useState("");

  // Form
  const [formData, setFormData] =
    useState({

      full_name: "",
      age: "",
      district: "",
      aadhaar: "",
      email: "",
      password: "",
      confirmPassword: "",
      acres: "",
      institution: ""

    });

  // Handle Change
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value
    });
  };

  // Username
  const username =
    formData.full_name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
    + "_" + role;

  // Send OTP
  const sendOtp = async (e) => {

    e.preventDefault();

    // Password Check
    if (
      !validatePassword(
        formData.password
      )
    ) {

      toast.error(
        "Weak password"
      );

      return;
    }

    // Password Match
    if (
      formData.password !==
      formData.confirmPassword
    ) {

      toast.error(
        "Passwords do not match"
      );

      return;
    }

    try {

      setLoading(true);

      toast.loading(
        "Sending OTP...",
        {
          id: "otp-toast"
        }
      );

      // Retailer/Customer OTP
      if (
        role === "retailer" ||
        role === "customer"
      ) {

        await API.post(

          "/api/send-otp",

          {
            email:
              formData.email
          }
        );

        setShowOtpModal(true);

        toast.success(

          "OTP Sent Successfully",

          {
            id: "otp-toast"
          }
        );
      }

      // Farmer/Dealer
      else {

        await API.post(

          "/api/register",

          {

            ...formData,

            role,

            username
          }
        );

        // Show OTP modal immediately so user can verify
        setShowOtpModal(true);

        toast.success(

          "OTP Sent. Verify to complete registration",

          {
            id: "otp-toast"
          }
        );
      }

    } catch (error) {

      toast.error(

        error?.response?.data?.message ||

        "Registration failed",

        {
          id: "otp-toast"
        }
      );

    } finally {

      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {

    try {

      setLoading(true);

      toast.loading(
        "Verifying OTP...",
        {
          id: "verify-toast"
        }
      );

      await API.post(

        "/api/verify-otp-register",

        {

          ...formData,

          role,

          username,

          otp
        }
      );

      toast.success(

        "Registration Successful",

        {
          id: "verify-toast"
        }
      );

      setShowOtpModal(false);

      // Reset Form
      setFormData({

        full_name: "",
        age: "",
        district: "",
        aadhaar: "",
        email: "",
        password: "",
        confirmPassword: "",
        acres: "",
        institution: ""

      });

      setOtp("");

    } catch (error) {

      toast.error(

        error?.response?.data?.message ||

        "OTP Verification Failed",

        {
          id: "verify-toast"
        }
      );

    } finally {

      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {

    try {

      await API.post(

        "/api/send-otp",

        {
          email:
            formData.email
        }
      );

      toast.success(
        "OTP Resent"
      );

    } catch (error) {

      toast.error(
        "Failed to resend OTP"
      );
    }
  };

  return (

    <>
      <div className="
        w-full
        max-w-5xl
        bg-white/20
        backdrop-blur-lg
        rounded-3xl
        p-10
        shadow-2xl
      ">

        <h1 className="
          text-5xl
          font-bold
          text-green-700
          mb-10
        ">
          Registration Portal
        </h1>

        <form
          onSubmit={sendOtp}
          className="
            grid
            md:grid-cols-2
            gap-6
          "
        >

          {/* Role */}
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="
              p-4
              rounded-2xl
              border
            "
          >

            <option value="farmer">
              Farmer
            </option>

            <option value="dealer">
              Dealer
            </option>

            <option value="retailer">
              Retailer
            </option>

            <option value="customer">
              Customer
            </option>

          </select>

          {/* Full Name */}
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            className="
              p-4
              rounded-2xl
              border
            "
            required
          />

          {/* Username */}
          <input
            type="text"
            value={username}
            readOnly
            className="
              p-4
              rounded-2xl
              border
              bg-gray-100
            "
          />

          {/* District */}
          <DistrictDropdown
            value={formData.district}
            onChange={(e) =>
              setFormData({

                ...formData,

                district:
                  e.target.value
              })
            }
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="
              p-4
              rounded-2xl
              border
            "
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="
              p-4
              rounded-2xl
              border
            "
            required
          />

          {/* Confirm */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="
              p-4
              rounded-2xl
              border
            "
            required
          />

          {/* Farmer */}
          {role === "farmer" && (

            <>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="
                  p-4
                  rounded-2xl
                  border
                "
                required
              />

              <input
                type="text"
                name="aadhaar"
                placeholder="Aadhaar Number"
                value={formData.aadhaar}
                onChange={handleChange}
                className="
                  p-4
                  rounded-2xl
                  border
                "
                required
              />

              <input
                type="number"
                name="acres"
                placeholder="Total Acres of Land"
                value={formData.acres}
                onChange={handleChange}
                className="
                  p-4
                  rounded-2xl
                  border
                "
                required
              />
            </>
          )}

          {/* Dealer */}
          {role === "dealer" && (

            <>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="
                  p-4
                  rounded-2xl
                  border
                "
                required
              />

              <input
                type="text"
                name="aadhaar"
                placeholder="Aadhaar Number"
                value={formData.aadhaar}
                onChange={handleChange}
                className="
                  p-4
                  rounded-2xl
                  border
                "
                required
              />

              <input
                type="text"
                name="institution"
                placeholder="Institution Name"
                value={formData.institution}
                onChange={handleChange}
                className="
                  p-4
                  rounded-2xl
                  border
                "
                required
              />
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              bg-green-600
              hover:bg-green-700
              text-white
              p-4
              rounded-2xl
              font-bold
              md:col-span-2
            "
          >

            {loading
              ? "Processing..."
              : "Register"}

          </button>

          {/* Already have an account? Sign In */}
          <div className="md:col-span-2 text-center mt-3 pt-1">
            <span className="text-gray-700 text-sm font-medium">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-green-700 hover:text-green-800 font-bold text-sm underline hover:no-underline transition-colors ml-1"
            >
              Sign In
            </Link>
          </div>

        </form>

      </div>

      {/* OTP MODAL */}
      <EmailVerificationModal
        open={showOtpModal}
        otp={otp}
        setOtp={setOtp}
        verifyOtp={verifyOtp}
        resendOtp={resendOtp}
        loading={loading}
      />
    </>
  );
}

export default RegistrationForm;