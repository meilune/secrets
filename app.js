//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const e = require("express");
const dotenv = require('dotenv').config()
const bcrypt = require('bcrypt');
const saltRounds = 10;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/secretsDB');
}

const userSchema = new mongoose.Schema({
    username: String,
    password: String
  });

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
  
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const user = new User ({
      username: req.body.username,
      password: hash
    });
    user.save(function(err){
      if (!err){
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
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
              bcrypt.compare(password, foundUser.password, function(err, result) {
                if (result === true ) {
                  res.render("secrets");
                } else {
                  res.redirect("/login");
                }
              });
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

