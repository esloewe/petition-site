const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const handlebars = require("express-handlebars");
const { insertNewSignature } = require("./database");
const { getSignatureById } = require("./database");
const { signersCount } = require("./database");
const { signersNames } = require("./database");
const { registration } = require("./database");
const { getUserData } = require("./database");
const { checkForEmailAndGetHashedPass } = require("./database");
const { getUserProfile } = require("./database");
const { insertUserProfile } = require("./database");
const { hashPassword } = require("./hashPass");
const { checkPassword } = require("./hashPass");
const bcrypt = require("bcryptjs");

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

app.use(express.static(__dirname + "/public"));

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "layouts"
    });
});

app.get("/login", (req, res) => {
    //todo
    //check if there is req.session.user if yes redirect to petition page if not then let them login
    res.render("login", {
        layout: "layouts"
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layouts: "layouts"
    });
});

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

app.get("/signers", (req, res) => {
    signersNames().then(results => {
        console.log("signers name", results);
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

                res.redirect("/petition");
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
        req.session.id
    ).then(function() {
        res.redirect("/petition");
    }); // do error catch stuff;
});

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            layout: "layouts",
            error: "error"
        });
    } else {
        checkForEmailAndGetHashedPass(req.body.email).then(function(hashed) {
            console.log("results check for email hashed pass", hashed);
            if (!hashed) {
                res.render("login", {
                    layouts: "layouts",
                    error: "email does not exist"
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
                            console.log("final user data", req.session.user);
                        });
                        res.redirect("/petition");
                    }
                });
            }
        });
    }
});

app.post("/petition", (req, res) => {
    if (!req.body.firstname || !req.body.lastname || !req.body.signature) {
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
