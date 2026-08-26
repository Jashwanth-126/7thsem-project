const districts = [
  "Bagalkot",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Yadgir",
  "Vijayanagara"
];

function DistrictDropdown({ value, onChange }) {

  return (

    <select
      value={value}
      onChange={onChange}
      className="
        w-full
        p-3
        rounded-xl
        border
        border-gray-300
        focus:ring-2
        focus:ring-green-500
      "
      required
    >

      <option value="">Select District</option>

      {districts.map((district, index) => (
        <option key={index} value={district}>
          {district}
        </option>
      ))}

    </select>
  );
}

export default DistrictDropdown;