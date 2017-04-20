'use strict';

var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var async = require("async");

router.use(require('body-parser').urlencoded());
router.use(busboy())

var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkSession;

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

String.prototype.xssFilter = function() {
	return this.replace( /</g , "&lt" ).replace( />/g , "&gt" ).replace( /"/g , '\\"' ).replace( /'/g, "\\'" );
}


router.get('/chat', checkSession, function( req, res ){
	var dialogs = {};
	var result = [];
	var group_ids = [];
	async.waterfall([
		function( callback ){
			db.Groups.find({ "users.id" : { $in : [ req.user.id ] } }, function( err, groups ){
				if( err ){
					throw err;
				} else {
					if( groups.length == 0 ){
						callback( null );
					} else {
						for( var i = groups.length - 1; i >= 0; --i ){
							group_ids.push( groups[i].id );
							if( !i ){
								callback( null );
							}
						}
					}
				}
			});
		}, function( callback ){
			db.Chats.find({ be : true, $or : [{ type : "u", "from.uid" : req.user.uid },{ type : "g", "to.id" : { $in : group_ids } }, { type : "u", "to.uid" : req.user.uid }] }).sort({ id : -1 }).exec( function( err, chats ){
				if( err ){
					throw err;
				} else {
					callback( null, chats );
				}
			});
		}
	], function( err, chats ){
		async.map(chats, function( chat, callback ){
			if( chat.text != null || chat.file ){
				if( chat.type == "u" ){
					if( chat.from.id == req.user.id && dialogs[chat.to.uid] == undefined ){
						result.push(chat);
						dialogs[chat.to.uid] = chat;
					} else if ( chat.to.id == req.user.id && dialogs[chat.from.uid] == undefined ){
						result.push(chat);
						dialogs[chat.from.uid] = chat;
					}
				} else if( chat.type == "g" ){ 
					if( dialogs[chat.to.id] == undefined ){
						dialogs[chat.to.id] = chat;
						result.push(chat);
					}
				}
			}
			callback(null);
		}, function( error ){
			if( error ){
				throw error;
			}
			makeObj( req, res, "chat", { dialogs : result });
		});
	});
});

router.post('/api/chat/exit', checkSession, function( req, res ){
	var gid = parseInt(req.body['gid']);
	db.Groups.findOne({ id : gid, "users.uid" : { $in : [ req.user.uid ] } }, function( err, group ){
		if( err ){
			throw err;
		} else {
			group.update({ $pull : { "users" : { id : req.user.id } } }, function( err, result ){
				db.Chats.findOne().sort({id:-1}).exec( function( err, chat ){
					if( err ){
						throw err;
					}
					var cid;
					if( !chat ){
						cid = 1;
					} else {
						cid = chat.id + 1;
					}
					var current = new db.Chats({
						id : cid,
						from : {
							id : req.user.id,
							name : req.user.name,
							uid : req.user.uid
						},
						type : 'g',
						to : group,
						text : null,
						html : '<span>' + req.user.name + '</span>님이 그룹에서 탈퇴하셨습니다',
						file : false
					});
					current.save( function( err ){
						for( var i = 0; i < group.users.length; ++i ){
							var socket_id = socket_ids[group.users[i].id];
							if( socket_id != undefined ){
								io.sockets.connected[socket_id].emit( 'chat_new', { type : current.type, dialog_id : current.to.id } );
							}
						}
						res.send("success");
					});
				});
			});
		}
	});
});

router.post('/api/chat/invite', checkSession, function( req, res ){
	var uids = req.body['uids'].split(',');
	var gid = parseInt(req.body['gid']);
	db.Groups.findOne({ id : gid, "users.uid" : { $in : [ req.user.uid ], $nin : uids } }, function( err, group ){
		if( err ){
			throw err;
		} else if( group ){
			db.Users.find({ uid : { $in : uids }, signUp : true }, function( err, users ){
				if( err ){
					throw err;
				} else if( users ){
					async.map(users, function( user, callback ){
						group.update({ $push : { users : user } }, function( err, result ){
							if( err ){
								throw err;
							} else if( result ){
								callback( null, user.name );
							}
						});
					}, function( err, result ){
						if( err ){
							throw err;
						} else if( result != undefined && result.length >= 1 ){
							db.Chats.findOne().sort({id:-1}).exec( function( err, chat ){
								if( err ){
									throw err;
								}
								var cid;
								if( !chat ){
									cid = 1;
								} else {
									cid = chat.id + 1;
								}
								var current = new db.Chats({
									id : cid,
									from : {
										id : req.user.id,
										name : req.user.name,
										uid : req.user.uid
									},
									type : 'g',
									to : group,
									text : null,
									html : '<span>' + req.user.name + '</span> 님이 <span>'+ result.toString() + '</span> 님을 초대하셨습니다',
									file : false
								});
								current.save( function( err ){
									for( var i = 0; i < group.users.length; ++i ){
										var socket_id = socket_ids[group.users[i].id];
										if( socket_id != undefined ){
											io.sockets.connected[socket_id].emit( 'chat_new', { type : current.type, dialog_id : current.to.id } );
										}
									}
									res.send("success");
								});
							});
						}
					});
				} else {
					res.end();
				}
			});
		} else {
			res.end();
		}
	});
});

router.post('/api/chat/makegroup', checkSession, function( req, res ){
	var uids = [];
	var name = "";
	db.Groups.findOne().sort({id:-1}).exec( function( err, group ){
		var gid;
		if( !group ){
			gid = 1;
		} else {
			gid = group.id + 1;
		}
		req.pipe( req.busboy );
		req.busboy.on( 'file', function( fieldname, file, filename ){
			var uploadedFile = __dirname + '/../files/group/' + gid;
			var fstream;
			fstream = fs.createWriteStream( uploadedFile );
			file.pipe( fstream );
			fstream.on( 'close' , function(){
			});
		});
		req.busboy.on( 'field', function( fieldname, val ){
			if( fieldname == "name" ){
				name = val.trim().xssFilter();
			} else if( fieldname == "uids" ){
				uids = val.split(',');
			}
		});
		req.busboy.on( 'finish', function(){
			db.Users.find({ uid : { $in : uids } }, function ( err, users ){
				if( err ){
					throw err;
				} 
				var current = new db.Groups({
					id : gid,
					name : name,
					users : users
				});
				current.users.push(req.user);
				current.save( function( err ){
					if( err ){
						throw err;
					} else {
						res.send( gid.toString() );
					}
				});
			});
		});
	});
});

router.post('/api/chat/writechat', checkSession, function( req, res ){
	var file_flag = false;
	var text = "";
	var type = "";
	var to_id = "";
	db.Chats.findOne().sort({id:-1}).exec( function( err, result ){
		if( err ){
			throw err;
		}
		var cid;
		if( !result ){
			cid = 1;
		} else {
			cid = result.id + 1;
		}
		req.pipe( req.busboy );
		req.busboy.on( 'file', function( fieldname, file, filename ){
			var uploadedFile = __dirname + '/../files/chat/' + cid;
			var fstream;
			file_flag = true;
			fstream = fs.createWriteStream( uploadedFile );
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
				id : cid,
				from : { 
					id : req.user.id,
					name : req.user.name,
					uid : req.user.uid
				},
				type : type,
				text : text,
				file : file_flag
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
								makeNotice( user, req.user, "chat", current );
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
									if( socket_id != undefined && group.users[i].id != req.user.id ){
										makeNotice( group.users[i], req.user, "chat", current );
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

router.post('/api/chat/getfile', checkSession, function( req, res ){
	var type = req.body['type'];
	var dialog_id = req.body['dialog_id'];
	var now = parseInt( req.body['now'] );
	var flag = req.body['flag'];

	var query = {
 		type : type, 
		file : 1,
	}
	var sort = {};
	if( flag == "gt" ){
		query.id = { "$gt" : now }
	} else {
		query.id = { "$lt" : now }
		sort.id = -1
	}
	if( typeof now == "NaN" ){
		res.send("비정상적 접근");
	} else if( type == "g" ){
		db.Groups.findOne({ id : dialog_id, "users.id" : { $in : [ req.user.id ] } }, function( error, group ){
			if( error ){
				throw error;
			} else if( group ){
				query["to.id"] = dialog_id;
				db.Chats.findOne(query).sort(sort).exec( function( err, chat ){
					if( err ){
						throw err;
					} else if( chat ){
						res.send(chat.id.toString());
					} else {
						res.send("");
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
				query["$or"] = [{ "to.id" : user.id , "from.id" : req.user.id },{ "to.id" : req.user.id , "from.id" : user.id }];
				db.Chats.findOne(query).sort(sort).exec( function( err, chat ){
					if( err ){
						throw err;
					} else if( chat ){
						res.send(chat.id.toString());
					} else {
						res.send("");
					}
				});
			} else {
				res.send("존재하지 않는 유저");
			}
		});
	}
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
				db.Chats.find({ type : type, "to.id" : dialog_id, be : true }).sort({ id : -1 }).skip( skip ).limit( limit ).exec( function( err, result ){
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
				db.Chats.find({ be : true, type : type, $or : [{ "to.id" : user.id , "from.id" : req.user.id },{ "to.id" : req.user.id , "from.id" : user.id }] }).skip( skip ).limit( limit ).sort({ id : -1 }).exec( function( err, chats ){
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

router.post('/api/chat/getinfo', checkSession, function( req, res ){
	var dialog_id = req.body['dialog_id'];
	db.Groups.findOne({ id : dialog_id, "users.id" : { $in : [ req.user.id ] } }, function( error, group ){
		if( error ){
			throw error;
		} else if( group ){
			res.send(group);
		} else {
			res.send("존재하지 않는 그룹입니다.");
		}
	});
});

module.exports = router;
