function RequestStatusBadge({ status }) {

  const colors = {

    pending:
      "bg-yellow-500",

    approved:
      "bg-green-600",

    rejected:
      "bg-red-600"
  };

  return (

    <span className={`
      px-4
      py-1
      rounded-full
      text-white
      text-sm
      font-semibold
      ${colors[status] || "bg-gray-500"}
    `}>

      {status}

    </span>
  );
}

export default RequestStatusBadge;