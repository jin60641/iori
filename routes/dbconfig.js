var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db')
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
	console.log('db connected');
});

var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost/db')
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
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
	date : { type : Date, default : Date.now }
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
    file :  { type : Number }
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
    file : { type : Number }
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
    email : String,
    name : String,
    password : String,
    signUp : { type : Boolean, default : false },
	uid : String,
	last : { type : Date },
	date : { type : Date, default : Date.now }
});

var NoticeSchema = new mongoose.Schema({
    id : { type : Number },
    from_id : { type : Number },
    to_id : { type : Number },
    readed : { type : Boolean, default : false },
    notice_type : { type : Number },
    obj_id : { type : Number },
    date : { type : Date, default : Date.now }
});

var LinkSchema = new mongoose.Schema({
    url : { type : String },
    title : { type : String },
    description : { type : String },
    image : { type : String }
});

var MusicSchema = new mongoose.Schema({
    id : { type : Number },
    title : { type : String },
    artist : { type : String },
    genre : { type : String },
    vals : []
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
	Chats : mongoose.model('chats',ChatSchema),
    Musics : mongoose.model('musics',MusicSchema)
}
