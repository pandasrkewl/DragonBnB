DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
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
    host BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255) DEFAULT 'placeholders/default_user.jpg'
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
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    property_type VARCHAR(50) NOT NULL,
    pets_allowed BOOLEAN DEFAULT FALSE,
    check_in_time TIME,
    check_out_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE amenities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  basics BOOLEAN,
  bathroom BOOLEAN,
  bedroom_and_laundry BOOLEAN,
  entertainment BOOLEAN,
  family BOOLEAN,
  heating_and_cooling BOOLEAN,
  home_safety BOOLEAN,
  internet_and_office BOOLEAN,
  kitchen_and_dining BOOLEAN,
  location_features BOOLEAN,
  outdoor BOOLEAN,
  parking_and_facilities BOOLEAN,
  services BOOLEAN
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    CHECK (end_date > start_date),
    CHECK (total_price >= 0),
    CHECK (
        status in (
            'pending',
            'confirmed',
            'cancelled',
            'rejected',
            'completed'
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

CREATE TABLE property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL DEFAULT 'placeholders/default_home.jpg',
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    list_name VARCHAR(100) NOT NULL,
    UNIQUE (user_id, property_id, list_name)
);

-- NGL im not sure what the messaging schemas are gonna be like placeholders

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL REFERENCES users(id),
    host_id INTEGER NOT NULL REFERENCES users(id),
    property_id INTEGER NOT NULL REFERENCES properties(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY, 
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password_hash,
    host,
    image_url
)
VALUES
    (1, 'Max', 'Chiu', 'maxkchiu@gmail.com', 'admin', TRUE, '1.jpg'),
    (2, 'Larry', 'Wu', 'larrywu@test.com', 'admin', FALSE, NULL),
    (3, 'Peter', 'Parker', 'notspiderman@marvel.com', 'admin', FALSE, NULL),
    (4, 'Tony', 'Stark', 'iamironman@dead.com', 'admin', TRUE, NULL),
    (5, 'Emma', 'Johnson', 'emma.johnson@example.com', 'admin', FALSE, NULL),
    (6, 'Noah', 'Williams', 'noah.williams@example.com', 'admin', TRUE, NULL),
    (7, 'Olivia', 'Brown', 'olivia.brown@example.com', 'admin', FALSE, NULL),
    (8, 'Liam', 'Davis', 'liam.davis@example.com', 'admin', TRUE, NULL),
    (9, 'Ava', 'Martinez', 'ava.martinez@example.com', 'admin', FALSE, NULL),
    (10, 'Ethan', 'Wilson', 'ethan.wilson@example.com', 'admin', TRUE, NULL),
    (11, 'Sophia', 'Anderson', 'sophia.anderson@example.com', 'admin', FALSE, NULL),
    (12, 'James', 'Thomas', 'james.thomas@example.com', 'admin', TRUE, NULL),
    (13, 'Mia', 'Taylor', 'mia.taylor@example.com', 'admin', FALSE, NULL),
    (14, 'Benjamin', 'Moore', 'benjamin.moore@example.com', 'admin', TRUE, NULL),
    (15, 'Charlotte', 'Jackson', 'charlotte.jackson@example.com', 'admin', FALSE, NULL),
    (16, 'Lucas', 'Martin', 'lucas.martin@example.com', 'admin', TRUE, NULL),
    (17, 'Amelia', 'Lee', 'amelia.lee@example.com', 'admin', FALSE, NULL),
    (18, 'Henry', 'Walker', 'henry.walker@example.com', 'admin', TRUE, NULL),
    (19, 'Evelyn', 'Hall', 'evelyn.hall@example.com', 'admin', FALSE, NULL),
    (20, 'Daniel', 'Allen', 'daniel.allen@example.com', 'admin', TRUE, NULL),
    (21, 'Harper', 'Young', 'harper.young@example.com', 'admin', FALSE, NULL),
    (22, 'Michael', 'King', 'michael.king@example.com', 'admin', TRUE, NULL),
    (23, 'Ella', 'Wright', 'e.wwright@example.com', 'admin', FALSE, NULL),
    (24, 'Jack', 'Scott', 'jack.scott@example.com', 'admin', TRUE, NULL);

INSERT INTO properties (
    id,
    host_id,
    title,
    description,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    country,
    max_guests,
    bedrooms,
    bathrooms,
    beds,
    price_per_night,
    rating,
    review_count,
    property_type,
    pets_allowed,
    check_in_time,
    check_out_time,
    created_at
)
VALUES
(1, 1, 'Modern Center City Apartment', 'Bright apartment near restaurants and public transportation.', '1500 Market Street', 'Apartment 8B', 'Philadelphia', 'Pennsylvania', '19102', 'United States', 4, 2, 1.5, 2, 175.00, 0.00, 0, 'Apartment', FALSE, '15:00', '11:00', CURRENT_TIMESTAMP),
(2, 1, 'Cozy Old City Loft', 'Historic loft close to shops and nightlife.', '225 Arch Street', NULL, 'Philadelphia', 'Pennsylvania', '19106', 'United States', 2, 1, 1.0, 1, 140.00, 0.00, 0, 'Apartment', FALSE, '16:00', '10:00', CURRENT_TIMESTAMP),
(3, 16, 'Spacious University City Home', 'Large home near Drexel and Penn.', '3200 Powelton Avenue', NULL, 'Philadelphia', 'Pennsylvania', '19104', 'United States', 6, 3, 2.5, 4, 250.00, 0.00, 0, 'House', TRUE, '15:00', '11:00', CURRENT_TIMESTAMP),
(4, 1, 'Suburban Family House', 'Rooms to live in, Suburban Virginia', '6139 Shiplett Blvd.', NULL, 'Burke', 'VA', '22015', 'United States', 2, 2, 1.0, 2, 200.00, 4.00, 2, 'Room', FALSE, '14:00', '10:00', '2025-01-12T08:17:43-07:00'),
(5, 4, 'Beachfront Villa', 'Luxury oceanfront villa with pool', '12 Ocean Dr', NULL, 'Miami', 'FL', '33139', 'United States', 8, 4, 3.0, 5, 420.00, 0.00, 0, 'House', TRUE, '15:30', '11:00', '2025-03-28T19:52:11+01:00'),
(6, 6, 'Cozy Loft', 'Downtown loft near attractions', '101 Market St', NULL, 'Philadelphia', 'PA', '19107', 'United States', 2, 1, 1.0, 1, 145.00, 0.00, 0, 'Apartment', FALSE, '16:00', '10:30', '2025-06-05T14:08:55-04:00'),
(7, 24, 'Mountain Cabin', 'Quiet cabin with fireplace', '88 Pine Rd', NULL, 'Aspen', 'CO', '81611', 'United States', 6, 3, 2.0, 4, 275.00, 0.00, 0, 'House', TRUE, '17:00', '11:00', '2025-09-19T22:34:19+09:00'),
(8, 10, 'City Studio', 'Affordable studio', '55 Center Ave', NULL, 'New York', 'NY', '10001', 'United States', 2, 1, 1.0, 1, 135.00, 0.00, 0, 'Apartment', FALSE, '14:30', '10:00', '2025-11-07T06:45:02+10:00'),
(9, 14, 'Lake House', 'Private dock and kayaks', '9 Lake View', NULL, 'Traverse City', 'MI', '49684', 'United States', 10, 5, 3.0, 7, 350.00, 0.00, 0, 'House', TRUE, '15:00', '12:00', '2025-12-22T11:29:37+05:30'),
(10, 12, 'Desert Retreat', 'Modern home with hot tub', '700 Cactus Way', NULL, 'Scottsdale', 'AZ', '85251', 'United States', 6, 3, 2.0, 3, 290.00, 0.00, 0, 'House', FALSE, '16:30', '11:00', '2026-02-14T17:13:58+02:00'),
(11, 18, 'Historic Home', 'Charming historic district stay', '19 King St', NULL, 'Charleston', 'SC', '29401', 'United States', 4, 2, 2.0, 2, 220.00, 0.00, 0, 'House', TRUE, '13:00', '10:00', '2026-04-03T20:41:26-05:00'),
(12, 20, 'Ski Chalet', 'Walk to ski lifts', '17 Alpine Ln', NULL, 'Park City', 'UT', '84060', 'United States', 12, 5, 4.0, 8, 510.00, 0.00, 0, 'House', FALSE, '17:30', '11:30', '2026-05-27T09:56:44+08:00'),
(13, 8, 'Garden Cottage', 'Private backyard cottage', '5 Rose Ct', NULL, 'Portland', 'OR', '97205', 'United States', 3, 1, 1.0, 2, 160.00, 0.00, 0, 'Room', TRUE, '15:00', '10:30', '2026-07-11T15:22:09+12:00'),
(14, 22, 'Luxury Penthouse', 'Top-floor skyline views', '800 High St', NULL, 'Chicago', 'IL', '60601', 'United States', 5, 2, 2.0, 2, 390.00, 0.00, 0, 'Apartment', FALSE, '14:00', '11:00', '2026-08-24T13:47:51-03:00');

INSERT INTO amenities(
    id,
    name,
    basics,
    bathroom,
    bedroom_and_laundry,
    entertainment,
    family,
    heating_and_cooling,
    home_safety,
    internet_and_office,
    kitchen_and_dining,
    location_features,
    outdoor,
    parking_and_facilities,
    services
) VALUES
 (1,'Air conditioning',TRUE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(2,'Arcade games',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(3,'Baby bath',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(4,'Baby monitor',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(5,'Baby safety gates',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(6,'Babysitter recommendations',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(7,'Backyard',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(8,'Baking sheet',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(9,'Barbecue utensils',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(10,'Bathtub',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(11,'Batting cage',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(12,'BBQ grill',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(13,'Beach access',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(14,'Beach essentials',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(15,'Bed linens',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(16,'Bidet',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(17,'Bikes',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(18,'Blender',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(19,'Board games',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(20,'Boat slip',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(21,'Body soap',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(22,'Books and reading material',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(23,'Bowling alley',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(24,'Bread maker',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(25,'Breakfast',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE)
,(26,'Carbon monoxide alarm',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(27,'Ceiling fan',FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(28,'Changing table',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(29,'Children''s playroom',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(30,'Children''s bikes',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(31,'Children''s books and toys',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(32,'Children''s dinnerware',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(33,'Cleaning available during stay',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE)
,(34,'Cleaning products',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(35,'Climbing wall',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(36,'Clothing storage',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(37,'Coffee',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(38,'Coffee maker',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(39,'Composting',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(40,'Conditioner',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(41,'Cooking basics',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(42,'Crib',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(43,'Dedicated workspace',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(44,'Dining table',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(45,'Dishes and silverware',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(46,'Dishwasher',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(47,'Doorman',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(48,'Dryer',TRUE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(49,'Drying rack for clothing',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(50,'eBike charger',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(51,'Elevator',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(52,'Essentials',TRUE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(53,'Ethernet connection',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(54,'EV charger',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(55,'Exercise equipment',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(56,'Extra pillows and blankets',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(57,'Fire extinguisher',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(58,'Fire pit',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(59,'Fireplace guards',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(60,'First aid kit',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(61,'Free parking off premises',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(62,'Free parking on premises',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(63,'Free street parking',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(64,'Freezer',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(65,'Game console',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(66,'Gated community',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(67,'Gym',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(68,'Hair dryer',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(69,'Hammock',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(70,'Hangers',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(71,'Heating',TRUE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(72,'High chair',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(73,'Hockey rink',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(74,'Hot tub',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(75,'Hot water',TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(76,'Hot water kettle',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(77,'Indoor fireplace',FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(78,'Iron',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(79,'Kayak',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(80,'Kitchen',TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(81,'Kitchenette',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(82,'Lake access',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(83,'Laser tag',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(84,'Laundromat nearby',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(85,'Life size games',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(86,'Long term stays allowed',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE)
,(87,'Luggage dropoff allowed',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE)
,(88,'Microwave',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(89,'Mini fridge',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(90,'Mini golf',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(91,'Mosquito net',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(92,'Movie theater',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(93,'Outdoor dining area',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(94,'Outdoor furniture',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(95,'Outdoor kitchen',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(96,'Outdoor playground',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(97,'Outdoor shower',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(98,'Outlet covers',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(99,'Oven',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(100,'Pack ''n play/Travel crib',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(101,'Paid parking off premises',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(102,'Paid parking on premises',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(103,'Patio or balcony',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(104,'Piano',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(105,'Ping pong table',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(106,'Pocket wifi',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(107,'Pool',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(108,'Pool table',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(109,'Portable fans',FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(110,'Private entrance',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(111,'Private living room',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(112,'Record player',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(113,'Recycling',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(114,'Refrigerator',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(115,'Resort access',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(116,'Rice maker',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(117,'Room-darkening shades',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(118,'Safe',FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(119,'Sauna',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(120,'Shampoo',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(121,'Shower gel',FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(122,'Single level home',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(123,'Skate ramp',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(124,'Ski-in/Ski-out',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(125,'Smoke alarm',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(126,'Solar panels',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE)
,(127,'Sound system',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(128,'Stove',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(129,'Sun loungers',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE)
,(130,'Table corner guards',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(131,'Theme room',FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(132,'Toaster',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(133,'Trash compactor',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE)
,(134,'TV',TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(135,'Washer',TRUE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(136,'Waterfront',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE)
,(137,'Wifi',TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(138,'Window guards',FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE)
,(139,'Wine glasses',FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE);




INSERT INTO property_amenities (property_id, amenity_id)
VALUES
  (1, 1),
  (1, 9),
  (1, 10),
  (1, 12),
  (1, 15),
  (1, 16),
  (1, 17),
  (1, 18),
  (1, 19),
  (1, 21),
  (1, 22),
  (1, 26),
  (1, 27),
  (1, 32),
  (1, 34),
  (1, 36),
  (1, 37),
  (1, 38),
  (1, 40),
  (1, 41),
  (1, 43),
  (1, 44),
  (1, 45),
  (1, 46),
  (1, 48),
  (1, 49),
  (1, 52),
  (1, 53),
  (1, 55),
  (1, 56),
  (1, 60),
  (1, 62),
  (1, 63),
  (1, 64),
  (1, 65),
  (1, 68),
  (1, 70),
  (1, 75),
  (1, 80),
  (1, 88),
  (1, 99),
  (1, 103),
  (1, 104),
  (1, 105),
  (1, 113),
  (1, 114),
  (1, 120),
  (1, 121),
  (1, 125),
  (1, 128),
  (1, 132),
  (1, 134),
  (1, 135),
  (1, 137);


INSERT INTO "bookings" ("id", "property_id", "user_id", "start_date", "end_date", "total_price", "status")
VALUES
    (1, 1, 2, '2026-03-01', '2026-03-03', 400.00, 'completed'),
    (2, 1, 2, '2026-05-10', '2026-05-13', 525.00, 'completed'),
    (3, 2, 3, '2026-06-01', '2026-06-03', 280.00, 'completed'),
    (4, 3, 5, '2026-07-15', '2026-07-18', 750.00, 'completed');

INSERT INTO "reviews" ("id", "rating", "comment", "created_at", "user_id", "property_id", "booking_id")
VALUES
    (1, 4, 'Cozy', '2026-03-02', 2, 1, 1),
    (2, 5, 'Great location and very clean apartment.', '2026-05-13', 2, 1, 2),
    (3, 4, 'Nice loft and easy check-in process.', '2026-06-03', 3, 2, 3),
    (4, 5, 'Spacious home with plenty of room.', '2026-07-18', 5, 3, 4);

INSERT INTO "property_images" ("property_id", "image_url", "display_order")
VALUES
    (1, '/placeholders/default_home.jpg', 1),
    (1, '/images/properties/property1-bedroom.jpg', 2),
    (2, '/images/properties/property2-main.jpg', 1),
    (3, '/images/properties/property3-main.jpg', 1),
    (4, '/images/properties/4-frontdoor.png', 1);

INSERT INTO "wishlists" ("user_id", "property_id", "list_name")
VALUES
    (2, 1, 'Philadelphia Trips'),
    (2, 3, 'Large Homes'),
    (3, 2, 'Weekend Stays');

INSERT INTO "conversations" ("guest_id", "host_id", "property_id")
VALUES
    (2, 1, 1),
    (3, 1, 2),
    (5, 1, 3),
    (2, 1, 1);

INSERT INTO "messages" ("conversation_id", "sender_id", "message", "created_at")
VALUES
    (1, 2, 'Hi, is the apartment available for these dates?', '2026-03-01 09:15:00'),
    (1, 1, 'Yes, it is currently available.', '2026-03-01 09:20:00'),
    (2, 3, 'Does the loft include parking?', '2026-06-01 14:30:00'),
    (2, 1, 'There is paid parking nearby.', '2026-06-01 14:45:00'),
    (3, 5, 'Are pets allowed at this property?', '2026-07-10 16:00:00'),
    (4, 1, 'Can I bring a dog?', '2026-07-20 11:10:00'),
    (4, 2, 'No', '2026-07-20 11:15:00');