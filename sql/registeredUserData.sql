--in terminal to add table to database - psql petition -f “registeredUserData.sql"
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR (200) NOT NULL,
    last_name VARCHAR (200) NOT NULL,
    email VARCHAR (200) NOT NULL UNIQUE,
    password_hash VARCHAR (200) NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp
);
