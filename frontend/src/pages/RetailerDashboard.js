import {
  useEffect,
  useState
} from "react";

import toast from "react-hot-toast";

import API from "../services/api";

import CropRequestForm from "../components/CropRequestForm";
import RequestCard from "../components/RequestCard";
import Marketplace from "./Marketplace";
import MatchedCropCard from "../components/MatchedCropCard";
import EscrowPaymentModal from "../components/EscrowPaymentModal";
import QRScannerModal from "../components/QRScannerModal";
import TraceabilitySearchBar from "../components/TraceabilitySearchBar";

import {
  ShoppingBag,
  User,
  List,
  AlertTriangle,
  MapPin,
  Upload,
  TrendingUp,
  Trash,
  Edit2,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Truck,
  XCircle,
  Database
} from "lucide-react";

function RetailerDashboard() {

  // ======================================
  // USER
  // ======================================

  const storedUser = JSON.parse(
    sessionStorage.getItem("user") || localStorage.getItem("user")
  );

  const user = storedUser?.user;

  // ======================================
  // STATES
  // ======================================

  const [activeTab, setActiveTab] = useState("auctions"); // "auctions", "inventory", "orders", "profile"

  // Auctions States
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [activeScanner, setActiveScanner] = useState(null);

  // Inventory States
  const [inventory, setInventory] = useState([]);
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  // Orders States
  const [orders, setOrders] = useState([]);

  // Profile States
  const [profile, setProfile] = useState({
    business_name: "",
    full_name: "",
    mobile_number: "",
    email: "",
    address: "",
    state: "",
    district: "",
    city_village: "",
    pin_code: "",
    latitude: "",
    longitude: "",
    profile_photo: "",
    shop_photo: ""
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [shopPhotoFile, setShopPhotoFile] = useState(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  // ======================================
  // FETCH REQUESTS & MATCHES (Auctions Tab)
  // ======================================

  const fetchRequests = async () => {
    try {
      const response = await API.get(`/api/retailer/requests/${user.id}`);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.log("REQUEST FETCH ERROR:", error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await API.get(`/api/matches/retailer/${user.id}`);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.log("MATCH FETCH ERROR:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await API.get(`/api/notifications/retailer/${user.id}`);
      setNotifications([...(response.data.notifications || [])]);
    } catch (error) {
      console.log("NOTIFICATION ERROR:", error);
    }
  };

  // ======================================
  // FETCH INVENTORY
  // ======================================

  const fetchInventory = async () => {
    try {
      const response = await API.get(`/api/retailer/inventory/${user.id}`);
      if (response.data.success) {
        setInventory(response.data.inventory || []);
      }
    } catch (error) {
      console.log("INVENTORY FETCH ERROR:", error);
    }
  };

  // ======================================
  // FETCH ORDERS
  // ======================================

  const fetchOrders = async () => {
    try {
      const response = await API.get(`/api/retailer/orders/${user.id}`);
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.log("ORDERS FETCH ERROR:", error);
    }
  };

  // ======================================
  // FETCH PROFILE
  // ======================================

  const fetchProfile = async () => {
    try {
      const response = await API.get(`/api/retailer/profile/${user.id}`);
      if (response.data.success && response.data.profile) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.log("PROFILE FETCH ERROR:", error);
    }
  };

  // ======================================
  // INITIAL LOAD & AUTO-REFRESH
  // ======================================

  useEffect(() => {
    if (!user?.id) return;

    fetchRequests();
    fetchMatches();
    fetchNotifications();
    fetchInventory();
    fetchOrders();
    fetchProfile();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sync data when activeTab changes
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "inventory") fetchInventory();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "profile") fetchProfile();
  }, [activeTab]);

  // ======================================
  // ACTIONS
  // ======================================

  const deleteRequest = async (id) => {
    try {
      await API.delete(`/api/retailer/delete-request/${id}`);
      toast.success("Request Deleted");
      fetchRequests();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  const handleUpdatePrice = async (itemId) => {
    try {
      const parsedPrice = parseFloat(newPrice);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        toast.error("Please enter a valid price");
        return;
      }
      const response = await API.put(`/api/retailer/inventory/update-price/${itemId}`, {
        selling_price: parsedPrice
      });
      if (response.data.success) {
        toast.success("Selling price updated successfully!");
        setEditingInventoryId(null);
        setNewPrice("");
        fetchInventory();
      }
    } catch (error) {
      toast.error("Failed to update price");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await API.put(`/api/retailer/order/update-status/${orderId}`, {
        status
      });
      if (response.data.success) {
        toast.success(`Order updated to ${status}`);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Detecting GPS coordinates...", { id: "geo-toast" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success("Coordinates captured successfully!", { id: "geo-toast" });
      },
      (error) => {
        toast.error(`Error capturing coordinates: ${error.message}`, { id: "geo-toast" });
      }
    );
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setUploadingProfile(true);
      const formData = new FormData();
      formData.append("full_name", profile.full_name || "");
      formData.append("business_name", profile.business_name || "");
      formData.append("mobile_number", profile.mobile_number || "");
      formData.append("address", profile.address || "");
      formData.append("state", profile.state || "");
      formData.append("district", profile.district || "");
      formData.append("city_village", profile.city_village || "");
      formData.append("pin_code", profile.pin_code || "");
      formData.append("latitude", profile.latitude || "");
      formData.append("longitude", profile.longitude || "");

      if (profilePhotoFile) {
        formData.append("profile_photo", profilePhotoFile);
      }
      if (shopPhotoFile) {
        formData.append("shop_photo", shopPhotoFile);
      }

      const response = await API.post(`/api/retailer/profile/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        toast.success("Profile saved successfully!");
        fetchProfile();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save profile");
    } finally {
      setUploadingProfile(false);
    }
  };

  // ======================================
  // ANALYTICS COMPUTATIONS
  // ======================================

  const totalSales = orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const activeItemsCount = inventory.filter(i => parseFloat(i.quantity_available) > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-fadeIn">
      
      {/* ================================= */}
      {/* NAVIGATION TABS BAR */}
      {/* ================================= */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2.5 rounded-2xl text-white">
              <ShoppingBag size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block">
                {profile.business_name || "Retailer Portal"}
              </span>
              <span className="text-sm text-green-600 font-semibold block">
                Retailer Dashboard
              </span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("auctions")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === "auctions"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Auctions & Bids
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === "inventory"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Inventory
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === "orders"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Customer Orders
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Profile Settings
            </button>
          </div>
        </div>
      </nav>

      {/* ================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================= */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <TraceabilitySearchBar />
        </div>

        {/* ================================= */}
        {/* TAB 1: AUCTIONS & MARKETPLACE */}
        {/* ================================= */}
        {activeTab === "auctions" && (
          <div className="space-y-12">
            
            {/* Win Notifications */}
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle className="text-green-600" /> Auction Win Notifications
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {notifications.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm text-slate-500 text-lg font-medium col-span-2">
                    No auction wins or notifications found yet. Keep bidding in the Marketplace!
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={notification.id || index}
                      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-slate-900">
                            {notification.crop_name}
                          </h3>
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                            ₹{notification.final_bid} Winning Bid
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-600 mb-6">
                          <p>
                            <span className="font-bold text-slate-900">Category:</span> {notification.crop_category}
                          </p>
                          <p>
                            <span className="font-bold text-slate-900">Quantity:</span> {notification.crop_quantity}
                          </p>
                          <p>
                            <span className="font-bold text-slate-900">Farmer:</span> {notification.farmer_name}
                          </p>
                          <p>
                            <span className="font-bold text-slate-900">District:</span> {notification.farmer_district}
                          </p>
                          <p>
                            <span className="font-bold text-slate-900">Phone:</span> {notification.farmer_phone}
                          </p>
                          <p>
                            <span className="font-bold text-slate-900">Email:</span> {notification.farmer_email}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
                        <button
                          disabled={
                            notification.escrow_enabled !== true ||
                            notification.escrow_status === "Verified" ||
                            notification.escrow_status === "Payment Submitted"
                          }
                          onClick={() => setSelectedAuction(notification)}
                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-300 ${
                            notification.escrow_status === "Verified" ||
                            notification.escrow_status === "Payment Submitted"
                              ? "bg-emerald-600 cursor-default"
                              : notification.escrow_enabled === true
                              ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-100"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {notification.escrow_status === "Verified" ||
                          notification.escrow_status === "Payment Submitted"
                            ? "✅ Payment Submitted"
                            : notification.escrow_enabled === true
                            ? "Pay Escrow Amount"
                            : "🔒 Escrow Locked"}
                        </button>

                        <button
                          onClick={() => setActiveScanner(notification)}
                          disabled={notification.delivery_status !== "Delivery QR Generated"}
                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-300 ${
                            notification.delivery_status === "Delivery QR Generated"
                              ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100"
                              : notification.delivery_status === "QR Verified" ||
                                notification.delivery_status === "Delivery Completed" ||
                                notification.delivery_status === "Amount Transferred"
                              ? "bg-purple-600 cursor-default"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {notification.delivery_status === "Amount Transferred"
                            ? "Transaction Completed"
                            : notification.delivery_status === "QR Verified" ||
                              notification.delivery_status === "Delivery Completed"
                            ? "✓ Delivery Received"
                            : notification.delivery_status === "Delivery QR Generated"
                            ? "Scan QR (Verify Delivery)"
                            : "Waiting for Dispatch"}
                        </button>
                      </div>

                      {selectedAuction?.auction_id === notification.auction_id && (
                        <EscrowPaymentModal
                          auction={notification}
                          onClose={() => setSelectedAuction(null)}
                        />
                      )}

                      {activeScanner?.auction_id === notification.auction_id && (
                        <QRScannerModal
                          auction={notification}
                          onClose={() => setActiveScanner(null)}
                          refresh={fetchNotifications}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Request Form & Current Requests */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Post Crop Request
                </h3>
                <CropRequestForm
                  role="retailer"
                  userId={user.id}
                  refreshRequests={fetchRequests}
                  editingRequest={editingRequest}
                  setEditingRequest={setEditingRequest}
                />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Active Crop Requests
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {requests.length === 0 ? (
                    <div className="bg-slate-100 rounded-2xl p-6 text-slate-500 text-sm font-medium col-span-2">
                      You haven't posted any crop requests yet.
                    </div>
                  ) : (
                    requests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onDelete={deleteRequest}
                        onEdit={setEditingRequest}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Opportunities & Marketplace */}
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                Matched Opportunities
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {matches.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 text-slate-500 text-sm font-medium col-span-3">
                    No crop listings match your requirements currently.
                  </div>
                ) : (
                  matches.map((crop) => (
                    <MatchedCropCard key={crop.id} crop={crop} />
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-12">
              <Marketplace />
            </div>

          </div>
        )}

        {/* ================================= */}
        {/* TAB 2: MY INVENTORY & ANALYTICS */}
        {/* ================================= */}
        {activeTab === "inventory" && (
          <div className="space-y-8">
            
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <span className="text-slate-500 text-sm font-medium block">Total Revenue</span>
                  <span className="text-2xl font-bold text-slate-950 block">₹{totalSales.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
                  <Clock size={28} />
                </div>
                <div>
                  <span className="text-slate-500 text-sm font-medium block">Pending Orders</span>
                  <span className="text-2xl font-bold text-slate-950 block">{pendingOrders} Orders</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                  <Database size={28} />
                </div>
                <div>
                  <span className="text-slate-500 text-sm font-medium block">In-Stock Crops</span>
                  <span className="text-2xl font-bold text-slate-950 block">{activeItemsCount} Categories</span>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">Current Stock Inventory</h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
                  Total Items: {inventory.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Crop Name</th>
                      <th className="px-6 py-4">Quantity Available</th>
                      <th className="px-6 py-4">Purchase Price</th>
                      <th className="px-6 py-4">Selling Price (₹)</th>
                      <th className="px-6 py-4">Farmer Source</th>
                      <th className="px-6 py-4">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                          No crops currently in inventory. Crops are automatically added here once you verify receipt of a won auction delivery!
                        </td>
                      </tr>
                    ) : (
                      inventory.map((item) => {
                        const qty = parseFloat(item.quantity_available);
                        const isOut = qty <= 0;
                        const isLow = qty > 0 && qty < 10;
                        
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-900">
                              {item.crop_name}
                              {isOut && (
                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-extrabold rounded-full">
                                  Out of Stock
                                </span>
                              )}
                              {isLow && (
                                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-extrabold rounded-full">
                                  Low Stock
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-semibold ${isOut ? "text-slate-400" : isLow ? "text-orange-600" : "text-slate-800"}`}>
                                {item.quantity_available} {item.unit}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">₹{item.purchase_price}</td>
                            <td className="px-6 py-4">
                              {editingInventoryId === item.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    placeholder="Price"
                                    className="w-20 p-1.5 border border-slate-300 rounded-lg text-xs"
                                    min="0"
                                    step="0.01"
                                  />
                                  <button
                                    onClick={() => handleUpdatePrice(item.id)}
                                    className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingInventoryId(null)}
                                    className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">₹{item.selling_price}</span>
                                  <button
                                    onClick={() => {
                                      setEditingInventoryId(item.id);
                                      setNewPrice(item.selling_price);
                                    }}
                                    className="text-slate-400 hover:text-green-600 p-1 rounded-md"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">{item.farmer_name} (Farmer)</td>
                            <td className="px-6 py-4 text-slate-500">
                              {new Date(item.purchase_date).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================================= */}
        {/* TAB 3: CUSTOMER ORDERS */}
        {/* ================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Customer Orders</h2>

            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center text-slate-500">
                  No orders have been received yet. Customer orders will show up here as they buy from your inventory!
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-4 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Order ID</span>
                        <span className="text-xs font-mono font-semibold text-slate-600">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Customer Name</span>
                        <span className="text-sm font-bold text-slate-900">{order.customer?.full_name || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Contact Mobile</span>
                        <span className="text-sm font-semibold text-slate-700">{order.customer?.mobile_number || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Order Amount</span>
                        <span className="text-base font-extrabold text-green-700">₹{order.total_amount}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Status</span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          order.status === "Pending" ? "bg-amber-100 text-amber-700" :
                          order.status === "Dispatched" ? "bg-blue-100 text-blue-700" :
                          order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items List</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                              <span className="text-sm font-bold text-slate-900 block">{item.crop_name}</span>
                              <span className="text-xs text-slate-500 block">₹{item.price_per_unit} per unit</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-800 block">{item.quantity} {item.unit}</span>
                              <span className="text-xs font-bold text-green-700 block">₹{item.total_price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 text-sm">
                      <p className="text-slate-600">
                        <span className="font-bold text-slate-900">Delivery Address:</span> {order.delivery_address || "No address provided"}
                      </p>
                      <div className="flex gap-2">
                        {order.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "Dispatched")}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-blue-100"
                            >
                              <Truck size={14} /> Dispatch Order
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-red-600 rounded-xl font-bold flex items-center gap-1.5"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </>
                        )}
                        {order.status === "Dispatched" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-green-100"
                          >
                            <CheckCircle size={14} /> Complete Delivery
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* TAB 4: PROFILE SETUP */}
        {/* ================================= */}
        {activeTab === "profile" && (
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm max-w-4xl mx-auto overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Business Profile Setup</h3>
                <p className="text-xs text-green-100 mt-1">Configure your retail shop details and geolocation for customer visibility</p>
              </div>
              <User size={36} />
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Business Info */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Business Name</label>
                  <input
                    type="text"
                    required
                    value={profile.business_name || ""}
                    onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter Shop/Business Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Owner Full Name</label>
                  <input
                    type="text"
                    required
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter Owner Full Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={profile.mobile_number || ""}
                    onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter Contact Number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email (Login ID)</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email || ""}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Address Info */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address Description</label>
                  <input
                    type="text"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Shop street address, landmark, building name..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City/Village</label>
                  <input
                    type="text"
                    value={profile.city_village || ""}
                    onChange={(e) => setProfile({ ...profile, city_village: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter City/Village"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">District</label>
                  <input
                    type="text"
                    value={profile.district || ""}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter District"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">State</label>
                  <input
                    type="text"
                    value={profile.state || ""}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter State"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PIN Code</label>
                  <input
                    type="text"
                    value={profile.pin_code || ""}
                    onChange={(e) => setProfile({ ...profile, pin_code: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Enter 6-Digit PIN"
                  />
                </div>

                {/* Location Detection */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-green-600 p-2 bg-green-100 rounded-xl">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">GPS Shop Location</h4>
                      <p className="text-xs text-slate-500">Enable location mapping so nearby customers can locate your store</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={profile.latitude || ""}
                        onChange={(e) => setProfile({ ...profile, latitude: e.target.value })}
                        className="w-28 p-2 text-xs border border-slate-200 rounded-lg text-center"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={profile.longitude || ""}
                        onChange={(e) => setProfile({ ...profile, longitude: e.target.value })}
                        className="w-28 p-2 text-xs border border-slate-200 rounded-lg text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all duration-200"
                    >
                      Detect Coordinates
                    </button>
                  </div>
                </div>

                {/* Photos Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    {profile.profile_photo && (
                      <img
                        src={profile.profile_photo}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Shop Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    {profile.shop_photo && (
                      <img
                        src={profile.shop_photo}
                        alt="Shop"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setShopPhotoFile(e.target.files[0])}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingProfile}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-100 disabled:bg-slate-400"
                >
                  {uploadingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default RetailerDashboard;