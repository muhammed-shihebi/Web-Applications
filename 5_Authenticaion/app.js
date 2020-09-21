// =========================================================== Init

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); // this needs passport-local package in order to work. 
const app = express();

// this is for configuring the google oauth20
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// this package is used to make the findorcreate() works without any other modifications. 
const findOrCreate = require('mongoose-findorcreate')



app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// initialize session
app.use(session({
	secret: "a random string",
	resave: false,
	saveUninitialized: false
}));
// initialize passport
app.use(passport.initialize());
// use passport to setup a session
app.use(passport.session());



// =========================================================== Database

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

// this is to prevent the warning: (node:8100) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	// this is just for the users signing up with google account
	googleId: String, 
	secret: String
});


// to use passportLocalMongoose we have to add it to the schema
// this package will hash and salt the passwords and save users to the mongodb database
userSchema.plugin(passportLocalMongoose);

// this plugin used to make findOrCreate function work
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

// this is how passportLocal is configured
// serialise and deserialise are used to save the information of the user locally then fetch the data to authenticate the users later without them entering
// their email and password again. 
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

// here we setting up the google strategy to access the users data and google is an email. 
passport.use(new GoogleStrategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.cLIENT_SECRET,
	callbackURL: "http://localhost:3000/auth/google/secrets",
	userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
	// in this function we retrieve the accessToken which allow us to access user data 
	// profile: contains the email and the google id with we will use to authenticate them 
	// this function get called when a user log in with google account before calling app.get("/auth/google/secrets") 
	function (accessToken, refreshToken, profile, cb) {
		// this function will search in the database for a user with this id, if there is one we will renew their data in our database, 
		// otherwise we will register them in our database and save their information
		User.findOrCreate({ googleId: profile.id }, function (err, user) {
			return cb(err, user);
		});
	}
));

// =========================================================== 

app.listen(3000, function () { console.log("Server Started successfully"); });

app.get("/", function (req, res) {
	// if (req.isAuthenticated()) {
	// 	res.render("secrets");
	// } else {
	// 	res.render("home");
	// }
	res.render("home");
});

app.get("/login", function (req, res) {
	res.render("login");
});

app.get("/register", function (req, res) {
	res.render("register");
});

app.get("/secrets", function (req, res) {
	User.find({"secret": {$ne: null}}, function(err, foundUsers){
		if (err){
			console.log(err);
		} else {
			if(foundUser0){
				res.render("secrets", {usersWithSecret: foundUsers}); 
			}
		}
	}); 
});


app.get("/submit", function (req, res) {
	if (req.isAuthenticated()) {
		res.render("submit");
	} else {
		res.redirect("/login");
	}
});

app.get("/logout", function (req, res) {
	// here we end the users session using the logout method
	req.logOut();
	res.redirect("/")
});

// this function get triggered when the user presses the button of sign up with google.  
// profile scope includes the email and the user id in google accounts. 
app.get("/auth/google", passport.authenticate('google', { scope: ["profile"] }));

// unsuccessful login will be redirect to login
app.get("/auth/google/secrets", passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
	// Successful authentication, redirect to secrets.
	res.redirect('/secrets');
});



app.post("/register", function (req, res) {
	
	// this method is provided by the passport local mongoose we added as a plugin to the database schema
	// we use this method to register users in the database 
	// if the user is registered successfully we can then authenticate them and store a cookie in the local system to authenticate them later when they 
	// open the website later without giving the password or the email again. 
	// the user in the callback function is an instance of the user add to the database.
	User.register({ username: req.body.username }, req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			res.redirect("/register");
		} else {
			// this callback is only triggered if the user is successfully authenticated
			passport.authenticate("local")(req, res, function () {
				// res.render("secrets", {
				// 	userEmail: user.username
				// });
				res.redirect("/secrets");
			});
		}
	});
});

app.post("/login", function (req, res) {
	const user = new User({
		email: req.body.username,
		password: req.body.password
	});
	// this function will log in the user and authenticate them. This method comes from passport
	req.login(user, function (err) {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function () {
				// res.render("secrets", {
				// 	userEmail: user.email
				// });
				res.redirect("/secrets");
			});
		}
	});
});

app.post("/submit", function (req, res) {
	const submittedSecret = req.body.secret; 

	// with req.user we can access the logged user information
	User.findById(req.user.id, function(err, foundUser){
		if(err){
			console.log(err);
		}else{
			if(foundUser){
				foundUser.secret = submittedSecret; 
				foundUser.save(function(err){
					if(!err){
						res.redirect("/secrets")
					}
				}); 
			}
		}
	});
});
