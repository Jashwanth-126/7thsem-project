function NotificationCard({

  notification

}) {

  return (

    <div>

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="
        flex
        justify-between
        items-center
        mb-6
      ">

        <h2 className="
          text-3xl
          font-bold
          text-green-700
        ">

          Auction Won

        </h2>

        <span className="
          bg-green-100
          text-green-700
          px-4
          py-2
          rounded-2xl
          font-semibold
        ">

          {notification.winner_role}

        </span>

      </div>

      {/* ================================= */}
      {/* CROP DETAILS */}
      {/* ================================= */}

      <div className="
        space-y-4
        text-gray-700
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

      </div>

      {/* ================================= */}
      {/* FARMER DETAILS */}
      {/* ================================= */}

      {notification.farmer_name && (

        <div className="mt-8">

          <h3 className="
            text-2xl
            font-bold
            text-green-700
            mb-4
          ">

            Farmer Details

          </h3>

          <div className="
            space-y-3
            text-gray-700
          ">

            <p>

              <span className="font-bold">
                Name:
              </span>

              {" "}
              {notification.farmer_name}

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
                Email:
              </span>

              {" "}
              {notification.farmer_email}

            </p>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* WINNER DETAILS */}
      {/* ================================= */}

      {notification.winner_name && (

        <div className="mt-8">

          <h3 className="
            text-2xl
            font-bold
            text-green-700
            mb-4
          ">

            Winner Details

          </h3>

          <div className="
            space-y-3
            text-gray-700
          ">

            <p>

              <span className="font-bold">
                Name:
              </span>

              {" "}
              {notification.winner_name}

            </p>

            <p>

              <span className="font-bold">
                Role:
              </span>

              {" "}
              {notification.winner_role}

            </p>

            <p>

              <span className="font-bold">
                Email:
              </span>

              {" "}
              {notification.winner_email}

            </p>

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationCard;