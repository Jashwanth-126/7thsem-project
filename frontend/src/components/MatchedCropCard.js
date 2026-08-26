import VerificationBadge
from "./VerificationBadge";

function MatchedCropCard({

  crop

}) {

  return (

    <div className="
      bg-white/20
      backdrop-blur-lg
      rounded-3xl
      overflow-hidden
      shadow-2xl
    ">

      <img
        src={
          crop.image_url ||
          "https://placehold.co/600x400"
        }
        alt={crop.crop_name}
        className="
          w-full
          h-64
          object-cover
        "
      />

      <div className="p-6">

        <div className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        ">

          <VerificationBadge />

          <span className="
            inline-flex
            items-center
            px-4
            py-2
            rounded-full
            text-sm
            font-semibold
            bg-white/20
            text-green-700
            border
            border-green-200
          ">
            {crop.auction_status || "pending"}
          </span>

        </div>

        <h2 className="
          text-4xl
          font-bold
          text-green-700
          mt-5
          mb-4
        ">

          {crop.crop_name}

        </h2>

        <div className="
          space-y-3
          text-gray-700
        ">

          <p>
            Match Score:
            {' '}
            {crop.match_score}%
          </p>

          <p>
            Quantity:
            {' '}
            {crop.quantity}
            {' '}
            {crop.unit}
          </p>

          <p>
            Base Price:
            {' '}
            ₹{crop.expected_price}
          </p>

          <p>
            Quality Grade:
            {' '}
            {crop.quality_grade}
          </p>

          <p>
            District:
            {' '}
            {crop.district}
          </p>

          {crop.verified_district && (
            <p>
              Verified District:
              {' '}
              {crop.verified_district}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default MatchedCropCard;