import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import PFODashboard from "./pages/PFODashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import DealerDashboard from "./pages/DealerDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import TraceabilityDetailsPage from "./pages/TraceabilityDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* PFO */}
        <Route
          path="/pfo/dashboard"
          element={<PFODashboard />}
        />

        {/* Farmer */}
        <Route
          path="/farmer/dashboard"
          element={<FarmerDashboard />}
        />

        {/* Dealer */}
        <Route
          path="/dealer/dashboard"
          element={<DealerDashboard />}
        />

        {/* Retailer */}
        <Route
          path="/retailer/dashboard"
          element={<RetailerDashboard />}
        />

        {/* Customer */}
        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />

        {/* Traceability Details */}
        <Route
          path="/traceability/:traceability_id"
          element={<TraceabilityDetailsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;