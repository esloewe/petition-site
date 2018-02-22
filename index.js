const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const handlebars = require("express-handlebars");
const fs = require("fs");
const { insertNewSignature } = require("./database");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(__dirname + "/public")); // refering to my public files

app.get("/petition", (req, res) => {
    res.render("main", {
        // main is the template that i want to render as it has all the body in it
        layout: "layouts"
    });
}); // url (/petition) in get is whatever i want it to be. this will present my templates in browser "render"

app.post("/petition", (req, res) => {
    console.log(req.body);
    if (!req.body.firstname && !req.body.lastname && !req.body.signature) {
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
            .then(function() {
                res.redirect("/petition");
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
