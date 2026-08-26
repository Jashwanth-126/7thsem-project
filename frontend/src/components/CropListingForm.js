import { useState } from "react";

import toast from "react-hot-toast";

import API from "../services/api";

import QRCodeModal
from "./QRCodeModal";

function CropListingForm({ 
  onCropAdded 
}) {

  const user = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  );

  const [loading, setLoading] =
    useState(false);

  const [qrData, setQrData] =
    useState("");

  const [showQR, setShowQR] =
    useState(false);

  const [preview, setPreview] =
    useState(null);

  const [formData, setFormData] =
    useState({

      crop_name: "",

      crop_category: "",

      crop_variety: "",

      quantity: "",

      unit: "Kg",

      expected_price: "",

      harvest_date: "",

      pickup_option:
        "Self Delivery",

      image: null
    });

  // Change
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value
    });
  };

  // Image
  const handleImage = (e) => {

    const file = e.target.files[0];

    setFormData({

      ...formData,

      image: file
    });

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // Submit
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      toast.loading(
        "Adding crop...",
        {
          id: "crop-toast"
        }
      );

      const data =
        new FormData();

      data.append(
        "farmer_id",
        user.user.id
      );

      data.append(
        "farmer_name",
        user.user.full_name
      );

      data.append(
        "district",
        user.user.district
      );

      Object.keys(formData)
        .forEach((key) => {

          data.append(
            key,
            formData[key]
          );
        });

      const response =
        await API.post(

          "/api/farmer/add-crop",

          data,

          {

            headers: {

              "Content-Type":
                "multipart/form-data"
            }
          }
        );

      setQrData(
        response.data.qr_base64
      );

      setShowQR(true);

      toast.success(

        "Crop Listed Successfully",

        {
          id: "crop-toast"
        }
      );

      // Reset form
      setFormData({
        crop_name: "",
        crop_category: "",
        crop_variety: "",
        quantity: "",
        unit: "Kg",
        expected_price: "",
        harvest_date: "",
        pickup_option: "Self Delivery",
        image: null
      });

      setPreview(null);

      // Refresh crops list in parent
      if (onCropAdded) {
        onCropAdded();
      }

    } catch (error) {

      toast.error(

        error?.response?.data?.message ||

        "Crop listing failed",

        {
          id: "crop-toast"
        }
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <>
      <div className="
        bg-white/20
        backdrop-blur-lg
        rounded-3xl
        p-8
        shadow-2xl
      ">

        <form
          onSubmit={handleSubmit}
          className="
            grid
            md:grid-cols-2
            gap-5
          "
        >

          {/* Crop Name */}
          <input
            type="text"
            name="crop_name"
            placeholder="Crop Name"
            value={formData.crop_name}
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
            required
          />

          {/* Category */}
          <select
            name="crop_category"
            value={
              formData.crop_category
            }
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
            required
          >

            <option value="">
              Select Category
            </option>

            <option>
              Vegetables
            </option>

            <option>
              Fruits
            </option>

            <option>
              Grains
            </option>

            <option>
              Pulses
            </option>

          </select>

          {/* Variety */}
          <input
            type="text"
            name="crop_variety"
            placeholder="Crop Variety"
            value={
              formData.crop_variety
            }
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
            required
          />

          {/* Quantity */}
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
            required
          />

          {/* Unit */}
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
          >

            <option>
              Kg
            </option>

            <option>
              Quintal
            </option>

            <option>
              Tons
            </option>

          </select>

          {/* Price */}
          <input
            type="text"
            name="expected_price"
            placeholder="Expected Price"
            value={
              formData.expected_price
            }
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
            required
          />

          {/* Harvest Date */}
          <input
            type="date"
            name="harvest_date"
            value={
              formData.harvest_date
            }
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
            required
          />

          {/* Pickup */}
          <select
            name="pickup_option"
            value={
              formData.pickup_option
            }
            onChange={handleChange}
            className="
              p-4
              rounded-xl
              border
            "
          >

            <option>
              Self Delivery
            </option>

            <option>
              Dealer Pickup
            </option>

            <option>
              Transport Required
            </option>

          </select>

          {/* Image */}
          <div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="
                p-4
                rounded-xl
                border
                w-full
              "
              required
            />

            {preview && (

              <img
                src={preview}
                alt="preview"
                className="
                  mt-3
                  w-40
                  rounded-xl
                "
              />
            )}

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              bg-green-600
              hover:bg-green-700
              text-white
              p-4
              rounded-xl
              font-bold
              md:col-span-2
            "
          >

            {loading
              ? "Listing Crop..."
              : "Add Crop"}

          </button>

        </form>

      </div>

      {/* QR */}
      <QRCodeModal
        open={showQR}
        qrData={qrData}
        onClose={() =>
          setShowQR(false)
        }
      />
    </>
  );
}

export default CropListingForm;