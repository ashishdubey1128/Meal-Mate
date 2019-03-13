var five = require("johnny-five");

var nodemailer = require("nodemailer");


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ashishkdubey1128@gmail.com',
    pass: 'ashish11281129'
  }
});



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
				email:req.body.email,
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
		



app.post("/verify",function (req,res) {
	Student.findOne({regno:req.body.regg},function (err,user) {
		if (err) {
			console.log(err);
		}
		if(!user)
		{
			var z = "You are at the WRONG place!!";
			res.render("notconfirm.ejs",{z:z});
		}
		else if(user.c==1)
		{
			var z = "OOPS!!! You have already taken your plate";
			res.render("notconfirm.ejs",{z:z});
		}
		else if(user.messbal<100)
		{
			var z = "Running Out of Balance: Need to recharge!!";
			res.render("notconfirm.ejs",{z:z});
			//mail
			var mailOptions = {
  			from: 'ashishkdubey1128@gmail.com',
  			to: user.email,
  			subject: 'Mess Balance Low',
  			text: 'RECHARGE your mess balance....running low'
			};

			transporter.sendMail(mailOptions, function(error, info){
  			if (error) {
    		console.log(error);
  			}
  			else {
    		console.log('Email sent: ' + info.response);
  			}
			});

		}
		else
		{
			Student.findOneAndUpdate({regno:req.body.regg},{$set:{c:'1'}},function (errr,u) {
				if (errr) {
					console.log(errr);
				}
				else
				{
					var x = "Take your Plate !!";
					res.render("confirm.ejs",{x:x});
					//servo
					// board.on("ready", function() {
					//   var servo = new five.Servo(3);
					//   this.repl.inject({
					//     servo: servo
					//   });
					//   servo.sweep();
					// });

				}
			});
		}
	});
});



app.post("/deposit",function (req,res) {
	Student.findOne({regno:req.body.regggg},function (err,use) {
		if (err) {
			console.log(err);
		}
		else if(use.c==0)
		{
			var k = "Take Plate First! ";
			res.render("notconfirm.ejs",{z:k});
		}
		else
		{
			Student.findOneAndUpdate({regno:req.body.regggg},{$set:{c:'0'}},function (errr,usse) {
				if(errr)
				{
					console.log(errr);
				}
				else
				{
					if(req.body.th=='o')
					{
						var m = (usse.messbal - 100)-5;
						Student.findOneAndUpdate({regno:req.body.regggg},{$set:{messbal:m}},function (er,usse){});
						var q = "Plate Submitted with deducted amount"+" "+"Remaining Bal: "+use.messbal;
						res.render("confirm.ejs",{x:q});

						var mailOptions = {
  						from: 'ashishkdubey1128@gmail.com',
  						to: usse.email,
  						subject: 'Credit Deduction',
  						text: 'Rs. 05 has been deducted from your mess balance for wasting food. This is venture to stop food wastage. Hope you Cooperate. Good day!'
						};

						transporter.sendMail(mailOptions, function(error, info){
  						if (error) {
    					console.log(error);
  						}
  						else {
    					console.log('Email sent: ' + info.response);
  						}
						});




					}
					else
					{
						var n = (usse.messbal - 100);
						Student.findOneAndUpdate({regno:req.body.regggg},{$set:{messbal:n}},function (errrr,usse){});
						var q = "Plate Submitted....Remaining Balance: "+use.messbal;
						res.render("confirm.ejs",{x:q});
					}
				}
			});
			}
		});
});


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
