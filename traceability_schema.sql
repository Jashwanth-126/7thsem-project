-- SQL DDL for Crop Traceability System
-- Table: traceability_history

CREATE TABLE IF NOT EXISTS traceability_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id BIGINT REFERENCES crops(id) ON DELETE CASCADE,
    traceability_id TEXT NOT NULL,
    performed_by TEXT,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    price DECIMAL(10, 2),
    location TEXT,
    remarks TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_traceability_history_tid ON traceability_history(traceability_id);
CREATE INDEX IF NOT EXISTS idx_traceability_history_crop_id ON traceability_history(crop_id);
