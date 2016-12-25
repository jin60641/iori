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
	db.Chats.find({ type : "u", $or : [ { "from.uid" : req.user.id }, { "to.uid" : req.user.uid } ] }).sort({ id : -1 }).exec( function( err, chats ){
		if( err ){
			throw err;
		} else {
			var dialogs = {};
			async.map(chats, function( chat, callback ){
				if( chat.from.id == req.user.id && dialogs[chat.to.uid] == undefined ){
					dialogs[chat.to.uid] = chat;
				} else if ( chat.to.id == req.user.id && dialogs[chat.from.uid] == undefined ){
					dialogs[chat.from.uid] = chat;
				}
				callback(null);
			}, function( error ){
				if( error ){
					throw error;
				}
				makeObj( req, res, "chat", { dialogs : JSON.stringify(dialogs) });
//				makeObj( req, res, "chat" );
			});
		}
	});
//	db.Groups.find({ type : "g", uids : { $in : [ req.user.id ] } }, function( err, groups ){
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
		var uploadedFile = __dirname + '/../files/chat/' + chatid;
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
					to_id = val.trim().xssFilter();
				} else if( fieldname == "type" ){
					type = val.trim().xssFilter();
				}
			});
			req.busboy.on( 'finish', function(){
				var current = new db.Chats({
					id : chatid,
					from : { 
						id : req.user.id,
						name : req.user.name,
						uid : req.user.uid
					},
					type : type,
					text : text,
					file : filecount
				});
				if( type == "u" ){
					db.Users.findOne({ uid : to_id, signUp : true }, { _id : 0, uid : 1, id : 1, name : 1 }, function( err, user ){	
						if( err ){
							throw err;
						} else {
							current.to = user;
							current.save( function( err ){
								if( err ){
									throw err;
								} else {
				   					var socket_id = socket_ids[user.id];
									if( socket_id != undefined ){
										io.sockets.connected[socket_id].emit( 'chat_new', { type : current.type, dialog_id : current.from.uid } );
				   					}
									res.send( current.to );
								}
							});
						}
					});
				} else if( type == "g" ){
					db.Groups.findOne({ id : to_id }, function( err, group ){
						if( err ){
							throw err;
						} else {
							current.to = group;
							current.save( function( err ){
								if( err ){
									throw err;
								} else {
									for( var i = 0; i < group.users.length; ++i ){
					   					var socket_id = socket_ids[group.users[i].id];
										if( socket_id != undefined ){
											io.sockets.connected[socket_id].emit( 'chat_new', { type : current.type, dialog_id : current.to.id } );
					   					}
									}
									res.send( current.to );
								}
							});
						}
					});
				}
						
			});
		});
	});
});

router.post('/api/chat/getchats', checkSession, function( req, res ){
	var type = req.body['type'];
	var dialog_id = req.body['dialog_id'];
	var limit = parseInt( req.body['limit'] );
	var skip = parseInt( req.body['skip'] );

	if( typeof skip != "number" || typeof limit != "number" ){
		res.send("비정상적 접근");
	} else if( type == "g" ){
		db.Groups.findOne({ id : dialog_id, "users.id" : { $in : [ req.user.id ] } }, function( error, group ){
			if( error ){
				throw error;
			} else if( group ){
				db.Chats.find({ type : type, "to.id" : dialog_id }).sort({ id : -1 }).skip( skip ).limit( limit ).exec( function( err, result ){
					if( err ){
						throw err;
					} else {
						res.send(result);
					}
				});
			} else {
				res.send("존재하지 않는 그룹");
			}
		});
	} else if( type == "u" ){
		db.Users.findOne({ uid : dialog_id, signUp : true }, function( err, user ){
			if( err ){
				throw err;
			} else if( user ){
				db.Chats.find({ type : type, $or : [{ "to.id" : user.id , "from.id" : req.user.id },{ "to.id" : req.user.id , "from.id" : user.id }] }).skip( skip ).limit( limit ).sort({ id : -1 }).exec( function( err, chats ){
					if( err ){
						throw err;
					} else {
						res.send(chats);
					}
				});
			} else {
				res.send("존재하지 않는 유저");
			}
		});
	}
});

module.exports = router;
