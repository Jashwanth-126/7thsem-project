import { useEffect, useState }
from "react";

import API
from "../services/api";

import CropVerificationCard
from "../components/CropVerificationCard";

function PFOCropVerification() {

  const pfo = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  )?.user;

  const [crops, setCrops] =
    useState([]);

  // FETCH
  const fetchCrops = async () => {

    try {

      const response =
        await API.get(

          `/api/pfo/pending-crops/${pfo.district}`
        );

      setCrops(
        response.data.crops
      );

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    fetchCrops();

  }, []);

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-green-100
      to-white
      p-6
    ">

      <h1 className="
        text-4xl
        font-bold
        text-green-700
        mb-8
      ">

        Pending Crop Verifications

      </h1>

      <div className="
        grid
        md:grid-cols-2
        lg:grid-cols-3
        gap-6
      ">

        {crops.map((crop) => (

          <CropVerificationCard
            key={crop.id}
            crop={crop}
            refresh={fetchCrops}
            pfo={pfo}
          />
        ))}

      </div>

    </div>
  );
}

export default PFOCropVerification;