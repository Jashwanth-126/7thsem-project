import {
  useEffect,
  useState
} from "react";

import toast from "react-hot-toast";

import API from "../services/api";
import TraceabilitySearchBar from "../components/TraceabilitySearchBar";

import {
  User,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  History,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Compass,
  Search,
  AlertCircle,
  Trash2,
  Plus,
  Minus,
  Check
} from "lucide-react";

function CustomerDashboard() {

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

  const [activeTab, setActiveTab] = useState("shop"); // "shop", "cart", "orders", "profile"

  // Profile States
  const [profile, setProfile] = useState({
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
    selected_retailer_id: null
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Retailer Selection States
  const [retailers, setRetailers] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Shop States
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Cart States (stored locally)
  const [cart, setCart] = useState([]);

  // Orders History States
  const [orders, setOrders] = useState([]);

  // ======================================
  // API FETCHES
  // ======================================

  const fetchProfile = async () => {
    try {
      const response = await API.get(`/api/customer/profile/${user.id}`);
      if (response.data.success && response.data.profile) {
        const p = response.data.profile;
        setProfile(p);
        
        // If they already have a selected retailer, fetch its info
        if (p.selected_retailer_id) {
          fetchSelectedRetailerDetails(p.selected_retailer_id);
        }
      }
    } catch (error) {
      console.log("PROFILE FETCH ERROR:", error);
    }
  };

  const fetchNearbyRetailers = async () => {
    try {
      setNearbyLoading(true);
      const response = await API.get(`/api/customer/nearby-retailers/${user.id}`);
      if (response.data.success) {
        setRetailers(response.data.retailers || []);
      }
    } catch (error) {
      console.log("NEARBY RETAILERS ERROR:", error);
    } finally {
      setNearbyLoading(false);
    }
  };

  const fetchSelectedRetailerDetails = async (retailerId) => {
    try {
      const response = await API.get(`/api/retailer/profile/${retailerId}`);
      if (response.data.success && response.data.profile) {
        setSelectedRetailer(response.data.profile);
        fetchRetailerInventory(retailerId);
      }
    } catch (error) {
      console.log("RETAILER DETAILS ERROR:", error);
    }
  };

  const fetchRetailerInventory = async (retailerId) => {
    try {
      setInventoryLoading(true);
      const response = await API.get(`/api/customer/retailer-inventory/${retailerId}`);
      if (response.data.success) {
        setInventory(response.data.inventory || []);
      }
    } catch (error) {
      console.log("INVENTORY FETCH ERROR:", error);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await API.get(`/api/customer/orders/${user.id}`);
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.log("ORDERS HISTORY ERROR:", error);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    if (!user?.id) return;
    fetchProfile();
    fetchNearbyRetailers();
    fetchOrders();

    // Load cart from localStorage if matches customer_id
    const savedCart = JSON.parse(localStorage.getItem(`cart_${user.id}`));
    if (savedCart) setCart(savedCart);
  }, []);

  // Sync cart with localStorage
  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
  }, [cart]);

  // Sync data when activeTab changes
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "profile") {
      fetchProfile();
    }
    if (activeTab === "shop" && profile.selected_retailer_id) {
      fetchRetailerInventory(profile.selected_retailer_id);
    }
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // ======================================
  // PROFILE ACTIONS
  // ======================================

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Detecting your GPS location...", { id: "geo-toast" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success("Location coordinates captured!", { id: "geo-toast" });
      },
      (error) => {
        toast.error(`Geolocation failed: ${error.message}`, { id: "geo-toast" });
      }
    );
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const response = await API.post(`/api/customer/profile/${user.id}`, {
        full_name: profile.full_name,
        mobile_number: profile.mobile_number,
        address: profile.address,
        state: profile.state,
        district: profile.district,
        city_village: profile.city_village,
        pin_code: profile.pin_code,
        latitude: profile.latitude,
        longitude: profile.longitude
      });
      if (response.data.success) {
        toast.success("Profile saved successfully!");
        fetchProfile();
        fetchNearbyRetailers(); // update coordinates distance
      }
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // ======================================
  // RETAILER SELECTION ACTIONS
  // ======================================

  const handleSelectRetailer = async (retailer) => {
    // If cart is not empty and they select a different retailer, verify first
    if (cart.length > 0 && profile.selected_retailer_id !== retailer.id) {
      const confirmClear = window.confirm("Selecting a different retailer will clear your current shopping cart. Proceed?");
      if (!confirmClear) return;
      setCart([]); // Clear cart
    }

    try {
      const response = await API.post("/api/customer/select-retailer", {
        customer_id: user.id,
        retailer_id: retailer.id
      });
      if (response.data.success) {
        toast.success(`Selected retailer: ${retailer.business_name || retailer.full_name}`);
        setProfile((prev) => ({ ...prev, selected_retailer_id: retailer.id }));
        setSelectedRetailer(retailer);
        fetchRetailerInventory(retailer.id);
      }
    } catch (error) {
      toast.error("Failed to select retailer");
    }
  };

  // ======================================
  // SHOPPING ACTIONS
  // ======================================

  const handleAddToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    const maxAvailable = parseFloat(item.quantity_available);

    if (existing) {
      if (existing.quantity >= maxAvailable) {
        toast.error(`Cannot add more. Only ${maxAvailable} ${item.unit} available in stock.`);
        return;
      }
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.crop_name} added to cart`);
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
    toast.success("Item removed from cart");
  };

  const handleQuantityChange = (itemId, change, maxAvailable) => {
    const existing = cart.find(c => c.id === itemId);
    if (!existing) return;
    
    const newQty = existing.quantity + change;
    if (newQty <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    if (newQty > maxAvailable) {
      toast.error(`Only ${maxAvailable} units available in stock`);
      return;
    }

    setCart(cart.map(c => c.id === itemId ? { ...c, quantity: newQty } : c));
  };

  // ======================================
  // CHECKOUT ACTIONS
  // ======================================

  const [checkoutAddress, setCheckoutAddress] = useState("");
  
  // Update checkout address field when profile mounts
  useEffect(() => {
    if (profile.address) {
      setCheckoutAddress(profile.address);
    }
  }, [profile.address]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!checkoutAddress.trim()) {
      toast.error("Please provide a delivery address");
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        inventory_id: item.id,
        quantity: item.quantity
      }));

      const response = await API.post("/api/customer/order", {
        customer_id: user.id,
        retailer_id: profile.selected_retailer_id,
        delivery_address: checkoutAddress,
        payment_method: "Cash on Delivery",
        items: orderItems
      });

      if (response.data.success) {
        toast.success("Order placed successfully!");
        setCart([]); // Clear cart
        setActiveTab("orders");
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    }
  };

  // ======================================
  // SEARCH FILTER
  // ======================================

  const filteredInventory = inventory.filter(item => 
    item.crop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.selling_price) * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-fadeIn">
      
      {/* ================================= */}
      {/* CUSTOMER NAVIGATION BAR */}
      {/* ================================= */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2.5 rounded-2xl text-white">
              <ShoppingBag size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block">
                Krishi Mitra Customer
              </span>
              <span className="text-sm text-green-600 font-semibold block">
                {profile.full_name || "Manage Purchases"}
              </span>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === "shop"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browse Shop
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 relative ${
                activeTab === "cart"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-extrabold text-xxs px-2 py-0.5 rounded-full border border-white">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === "orders"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Orders
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
        {/* TAB 1: BROWSE SHOP */}
        {/* ================================= */}
        {activeTab === "shop" && (
          <div className="space-y-8">
            
            {/* Retailer Selection Section */}
            {!profile.selected_retailer_id ? (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
                  <AlertCircle className="text-amber-600 shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-bold text-amber-950">Select a Retailer to Start Shopping</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      You must map to an active retailer in your district to browse and purchase crops. We have calculated nearby retailers based on your GPS coordinates below.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Compass className="text-green-600" /> Nearby Retailers
                  </h3>

                  {nearbyLoading ? (
                    <div className="text-center text-slate-500 py-12">Loading nearby retailers...</div>
                  ) : retailers.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                      No active retailers found. Go to Profile Settings to set your location coordinates!
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {retailers.map((ret, index) => (
                        <div
                          key={ret.id}
                          className="border border-slate-100 rounded-2xl p-5 hover:border-green-600 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-slate-900 text-lg">
                                {ret.business_name || ret.full_name}
                              </h4>
                              {index === 0 && ret.distance !== null && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xxs font-extrabold rounded-full">
                                  Nearest
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 space-y-1 mb-4">
                              <p className="flex items-center gap-1">
                                <MapPin size={12} /> {ret.city_village || "N/A"}, {ret.district || ret.district}
                              </p>
                              {ret.distance !== null && (
                                <p className="font-bold text-green-600 flex items-center gap-1">
                                  🚙 {ret.distance} km away
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelectRetailer(ret)}
                            className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-all duration-200"
                          >
                            Map & Shop Here
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Shopping Interface for mapped retailer
              <div className="space-y-6">
                
                {/* Active Retailer Header Banner */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest block">Mapped Store</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {selectedRetailer?.business_name || selectedRetailer?.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {selectedRetailer?.city_village}, {selectedRetailer?.district}, PIN: {selectedRetailer?.pin_code}
                    </p>
                  </div>

                  <button
                    onClick={() => setProfile((prev) => ({ ...prev, selected_retailer_id: null }))}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Change Mapped Retailer
                  </button>
                </div>

                {/* Inventory Browser */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900">Available Crops Catalog</h3>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search crops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {inventoryLoading ? (
                    <div className="text-center text-slate-500 py-12">Loading products catalog...</div>
                  ) : filteredInventory.length === 0 ? (
                    <div className="text-center text-slate-500 py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                      <AlertCircle className="mx-auto text-slate-400 mb-3" size={32} />
                      <p className="text-sm font-bold text-slate-700">Out of Stock</p>
                      <p className="text-xs text-slate-400 mt-1">No crops are currently available at this retailer shop.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInventory.map((item) => {
                        const inCart = cart.find(c => c.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-extrabold text-slate-900 text-lg">
                                  {item.crop_name}
                                </h4>
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">
                                  ₹{item.selling_price} / {item.unit}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 space-y-1 mb-6">
                                <p>
                                  <span className="font-semibold text-slate-800">Source:</span> {item.farmer_name} (Farmer)
                                </p>
                                <p>
                                  <span className="font-semibold text-slate-800">Purchase Date:</span> {new Date(item.purchase_date).toLocaleDateString()}
                                </p>
                                <p>
                                  <span className="font-semibold text-slate-800">Stock Available:</span> {item.quantity_available} {item.unit}
                                </p>
                              </div>
                            </div>

                            {inCart ? (
                              <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-1 mb-2">
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1, parseFloat(item.quantity_available))}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="font-extrabold text-sm">{inCart.quantity} {item.unit}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1, parseFloat(item.quantity_available))}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-all duration-200 shadow-sm shadow-green-100 mb-2"
                              >
                                Add to Cart
                              </button>
                            )}

                            <button
                              onClick={() => {
                                const tid = item.qr_traceability_id || item.traceability_id || item.crop_qr_traceability_id || item.crop_id || item.id;
                                window.location.href = `/traceability/${encodeURIComponent(tid)}`;
                              }}
                              className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold text-xs transition-colors"
                            >
                              View Complete Journey
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ================================= */}
        {/* TAB 2: SHOPPING CART */}
        {/* ================================= */}
        {activeTab === "cart" && (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Cart List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ShoppingCart className="text-green-600" /> Shopping Cart
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    Your cart is empty. Go to Browse Shop to select fresh farm crops!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 first:pt-0 last:pb-0">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{item.crop_name}</h4>
                          <p className="text-xs text-slate-400">
                            ₹{item.selling_price} per {item.unit} • Source: {item.farmer_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-start">
                          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1, parseFloat(item.quantity_available))}
                              className="p-1 hover:bg-white rounded text-slate-500"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-xs px-2">{item.quantity} {item.unit}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1, parseFloat(item.quantity_available))}
                              className="p-1 hover:bg-white rounded text-slate-500"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            ₹{(parseFloat(item.selling_price) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900 pb-4 border-b border-slate-100">
                  Checkout Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Retailer Mapped:</span>
                    <span className="font-bold text-slate-900">{selectedRetailer?.business_name || "None"}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total items:</span>
                    <span className="font-bold text-slate-900">{cart.length} Categories</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-950 pt-3 border-t border-slate-100">
                    <span>Total Price:</span>
                    <span className="text-green-600 text-lg">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Delivery Address</label>
                    <textarea
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none text-sm h-24 resize-none"
                      placeholder="Specify complete delivery destination address..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Method</label>
                    <select
                      disabled
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 text-sm focus:outline-none"
                    >
                      <option>Cash on Delivery (Standard)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={cart.length === 0}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-100 disabled:bg-slate-300 disabled:shadow-none transition-all duration-200"
                  >
                    Place Cash on Delivery Order
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* ================================= */}
        {/* TAB 3: ORDER HISTORY & TRACKING */}
        {/* ================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Your Order History</h2>

            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center text-slate-500">
                  You haven't placed any orders yet. Map a retailer and place your first order!
                </div>
              ) : (
                orders.map((order) => {
                  const isPending = order.status === "Pending";
                  const isDispatched = order.status === "Dispatched";
                  const isDelivered = order.status === "Delivered";
                  const isCancelled = order.status === "Cancelled";

                  return (
                    <div key={order.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                      
                      {/* Header details */}
                      <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-4 gap-4">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Order ID</span>
                          <span className="text-xs font-mono font-semibold text-slate-600">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Retailer Shop</span>
                          <span className="text-sm font-bold text-slate-900">{order.retailer?.business_name || order.retailer?.full_name}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Payment Mode</span>
                          <span className="text-sm font-semibold text-slate-700">{order.payment_method}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Amount</span>
                          <span className="text-base font-extrabold text-green-700">₹{order.total_amount}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Order Date</span>
                          <span className="text-sm font-semibold text-slate-600">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Timeline status stepper */}
                      <div className="py-4 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Order Progress</span>
                        
                        <div className="flex items-center max-w-xl mx-auto justify-between relative px-4">
                          
                          {/* Stepper connector line */}
                          <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 -z-0">
                            <div
                              className={`h-full bg-green-500 transition-all duration-300 ${
                                isDispatched ? "w-1/2" : isDelivered ? "w-full" : "w-0"
                              }`}
                            />
                          </div>

                          {/* Step 1: Ordered */}
                          <div className="flex flex-col items-center z-10 relative">
                            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                              <Check size={16} />
                            </div>
                            <span className="text-xs font-bold text-slate-900 mt-2">Ordered</span>
                          </div>

                          {/* Step 2: Dispatched */}
                          {!isCancelled ? (
                            <div className="flex flex-col items-center z-10 relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                isDispatched || isDelivered ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
                              }`}>
                                <Truck size={16} />
                              </div>
                              <span className={`text-xs font-bold mt-2 ${isDispatched || isDelivered ? "text-slate-900" : "text-slate-400"}`}>
                                Dispatched
                              </span>
                            </div>
                          ) : null}

                          {/* Step 3: Delivered/Cancelled */}
                          {isCancelled ? (
                            <div className="flex flex-col items-center z-10 relative">
                              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                                <XCircle size={16} />
                              </div>
                              <span className="text-xs font-bold text-red-600 mt-2">Cancelled</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center z-10 relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                isDelivered ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
                              }`}>
                                <CheckCircle size={16} />
                              </div>
                              <span className={`text-xs font-bold mt-2 ${isDelivered ? "text-slate-900" : "text-slate-400"}`}>
                                Delivered
                              </span>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Items</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {order.items?.map((item) => (
                            <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
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

                      {/* Delivery Address */}
                      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-0.5">Shipping Destination:</span>
                        {order.delivery_address}
                      </div>

                    </div>
                  );
                })
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
                <h3 className="text-2xl font-bold">Customer Profile Setup</h3>
                <p className="text-xs text-green-100 mt-1">Configure your contact details and GPS coordinates for nearby store mappings</p>
              </div>
              <User size={36} />
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Customer Full Name</label>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address (Login ID)</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email || ""}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Delivery Home Address</label>
                  <input
                    type="text"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:outline-none"
                    placeholder="Street, house number, landmark..."
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
                    placeholder="Enter PIN"
                  />
                </div>

                {/* Location Detection */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-green-600 p-2 bg-green-100 rounded-xl">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">GPS Location Coordinates</h4>
                      <p className="text-xs text-slate-500">Provide latitude and longitude so we can display the nearest agricultural retailers</p>
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
                      Detect GPS
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-100 disabled:bg-slate-400"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default CustomerDashboard;