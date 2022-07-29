//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

main().catch(err => console.log(err));

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'Out little secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session());

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/secretsDB');
}

const userSchema = new mongoose.Schema({
    username: String,
    password: String
  });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login")
  }
});

app.post("/register", (req, res) => {
  User.register({ username: req.body.username }, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
      res.redirect("/secrets")
      })
    }
  })
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        })
    }
  });
});

app.get("/logout", (req, res) => {
    res.render("logout");
});

const port = process.env.PORT || 3000;

//app can be used on Local Server 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});

