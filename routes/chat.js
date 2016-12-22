var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var async = require("async");

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./makeObj.js');

function checkSession( req, res, next ){
	if( req.user && req.user.signUp ){
		return next();
	} else {
		res.redirect('/login/' + req.url.substr(1).replace(/\//g,'-'));
	}
}

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

String.prototype.xssFilter = function() {
	return this.replace( /</g , "&lt" ).replace( />/g , "&gt" );
}

router.get('/chat', checkSession, function( req, res ){
	db.Chats.find({ type : "user", $or : [ { user_id : req.user.id },{ to : req.user.id } ] }).sort({ id : -1 }).exec( function( err, chats ){
		if( err ){
			throw err;
		} else {
			var dialogs = {};
			async.map(chats, function( chat, callback ){
				if( chat.user_id == req.user.id && dialogs[chat.to] == undefined ){
					db.Users.findOne({ id : chat.to }, function( err, user ){
						if( err ){
							throw err;
						} else if( user ){
							dialogs[chat.to] = JSON.parse(JSON.stringify(chat));
							dialogs[chat.to].user = {
								id : user.id,
								name : user.name,
								user_id : user.user_id
							}
							callback(null);
						}
					});
				} else if ( chat.to == req.user.id && dialogs[chat.user_id] == undefined ){
					dialogs[chat.user_id] = chat;
					callback(null);
				}
			}, function( error ){
				if( error ){
					throw error;
				}
				makeObj( req, res, "chat", { dialogs : JSON.stringify(dialogs) });
//				makeObj( req, res, "chat" );
			});
		}
	});
//	db.Groups.find({ type : "group", user_ids : { $in : [ req.user.id ] } }, function( err, groups ){
//	});
});

router.post('/api/chat/writechat', checkSession, function( req, res ){
	var filecount = 0;
	var text = "";
	var type = "";
	var to_id = "";
	db.Chats.findOne().sort({id:-1}).exec( function( err, result ){
		var chatid;
		if( !result ){
			chatid = 1;
		} else {
			chatid = result.id + 1;
		}
		var uploadedFile = __dirname + '/../files/chatimg/' + chatid;
		fs.mkdir( uploadedFile, 0755, function( err ){
			if( err ){
				throw err;
			}
			req.pipe( req.busboy );
			req.busboy.on( 'file', function( fieldname, file, filename ){
				var fstream;
				++filecount;
				fstream = fs.createWriteStream( uploadedFile + '/' + filecount );
				file.pipe( fstream );
				fstream.on( 'close' , function(){
				});
			});
			req.busboy.on( 'field', function( fieldname, val ){
				if( fieldname == "text" ){
					text = val.trim().xssFilter();
				} else if( fieldname == "to_id" ){
					to_id = parseInt(val.trim().xssFilter());
				}
			});
			req.busboy.on( 'finish', function(){
				var current = new db.Chats({
					id : chatid,
					user_id : req.user.id,
					user_name : req.user.name,
					user_userid : req.user.user_id,
					to : to_id,
					type : "user",
					text : text,
					file : filecount
				});
				current.save( function( error ){
					if( error ){
						throw error;
					} else {
						res.send( current.id.toString() );
					}
				});
			});
		});
	});
});

router.post('/api/chat/getchats', checkSession, function( req, res ){
	var type = req.params['type'];
	var dialog_id = req.params['dialog_id'];
	var skip = req.params['skip'];
	var limit = req.params['limit'];
	if( type == "group" ){
		db.Groups.findOne({ id : dialog_id, user_ids : { $in : [ req.user.id ] } }, function( error, group ){
			if( error ){
				throw error;
			} else if( group ){
				db.Chats.find({ type : type, to : dialog_id }).skip( skip ).limit( limit ).sort({ id : -1 }).exec( function( err, result ){
					if( err ){
						throw err;
					} else {
						res.send(result);
					}
				});
			} else {
				res.send("비정상적 접근");
			}
		});
	} else if( type == "user" ){
		db.Chats.find({ type : type, $or : [{ to : dialog_id, user_id : req.user.id },{ to : req.user.id , user_id : dialog_id }] }).skip( skip ).limit( limit ).sort({ id : -1 }).exec( function( err, result ){
			if( err ){
				throw err;
			} else {
				res.send(result);
			}
		});
	}
});

module.exports = router;
