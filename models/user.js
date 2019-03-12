var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var StudentSchema = new mongoose.Schema({

	username:String,
	regno:String,
	roomno:String,
	messbal:Number,
	c:Number


});

StudentSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("Student",StudentSchema);