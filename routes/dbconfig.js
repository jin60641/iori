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
    id : { type : Number },
    user_id : { type : Number },
    post_id : { type : Number },
    date : { type: Date, default : Date.now }
});

var DontseeSchema = new mongoose.Schema({
    id : { type : Number },
    user_id : { type : Number },
	type : { type : String },
    obj_id : { type : Number },
    date : { type : Date, default : Date.now }
});

var ChatSchema = new mongoose.Schema({
	id : { type : Number },
	user_id : { type : Number },
	user_name : { type : String },
	user_userid : { type : String },
	to : { type : Number },
	type : { type : String },
	text : { type : String },
	file : { type : Number },
	date : { type : Date, default : Date.now }
});

var GroupSchema = new mongoose.Schema({
	id : { type : Number },
	user_ids : [{ type : Number }],
	name : { type : String }
});

var PostSchema = new mongoose.Schema({
    id : { type : Number },
    user_id : { type : Number },
	user_userid : { type : String },
    user_name : String,
    text : { type : String, default : "" },
    html : { type : String, default : "" },
    date : { type : Date, default : Date.now },
    change :  { type : Date },
    file :  { type : Number }
});

var ReplySchema = new mongoose.Schema({
    id : { type : Number },
    user_id : { type : Number },
    user_name : String,
	user_userid : { type : String },
    post_id : { type : Number },
    text : String,
    date : { type: Date, default : Date.now },
    change : { type : Date },
    file : { type : Number }
});

var FollowSchema = new mongoose.Schema({
    from_id : { type : Number },
	from_userid : { type : String },
	from_name : { type : String },
    to_id : { type : Number },
	to_userid : { type : String },
	to_name : { type : String },
    date : { type: Date, default : Date.now }
});

var UserSchema = new mongoose.Schema({
    id : { type : Number },
    email : String,
    name : String,
    password : String,
    signUp : { type : Number },
	user_id : String,
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

var GroupSchema = new mongoose.Schema({
    id : { type : Number },
    members : [{
        id : Number,
        permission : Number, // 0은 일반멤버 1은 관리자멤버
        date : { type : Date, default : Date.now }
    }],
    name : String,
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
