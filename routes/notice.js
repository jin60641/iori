'use strict';

var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var async = require('async');

var makeObj = require('./makeObj.js');

var checkSession = require('./auth.js').checkSession;

router.get( '/activity', checkSession, function( req, res ){
	makeObj( req, res, "activity" );
});

router.get( '/notice', checkSession, function( req, res ){
	makeObj( req, res, "notice" );
});

router.post( '/api/notice/getactivitys', checkSession, function( req, res ){
	getActivitys( req, function( result ){
		res.send( result );
	});
});

router.post( '/api/notice/getnotices', checkSession, function( req, res ){
	getNotices( req, function( result ){
		res.send( result );
	});
});

function getActivitys( req, cb ){
	var skip = parseInt(req.body['skip']);
	var limit = parseInt(req.body['limit']);
	if( skip >= 0 == false ){
		skip = 0;
	}
	if( limit >= 0 == false ){
		limit = 20;
	}
	db.Notices.find({ "from.id" : req.user.id }).sort({ id : -1 }).limit( limit ).skip( skip ).exec( function( err, result ){
		if( err ){
			throw err;
		} else {
			cb( result );
		}
	});
};

function getNotices( req, cb ){
	db.Users.findOne({ id : req.user.id }, function( err2, user ){
		if( err2 ){
			throw err2;
		}
		var skip = parseInt(req.body['skip']);
		var limit = parseInt(req.body['limit']);
		if( skip >= 0 == false ){
			skip = 0;
		}
		if( limit >= 0 == false ){
			limit = 20;
		}
		var types = [];
		var type_key = Object.keys( user.notice );
		async.each( type_key, function( type, cb ){
			if( user.notice[ type ] == true ){
				types.push( type );
			}
			cb(null);
		}, function( err3 ){
			if( err3 ){
				throw err3;
			}
			var query = {
				"to.id" : req.user.id,
				type : { 
					$in : types
				}
			}
			db.Notices.find(query).sort({ id : -1 }).limit( limit ).skip( skip ).exec( function( err, result ){
				if( err ){
					throw err;
				} else {
					cb( result );
				}
			});
		});
	});
};

function makeNotice( to, from, type, obj ){
	var nid;
	var sid = socket_ids[ to.id ];
	var user;
	async.waterfall([
		function( cb ){
			if( to.id == from.id ){
				return; // 
			} else {
				cb( null );
			}
		}, function( cb ){
			db.Users.findOne({ id : to.id }, function( err, result ){
				if( err ){
					throw err;
				} else if( result == undefined ){
					return; // 없는유저
				} else {
					user = result;
					cb( null );
				}
			});
		}, function( cb ){
			db.Notices.findOne().sort({id:-1}).exec( function( err, result ){
				if( err ){
					throw err;
				} else {
					if( result ){
						nid = result.id + 1;
					} else {
						nid = 1;
					}
					cb( null );
				}
			});
		}
	], function( err ){
		var current = new db.Notices({
			id : nid,
			to : to,
			from : from,
			type : type
		});
		switch( type ){
			case "reply":
				current.desc = obj.text;
				current.link = "/post/" + obj.pid;
				break;
			case "chat":
				if( obj.text ){
					current.desc = obj.text;
				} else if ( obj.file ){
					current.desc = "파일";
				}
				if( obj.type == "g" ){
					current.link = "/chat/g/" + obj.to.id;
				} else if( obj.type == "u" ){
					current.link = "/chat/u/" + obj.from.uid;
				}
				break;
			case "follow":
				current.link = "/@" + obj.from.uid;
				break;
			case "favorite":
				current.link = "/post/" + obj.pid;
				break;
			case "share":
				current.link = "/post/" + obj.id;
				break;
		}
		current.save( function( err ){
			if( err ){
				throw err;
			}
			if( user.notice.email == true ){
				//이메일발송
			}
			if( user.notice.web == true ){
				//웹알람발송
			}
			if( sid && io.sockets.connected[sid] && user.notice[type] == true ){ 
				//소켓(iori)알람 발송
				io.sockets.connected[sid].emit( 'notice_new', current );
			}
		});
	});
}

module.exports = {
	router : router,
	makeNotice : makeNotice
};

