//run db.query(query, params) and pass in the query and the params and return db.query
//db.query returns a promise so when i run insertNewSignature i can chain a .then()
//and inside here i redirect to the thanks route in my post request.
//module.exports to export the functions
//in index.js require /database.js
// then run the function

var spicedPg = require("spiced-pg");

var db = spicedPg("postgres:spicedling:password@localhost:5432/signatures");

exports.insertNewSignature = function(firstname, lastname, signature) {
    return db.query(
        "INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3)",
        [firstname, lastname, signature]
    );
};
