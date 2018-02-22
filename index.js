const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const handlebars = require("express-handlebars");
const fs = require("fs");
const { insertNewSignature } = require("./database");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(
    cookieSession({
        secret: "nosecret"
    })
);

app.use(express.static(__dirname + "/public"));

app.get("/petition", (req, res) => {
    res.render("main", {
        layout: "layouts"
    });
});

app.get("/thankyou", (req, res) => {
    signedSession(id);
    res.render("thankyou-page", {
        layout: "layouts"
    });
});

app.post("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/petition");
        return;
    }

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
                console.log("return value from insert new sig", id);
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
