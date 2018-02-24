var spicedPg = require("spiced-pg");

var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.insertNewSignature = function(firstname, lastname, signature) {
    return db
        .query(
            "INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id",
            [firstname, lastname, signature]
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
            return results.rows;
        });
};

exports.registration = function(first_name, last_name, email, password_hash) {
    return db
        .query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id",
            [first_name, last_name, email, password_hash]
        )
        .then(function(results) {
            console.log(results.rows);
            return results.rows;
        });
};

exports.checkPass = function(password_hash) {
    return db
        .query("SELECT * FROM users WHERE password_hash = $1", [password_hash])
        .then(function(results) {
            console.log("cheking pass", results.rows);
            return results.rows[0];
        });
};

exports.existsEmail = function(email) {
    return db
        .query("SELECT COUNT(*) FROM users WHERE email = $1", [email])
        .then(function(results) {
            console.log("cheking exist email", results.rows);
            return results.rows;
        });
};
