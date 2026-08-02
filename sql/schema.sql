DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    host BOOLEAN DEFAULT FALSE
);

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,

    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,

    max_guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms NUMERIC(3, 1) NOT NULL,
    beds INTEGER NOT NULL,

    price_per_night NUMERIC(10, 2) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    pets_allowed BOOLEAN DEFAULT FALSE,
    check_in_time TIME,
    check_out_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO "users" ("first_name", "last_name", "email", "password_hash", "host")
VALUES
    ('Max', 'Chiu', 'maxkchiu@gmail.com', 'admin', TRUE),
    ('Larry', 'Wu', 'larrywu@test.com', 'admin', FALSE),
    ('Peter', 'Parker', 'notspiderman@marvel.com', 'admin', FALSE),
    ('Tony', 'Stark', 'iamironman@dead.com', 'admin', TRUE),
    ('Emma', 'Johnson', 'emma.johnson@example.com', 'admin', FALSE),
    ('Noah', 'Williams', 'noah.williams@example.com', 'admin', TRUE),
    ('Olivia', 'Brown', 'olivia.brown@example.com', 'admin', FALSE),
    ('Liam', 'Davis', 'liam.davis@example.com', 'admin', TRUE);


INSERT INTO "properties" ("host_id", "title", "description", "address_line_1", "address_line_2", "city", "state", "postal_code", "country", "max_guests", "bedrooms", "bathrooms", "beds", "price_per_night", "property_type", "pets_allowed", "check_in_time", "check_out_time")
VALUES
    (1, 'Modern Center City Apartment', 'Bright apartment near restaurants and public transportation.', '1500 Market Street', 'Apartment 8B', 'Philadelphia', 'Pennsylvania', '19102', 'United States', 4, 2, 1.5, 2, 175.00, 'Apartment', FALSE, '15:00', '11:00'),
    (1, 'Cozy Old City Loft', 'Historic loft close to shops and nightlife.', '225 Arch Street', NULL, 'Philadelphia', 'Pennsylvania', '19106', 'United States', 2, 1, 1.0, 1, 140.00, 'Apartment', FALSE, '16:00', '10:00'),
    (1, 'Spacious University City Home', 'Large home near Drexel and Penn.', '3200 Powelton Avenue', NULL, 'Philadelphia', 'Pennsylvania', '19104', 'United States', 6, 3, 2.5, 4, 250.00, 'House', TRUE, '15:00', '11:00');
    
-- CREATE TABLE reviews (
--     id SERIAL PRIMARY KEY,
--     rating NUMERIC(2, 1) NOT NULL,
--     comment TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     user_id INTEGER NOT NULL REFERENCES users(id),
--     property_id INTEGER NOT NULL REFERENCES properties(id),
--     booking_id INTEGER UNIQUE NOT NULL REFERENCES bookings(id)
-- )
