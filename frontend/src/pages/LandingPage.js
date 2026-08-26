import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  QrCode,
  Bot,
  TrendingUp,
  BarChart3,
  Users,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Search,
  Sparkles,
  ExternalLink,
  Lock,
  Scale,
  Truck,
  Building2,
  UserCheck,
  Store,
  HelpCircle,
  Leaf,
  Award,
  ChevronRight,
  Shield,
  Zap,
  Clock,
  Eye,
  Layers,
  PhoneCall
} from "lucide-react";
import API from "../services/api";

// Assets
import heroFarmerImg from "../assets/hero_farmer_field.png";
import escrowShieldImg from "../assets/escrow_shield_agri.png";
import qrTraceabilityImg from "../assets/qr_traceability_crop.png";
import farmerHarvestImg from "../assets/farmer_first_harvest.png";
import ctaFarmlandBg from "../assets/cta_farmland_bg.png";

function LandingPage() {
  const navigate = useNavigate();

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  // Accordion active index
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Live Statistics & Marketplace data
  const [stats, setStats] = useState({
    farmers: 1240,
    crops: 380,
    auctions: 420,
    transactions: 99.8,
    predictions: 15400
  });

  const [liveCrops, setLiveCrops] = useState([]);
  const [loadingMarketplace, setLoadingMarketplace] = useState(true);

  useEffect(() => {
    // Fetch live marketplace crops to display real data if available
    const fetchMarketplaceData = async () => {
      try {
        const response = await API.get("/api/marketplace");
        const cropsData = response.data.crops || [];
        setLiveCrops(cropsData);
        if (cropsData.length > 0) {
          setStats((prev) => ({
            ...prev,
            crops: cropsData.length,
            auctions: cropsData.filter((c) => c.status === "ACTIVE" || c.status === "APPROVED").length || prev.auctions
          }));
        }
      } catch (err) {
        console.log("Using static sample crops preview:", err);
      } finally {
        setLoadingMarketplace(false);
      }
    };

    fetchMarketplaceData();
  }, []);

  // Static Sample Crops Preview for fallback
  const sampleCrops = [
    {
      id: "crop-101",
      crop_name: "Premium Desi Tomato",
      quantity: 500,
      quantity_unit: "kg",
      min_price: 32,
      max_price: 45,
      district: "Nashik, Maharashtra",
      variety: "Heirloom Red",
      traceability_id: "KM-TR-90412",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "crop-102",
      crop_name: "Sharbati Wheat Grade A",
      quantity: 1200,
      quantity_unit: "kg",
      min_price: 28,
      max_price: 36,
      district: "Sehore, Madhya Pradesh",
      variety: "Golden Grain",
      traceability_id: "KM-TR-88120",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "crop-103",
      crop_name: "Organic Basmati Paddy",
      quantity: 800,
      quantity_unit: "kg",
      min_price: 65,
      max_price: 82,
      district: "Karnal, Haryana",
      variety: "Pusa 1121",
      traceability_id: "KM-TR-74391",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "crop-104",
      crop_name: "Yellow Hybrid Maize",
      quantity: 1500,
      quantity_unit: "kg",
      min_price: 22,
      max_price: 29,
      district: "Davanagere, Karnataka",
      variety: "Sweet Yellow",
      traceability_id: "KM-TR-65209",
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const displayCrops = liveCrops.length > 0 ? liveCrops.slice(0, 4) : sampleCrops;

  const faqs = [
    {
      q: "What is Krishi Mitra?",
      a: "Krishi Mitra is a commercial AI-powered agricultural marketplace and supply chain platform. It directly connects Indian farmers with buyers, retailers, and consumers through verified crop listings, live auctions, secure escrow payments, and QR-based farm-to-market traceability."
    },
    {
      q: "How can farmers list their crops for auction?",
      a: "Farmers log into their dashboard, enter crop details (name, quantity, expected price, district, images), and submit the listing. Once verified by the designated Primary Farming Organization (PFO), the crop automatically goes live for transparent bidding."
    },
    {
      q: "How does the transparent bidding & auction system work?",
      a: "Registered dealers and buyers view verified crops in the live marketplace. During the auction period, buyers submit competitive bids. The system ensures complete transparency, updating highest bids in real-time until the winning bid is finalized."
    },
    {
      q: "What is escrow payment security and how does it protect transactions?",
      a: "Escrow secures the financial transaction between the buyer and the farmer. The buyer's payment is held safely in escrow until PFO inspection and delivery verification are completed. Funds are released to the farmer only upon successful dispatch and receipt confirmation."
    },
    {
      q: "How does QR Traceability work?",
      a: "Every crop batch listed on Krishi Mitra is assigned a unique Traceability ID and QR code. Customers or buyers can scan the QR code to trace the crop's complete origin, farmer details, PFO quality verification, auction timestamp, and supply chain journey."
    },
    {
      q: "What AI tools are integrated into Krishi Mitra?",
      a: "Krishi Mitra features dedicated AI tools including an AI Agriculture Chatbot for instant farming advisory and a Crop Yield Predictor to estimate expected harvest volume."
    },
    {
      q: "Who can participate in auctions?",
      a: "Verified agricultural dealers, wholesalers, retailers, and PFO administrators can participate in crop auctions after completing registration and profile verification."
    },
    {
      q: "How can consumers track a crop from farm to table?",
      a: "Consumers simply enter the crop's Traceability ID into the QR Traceability search bar on the landing page or scan the QR code on the packaging to view full harvest and quality credentials."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">

      {/* ========================================================================= */}
      {/* 3. HERO NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 font-serif">
                    KRISHI MITRA
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  SMART AGRITECH PLATFORM
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              <a href="#about" className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
                About
              </a>
              <a href="#features" className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
                Features
              </a>
              <a href="#ai-suite" className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1">
                <span>AI Suite</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              </a>
              <button onClick={() => navigate("/login")} className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
                Marketplace
              </button>
              <a href="#traceability" className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
                Traceability
              </a>
              <a href="#escrow" className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
                Escrow Security
              </a>
              <a href="#faq" className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
                FAQ
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 rounded-xl shadow-md shadow-emerald-700/25 hover:shadow-lg hover:shadow-emerald-700/35 transition-all flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              About Platform
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              Platform Features
            </a>
            <a
              href="#ai-suite"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>AI Tools Suite</span>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold">2 Tools</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              Crop Marketplace
            </button>
            <a
              href="#traceability"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              QR Traceability
            </a>
            <a
              href="#escrow"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              Escrow Security
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              FAQ
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full py-3 text-center font-semibold text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/register");
                }}
                className="w-full py-3 text-center font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 shadow-md transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden bg-gradient-to-b from-emerald-50/70 via-[#FDFBF7] to-white">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl h-96 bg-emerald-200/30 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Content (4, 5 CTA Buttons) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide shadow-sm">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Next-Generation Indian Agritech Platform</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Empowering Farmers Through{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800">
                  Smarter Agriculture
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Krishi Mitra connects farmers, buyers and customers through AI-powered agriculture, transparent auctions, secure escrow payments and farm-to-market traceability.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 hover:from-emerald-800 hover:to-green-700 rounded-2xl shadow-xl shadow-emerald-700/25 hover:shadow-2xl hover:shadow-emerald-700/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 hover:border-emerald-500 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <span>Explore Marketplace</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Farm-to-Buyer Auctions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified PFO Inspection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Escrow Bank Protection</span>
                </div>
              </div>

            </div>

            {/* Right Visual Environment (2. Hero Visual) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/15 border-4 border-white bg-slate-900 group">
                <img
                  src={heroFarmerImg}
                  alt="Real Indian farmer working in lush green farmland with tractor"
                  className="w-full h-[440px] sm:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Sunlight Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/20 to-transparent" />

                {/* Integrated Natural Environment Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-emerald-100 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Commercial Agricultural Ecosystem</h4>
                      <p className="text-xs text-slate-500">Empowering 100% verified Indian farmers</p>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    LIVE
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 6. HERO INFORMATION CARDS (Anchored below hero visual cleanly) */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-emerald-500 hover:shadow-lg transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">🌾 Crop Marketplace</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Buy & sell verified agricultural crops with live bidding.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-emerald-500 hover:shadow-lg transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">🤖 AI Advisory</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  AI-powered crop yield prediction & advisory chatbot.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-emerald-500 hover:shadow-lg transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">🔐 Secure Escrow</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Protected agricultural payment workflow between parties.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-900/5 hover:border-emerald-500 hover:shadow-lg transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">🔎 QR Traceability</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Track crop history & origin from farm to consumer market.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* ========================================================================= */}
      {/* 8. "ONE PLATFORM, COMPLETE AGRICULTURAL ECOSYSTEM" */}
      {/* ========================================================================= */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Seamless Supply Chain Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One Platform, Complete Agricultural Ecosystem
            </h2>
            <p className="text-base text-slate-600">
              Krishi Mitra connects every participant in the agricultural value chain—from harvest to table—with total transparency.
            </p>
          </div>

          {/* Visual Step Flow Diagram */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                01
              </div>
              <p className="font-bold text-slate-900 text-sm">Farmer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Crop Harvest</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                02
              </div>
              <p className="font-bold text-slate-900 text-sm">PFO</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Verification</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                03
              </div>
              <p className="font-bold text-slate-900 text-sm">Auction</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Live Bidding</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                04
              </div>
              <p className="font-bold text-slate-900 text-sm">Dealer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Bulk Buyer</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                05
              </div>
              <p className="font-bold text-slate-900 text-sm">Escrow</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Secure Payment</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                06
              </div>
              <p className="font-bold text-slate-900 text-sm">Retailer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Local Market</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                07
              </div>
              <p className="font-bold text-slate-900 text-sm">Customer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">End Consumer</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                08
              </div>
              <p className="font-bold text-slate-900 text-sm">Traceability</p>
              <p className="text-[11px] text-slate-500 mt-0.5">QR Verification</p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CORE PLATFORM FEATURES */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Modern Agriculture
            </h2>
            <p className="text-base text-slate-600">
              Explore the deployed core capabilities powering the Krishi Mitra ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-emerald-500 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sprout className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Smart Crop Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Farmers can easily manage crop inventories, add expected harvest details, submit quality photographs, and track listing statuses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-emerald-500 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Live Auctions & Bidding</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transparent agricultural auctions connect verified farmers directly with dealers and retailers for optimal price discovery.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-emerald-500 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Secure Escrow Payments</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automated escrow holding protects both farmers and buyers during auction payment workflows until dispatch verification.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-emerald-500 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">QR Traceability</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unique QR codes allow complete farm-to-table supply chain tracking, verifying crop origin, PFO approval, and ownership.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-emerald-500 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Crop Yield Prediction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Predict expected crop yield based on regional weather, soil parameters, and crop types using our deployed ML model.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-emerald-500 hover:shadow-xl transition-all space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Agriculture Chatbot</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instant 24/7 agricultural guidance and assistance using our specialized farming AI chatbot service.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. AI SUITE SECTION */}
      {/* ========================================================================= */}
      <section id="ai-suite" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Deployed Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Tools Built for Modern Farmers
            </h2>
            <p className="text-base text-emerald-200/80">
              Access our live, specialized agricultural AI engines designed to assist farming decisions, price forecasting, and yield estimations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* AI Tool 1: Chatbot */}
            <div className="bg-slate-900/90 rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-400 shadow-2xl flex flex-col justify-between space-y-6 group hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900/80 border border-emerald-600 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">AI Agriculture Chatbot</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                    Live Tool
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  24/7 AI-powered conversational assistance providing guidance on crop health, soil care, pest management, and farming best practices.
                </p>
              </div>

              <a
                href="https://farmer-chatbot12.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition-all"
              >
                <span>Open AI Tool</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* AI Tool 2: Yield Predictor */}
            <div className="bg-slate-900/90 rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-400 shadow-2xl flex flex-col justify-between space-y-6 group hover:-translate-y-1 transition-all">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900/80 border border-emerald-600 text-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Crop Yield Predictor</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                    Live Model
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Machine learning model to estimate harvest yield per acre based on regional weather inputs, soil nutrients, and crop varieties.
                </p>
              </div>

              <a
                href="https://dainty-raindrop-5b7238.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition-all"
              >
                <span>Open AI Tool</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </section>



      {/* ========================================================================= */}
      {/* 12. AUCTION & BIDDING SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Explanation */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                Price Discovery Engine
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Transparent Auctions & Competitive Bidding
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Eliminate middlemen and lowball offers. Krishi Mitra enables competitive live auctions where multiple buyers bid directly for verified crop harvests.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Fair Market Pricing</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Real-time competitive bids ensure farmers receive optimal value for their produce.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Automated Winner Selection</h4>
                    <p className="text-xs text-slate-600 mt-0.5">The highest valid bid automatically secures the winning allocation upon timer expiry.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Direct Escrow Transition</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Winning bids immediately lock payment safely into escrow protection.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Visual Workflow Card */}
            <div className="lg:col-span-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Auction Lifecycle Workflow</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                    TRANSPARENT
                  </span>
                </h3>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">1</div>
                      <span className="text-sm font-bold text-slate-800">Farmer Crop Listing</span>
                    </div>
                    <span className="text-xs text-slate-500">Batch Verified</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">2</div>
                      <span className="text-sm font-bold text-slate-800">Live Auction Window</span>
                    </div>
                    <span className="text-xs text-amber-600 font-bold">Bidding Open</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">3</div>
                      <span className="text-sm font-bold text-slate-800">Highest Bid Finalized</span>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold">Winner Locked</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">4</div>
                      <span className="text-sm font-bold text-slate-800">Escrow Payment & Dispatch</span>
                    </div>
                    <span className="text-xs text-slate-500">Fund Protected</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. ESCROW SECURITY SECTION */}
      {/* ========================================================================= */}
      <section id="escrow" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Security Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-800/40 bg-slate-900">
                <img
                  src={escrowShieldImg}
                  alt="Krishi Mitra Secure Escrow Protection Shield"
                  className="w-full h-96 object-cover object-center"
                />
              </div>
            </div>

            {/* Explanation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Financial Safety</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Secure Transactions. Trusted Agriculture.
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Our platform uses an escrow-based workflow to protect transactions for both farmers and buyers. Payments are safely held in escrow and released only when crop inspection and delivery criteria are verified.
              </p>

              {/* Workflow Flow Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center space-y-1">
                  <span className="text-xs text-emerald-400 font-mono font-bold">STEP 1</span>
                  <p className="text-xs font-bold text-white">Payment Submitted</p>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center space-y-1">
                  <span className="text-xs text-emerald-400 font-mono font-bold">STEP 2</span>
                  <p className="text-xs font-bold text-white">Payment Verified</p>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center space-y-1">
                  <span className="text-xs text-emerald-400 font-mono font-bold">STEP 3</span>
                  <p className="text-xs font-bold text-white">Crop Dispatch</p>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center space-y-1">
                  <span className="text-xs text-emerald-400 font-mono font-bold">STEP 4</span>
                  <p className="text-xs font-bold text-white">Fund Release</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. QR TRACEABILITY SECTION */}
      {/* ========================================================================= */}
      <section id="traceability" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                Farm-to-Market Transparency
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                QR-Based Crop Traceability
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                From farm to marketplace, every important crop event can be tracked through its Traceability ID. Verify crop origin, farmer identity, PFO quality check, and transport timeline.
              </p>

              {/* Traceability Flow */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-700 flex flex-wrap items-center gap-2">
                <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">QR Code</span>
                <span>→</span>
                <span>Crop Origin</span>
                <span>→</span>
                <span>Farmer</span>
                <span>→</span>
                <span>PFO Check</span>
                <span>→</span>
                <span>Auction</span>
                <span>→</span>
                <span>Winner Buyer</span>
                <span>→</span>
                <span>Consumer</span>
              </div>



            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                <img
                  src={qrTraceabilityImg}
                  alt="Fresh agricultural harvest with QR code traceability tag"
                  className="w-full h-[400px] object-cover object-center"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 15. FARMER-FIRST SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Image */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                <img
                  src={farmerHarvestImg}
                  alt="Indian farmer standing in golden harvest wheat field"
                  className="w-full h-[420px] object-cover object-center"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                Farmer Empowerment
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Technology That Works for Farmers
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Krishi Mitra was built to empower Indian farmers with direct access to nationwide markets, price clarity, and protective financial mechanisms.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    Better Crop Visibility
                  </h4>
                  <p className="text-xs text-slate-600">Showcase verified crops to thousands of active buyers nationwide.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Transparent Auctions
                  </h4>
                  <p className="text-xs text-slate-600">Eliminate distress selling with competitive real-time bidding.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-600" />
                    AI-Assisted Decisions
                  </h4>
                  <p className="text-xs text-slate-600">ML models forecast crop yield volumes and harvest health.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Secure Payment Guarantee
                  </h4>
                  <p className="text-xs text-slate-600">Escrow workflow guarantees timely fund transfers upon delivery.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 16. HOW KRISHI MITRA WORKS */}
      {/* ========================================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Simple 6-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Krishi Mitra Works
            </h2>
            <p className="text-base text-slate-600">
              A straightforward digital process designed for simplicity and maximum efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 hover:border-emerald-500 transition-all">
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">01</span>
              <h3 className="font-bold text-slate-900 text-base">Register</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Create a verified account as a Farmer, Buyer, PFO, or Retailer.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 hover:border-emerald-500 transition-all">
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">02</span>
              <h3 className="font-bold text-slate-900 text-base">List Crop</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Farmer submits crop details, pictures, location, and reserve price.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 hover:border-emerald-500 transition-all">
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">03</span>
              <h3 className="font-bold text-slate-900 text-base">PFO Check</h3>
              <p className="text-xs text-slate-600 leading-relaxed">District PFO verifies crop quality and approves the auction listing.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 hover:border-emerald-500 transition-all">
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">04</span>
              <h3 className="font-bold text-slate-900 text-base">Live Auction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Dealers submit competitive bids in a transparent live auction.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 hover:border-emerald-500 transition-all">
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">05</span>
              <h3 className="font-bold text-slate-900 text-base">Secure Escrow</h3>
              <p className="text-xs font-bold text-slate-900 text-xs">Winning payment is safely locked in escrow until dispatch.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3 hover:border-emerald-500 transition-all">
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">06</span>
              <h3 className="font-bold text-slate-900 text-base">Traceable Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Crops delivered with QR traceability to retailers & customers.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 17. ROLE-BASED ECOSYSTEM */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Multi-Role Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Dashboards for Every Stakeholder
            </h2>
            <p className="text-base text-slate-600">
              Krishi Mitra provides specialized interfaces tailored to the exact operational needs of each ecosystem member.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Role 1: Farmer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🌾
              </div>
              <h3 className="text-lg font-bold text-slate-900">Farmer Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                List crops, track auction bids, manage payments, and consult AI yield prediction tools.
              </p>
            </div>

            {/* Role 2: PFO */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🏢
              </div>
              <h3 className="text-lg font-bold text-slate-900">PFO Inspection Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect physical crop samples, verify farmer listings, approve auction eligibility, and log quality reports.
              </p>
            </div>

            {/* Role 3: Dealer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🚛
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dealer Bidding Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse verified crop listings nationwide, place real-time competitive bids, and manage bulk purchases.
              </p>
            </div>

            {/* Role 4: Retailer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🏪
              </div>
              <h3 className="text-lg font-bold text-slate-900">Retailer Store Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Procure crops from dealers, set retail pricing, manage inventory, and serve local consumer orders.
              </p>
            </div>

            {/* Role 5: Customer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🛒
              </div>
              <h3 className="text-lg font-bold text-slate-900">Customer Storefront</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Order fresh produce from nearby verified retailers and scan QR codes to verify crop harvest origin.
              </p>
            </div>

            {/* Role 6: Admin */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                👨‍💼
              </div>
              <h3 className="text-lg font-bold text-slate-900">System Admin Control</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Oversee platform user roles, audit escrow transactions, manage PFO registrations, and monitor system health.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 18. TRUST & TRANSPARENCY SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Verified Crops</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Transparent Auctions</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Secure Payments</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">QR Traceability</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">AI Assistance</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Role-Based Access</p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 19. BUILT FOR THE AGRICULTURAL ECOSYSTEM SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/30">
                Commercial Impact
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built for the Agricultural Ecosystem
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Krishi Mitra addresses structural inefficiencies in Indian agriculture by providing an end-to-end digital foundation. By combining AI forecasting, verified PFO quality checks, competitive bidding, escrow safety, and QR traceability, we deliver measurable trust for farmers and buyers alike.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Join Ecosystem</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 20. FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-base text-slate-600">
              Everything you need to know about the Krishi Mitra platform architecture and functionality.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 text-base flex items-center justify-between gap-4 hover:text-emerald-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-sm text-slate-600 border-t border-slate-200/50 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 21. FINAL CTA */}
      {/* ========================================================================= */}
      <section className="relative py-24 overflow-hidden bg-slate-900 text-white">
        
        {/* Background Image */}
        <img
          src={ctaFarmlandBg}
          alt="Wide Indian farmland background at sunrise"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
            <Sprout className="w-8 h-8 text-yellow-300" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Build a Smarter Agricultural Future
          </h2>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect farmers, buyers and customers through one transparent digital agricultural ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-2xl shadow-xl shadow-emerald-900/50 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Marketplace</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 22. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1: Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Sprout className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">KRISHI MITRA</span>
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">SMART AGRITECH PLATFORM</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Empowering Indian farmers through AI crop insights, verified auctions, bank-grade escrow payments, and farm-to-table QR traceability.
              </p>
            </div>

            {/* Col 2: Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-emerald-400 transition-colors">Crop Marketplace</button></li>
                <li><a href="#traceability" className="hover:text-emerald-400 transition-colors">QR Traceability</a></li>
                <li><a href="#escrow" className="hover:text-emerald-400 transition-colors">Escrow Protection</a></li>
              </ul>
            </div>

            {/* Col 3: AI Suite */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Suite</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://farmer-chatbot12.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <span>AI Chatbot</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a href="https://dainty-raindrop-5b7238.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <span>Yield Predictor</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Authentication */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate("/login")} className="hover:text-emerald-400 transition-colors">Sign In</button></li>
                <li><button onClick={() => navigate("/register")} className="hover:text-emerald-400 transition-colors">Register Account</button></li>
                <li><a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ & Help</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Krishi Mitra. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Commercial Agricultural Technology Platform
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
