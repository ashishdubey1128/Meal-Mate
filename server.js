var five = require("johnny-five");

var express = require("express");

var app = express();

var bodyParser = require("body-parser");

var request = require("request");

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/mealmate_app");

var passport = require("passport");

var localStrategy = require("passport-local");

//var board = new five.Board();
app.use(bodyParser.urlencoded({extended:true}));

var User = require("./models/admin");
var Student = require("./models/user");



app.use(require("express-session")({
	secret:"Apurva is the best",
	resave:false,
	saveUninitialized:false
}));

app.use( express.static( "public" ) );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res)
{
	res.render("homepage.ejs");
});

app.get("/mainpage",isLoggedIn,function (req,res) {
	Student.find({},function (err,stu) {
			if (err) {
				console.log(err);
			}
			else{
				res.render("landing.ejs",{stu:stu});
			}
			
	});
});


app.post("/signup",function (req,res) {
	var newuser = new User({username:req.body.username});
	User.register(newuser,req.body.password , function (err,user) {
		if(err)
		{
			console.log(err);
			return res.render("homepage.ejs");
		}
		passport.authenticate('local')(req,res,function(){
			res.redirect("/mainpage");
		});
	});
});


app.post("/login", passport.authenticate("local",{
	successRedirect:"/mainpage",
	failureRedirect:"/"
}),function (req,res) {
});


app.get("/logout",function (req,res) {
	req.logout();
	res.redirect("/");
});


var c=0;
app.post("/register",function (req,res) {
		Student.findOne({regno:req.body.regno},function(err,user)
		{
			if(err)
			{
				console.log(err);
			}
			if(!user)
			{
				Student.create({
				username:req.body.stuname,
				regno:req.body.regno,
				roomno:req.body.rno,
				messbal:req.body.mb
			},function(errr,user){
				if(errr)
				{
					console.log(errr);
				}
				else
				{
					res.redirect("/mainpage");
					c=0;
				}
			});
			}
			else
			{
				res.redirect("/mainpage");
			}
		});
	});
		


var ar=["1"];

app.post("/verify",function (req,res) {
	Student.find({regno:req.body.regg},function (err,user) {
		if (err) {
			console.log(err);
		}
		else
		{
			ar.forEach(function (v) {
				if(v===req.body.regg)
				{	
					var z="OOPS !! Already taken once";
					res.render("notconfirm.ejs",{z:z});
				}
				else
				{
					var y = "Collect you Plate";
					ar.push(req.body.regg);
					res.render("confirm.ejs",{x:y});
				}

			});
		}
	});
});


// app.post("/deposit",function (req,res) {
// 	Student.find
// })


app.post("/delete",function(req,res)
{
	Student.findOneAndDelete({regno:req.body.reg},function(err,user)
	{
		if (err) {
			console.log(err);
		}
		else
		{
			res.redirect("/mainpage");
		}
	});
});

// board.on("ready", function() {

//   var motor = new five.Motor(13);

//   // Start the motor at maximum speed
//   motor.start(255);
//   motor

// });



function isLoggedIn(req,res,next) {
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/");
}


var port = 3000||process.env.port;
app.listen(port,function(){
	console.log("Server Started!!!");
});