function VerificationStatusBadge({
  status
}) {

  let color =
    "bg-yellow-500";

  if (status === "verified") {

    color =
      "bg-green-600";
  }

  if (status === "rejected") {

    color =
      "bg-red-600";
  }

  return (

    <span className={`
      ${color}
      text-white
      px-4
      py-2
      rounded-full
      text-sm
      font-semibold
    `}>

      {status}

    </span>
  );
}

export default VerificationStatusBadge;