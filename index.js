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
    userDataUpdateByUserinUsersProfiles,
    deleteSignature
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
app.use(csrf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(express.static(__dirname + "/public"));

const alreadySigned = function(req, res, next) {
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

const requireUser = function(req, res, next) {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        next();
    }
};

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

app.get("/profile", requireUser, (req, res) => {
    res.render("profile", {
        layout: "layouts"
    });
});

app.get("/petition", requireUser, (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thankyou");
        return;
    }
    res.render("main", {
        layout: "layouts"
    });
});
//alreadySigned
app.get("/thankyou", requireUser, alreadySigned, (req, res) => {
    console.log("THANKSSSSSS");
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

app.get("/profile/edit", requireUser, (req, res) => {
    populateUpdateUserData(req.session.user.id).then(results => {
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

app.get("/signers", requireUser, alreadySigned, (req, res) => {
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

app.get("/logout", (req, res) => {
    req.session = null;
    res.render("logout", {
        layout: "layouts"
    });
    //res.redirect("/login");
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
            return updateUserTableWithoutPassword(
                firstNameInput,
                lastNameInput,
                inputEmail,
                userId
            );
        }
    }
    Promise.all([
        updateUser(
            firstname,
            lastname,
            email,
            password,
            req.session.user.id
        ).catch(error => {
            console.log("error in update user promise");
            throw error;
        }),
        userDataUpdateByUserinUsersProfiles(
            age,
            city,
            homepage,
            req.session.user.id
        ).catch(error => {
            console.log("error in update user PROFILE promise");
            throw error;
        })
    ]).then(function() {
        res.redirect("/thankyou");
    });
});

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
                        console.log("logingggggg", req.body.email);
                        getUserData(req.body.email).then(function(userData) {
                            console.log(userData);
                            req.session.user = {
                                id: userData.userid,
                                firstname: userData.firstname,
                                lastname: userData.lastname,
                                email: userData.email,
                                signature: userData.id
                            };
                            res.redirect("/petition");
                        });
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

app.post("/deleteSignature", (req, res) => {
    deleteSignature(req.session.signatureId).then(() => {
        req.session.signatureId = null;
        res.redirect("/petition");
    });
});

app.listen(8080, () => {
    console.log("listening");
});
