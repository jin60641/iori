'use strict';

var mongoose = require('mongoose'); 		
mongoose.connect('mongodb://localhost/db')	
var db = mongoose.connection;				
db.on('error', console.error.bind(console, 'connection error: ')); 

db.once('open', function callback() {
	console.log('db connected');
});

var ReportSschema = new mongoose.Schema({
	id : { type : Number },
	comment : { type : String },
	type : { type : String },
	comment : { type : String },
	oid : { type : Number },
	date : { type : Date, default : Date.now },
	be : { type : Boolean }
});

var FavoriteSchema = new mongoose.Schema({
	uid : { type : Number },
	pid : { type : Number },
	date : { type: Date, default : Date.now }
});

var DontseeSchema = new mongoose.Schema({
	uid : { type : Number },
	type : { type : String },
	obj_id : { type : Number },
	date : { type : Date, default : Date.now }
});

var ChatSchema = new mongoose.Schema({
	id : { type : Number },
	from : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	to : { 
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	type : { type : String },
	html : { type : String },
	text : { type : String },
	file : { type : Boolean, default : false },
	date : { type : Date, default : Date.now },
	be : { type : Boolean, default : true }
});

var GroupSchema = new mongoose.Schema({
	id : { type : Number },
	users : [{
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	}],
	name : { type : String }
});

var PostSchema = new mongoose.Schema({
	id : { type : Number },
	user : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	text : { type : String, default : "" },
	html : { type : String, default : "" },
	date : { type : Date, default : Date.now },
	change :  { type : Date },
	file :  { type : Number },
	share : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	be : { type : Boolean, default : true }
});

var ReplySchema = new mongoose.Schema({
	id : { type : Number },
	user : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	pid : { type : Number },
	text : String,
	date : { type: Date, default : Date.now },
	change : { type : Date },
	file : { type : Number },
	be : { type : Boolean, default : true }
});

var FollowSchema = new mongoose.Schema({
	from : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	to : { 
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	date : { type: Date, default : Date.now }
});

var UserSchema = new mongoose.Schema({
	id : { type : Number },
	admin : { type : Boolean, default : false },
	email : String,
	name : String,
	password : String,
	signUp : { type : Boolean, default : false },
	uid : String,
	profile : { type : Boolean, default : false },
	header : { type : Boolean, default : false },
	notice : {
		favorite : { type : Boolean, default : true },
		reply : { type : Boolean, default : true },
		follow : { type : Boolean, default : true },
		chat : { type : Boolean, default : true },
		share : { type : Boolean, default : true },
		email : { type : Boolean, default : true },
		web : { type : Boolean, default : true }
	},
	color : { 
		hex : { type : String, default : require('./settings.js').defaultColor.hex },
		r : { type : Number, default : require('./settings.js').defaultColor.r },
		g : { type : Number, default : require('./settings.js').defaultColor.g },
		b : { type : Number, default : require('./settings.js').defaultColor.b }
	},
	last : { type : Date },
	date : { type : Date, default : Date.now },
	be : { type : Boolean, default : true }
});

var NoticeSchema = new mongoose.Schema({
	id : { type : Number },
	to : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	from : {
		id : { type : Number },
		uid : { type : String },
		name : { type : String }
	},
	type : { type : String },
	desc : { type : String },
	link : { type : String },
	readed : { type : Boolean, default : false },
	date : { type : Date, default : Date.now }
});

var LinkSchema = new mongoose.Schema({
	url : { type : String },
	title : { type : String },
	description : { type : String },
	image : { type : String }
});

module.exports = {
	Users : mongoose.model('users',UserSchema),
	Follows : mongoose.model('follows',FollowSchema),
	Posts : mongoose.model('posts',PostSchema),
	Replys : mongoose.model('replys',ReplySchema),
	Favorites : mongoose.model('favorites',FavoriteSchema),
	Dontsees : mongoose.model('dontsees',DontseeSchema),
	Groups : mongoose.model('groups',GroupSchema),
	Notices : mongoose.model('notices',NoticeSchema),
	Links : mongoose.model('links',LinkSchema),
	Chats : mongoose.model('chats',ChatSchema)
}
