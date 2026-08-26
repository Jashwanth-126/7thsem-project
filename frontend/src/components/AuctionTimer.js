import { useEffect, useState }
from "react";

function AuctionTimer({
  auctionEnd,
  status
}) {

  const [timeLeft,
    setTimeLeft] =
      useState("");

  useEffect(() => {

    const updateTimer = () => {

      if (status === "closed" || status === "finalized" || status === "Amount Transferred" || status === "Transaction Completed") {
        setTimeLeft("Auction Ended");
        return;
      }

      if (!auctionEnd) {

        setTimeLeft("Auction pending");

        return;
      }

      const end = new Date(auctionEnd);

      const now = new Date();

      const diff = end - now;

      if (diff <= 0) {

        setTimeLeft("Auction Ended");

        return;
      }

      const hours = Math.floor(
        diff / (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) /
        (1000 * 60)
      );

      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () =>
      clearInterval(interval);

  }, [auctionEnd, status]);

  return (

    <div className="
      bg-red-500
      text-white
      px-4
      py-2
      rounded-full
      font-bold
      inline-block
    ">

      {timeLeft}

    </div>
  );
}

export default AuctionTimer;