function DeliveryQRModal({

  qrData

}) {

  return (

    <div className="
      mt-10
      bg-white
      rounded-3xl
      p-8
      shadow-2xl
    ">

      <h2 className="
        text-4xl
        font-bold
        text-green-700
        mb-6
      ">

        Delivery QR Generated

      </h2>

      <img
        src={qrData.qr_url}
        alt="Delivery QR"
        className="
          w-72
          rounded-2xl
          shadow-lg
          mb-6
        "
      />

      <p className="
        text-lg
        text-gray-700
      ">

        Delivery ID:
        {" "}
        {qrData.delivery_id}

      </p>

    </div>
  );
}

export default DeliveryQRModal;