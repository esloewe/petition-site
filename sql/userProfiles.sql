DROP TABLE IF EXISTS users_profiles;

CREATE TABLE users_profiles (
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR (200),
    homepage VARCHAR (200),
    user_id INTEGER REFERENCES users(id) UNIQUE,
    created_at TIMESTAMP DEFAULT current_timestamp
);
