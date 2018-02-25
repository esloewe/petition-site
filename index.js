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
const { checkPass } = require("./database");
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
console.log("1");
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thankyou");
        return;
    }
    res.render("main", {
        layout: "layouts"
    });
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "layouts"
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
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
            .then(function(hash) {
                return registration(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hash
                );
            })
            .then(results => {
                req.session.user = {
                    id: results.rows[0].id,
                    firstname: results.rows[0].firstname,
                    lasname: results.rows[0].lastname
                };
                res.redirect("/login");
            })
            .catch(function(error) {
                console.log(error);
                res.render("registration", {
                    layout: "layouts",
                    error: "error"
                });
            });
    }
});

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            layout: "layouts",
            error: "error"
        });
    } else {
        checkPass(req.body.password).then(results => {
            req.session.user = {
                id: results.rows[0].id,
                firstname: results.rows[0].firstname,
                lasname: results.rows[0].lastname
            };
            res.redirect("/petition");
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
        insertNewSignature(
            req.body.firstname,
            req.body.lastname,
            req.body.signature
        )
            .then(function(id) {
                console.log("siggg");
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
console.log("5");
app.listen(8080, () => {
    console.log("listening");
});
