import { useState } from "react";

import toast from "react-hot-toast";

import API from "../services/api";

function PendingRequests({
  requests,
  role,
  refreshRequests,
  pfoId
}) {

  const [loadingId, setLoadingId] =
    useState(null);

  // =====================================
  // APPROVE USER
  // =====================================

  const approveUser = async (id) => {

    try {

      setLoadingId(id);

      toast.loading(

        "Verifying account and sending mail...",

        {
          id: "verify-toast"
        }
      );

      await API.post(

        "/api/pfo/approve",

        {

          role,

          user_id: id,

          pfo_id: pfoId
        }
      );

      toast.success(

        "Account verified successfully",

        {
          id: "verify-toast"
        }
      );

      refreshRequests();

    } catch (error) {

      console.log(error);

      toast.error(

        "Verification failed",

        {
          id: "verify-toast"
        }
      );

    } finally {

      setLoadingId(null);
    }
  };

  // =====================================
  // REJECT USER
  // =====================================

  const rejectUser = async (id) => {

    try {

      await API.post(

        "/api/pfo/reject",

        {

          role,

          user_id: id
        }
      );

      toast.success(
        "Request rejected"
      );

      refreshRequests();

    } catch (error) {

      toast.error(
        "Rejection failed"
      );
    }
  };

  return (

    <div className="
      bg-white
      rounded-3xl
      shadow-xl
      p-8
    ">

      {/* Heading */}
      <h2 className="
        text-3xl
        font-bold
        text-green-700
        mb-8
      ">

        Pending {role} Requests

      </h2>

      {/* No Requests */}
      {requests.length === 0 && (

        <div className="
          text-center
          text-gray-500
          py-10
        ">

          No Pending Requests

        </div>
      )}

      {/* Requests */}
      <div className="space-y-6">

        {requests.map((user) => (

          <div
            key={user.id}
            className="
              border
              border-green-200
              rounded-3xl
              p-6
              bg-green-50
              shadow-md
            "
          >

            {/* Name */}
            <h3 className="
              text-2xl
              font-bold
              text-green-700
              mb-5
            ">

              {user.full_name}

            </h3>

            {/* Details Grid */}
            <div className="
              grid
              md:grid-cols-2
              gap-4
              text-gray-700
            ">

              {/* Username */}
              <p>

                <strong>
                  Username:
                </strong>

                {" "}

                {user.username}

              </p>

              {/* Age */}
              <p>

                <strong>
                  Age:
                </strong>

                {" "}

                {user.age}

              </p>

              {/* District */}
              <p>

                <strong>
                  District:
                </strong>

                {" "}

                {user.district}

              </p>

              {/* Email */}
              <p>

                <strong>
                  Email:
                </strong>

                {" "}

                {user.email}

              </p>

              {/* Role */}
              <p>

                <strong>
                  Role:
                </strong>

                {" "}

                {role}

              </p>

              {/* Verification */}
              <p>

                <strong>
                  Status:
                </strong>

                {" "}

                {user.verification_status}

              </p>

              {/* Aadhaar */}
              <p>

                <strong>
                  Aadhaar:
                </strong>

                {" "}

                Encrypted & Secure

              </p>

              {/* Farmer Details */}
              {role === "farmer" && (

                <p>

                  <strong>
                    Land Details:
                  </strong>

                  {" "}

                  Available

                </p>
              )}

              {/* Dealer Details */}
              {role === "dealer" && (

                <p>

                  <strong>
                    Institution Details:
                  </strong>

                  {" "}

                  Available

                </p>
              )}

            </div>

            {/* Buttons */}
            <div className="
              flex
              gap-4
              mt-8
            ">

              {/* Approve */}
              <button
                onClick={() =>
                  approveUser(user.id)
                }
                disabled={
                  loadingId === user.id
                }
                className="
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                "
              >

                {loadingId === user.id
                  ? "Verifying..."
                  : "Approve"}

              </button>

              {/* Reject */}
              <button
                onClick={() =>
                  rejectUser(user.id)
                }
                className="
                  bg-red-500
                  hover:bg-red-600
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                "
              >

                Reject

              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default PendingRequests;