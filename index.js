const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const handlebars = require("express-handlebars");
const bcrypt = require("bcryptjs");
const csrf = require("csurf");
const { hashPassword, checkPassword } = require("./hashPass");
const {
    insertNewSignature,
    getSignatureById,
    signersCount,
    signersNames,
    registration,
    getUserData,
    checkForEmailAndGetHashedPass,
    getUserProfile,
    signersNamesCity,
    populateUpdateUserData,
    updateUserTableWithPassword,
    updateUserTableWithoutPassword,
    userDataUpdateCheckId,
    userDataUpdateByUserinUsersProfiles
} = require("./database");

//MIDDLEWARE

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    cookieSession({
        secret: "nosecret",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
//app.use(csrf());
//or use it as middleware let csrfProtection = csrf()

app.use(express.static(__dirname + "/public"));

// const alreadySigned = function(req, res, next) {
//     if (!req.session.signatureId) {
//         res.redirect("/petition");
//     } else {
//         next();
//     }
// };
//
// const checkIfLoggedIn = function(req, res, next) {
//     if (!req.session.user) {
//         res.redirect("/registration");
//     } else {
//         next();
//     }
// };

// end MIDDLEWARE

//checkIfLoggedIn
app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "layouts"
    });
});

//checkIfLoggedIn
app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "layouts"
        });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "layouts"
    });
});

//alreadySigned
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thankyou");
        return;
    }
    res.render("main", {
        layout: "layouts"
    });
});

app.get("/thankyou", (req, res) => {
    getSignatureById(req.session.signatureId).then(results => {
        signersCount().then(count => {
            res.render("thankyou-page", {
                layout: "layouts",
                yourSignature: results,
                totalSigners: count
            });
        });
    });
});

app.get("/profile/edit", (req, res) => {
    populateUpdateUserData(req.session.user.id).then(results => {
        console.log("results popPPPPPPP", results);
        res.render("profileEdit", {
            layout: "layouts",
            firstname: results.first_name,
            lastname: results.last_name,
            email: results.email,
            password: results.password_hash,
            age: results.age,
            city: results.city,
            homepage: results.homepage
        });
    });
});

app.get("/signers", (req, res) => {
    signersNames().then(results => {
        res.render("signerslist", {
            layout: "layouts",
            signerslist: results
        });
    });
});

app.get("/signers/:city", (req, res) => {
    const city = req.params.city; // params reads the URL syntax is with : ex-> /:city and thats its the part that will change.
    signersNamesCity(city).then(results => {
        res.render("signerslist", {
            layout: "layouts",
            signerslist: results
        });
    });
});

app.post("/register", (req, res) => {
    if (
        !req.body.firstname ||
        !req.body.lastname ||
        !req.body.email ||
        !req.body.password
    ) {
        res.render("registration", {
            layout: "layouts",
            error: "error"
        });
    } else {
        let hash = hashPassword(req.body.password);
        hash
            .then(hash => {
                return registration(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hash
                );
            })
            .then(userId => {
                console.log(userId);
                req.session.user = {
                    id: userId,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname
                };

                console.log(req.session);
                res.redirect("/profile");
            })
            .catch(error => {
                console.log(error);
                res.render("registration", {
                    layout: "layouts",
                    error: "error"
                });
            });
    }
});

app.post("/profile", (req, res) => {
    getUserProfile(
        +req.body.age,
        req.body.city,
        req.body.homepage,
        req.session.user.id
    )
        .then(function() {
            res.redirect("/petition");
        })
        .catch(error => {
            console.log(error);
            res.render("/profile", {
                layout: "layouts",
                error: "error"
            });
        });
});

app.post("/profile/edit", (req, res) => {
    const {
        firstname,
        lastname,
        email,
        password,
        age,
        city,
        homepage
    } = req.body; // user input from form

    function updateUser(
        firstNameInput,
        lastNameInput,
        inputEmail,
        passwordInput,
        userId
    ) {
        if (passwordInput) {
            console.log("new pass word detected");
            const hashPassUpdate = hashPassword(passwordInput);
            return hashPassUpdate.then(hashPassUpdate => {
                return updateUserTableWithPassword(
                    firstNameInput,
                    lastNameInput,
                    inputEmail,
                    hashPassUpdate,
                    userId
                );
            });
        } else {
            console.log("no new passsss");
            return updateUserTableWithoutPassword(
                firstNameInput,
                lastNameInput,
                inputEmail,
                userId
            );
        }
    }
    Promise.all([
        updateUser(firstname, lastname, email, password, req.session.user.id),
        userDataUpdateByUserinUsersProfiles(
            age,
            city,
            homepage,
            req.session.user.id
        )
    ])
        .then(() => {
            console.log(" we are here woah!");
        })
        .catch(error => {
            console.log(error);
            res.render("profileEdit", {
                layout: "layouts",
                error: "error"
            });
        });
});
// Promise.all([
//     updateUserTableWithPassword(
//         firstname,
//         lastname,
//         email,
//         hashPassUpdate,
//         req.session.user.id
//     ),
//     updateUserTableWithoutPassword(
//         firstname,
//         lastname,
//         email,
//         req.session.user.id
//     )
// ])
//     .then(() => {
//         userDataUpdateByUserinUsersProfiles(
//        age,
//             req.body.city,
//             req.body.homepage,
//             req.session.user.id
//         );
//     })
//     .then(function() {
//         res.redirect("/thankyou");
//     });

//
//
//     if (req.body.password === "") {
//         updateUserTableWithoutPassword(
//         req.body.firstname,
//         req.body.lastname,
//         req.body.email,
//         req.session.user.id).then(function(){
//             userDataUpdateByUserinUsersProfiles(req.body.age, req.body.city, req.body.homepage, req.session.user.id).then(function(){
//             res
//             })
//
//
//         })
//         // user did not enter password
//         // do update to users table without updating password with the new query that i will make but without the password
//     } else {
//         // user entered password, bro
//         // hash first, then
//         // in the then of hash i pass hash down though a promise do update to users table with password, bro
//         userDataUpdateByUserinUsers(
//             req.body.firstname,
//             req.body.lastname,
//             req.body.email,
//             INEEDAHASHHERE!!!,
//             req.session.user.id
//         ).then(function() {});
//     }
//
//     // res.redirect("/thankyou");
// });

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            layout: "layouts",
            error: "error"
        });
    } else {
        checkForEmailAndGetHashedPass(req.body.email).then(function(hashed) {
            if (!hashed) {
                res.render("login", {
                    layouts: "layouts",
                    error2: "error"
                });
            } else {
                checkPassword(req.body.password, hashed).then(function(
                    doesMatch
                ) {
                    if (doesMatch) {
                        getUserData(req.body.email).then(function(userData) {
                            req.session.user = {
                                id: userData.id,
                                firstname: userData.firstname,
                                lastname: userData.lastname,
                                email: userData.email
                            };
                        });
                        res.redirect("/petition");
                    }
                });
            }
        });
    }
});

app.post("/petition", (req, res) => {
    if (!req.body.signature) {
        res.render("main", {
            layout: "layouts",
            error: "error"
        });
    } else {
        insertNewSignature(req.session.user.id, req.body.signature)
            .then(function(id) {
                req.session.signatureId = id;
                res.redirect("/thankyou");
            })
            .catch(function(error) {
                console.log(error);
                res.render("main", {
                    layout: "layouts",
                    error: "error"
                });
            });
    }
});

app.listen(8080, () => {
    console.log("listening");
});
