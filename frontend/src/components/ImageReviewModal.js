function ImageReviewModal({

  open,

  image,

  onClose

}) {

  if (!open) return null;

  return (

    <div className="
      fixed
      inset-0
      bg-black/60
      flex
      justify-center
      items-center
      z-50
    ">

      <div className="
        bg-white
        p-5
        rounded-3xl
        shadow-2xl
      ">

        <img
          src={image || "https://placehold.co/600x400?text=No+Crop+Image"}
          alt="Crop Preview"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400?text=No+Crop+Image";
          }}
          className="
            max-h-[80vh]
            max-w-[90vw]
            object-contain
            rounded-2xl
          "
        />

        <button
          onClick={onClose}
          className="
            mt-5
            w-full
            bg-green-600
            text-white
            p-3
            rounded-xl
          "
        >

          Close

        </button>

      </div>

    </div>
  );
}

export default ImageReviewModal;