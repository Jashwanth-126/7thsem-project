import { useEffect, useState } from "react";
import API from "../services/api";

export const stages = [
  "Waiting For Farmer Payment QR",
  "Waiting For Escrow Payment",
  "Waiting For Dealer Payment",
  "Payment Submitted",
  "Payment Verified",
  "Waiting For Crop Dispatch",
  "Delivery QR Generated",
  "QR Verified",
  "Amount Transferred"
];

export const getStageIndex = (status) => {
  if (!status || status === "Not Started") return -1;
  if (status === "Waiting For Farmer Payment QR") return 0;
  if (status === "Waiting For Escrow Payment" || status === "Farmer Payment QR Uploaded") return 1;
  if (status === "Waiting For Dealer Payment" || status === "Escrow Payment Enabled") return 2;
  if (status === "Payment Submitted" || status === "Escrow Payment Submitted") return 3;
  if (status === "Payment Verified") return 4;
  if (status === "Waiting For Crop Dispatch" || status === "Crop Dispatch Enabled") return 5;
  if (status === "Delivery QR Generated") return 6;
  if (status === "QR Verified" || status === "Delivery Completed") return 7;
  if (status === "Amount Transferred" || status === "Transaction Completed") return 8;

  const foundIndex = stages.indexOf(status);
  return foundIndex !== -1 ? foundIndex : -1;
};

function DeliveryTimeline({ auctionId }) {
  const [status, setStatus] = useState("Not Started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await API.get(`/api/payment/timeline/${auctionId}`);
        if (response.data.success) {
          setStatus(response.data.status || "Not Started");
        }
      } catch (error) {
        console.log("Timeline Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 3000);
    return () => clearInterval(interval);
  }, [auctionId]);

  const currentIndex = getStageIndex(status);
  const isAllCompleted = currentIndex === 8 || status === "Transaction Completed" || status === "Amount Transferred";

  if (loading) return <div className="text-gray-500 animate-pulse py-4 text-center">Loading live transaction status...</div>;

  return (
    <div className="mt-6 bg-white/40 p-6 rounded-2xl shadow-inner border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Transaction Timeline</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAllCompleted ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-blue-100 text-blue-800'}`}>
          {isAllCompleted ? "✓ Completed" : `Stage ${currentIndex >= 0 ? currentIndex + 1 : 0} of 9`}
        </span>
      </div>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-300 rounded-full"></div>
        
        <div className="space-y-6">
          {stages.map((stage, index) => {
            const isCompleted = isAllCompleted || index < currentIndex;
            const isCurrent = !isAllCompleted && index === currentIndex;
            const isPending = !isAllCompleted && index > currentIndex;

            return (
              <div key={stage} className={`flex items-center gap-4 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center z-10 font-bold border-4 text-sm transition-all
                  ${isCompleted ? 'bg-green-500 border-green-200 text-white' : 
                    isCurrent ? 'bg-blue-500 border-blue-200 text-white animate-pulse shadow-md scale-105' : 
                    'bg-gray-200 border-white text-gray-500'}
                `}>
                  {isCompleted ? "✓" : index + 1}
                </div>
                
                <div className={`font-semibold text-base md:text-lg ${isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                  {stage}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {isAllCompleted && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-xl font-bold text-center text-lg border-2 border-green-300 shadow-sm flex items-center justify-center gap-2">
          <span>🎉</span> Transaction Fully Completed & Amount Transferred to Farmer <span>🎉</span>
        </div>
      )}
    </div>
  );
}

export default DeliveryTimeline;
