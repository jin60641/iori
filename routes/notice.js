var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');

router.use(require('body-parser').urlencoded());
var makeObj = require('./makeObj.js');

var checkSession = require('./auth.js').checkSession;

router.get( '/notice', checkSession, function( req, res ){
	db.Notices.find({ "to.id" : req.user.id }, function( err, result ){
		if( err ){
			throw err;
		} else {
			makeObj( req, res, "notice", { notices : JSON.stringify(result) } );
		}
	});
});

function makeNotice( to, from, type, obj ){
	var nid;
	var sid = socket_ids[ to.id ];
	db.Notices.findOne().sort({id:-1}).exec( function( err, result ){
		if( err ){
			throw err;
		} else {
			if( result ){
				nid = result.id + 1;
			} else {
				nid = 1;
			}
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
						current.link = "/chat#g?" + obj.to.id;
					} else if( obj.type == "u" ){
						current.link = "/chat#u?" + obj.from.uid;
					}
					break;
				case "follow":
					current.link = "/@" + obj.from.uid;
					break;
			}
			console.log(current);
			current.save( function( err ){
				if( err ){
					throw err;
				}
				io.sockets.connected[sid].emit( 'notice_new', current );
			});
		}
	});
}

module.exports = {
	router : router,
	makeNotice : makeNotice
};

