function QRCodeModal({

  open,

  qrData,

  onClose

}) {

  if (!open) return null;

  const imgSrc = qrData
    ? (qrData.startsWith("data:") ? qrData : `data:image/png;base64,${qrData}`)
    : "";

  const handleDownload = () => {
    if (!imgSrc) return;
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `crop-qr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (

    <div className="
      fixed
      inset-0
      bg-black/50
      flex
      justify-center
      items-center
      z-50
      p-4
    ">

      <div className="
        bg-white
        rounded-3xl
        p-8
        shadow-2xl
        text-center
        max-w-md
        w-full
      ">

        <h2 className="
          text-3xl
          font-bold
          text-green-700
          mb-2
        ">

          Crop QR Code

        </h2>

        <p className="text-sm text-gray-500 mb-6 font-medium">
          Generated successfully for crop dispatch verification
        </p>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 mb-6 inline-block">
          <img
            src={imgSrc}
            alt="Crop QR Code"
            className="
              w-60
              h-60
              object-contain
              mx-auto
              rounded-lg
            "
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            disabled={!imgSrc}
            className="
              flex-1
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              py-3.5
              px-4
              rounded-xl
              font-bold
              shadow-md
              shadow-emerald-100
              transition-all
              disabled:opacity-50
            "
          >

            📥 Download QR Code

          </button>

          <button
            onClick={onClose}
            className="
              bg-gray-100
              hover:bg-gray-200
              text-gray-700
              px-6
              py-3.5
              rounded-xl
              font-bold
              transition-all
            "
          >

            Close

          </button>
        </div>

      </div>

    </div>
  );
}

export default QRCodeModal;