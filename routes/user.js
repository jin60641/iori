var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

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

router.get('/@:uid(*)/favorite', function( req, res ){
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

router.post( '/api/user/search', function( req, res){
	query = req.body['query'];
	if(query){
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

router.post( '/api/user/headerimg', checkSession, function( req, res ){
	console.log("12313");
	var fstream;
	req.pipe( req.busboy );
	req.busboy.on( 'file' , function( fieldname, file, filename ){
		var uploadedFile = __dirname + '/../files/header/' + req.user.id;
		fstream = fs.createWriteStream( uploadedFile );
		file.pipe( fstream );
		fstream.on( 'close' , function(){
			res.redirect(req.get('referer'));
		});
	});
});


router.post( '/api/user/profileimg', checkSession, function( req, res ){
	console.log("why");
	var fstream;
	req.pipe( req.busboy );
	req.busboy.on( 'file' , function( fieldname, file, filename ){
		var uploadedFile = __dirname + '/../files/profile/' + req.user.id;
		fstream = fs.createWriteStream( uploadedFile );
		file.pipe( fstream );
		fstream.on( 'close' , function(){
			res.redirect(req.get('referer'));
		});
	});
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
