const express = require("express");
const bodyParser = require("body-parser"); 
const ejs = require("ejs");
const { render } = require("express/lib/response");
// const session = require('express-session');
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const findOrCreate = require('mongoose-findorcreate');
// const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// mongoose.connect("mongodb://localhost:27017/urbanDB", {useNewUrlParser: true});

// DB Schemas

// Users
// const userSchema = new mongoose.Schema ({
  // username: {type: String, unique: true}, // values: email address, googleId, facebookId
  // password: String,
  // provider: String

//});

// Staff 
// const staffSchema = new mongoose.Schema ({
    //email: String,
    //password
//});

//Services ordered
// const servicesSchema = new mongoose.Schema ({
  // name: String,
  // service: String
// });

app.get("/", function(req, res){
  res.render("home");
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

app.listen(3000, function(){
  console.log("Server started on port 3000");
});