CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    host BOOLEAN DEFAULT FALSE
);

INSERT INTO "users" ("id", "first_name", "last_name", "email", "password_hash", "host")
VALUES
  (1, 'Max', 'Chiu', 'maxkchiu@gmail.com', 'admin', 'Yes'),
  (2, 'Larry', 'Wu', 'larrywu@test.com', 'admin', 'No'),
  (3, 'Peter', 'Parker', 'notspiderman@marvel.com', 'admin', 'No'),
  (4, 'Tony', 'Stark', 'iamironman@dead.com', 'admin', 'Yes'),
  (5, 'Emma', 'Johnson', 'emma.johnson@example.com', 'admin', 'No'),
  (6, 'Noah', 'Williams', 'noah.williams@example.com', 'admin', 'Yes'),
  (7, 'Olivia', 'Brown', 'olivia.brown@example.com', 'admin', 'No'),
  (8, 'Liam', 'Davis', 'liam.davis@example.com', 'admin', 'Yes'),
  (9, 'Ava', 'Martinez', 'ava.martinez@example.com', 'admin', 'No'),
  (10, 'Ethan', 'Wilson', 'ethan.wilson@example.com', 'admin', 'Yes'),
  (11, 'Sophia', 'Anderson', 'sophia.anderson@example.com', 'admin', 'No'),
  (12, 'James', 'Thomas', 'james.thomas@example.com', 'admin', 'Yes'),
  (13, 'Mia', 'Taylor', 'mia.taylor@example.com', 'admin', 'No'),
  (14, 'Benjamin', 'Moore', 'benjamin.moore@example.com', 'admin', 'Yes'),
  (15, 'Charlotte', 'Jackson', 'charlotte.jackson@example.com', 'admin', 'No'),
  (16, 'Lucas', 'Martin', 'lucas.martin@example.com', 'admin', 'Yes'),
  (17, 'Amelia', 'Lee', 'amelia.lee@example.com', 'admin', 'No'),
  (18, 'Henry', 'Walker', 'henry.walker@example.com', 'admin', 'Yes'),
  (19, 'Evelyn', 'Hall', 'evelyn.hall@example.com', 'admin', 'No'),
  (20, 'Daniel', 'Allen', 'daniel.allen@example.com', 'admin', 'Yes'),
  (21, 'Harper', 'Young', 'harper.young@example.com', 'admin', 'No'),
  (22, 'Michael', 'King', 'michael.king@example.com', 'admin', 'Yes'),
  (23, 'Ella', 'Wright', 'e.wwright@example.com', 'admin', 'No'),
  (24, 'Jack', 'Scott', 'jack.scott@example.com', 'admin', 'Yes');