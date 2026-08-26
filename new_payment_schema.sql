-- NEW SQL QUERIES FOR ESCROW PAYMENT & CROP DISPATCH

-- 1. Admin Escrow Payment QR
CREATE TABLE IF NOT EXISTS admin_escrow_qr (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    qr_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one active QR at a time by using a unique index or simply updating old ones to false when inserting
-- Example to set others to false: UPDATE admin_escrow_qr SET is_active = false WHERE id != NEW.id;

-- 2. Escrow Payment Workflows (Farmer QR & Dealer Payment Proof)
CREATE TABLE IF NOT EXISTS auction_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auction_id BIGINT NOT NULL UNIQUE REFERENCES crop_auctions(id) ON DELETE CASCADE,
    farmer_id BIGINT NOT NULL,
    dealer_id BIGINT NOT NULL, -- dealers or retailers, referencing appropriately if they share a common table, or just keep UUID
    
    -- Status Tracking (Waiting For Farmer Payment QR, Escrow Payment Submitted, etc.)
    delivery_status TEXT DEFAULT 'Waiting For Farmer Payment QR',
    
    -- Farmer Payment QR
    farmer_qr_enabled BOOLEAN DEFAULT FALSE,
    farmer_qr_url TEXT,
    
    -- Escrow Payment
    escrow_enabled BOOLEAN DEFAULT FALSE,
    payment_screenshot_url TEXT,
    utr_number TEXT,
    transaction_remarks TEXT,
    payment_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Payment Verification
    payment_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Crop Dispatch
    dispatch_enabled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crop Dispatch & Delivery Tracking
CREATE TABLE IF NOT EXISTS crop_deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auction_id BIGINT NOT NULL UNIQUE REFERENCES crop_auctions(id) ON DELETE CASCADE,
    farmer_id BIGINT NOT NULL,
    dealer_id BIGINT NOT NULL,
    crop_id BIGINT NOT NULL,
    
    -- Dispatch Form
    traveler_number TEXT NOT NULL,
    delivery_person_name TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    dispatch_notes TEXT,
    
    -- Images
    loading_image_url TEXT NOT NULL,
    delivery_proof_url TEXT NOT NULL,
    transport_receipt_url TEXT NOT NULL,
    
    -- Delivery QR Info
    delivery_qr_url TEXT NOT NULL,
    verification_token TEXT NOT NULL,
    
    dispatch_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_completed BOOLEAN DEFAULT FALSE
);

-- Note: Ensure Supabase Storage buckets exist:
-- 1. payment-qrs (public)
-- 2. payment-proofs (public)
-- 3. delivery-proofs (public)
