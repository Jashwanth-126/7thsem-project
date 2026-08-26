import RequestStatusBadge
from "./RequestStatusBadge";

function RequestCard({

  request,

  onDelete,

  onEdit

}) {

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      p-6
      shadow-xl
    ">

      <h2 className="
        text-2xl
        font-bold
        text-green-700
        mb-4
      ">

        {request.crop_type}

      </h2>

      <div className="
        space-y-2
        text-gray-700
      ">

        <p>
          Category:
          {" "}
          {request.crop_category}
        </p>

        <p>
          Quantity:
          {" "}
          {request.quantity}
          {" "}
          {request.unit}
        </p>

        <p>
          Delivery:
          {" "}
          {request.delivery_date}
        </p>

        <p>
          Notes:
          {" "}
          {request.notes || "-"}
        </p>

        <p>
          Requested:
          {" "}
          {
            new Date(
              request.created_at
            ).toLocaleDateString()
          }
        </p>

      </div>

      <div className="mt-4">

        <RequestStatusBadge
          status={request.request_status}
        />

      </div>

      <div className="
        flex
        gap-4
        mt-6
      ">

        <button
          onClick={() =>
            onEdit(request)
          }
          className="
            flex-1
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            rounded-xl
            font-semibold
          "
        >

          Edit

        </button>

        <button
          onClick={() =>
            onDelete(request.id)
          }
          className="
            flex-1
            bg-red-600
            hover:bg-red-700
            text-white
            py-3
            rounded-xl
            font-semibold
          "
        >

          Delete

        </button>

      </div>

    </div>
  );
}

export default RequestCard;