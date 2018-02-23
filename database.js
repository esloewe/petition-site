var spicedPg = require("spiced-pg");

var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.insertNewSignature = function(firstname, lastname, signature) {
    return db
        .query(
            "INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id",
            [firstname, lastname, signature]
        )
        .then(function(results) {
            console.log("this is results new sig", results.rows);
            return results.rows[0].id;
        });
};

exports.getSignatureById = function(id) {
    return db
        .query("SELECT signature FROM signatures WHERE id = $1", [id])
        .then(function(results) {
            console.log("fdbfber", results.rows[0].signature);
            return results.rows[0].signature;
        });
};
