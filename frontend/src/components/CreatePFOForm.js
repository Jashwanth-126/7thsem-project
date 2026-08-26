import { useState } from "react";
import API from "../services/api";
import DistrictDropdown from "./DistrictDropdown";

function CreatePFOForm({ refreshPFOs }) {

  const [formData, setFormData] = useState({
    pfo_name: "",
    email: "",
    phone: "",
    district: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [generatedCredentials, setGeneratedCredentials] =
    useState(null);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setMessage("");

    try {

      // Generate Username
      const generatedUsername =
        formData.pfo_name
          .toLowerCase()
          .replace(/\s+/g, "_") + "_pfo";

      // Generate Password
      const generatedPassword =
        generatedUsername + "@Krishi";

      // Payload
      const payload = {
        ...formData,
        username: generatedUsername,
        password: generatedPassword,
      };

      const response = await API.post(
        "/api/pfo/create",
        payload
      );

      setMessage(response.data.message);

      // Show credentials
      setGeneratedCredentials({
        username: generatedUsername,
        password: generatedPassword,
      });

      // Reset form
      setFormData({
        pfo_name: "",
        email: "",
        phone: "",
        district: "",
      });

      refreshPFOs();

    } catch (error) {

      console.log(error);

      setMessage("Failed to create PFO");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="
      bg-white
      rounded-3xl
      shadow-lg
      p-8
    ">

      <h2 className="
        text-2xl
        font-bold
        text-green-700
        mb-6
      ">
        Create PFO Account
      </h2>

      {/* Success/Error Message */}
      {message && (

        <div className="
          bg-green-100
          text-green-700
          p-3
          rounded-lg
          mb-4
        ">
          {message}
        </div>
      )}

      {/* Generated Credentials */}
      {generatedCredentials && (

        <div className="
          bg-blue-100
          text-blue-800
          p-4
          rounded-xl
          mb-6
        ">

          <h3 className="font-bold mb-2">
            Generated Login Credentials
          </h3>

          <p>
            <strong>Username:</strong>
            {" "}
            {generatedCredentials.username}
          </p>

          <p>
            <strong>Password:</strong>
            {" "}
            {generatedCredentials.password}
          </p>

        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-5"
      >

        {/* PFO Name */}
        <input
          type="text"
          name="pfo_name"
          placeholder="PFO Name"
          value={formData.pfo_name}
          onChange={handleChange}
          className="
            p-3
            rounded-xl
            border
          "
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="
            p-3
            rounded-xl
            border
          "
          required
        />

        {/* Phone */}
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="
            p-3
            rounded-xl
            border
          "
          required
        />

        {/* District */}
        <DistrictDropdown
          value={formData.district}
          onChange={(e) =>
            setFormData({
              ...formData,
              district: e.target.value,
            })
          }
        />

        {/* Submit */}
        <button
          type="submit"
          className="
            bg-green-600
            hover:bg-green-700
            text-white
            p-3
            rounded-xl
            font-semibold
            md:col-span-2
          "
        >

          {loading ? "Creating..." : "Create PFO"}

        </button>

      </form>

    </div>
  );
}

export default CreatePFOForm;