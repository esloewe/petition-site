var spicedPg = require("spiced-pg");

var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.insertNewSignature = function(userId, signature) {
    return db
        .query(
            "INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id",
            [userId, signature]
        )
        .then(function(results) {
            return results.rows[0].id;
        });
};

exports.getSignatureById = function(id) {
    return db
        .query("SELECT signature FROM signatures WHERE id = $1", [id])
        .then(function(results) {
            return results.rows[0].signature;
        });
};

exports.signersCount = function() {
    return db.query("SELECT COUNT(*) FROM signatures").then(function(results) {
        return results.rows[0].count;
    });
};

exports.signersNames = function() {
    return db
        .query(
            "SELECT first_name, last_name FROM signatures ORDER BY first_name ASC"
        )
        .then(function(results) {
            return results.rows[0].id;
        });
};

exports.registration = function(first_name, last_name, email, password_hash) {
    return db
        .query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id",
            [first_name, last_name, email, password_hash]
        )
        .then(function(results) {
            return results.rows[0].id;
        });
};

exports.checkForEmailAndGetHashedPass = function(email) {
    return db
        .query("SELECT password_hash FROM users WHERE email = $1", [email])
        .then(function(results) {
            return results.rows[0].password_hash;
        });
};

exports.getUserData = function(email) {
    return db
        .query(
            "SELECT users.first_name, users.last_name, users.email, users.password_hash, signatures.signature FROM users INNER JOIN signatures ON users.id = signatures.user_id WHERE email = $1",
            [email]
        )
        .then(function(results) {
            return results.rows[0];
        });
};

exports.getUserProfile = function(age, city, homepage, user_id) {
    return db
        .query(
            "INSERT INTO users_profiles (age, city, homepage, user_id) VALUES ($1, $2, $3, $4)",
            [age, city, homepage, user_id]
        )
        .then(function(results) {
            return results.rows[0];
        });
};

exports.insertUserProfile = function() {
    return db
        .query(
            "SELECT * FROM user_profiles INNER JOIN users ON users.id = user_profiles.id"
        )
        .then(function(results) {
            return results.rows[0];
        });
};
