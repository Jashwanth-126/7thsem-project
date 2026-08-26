import {
  useEffect,
  useState
} from "react";

import API
from "../services/api";

import BidCard
from "../components/BidCard";

function Marketplace() {

  const user = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  )?.user;

  const [crops, setCrops] =
    useState([]);

  const fetchMarketplace =
    async () => {

      try {

        const response =
          await API.get(
            "/api/marketplace"
          );

        setCrops(
          response.data.crops || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    fetchMarketplace();

    const interval = setInterval(
      fetchMarketplace,
      15000
    );

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="
      mt-12
    ">

      <h1 className="
        text-5xl
        font-bold
        text-green-700
        mb-8
      ">

        Verified Crop Marketplace

      </h1>

      <div className="
        grid
        md:grid-cols-2
        lg:grid-cols-3
        gap-8
      ">

        {crops.length === 0 ? (
          <div className="
            bg-white/20
            backdrop-blur-lg
            rounded-3xl
            p-8
            shadow-2xl
            text-center
            text-gray-600
          ">
            No verified crops are live for bidding yet.
          </div>
        ) : (
          crops.map((crop) => (
            <BidCard
              key={crop.id}
              crop={crop}
              user={user}
            />
          ))
        )}

      </div>

    </div>
  );
}

export default Marketplace;