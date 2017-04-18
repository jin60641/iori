var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var im = require('imagemagick');
var smtpTransport = require("./mailconfig").smtpTransport;
var crypto = require('crypto');
var async = require('async');

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkSession;

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

String.prototype.xssFilter = function() {
	return this.replace( /</g , "&lt" ).replace( />/g , "&gt" );
}

router.get('/setting', checkSession, function( req, res ){
	makeObj( req, res, "setting", { page : null });
});
router.get('/setting/:page', checkSession, function( req, res ){
	var page = req.params['page'];
	if( page == undefined || page.length == 0 ){
		page = "account";
	}
	makeObj( req, res, "setting", { page : page });
});

router.post('/@:uid(*)/:type(follower|following)', function( req, res ){
	var uid = req.params['uid'];
	var type = req.params['type'];
	var way;
	var user;
	async.waterfall([ 
		function( cb ){
			db.Users.findOne({ uid : req.params['uid'], be : true }, function( err, result ){
				if( err ){
					throw err;
				} else if( result ){
					user = result;
					cb( null );
				} else {
					res.send("존재하지 않는 사용자입니다.");
				}
			});
		}, function( cb ){
			var query = {};
			if( type == "following" ){
				way = "to";
				query["from.id"] = user.id; 
			} else if( type == "follower" ){
				way = "from";
				query["to.id"] = user.id; 
			}
			db.Follows.find( query, function( err, result ){
				if( err ){
					throw err;
				} else if( result.length >= 1 ){
					var uids = [];
					for( var i = 0; i < result.length; ++i ){
						uids.push(result[i][way].id);
						if( i == result.length - 1){
							cb( null, uids );
						}
					}
				} else {
					res.send("[]");
				}
			});
		}, function( uids, cb ){
			db.Users.find({ be : true, id : { $in : uids } },{ id : 1, name : 1, uid : 1, profile : 1, header : 1 }).lean().exec( function( err, result ){
				if( err ){
					throw err;
				} else {
					cb( null, result );
				}
			});
		}, function( users, cb ){
			if( req.user && req.user.id ){
				for( var j = 0; j < users.length; ++j ){
					( function(i){
						db.Follows.find({ $or : [{ "to.id" : req.user.id, "from.id" : users[i].id },{ "from.id" : user.id, "to.id" : users[i].id }] }, function( err, result ){
							if( err ){
								throw err;
							} else {
								if( result != null ){
									if( result.length == 2 ){
										users[i].following = true;
										users[i].follower = true;
									} else if( result.length ){
										if( result[0].to.id == req.user.id ){
											users[i].follower = true;
										} else {
											users[i].following = true;
										}
									}
								} 
								if( i+1 == users.length ){
									cb( null, users );
								}
							}
						});
					})(j);
				}
			} else {
				cb( null, users );
			}
		}
	], function( err, users ){
		res.send(users);
	});
});

router.post('/@:uid(*)/favorite', function( req, res ){
	db.Users.findOne({ be : true, uid : req.params['uid'] }, function( err, user ){
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
			res.send("존재하지 않는 사용자입니다.");
		}
	});
});


function getProfilePage( req, res ){
	var uid = req.params['uid'];
	db.Users.findOne({ uid : uid, be : true },{ id : 1, name : 1, uid : 1, profile : 1, header : 1, color : 1 }).lean().exec( function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			var obj = user;
			obj.following = false;
			if( req.user && req.user.id ){
				db.Follows.findOne({ "to.id" : user.id, "from.id" : req.user.id }, function( err2, following ){
					if( err2 ){
						throw err2;
					} else {
						if( following ){
							obj.following = true;
						}
						makeObj( req, res, "profile", { "user" : obj } );
					}
				});
			} else {
				makeObj( req, res, "profile", { "user" : obj } );
			}
		} else {
			//makeObj( req, res, "anyone" );
			res.send("존재하지 않는 사용자입니다.");
		}
	});
}

router.get('/@:uid(*)/:tab', getProfilePage );
router.get('/@:uid(*)', getProfilePage );

router.post('/@:uid(*)', function( req, res ){
	db.Users.findOne({ be : true, uid : req.params['uid'], signUp : true }, function( err, user ){
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
	db.Users.findOne({ be : true, id : uid }, { _id : 0, id : 1, name : 1, uid : 1 }, function( err, user ){
		if( err ){
			throw err;
		} else if ( user ){
			db.Follows.findOne({ "to.id" : user.id }, function( err2, follow ){
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
						from : req.user,
						to : user
					});
					current.save( function( err3 ){
						if( err3 ){
							throw err3;
						} else {
							makeNotice( user, req.user, "follow", current );
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

router.post( '/api/user/change/color', checkSession, function( req, res ){
	var code = req.body['color'];
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	var hex = code.replace( shorthandRegex, function( m, r, g, b ){
		return r + r + g + g + b + b;
	});

	var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	var color = {
		hex : hex,
		r : parseInt( rgb[1], 16 ),
		g : parseInt( rgb[2], 16 ),
		b : parseInt( rgb[3], 16 )
	}
	
	if ( color.r >= 0 && color.g >= 0 & color.b >= 0 & color.length != 7 ){
		db.Users.update({ id : req.user.id },{ color : color }, function( err, reuslt ){
			if( err ){
				throw err;
			}
			req.user.color = color;
			res.send("설정이 저장되었습니다");
		});
	}
});

router.post( '/api/user/change/uid', checkSession, function( req, res ){
	var uid = req.body['uid'];
	var save = req.body['save'];
	db.Users.findOne({ uid : uid }, function( err, user ){
		if( err ){
			throw err;
		} 
		if( user ){
			if( user.uid == req.user.uid ){
				res.send("현재 내 아이디입니다.");
			} else {
				res.send("이미 사용중인 아이디입니다.");
			}
		} else {
			if( uid.length >= 8 && uid.length <= 20 ){
				var regex = /[a-zA-Z0-9_]*/;
				if( regex.test(uid) == false ){
					res.send("아이디에는 영문 대/소문자와 밑줄(_)만 사용하실 수 있습니다.");
				} else if( save == "true" ){
					db.Users.update({ id : req.user.id },{ uid : uid }, function( err, reuslt ){
						if( err ){
							throw err;
						}
						req.user.uid = uid;
						res.send("success");
					});
				} else {
					res.send("사용 가능합니다!");
				}
			} else {
				res.send("아이디의 길이는 8자 이상 20자 이하여야 합니다.");
			}

		}
	});
});

router.post( '/api/user/change/email', checkSession, function( req, res ){
	var email = req.body['email'];
	var save = req.body['save'];
	db.Users.findOne({ email : email }, function( err, user ){
		if( err ){
			throw err;
		} 
		var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
		if( user ){
			if( user.email == req.user.email ){
				res.send("현재 내 이메일입니다.");
			} else {
				res.send("이미 사용중인 이메일입니다.");
			}
		} else if ( regex.test(email) ){
			if( save == "true" ){
				var shasum = crypto.createHash('sha1');
				shasum.update(email);
				var password = shasum.digest('hex');
				var string = "http://iori.kr/api/change/email/" + email + "/" + password;
				smtpTransport.sendMail({
					from: 'iori <iori.kr>',
					to: email,
					subject : 'iori.kr 인증 메일',
					html : '<div style="width : 100%; text-align : center; font-size : 10pt; line-height : 24px;"><img src="http://iori.kr/svg/logo.svg" style="width : 100px; margin : 30px 0 30px 0;"><div style="border-top : 1px solid #4c0e25; border-bottom : 1px solid #4c0e25; padding-top : 60px; padding-bottom : 60px; margin-bottom : 20px;">안녕하세요. iori.kr입니다.<br>이메일 정보를 변경하시려면 아래의 링크를 클릭해주세요.<br><a href="' + string + '" style="display : block; margin-top : 20px; text-decoration:none;color:' + require('./settings.js').defaultColor.hex + ';font-weight:bold;">여기를 눌러 이메일 인증</a><br>인증이 완료되면 정상적으로 서비스 이용이 가능합니다.<br>감사합니다.<br>오늘도 좋은 하루되세요.<br>iori.kr 운영진 드림.<br></div>더 궁금한 사항이 있으시면 support@iori.kr로 문의 바랍니다.</div>'
				}, function(err3,response){
					if( err3 ){
						throw err3;
					} else {
						res.send(email + "으로 인증메일이 발송되었습니다.\n메일을 확인해주세요.");
					}
				});
			} else {
				res.send("사용 가능합니다! 설정 저장 후 인증메일을 확인하셔야 변경됩니다");
			}
		} else {
			res.send("유효하지않은 이메일입니다.");
		}
	});
});

router.get( '/api/user/change/email/:email/:link', checkSession, function( req, res ){
	var email = req.params.email;
	var link = req.params.link;
	if( req.user == null || req.user.email == null ){
		res.render(__dirname + '/../views/emailauth.ejs', { result : "로그인 후에 링크를 클릭해주세요." });
	}
	if( email != null, link != null ){
		db.Users.findOne({ 'id' : req.user.id }, function( err, user ){
			if( err ){
				throw err;
			} else if( user ){
				var shasum = crypto.createHash('sha1');
				shasum.update(email);
				var sha_email = shasum.digest('hex');
				if( sha_email == link ){
					db.Users.update({ 'id' : req.user.id }, { email : email } , function( error, result ){
						if( error ){
							throw error;
						} else {
							req.user.email = email;
							res.render(__dirname + '/../views/emailauth.ejs', { result : "이메일 변경이 완료되었습니다." });
						}
					});
				} else {
					res.redirect('/');
				}
			} else {
				res.redirect('/');
			}
		});
	}
});

router.post( '/api/user/change/notice', checkSession, function( req, res ){
	db.Users.findOne({ be : true, id : req.user.id }, function( err, user ){
		if( err ){
			throw err;
		}
		var query = JSON.parse(JSON.stringify(req.body).replace(/"true"/g,"true").replace(/"false"/g,"false"));
		user.update({ notice :  query }, function( err2 ){
			if( err2 ){
				throw err2;
			}
			req.user.notice = query;
			res.send("설정이 저장되었습니다.");
		});
	});
});

router.post( '/api/user/change/password', checkSession, function( req, res ){
	var oldpw = req.body['oldpw'];
	var password = req.body['newpw'];
	var score = 0;
	if( password.match(/[a-z]/) ){
		++score;
	}
	if( password.match(/[A-Z]/) ){
		++score;
	}
	if( password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/) ){
		++score;
	}
	if( password.match(/[0-9]/) ){
		++score;
	}
	if( password.length < 8 || password.length > 20 ){
		score = -1;
	}
	if( score >= 2 ){
		var shasum = crypto.createHash('sha1');
		shasum.update(password);
		password = shasum.digest('hex');
		if( oldpw != null ){
			db.Users.findOne({ be : true, id : req.user.id }, function( err, user ){
				if( err ){
					throw err;
				}
				var shasum2 = crypto.createHash('sha1');
				shasum2.update(oldpw);
				var sha_pw = shasum2.digest('hex');
				if( user.password == sha_pw ){
					user.update({ password : password }, function( err2, result ){
						if( err2 ){
							throw err2;
						}
						res.send("success");
					});
				} else {
					res.send("fail");
				}
			});
		} else {
			res.send('사용 가능합니다');
		}
	} else if( score == -1 ){
		res.send("8자 이상 20자 이하여야 합니다.");
	} else {
		res.send("대소문자, 특수문자, 숫자 등을 혼용해주세요");
	}
});

module.exports = router;
