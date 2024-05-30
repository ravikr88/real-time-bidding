CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(255) DEFAULT 'user', -- roles : 'user', 'admin' 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Drop the previous table if it exists
DROP TABLE IF EXISTS items;

-- Create the new items table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2),
    image_url VARCHAR(255),
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger function to set the default value for current_price
CREATE OR REPLACE FUNCTION set_current_price_default()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_price := NEW.starting_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the function before insert
CREATE TRIGGER set_current_price_default_trigger BEFORE
INSERT
    ON items FOR EACH ROW
EXECUTE FUNCTION set_current_price_default ();

CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL,
    user_id INT NOT NULL,
    bid_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);