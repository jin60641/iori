var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var im = require('imagemagick');

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

router.post('/@:uid(*)/follower', function( req, res ){
	var uid = req.params['uid'];
	db.Users.findOne({ uid : req.params['uid'] }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			db.Follows.find({ "to.id" : user.id }, function( err, result ){
				if( err ){
					throw err;
				} else if( result.length ){
					res.send(result);
				}
			});
		} else {
			res.send("없는 사용자입니다.");
		}
	});
});

router.post('/@:uid(*)/following', function( req, res ){
	var uid = req.params['uid'];
	db.Users.findOne({ uid : req.params['uid'] }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			db.Follows.find({ "from.id" : user.id }, function( err, result ){
				if( err ){
					throw err;
				} else {
					res.send(result);
				}
			});
		} else {
			res.send("없는 사용자입니다.");
		}
	});
});

router.post('/@:uid(*)/favorite', function( req, res ){
	db.Users.findOne({ uid : req.params['uid'] }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			db.Favorites.find({ uid : user.id }, function( err, result ){
				if( err ){
					throw err;
				} else {
					res.send(result);
				}
			});
		} else {
			res.send("없는 사용자입니다.");
		}
	});
});

router.get('/@:uid(*)', function( req, res ){
	var uid = req.params['uid'];
	db.Users.findOne({ uid : uid }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			var obj = {
				id : user.id,
				name : user.name,
				uid : user.uid,
				profile : user.profile,
				header : user.header,
				following : false
			}
			if( req.user && req.user.id ){
				db.Follows.findOne({ to_id : user.id, from_id : req.user.id }, function( err2, following ){
					if( err2 ){
						throw err2;
					} else {
						if( following ){
							obj.following = true;
						}
						makeObj( req, res, "profile", { "user" : JSON.stringify(obj) } );
					}
				});
			} else {
				makeObj( req, res, "profile", { "user" : JSON.stringify(obj) } );
			}
		} else {
			//makeObj( req, res, "anyone" );
			res.send("존재하지 않는 사용자입니다.");
		}
	});
});

router.post('/@:uid(*)', function( req, res ){
	db.Users.findOne({ uid : req.params['uid'], signUp : true }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			var obj = {
				name : user.name,
				uid : user.uid
			}

			var socket_id = socket_ids[user.id];
			if( io.sockets.connected[socket_id] ){
				obj.last = "접속중";
			} else {
				var date = new Date(user.last);
				var now = new Date();
				var date_time = Math.floor(date.getTime()/1000)
				var now_time = Math.floor(now.getTime()/1000)
				var gap = now_time - date_time;
				if( gap < 120 ){
					obj.last = "마지막 접속 1분 전";
				} else if( gap < 3600 ){
					obj.last = "마지막 접속 " + Math.floor(gap/60)+"분 전";
				} else if( gap < 86400 ){
					obj.last = "마지막 접속 " + Math.floor(gap/3600)+"시간 전";
				} else if( gap >= 86400 ){
					if(Math.floor(gap/86400) == 1){
						obj.last = "마지막 접속 어제 " + date.getHours() + ":" + date.getMinutes();
					} else {
						var b = new Date();
						b.setHours(0);
						b.setMinutes(0);
						b.setSeconds(0);
						b.setMilliseconds(0);
						obj.last = "마지막 접속 " + Math.floor((b.getTime()/1000 - date_time)/86400) + "일 전";
					}
				}
			}
			res.send(obj);
		} else {
			res.send("존재하지 않는 사용자입니다.");
		}
	});
});

router.post( '/api/user/search', function( req, res){
	var query = req.body['query'];
	if( query ){
		db.Users.find({ $or : [{ name : { $regex : query } }, { uid : { $regex : query } }], signUp : true },{ __v : 0, _id : 0, signUp : 0, email : 0, password : 0 }, function( err, result ){
			if( result ){
				res.send( result );
			} else {
				res.end();
			}
		});
	} else {
		res.send("검색어를 입력하여 주십시오.");
	}
});

router.post( '/api/user/removeimg', checkSession, function( req, res ){
	var type = req.body['imgtype'];
	if( type != "profile" && type != "header" ){
		res.end();
	} else {
		var file = __dirname + '/../files/' + type + '/' + req.user.id;
		var exist = fs.existsSync( file );
		if( exist ){
			fs.unlink( file, function( err ){
				if( err ){
					throw err;
				}
				res.send("success")
				var query = {};
				query[type] = false;
				db.Users.update({ id : req.user.id }, query ).exec();
			});
		}
	}
});

router.post( '/api/user/:imgtype(*)img', checkSession, function( req, res ){
	var type = req.params['imgtype'];
	var point = {};
	if( type != "profile" && type != "header" ){
		res.end();
	} else {
		var point = {};
		var uploadedFile = __dirname + '/../files/' + type + '/' + req.user.id;
		var fstream = fs.createWriteStream( uploadedFile );
		var origin;

		req.pipe( req.busboy );
		req.busboy.on( 'file', function( fieldname, file, filename ){
			fstream.on( 'close' , function(){
				if( point.x >= 0 && point.y >= 0 && point.width >= 1 && point.height >= 1 && fstream != null ){
					var query = point.width + 'x' + point.height + '+' + point.x + '+' + point.y;
					im.convert([ uploadedFile, '-crop', query, uploadedFile ] , function( err ){
						if( err ){
							throw err;
						}
						res.end();
						var obj = {};
						obj[type] = true;
						db.Users.update({ id : req.user.id }, obj ).exec();
					});
				} else {
					res.end();
				}
			});
			file.pipe( fstream );
		});

		req.busboy.on( 'field', function( fieldname, val ){
			point[fieldname] = val;
		});

	}
});

router.post( '/api/user/follow', checkSession, function( req, res ){
	var uid = req.body['uid'];
	db.Users.findOne({ id : uid }, { _id : 0, id : 1, name : 1, uid : 1 }, function( err, user ){
		if( err ){
			throw err;
		} else if ( user ){
			db.Follows.findOne({ to_id : user.id }, function( err2, follow ){
				if( err2 ){
					throw err2;
				} else if( follow ){
					follow.remove( function( err3 ){
						if( err3 ){
							throw err3;
						} else {
							res.send("unfollow");
						}
					});
				} else {
					var current = new db.Follows({
						from : {
							id : req.user.id,
							uid : req.user.uid,
							name : req.user.name
						},
						to : user
					});
					current.save( function( err3 ){
						if( err3 ){
							throw err3;
						} else {
							res.send("follow");
						}
					});
				}
			});
		} else {
			res.send("존재하지 않는 사용자입니다");
		}
	});
});

module.exports = router;
