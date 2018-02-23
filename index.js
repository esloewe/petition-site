const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const handlebars = require("express-handlebars");
const fs = require("fs");
const { insertNewSignature } = require("./database");
const { getSignatureById } = require("./database");
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
        res.render("thankyou-page", {
            layout: "layouts",
            yourSignature: results
        });
    });
});

app.get("/signerslist", (req, res) => {
    res.render("signerslist", {
        layout: "layouts"
    });
});

app.post("/petition", (req, res) => {
    if (!req.body.firstname || !req.body.lastname || !req.body.signature) {
        // here add the req.body.password
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
