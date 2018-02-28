var spicedPg = require("spiced-pg");

var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); // this need sto change for heroku by adding proccess.env.DATABASE_URL  || the one i already have

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
            "SELECT users.first_name, users.last_name, users_profiles.city, users_profiles.age, users_profiles.homepage FROM users INNER JOIN users_profiles ON users.id = users_profiles.id  ORDER BY users.first_name ASC"
        )
        .then(function(results) {
            return results.rows;
        });
};

exports.signersNamesCity = function(city) {
    return db
        .query(
            "SELECT users.first_name, users.last_name, users_profiles.city, users_profiles.age, users_profiles.homepage FROM users INNER JOIN users_profiles ON users.id = users_profiles.id WHERE LOWER(city) = LOWER($1) ORDER BY users.first_name ASC",
            [city]
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

exports.populateUpdateUserData = function(id) {
    return db
        .query(
            `SELECT users.first_name, users.last_name, users.email, users_profiles.city, users_profiles.age, users_profiles.homepage
            FROM users JOIN users_profiles
            ON users.id = users_profiles.user_id
            WHERE users.id = $1`,
            [id]
        )
        .then(function(results) {
            return results.rows[0];
        });
};

exports.updateUserTableWithPassword = function(
    first_name,
    last_name,
    email,
    password_hash,
    id
) {
    return db
        .query(
            `UPDATE users
             SET first_name = $1, last_name = $2, email = $3, password_hash = $4 WHERE id = $5`,
            [first_name, last_name, email, password_hash, id]
        )
        .then(function(results) {
            return results.rows[0];
        });
};

exports.updateUserTableWithoutPassword = function(
    first_name,
    last_name,
    email,
    id
) {
    return db
        .query(
            "UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4",
            [first_name, last_name, email, id]
        )
        .then(function(results) {
            return results.rows[0];
        });
};

exports.userDataUpdateByUserinUsersProfiles = function(
    age,
    city,
    homepage,
    user_id
) {
    return db
        .query(
            `INSERT INTO users_profiles (age, city, homepage, user_id) VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET age = $1, city = $2, homepage = $3`,
            [age, city, homepage, user_id]
        )
        .then(function(results) {
            return results.rows[0];
        })
        .catch(error => {
            console.log("EEEERRRROOORRR");
            console.log(error);
        });
};
