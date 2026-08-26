import {
  useEffect,
  useState
} from "react";

import API
from "../services/api";

function BidHistoryModal({

  cropId,

  closeModal

}) {

  const [history,
    setHistory] =
      useState([]);

  const fetchHistory =
    async () => {

      try {

        const response =
          await API.get(

            `/api/bid/history/${cropId}`
          );

        setHistory(
          response.data.history
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    fetchHistory();

  }, []);

  return (

    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
    ">

      <div className="
        bg-white
        rounded-3xl
        p-8
        w-[95%]
        max-w-3xl
        max-h-[90vh]
        overflow-y-auto
      ">

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

            Bid History

          </h2>

          <button
            onClick={closeModal}
            className="
              text-red-500
              text-xl
              font-bold
            "
          >

            ✕
          </button>

        </div>

        <div className="
          space-y-4
        ">

          {history.map((bid) => (

            <div
              key={bid.id}
              className="
                bg-green-50
                p-5
                rounded-2xl
              "
            >

              <p>
                Bidder ID:
                {" "}
                {bid.bidder_id}
              </p>

              <p>
                Role:
                {" "}
                {bid.bidder_role}
              </p>

              <p>
                Bid Amount:
                ₹{bid.bid_amount}
              </p>

              <p>
                Action:
                {" "}
                {bid.action_type}
              </p>

              <p>
                Time:
                {" "}
                {
                  new Date(
                    bid.created_at
                  ).toLocaleString()
                }
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default BidHistoryModal;