-- SQL DDL for KrishiMitra Supabase Tables

-- Add missing columns to crops table
ALTER TABLE crops ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE crops ADD COLUMN IF NOT EXISTS quality_grade TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS pfo_remarks TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS verified_district TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Crop Auctions
CREATE TABLE IF NOT EXISTS crop_auctions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    auction_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auction_end TIMESTAMP WITH TIME ZONE,
    auction_status TEXT DEFAULT 'active',
    closed_by_pfo BOOLEAN DEFAULT FALSE,
    winning_bid_id UUID REFERENCES crop_bids(id),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop QR Codes
CREATE TABLE IF NOT EXISTS crop_qr (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    qr_traceability_id TEXT,
    qr_base64 TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Verifications Log
CREATE TABLE IF NOT EXISTS crop_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    verification_status TEXT NOT NULL,
    quality_grade TEXT,
    remarks TEXT,
    rejection_reason TEXT,
    verified_by TEXT,
    verified_district TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Notifications
CREATE TABLE IF NOT EXISTS crop_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Matches
CREATE TABLE IF NOT EXISTS crop_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    request_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_role TEXT NOT NULL,
    match_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auction Notifications
CREATE TABLE IF NOT EXISTS auction_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    user_role TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    request_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer Crop Requests
CREATE TABLE IF NOT EXISTS dealer_crop_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES dealers(id),
    crop_type TEXT NOT NULL,
    quantity_needed DECIMAL(10,2),
    unit TEXT,
    max_price DECIMAL(10,2),
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retailer Crop Requests
CREATE TABLE IF NOT EXISTS retailer_crop_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES retailers(id),
    crop_type TEXT NOT NULL,
    quantity_needed DECIMAL(10,2),
    unit TEXT,
    max_price DECIMAL(10,2),
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop Bids
CREATE TABLE IF NOT EXISTS crop_bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL,
    bidder_role TEXT NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bid History
CREATE TABLE IF NOT EXISTS bid_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bid_id UUID NOT NULL REFERENCES crop_bids(id) ON DELETE CASCADE,
    previous_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crop_auctions_crop_id ON crop_auctions(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_qr_crop_id ON crop_qr(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_verifications_crop_id ON crop_verifications(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_notifications_farmer_id ON crop_notifications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_matches_crop_id ON crop_matches(crop_id);
CREATE INDEX IF NOT EXISTS idx_auction_notifications_user_id ON auction_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_bids_crop_id ON crop_bids(crop_id);
CREATE INDEX IF NOT EXISTS idx_dealer_crop_requests_user_id ON dealer_crop_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_retailer_crop_requests_user_id ON retailer_crop_requests(user_id);