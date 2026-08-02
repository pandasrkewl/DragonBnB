DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
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

CREATE TABLE amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE property_amenities (
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE, 
    amenity_id INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL, 
    end_date DATE NOT NULL, 
    total_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',

    CHECK (end_date > start_date),
    CHECK (total_price >= 0),
    CHECK (
        status in (
            'Pending',
            'Confirmed',
            'Cancelled',
            'Rejected',
            'Completed'
        )
    )
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL REFERENCES users(id),
    property_id INTEGER NOT NULL REFERENCES properties(id),
    booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id)
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

INSERT INTO "amenities" ("name")
VALUES
    ('Fireplace'),
    ('TV');

INSERT INTO "property_amenities" ("property_id", "amenity_id")
VALUES
    (1, 1),
    (2, 1),
    (2, 2);

INSERT INTO "bookings" ("property_id", "user_id", "start_date", "end_date", "total_price", "status")
VALUES 
    (1, 2, '2026-09-10', '2026-09-13', 525.00, 'Confirmed'),
    (2, 3, '2026-10-01', '2026-10-03', 280.00, 'Pending'),
    (3, 5, '2026-11-15', '2026-11-18', 750.00, 'Completed');

INSERT INTO "reviews" ("rating", "comment", "user_id", "property_id", "booking_id")
VALUES
    (5, 'Great location and very clean apartment.', 2, 1, 1),
    (4, 'Nice loft and easy check-in process.', 3, 2, 2),
    (5, 'Spacious home with plenty of room.', 5, 3, 3);