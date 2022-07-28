//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const e = require("express");
var encrypt = require('mongoose-encryption');
const dotenv = require('dotenv').config()

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/secretsDB');
}

const userSchema = new mongoose.Schema({
    username: String,
    password: String
  });

userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY, encryptedFields: ["password"] });

const User = mongoose.model('User', userSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const user = new User ({
      username: req.body.username,
      password: req.body.password
    });
    user.save(function(err){
      if (!err){
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  })

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username}, (err, foundUser) => {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            } else {
                res.redirect("/login");
            }
        }
    })
});

app.get("/logout", (req, res) => {
    res.render("logout");
});

const port = process.env.PORT || 3000;

//app can be used on Local Server 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});

