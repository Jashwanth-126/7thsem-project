import { CheckCircle } from "lucide-react";
import DeliveryTimeline from "./DeliveryTimeline";

function TransactionHistoryCard({ result }) {
  return (
    <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-green-700">{result.crop_name}</h3>
          <p className="text-gray-500 text-sm">Auction #{result.auction_id}</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-bold">
          <CheckCircle size={20} />
          <span>Completed</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-gray-700">
          <span className="font-semibold">Final Bid:</span>
          <span className="text-green-700 font-bold text-lg">₹{result.final_bid}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="font-semibold">Quantity:</span>
          <span>{result.crop_quantity}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="font-semibold">Winner:</span>
          <span>{result.winner_name} ({result.winner_role})</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span className="font-semibold">Date:</span>
          <span>{new Date(result.winning_timestamp).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/20">
        <DeliveryTimeline auctionId={result.auction_id} />
      </div>
    </div>
  );
}

export default TransactionHistoryCard;
