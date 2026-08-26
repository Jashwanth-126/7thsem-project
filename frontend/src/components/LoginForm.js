import { useState } from "react";

import {
  Eye,
  EyeOff,
  Leaf
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import API from "../services/api";

import Loader from "./Loader";

function LoginForm() {

  const navigate = useNavigate();

  const [role, setRole] =
    useState("admin");

  const [formData, setFormData] =
    useState({

      username: "",
      password: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // Input Change
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  // Login
  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      toast.loading(
        "Authenticating...",
        {
          id: "login-toast"
        }
      );

      // Endpoint
      let endpoint =
        "/api/user/login";

      if (role === "admin") {

        endpoint =
          "/api/admin/login";
      }

      else if (role === "pfo") {

        endpoint =
          "/api/pfo/login";
      }

      else if (
        role === "retailer" ||
        role === "customer"
      ) {

        endpoint =
          "/api/retail-login";
      }

      // API
      const response =
        await API.post(

          endpoint,

          {

            role,

            username:
              formData.username,

            password:
              formData.password
          }
        );

      // Save User to tab-isolated sessionStorage
      sessionStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      toast.success(

        "Login Successful",

        {
          id: "login-toast"
        }
      );

      // Redirect
      if (role === "admin") {

        navigate(
          "/admin/dashboard"
        );
      }

      else if (role === "pfo") {

        navigate(
          "/pfo/dashboard"
        );
      }

      else if (role === "farmer") {

        navigate(
          "/farmer/dashboard"
        );
      }

      else if (role === "dealer") {

        navigate(
          "/dealer/dashboard"
        );
      }

      else if (role === "retailer") {

        navigate(
          "/retailer/dashboard"
        );
      }

      else {

        navigate(
          "/customer/dashboard"
        );
      }

    } catch (error) {

      toast.error(

        error?.response?.data?.message ||

        "Invalid Credentials",

        {
          id: "login-toast"
        }
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="w-full max-w-md">

      <div className="
        backdrop-blur-lg
        bg-white/20
        border border-white/30
        shadow-2xl
        rounded-3xl
        p-8
      ">

        {/* Logo */}
        <div className="
          flex
          justify-center
          mb-6
        ">

          <div className="
            w-20
            h-20
            bg-green-600
            rounded-full
            flex
            items-center
            justify-center
          ">

            <Leaf
              size={40}
              color="white"
            />

          </div>

        </div>

        {/* Title */}
        <h2 className="
          text-3xl
          font-bold
          text-center
          text-green-800
          mb-2
        ">
          KrishiMitra
        </h2>

        <p className="
          text-center
          text-gray-700
          mb-8
        ">
          Authentication Portal
        </p>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Role */}
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="
              w-full
              p-3
              rounded-xl
              border
            "
          >

            <option value="admin">
              Admin
            </option>

            <option value="pfo">
              PFO
            </option>

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

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            value={formData.username}
            onChange={handleChange}
            className="
              w-full
              p-3
              rounded-xl
              border
            "
            required
          />

          {/* Password */}
          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="
                w-full
                p-3
                rounded-xl
                border
              "
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-4
                top-3
              "
            >

              {showPassword
                ? <EyeOff />
                : <Eye />
              }

            </button>

          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              p-3
              rounded-xl
              font-semibold
            "
          >

            {loading
              ? <Loader />
              : "Login"}

          </button>

          {/* Register */}
          <div className="text-center">

            <p className="text-gray-700">

              New User?

            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
              className="
                mt-2
                text-green-700
                font-semibold
                hover:underline
              "
            >

              Register Here

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default LoginForm;