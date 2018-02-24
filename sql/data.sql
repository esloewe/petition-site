DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    --user_id INTEGER NOT NULL,
    first_name VARCHAR (200) NOT NULL,
    last_name VARCHAR (200) NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp
);