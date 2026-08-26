import { useState }
from "react";

import toast
from "react-hot-toast";

import API
from "../services/api";

function CropRequestForm({

  role,

  userId,

  refreshRequests,

  editingRequest,

  setEditingRequest

}) {

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({

      crop_type:
        editingRequest?.crop_type || "",

      crop_category:
        editingRequest?.crop_category || "",

      quantity:
        editingRequest?.quantity || "",

      unit:
        editingRequest?.unit || "Kg",

      delivery_date:
        editingRequest?.delivery_date || "",

      notes:
        editingRequest?.notes || ""
    });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const endpoint = editingRequest

        ? `/api/${role}/update-request/${editingRequest.id}`

        : `/api/${role}/add-request`;

      const method =
        editingRequest
          ? API.put
          : API.post;

      const payload = {

        ...formData,

        user_id: userId
      };

      await method(
        endpoint,
        payload
      );

      toast.success(

        editingRequest
          ? "Request Updated"
          : "Request Added"
      );

      setFormData({

        crop_type: "",
        crop_category: "",
        quantity: "",
        unit: "Kg",
        delivery_date: "",
        notes: ""
      });

      if (setEditingRequest) {

        setEditingRequest(null);
      }

      refreshRequests();

    } catch (error) {

      toast.error(
        "Operation failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      p-8
      shadow-2xl
      mb-10
    ">

      <h2 className="
        text-3xl
        font-bold
        text-green-700
        mb-6
      ">

        Add Crop Requirement

      </h2>

      <form
        onSubmit={handleSubmit}
        className="
          grid
          md:grid-cols-2
          gap-5
        "
      >

        <input
          type="text"
          name="crop_type"
          placeholder="Crop Type"
          value={formData.crop_type}
          onChange={handleChange}
          className="
            p-4
            rounded-xl
            border
          "
          required
        />

        <select
          name="crop_category"
          value={formData.crop_category}
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

        <input
          type="number"
          name="quantity"
          placeholder="Required Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="
            p-4
            rounded-xl
            border
          "
          required
        />

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

        <input
          type="date"
          name="delivery_date"
          value={formData.delivery_date}
          onChange={handleChange}
          className="
            p-4
            rounded-xl
            border
          "
          required
        />

        <textarea
          name="notes"
          placeholder="Additional Notes"
          value={formData.notes}
          onChange={handleChange}
          className="
            p-4
            rounded-xl
            border
          "
        />

        <button
          type="submit"
          disabled={loading}
          className="
            md:col-span-2
            bg-green-600
            hover:bg-green-700
            text-white
            py-4
            rounded-xl
            font-bold
          "
        >

          {loading
            ? "Processing..."
            : editingRequest
              ? "Update Request"
              : "Add Request"}

        </button>

      </form>

    </div>
  );
}

export default CropRequestForm;