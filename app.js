require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser"); 
const ejs = require("ejs");
const { render } = require("express/lib/response");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/urbanDB", {useNewUrlParser: true});

// Users
const userSchema = new mongoose.Schema ({
  username: {type: String, unique: true}, // values: email address, googleId, facebookId
  password: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  provider: String

});

//Staff 
const staffSchema = new mongoose.Schema ({
    email: String,
    password: String,
    firstName: String,
  lastName: String
});

//Services offered
const serviceSchema = new mongoose.Schema ({
  name: String,
  description: String,
  price: {type: Number, get: getPrice, set: setPrice }
});

function getPrice(num){
  return (num/100).toFixed(2);
}

function setPrice(num){
  return num*100;
}

//Plugins

userSchema.plugin(passportLocalMongoose, {emailUnique: false});
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);
const Staff = mongoose.model("Staff", staffSchema);
const Service = mongoose.model("Service", serviceSchema)

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/booking",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ username: profile.id },
    {
      provider: "google",
      email: profile._json.email
    }, function (err, user) {
    return cb(err, user);
  });
}
));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/booking",
  enableProof: true,
  profileFields: ["id", "email"]
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate(
    { username: profile.id },
    { 
      provider: "google",
      email: profile._json.email
    }, function (err, user) {
      return cb(err, user);
  });
}
));

// GETS
app.get("/", function(req, res){
  res.render("home");
});

app.get("/auth/google", passport.authenticate('google', {
  
  scope: ["profile", "email"]

}));

app.get('/auth/google/booking', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/booking');
  });

  app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: ["email"]
  }));

  app.get('/auth/facebook/booking',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/booking');
  });

  app.get("/logout", function(req, res) {
    req.logOut();
    res.redirect("/");
  });

app.get("/services", function(req, res){
  res.render("services");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact");
});

app.get("/booking", function(req, res){
  res.render("booking");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

// POSTS

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){

    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/booking");
      })
    }

  })
  
});

app.post("/login", function(req, res){

  const user = new User({

    username: req.body.username,

    password: req.body.password

  });

  req.login(user, function(err){

    if (err) {
      console.log(err);

    } else {

      passport.authenticate("local");

      res.redirect("/booking");

    }
  })
});

// app.post("/submit", function(req, res) {

//   const submittedSecret = req.body.secret;

//   console.log(req.user);

//   User.findById(req.user.id, function(err, foundUser) {
    
//     if(err) {

//       console.log(err);

//     } else {

//       if (foundUser) {

//           foundUser.secret = submittedSecret;

//           foundUser.save(function(){

//             res.redirect("/booking");

//           });
//       }
//     }
//   })

// });

app.listen(3000, function(){
  console.log("Server started on port 3000");
});