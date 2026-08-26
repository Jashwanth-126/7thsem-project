-- 1. Alter retailers table to add profile columns
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS city_village TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS pin_code TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS shop_photo TEXT;

-- 2. Alter customers table to add profile and selected retailer columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city_village TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pin_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS selected_retailer_id INT REFERENCES retailers(id) ON DELETE SET NULL;

-- 3. Create retailer_inventory table
CREATE TABLE IF NOT EXISTS retailer_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    crop_id UUID,
    crop_name TEXT NOT NULL,
    quantity_available DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    farmer_name TEXT NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auction_id BIGINT UNIQUE
);

-- 4. Create customer_orders table
CREATE TABLE IF NOT EXISTS customer_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    retailer_id INT NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Dispatched', 'Delivered', 'Cancelled'
    delivery_address TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES retailer_inventory(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);
