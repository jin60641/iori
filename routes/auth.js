'use strict';

var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');

var session = require('express-session')
var sessionstore = require('sessionstore');
global.store = sessionstore.createSessionStore();
var sessionMiddleware = {
	store: global.store,
	secret: require('./settings.js').sessionSecret,
	cookie: { path: '/', domain: 'iori.kr', expires : false }
}

var crypto = require('crypto');
var smtpTransport = require("./mailconfig").smtpTransport;
var passport = require('passport');
var makeObj = require('./makeObj.js');
var LocalStrategy = require('passport-local').Strategy;

/* 자동로그인(서버)
router.use( function( req, res, next ){
	if( req.cookies && ( req.user == undefined || ( req.user && req.user.signUp == false ) ) ){
		next();
		if( req.cookies['facebook'] == "true" ){
//			res.redirect('/');
		} else if( req.cookies['uid'] ){
		}
	} else {
		next();
	}
});
*/
router.use(session(sessionMiddleware));
router.use(passport.initialize()).use(passport.session());
passport.serializeUser(function(user, done) {
	if( user && user._json ){
		db.Users.findOne({ email : user._json.email }).lean().exec( function( err, result ){
			if( err ){
				throw err;
			} else if( result && result.signUp && result.be ){
				delete result.password;
				result.token = user.token;
				result.secret = user.secret;
				result.username = user.username;
				user = result;
				done(null, user);
			} else {
				done(null, user._json);
			}
		});
	} else {
		done(null, user); 
	}
});
passport.deserializeUser(function(obj, done) {done(null, obj);});

var TwitterStrategy = require('passport-twitter').Strategy;
passport.use( new TwitterStrategy({
    consumerKey: require('./settings.js').twitterConsumerKey,
    consumerSecret: require('./settings.js').twitterConsumerSecret,
	callbackURL: 'https://iori.kr/api/auth/twitter/callback',
	includeEmail : true
	}, function( token, secret, profile, done ){
		profile.token = token;
		profile.secret = secret;
		return done(null, profile);
	})
);

var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use( new GoogleStrategy({
	clientID: require('./settings.js').googleClientID,
	clientSecret: require('./settings.js').googleClientSecret,
	callbackURL: 'https://iori.kr/api/auth/google/callback',
	profileFields: ['id', 'emails', 'displayName']
	}, function( accessToken, refreshToken, profile, done ){
		return done(null, profile);
	})
);


var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
	clientID: require('./settings.js').facebookClientID,
	clientSecret: require('./settings.js').facebookClientSecret,
	callbackURL: "http://iori.kr/api/auth/facebook/callback",
	profileFields: ['id', 'emails', 'displayName']
}, function( accessToken, refreshToken, profile, done ){
	return done( null, profile );
}));

/*
var FacebookTokenStrategy = require('passport-facebook-token');
passport.use(new FacebookTokenStrategy({
	clientID: '',
	clientSecret: '',
	profileFields: ['id', 'emails', 'displayName']
}, function(accessToken, refreshToken, profile, done) {
	return done(null, profile);
}));
*/

passport.use(new LocalStrategy({ usernameField : 'uid', passwordField : 'password' }, function( uid, password, next ){
	db.Users.findOne({ $or : [{ email : uid }, { uid : uid }] }).lean().exec( function( err, user ){
		if( err ){
			return next(err);
		} else if(!user){
			return next(null,false,{message:"아이디 또는 비밀번호가 잘못되었습니다."});
		} else {
			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			var sha_pw = shasum.digest('hex');
			if( user.password == sha_pw ){
				if( user && user.signUp == false ){
					return next(null,false,{message:'이메일 인증을 진행하셔야 정상적인 이용이 가능합니다.'});
				} else if( user.be == false ){
					return next(null,false,{message:'아이디 또는 비밀번호가 잘못되었습니다.'});
				} else if( user ){
					delete user.password;
					return next(null,user);
				}
			} else {
				return next(null,false,{message:'이메일 또는 비밀번호가 잘못되었습니다.'});
			}
		}
	});
}));

router.get( '/api/auth/findpw/:email/:link', function( req, res ){
	var email = req.params.email;
	var link = req.params.link;
	db.Users.findOne({ 'email' : email }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
			var shasum = crypto.createHash('sha1');
			shasum.update(user.email);
			var sha_email = shasum.digest('hex');
			if( sha_email == link ){
				res.redirect('/changepw/'+email+'/'+link);
			} else {
				res.redirect('/');
			}
		} else {
			res.end();
		}
	});
});

router.get( '/api/auth/mail/:email/:link', function( req, res ){
	var email = req.params.email;
	var link = req.params.link;
	if( email != null, link != null ){
		db.Users.findOne({ 'email' : email }, function( err, user ){
			if( err ){
				throw err;
			} else if( user ){
				var shasum = crypto.createHash('sha1');
				shasum.update(user.email);
				var sha_email = shasum.digest('hex');
				if( sha_email == link ){
					if( !user.signUp ){
						db.Users.update({ 'email' : email } , { 'signUp' : true } , function( error, result ){
							if( error ){
								throw error;
							} else {
								res.render(__dirname + '/../views/emailauth.ejs', { result : "회원가입이 완료되었습니다." });
							}
						});
					} else {
						res.render(__dirname + '/../views/emailauth.ejs', { result : "회원가입이 완료되었습니다." });
					}
				} else {
					res.redirect('/');
				}
			} else {
				res.redirect('/');
			}
		});
	}
});

router.post('/api/auth/findpw', function( req, res ){
    var email = req.body['email'].trim();
    db.Users.findOne({ email : email }, function( err, user ){
        if( user ) {
            var shasum = crypto.createHash('sha1');
            shasum.update(email);
            var sha_email = shasum.digest('hex');
            var string = "http://iori.kr/api/auth/findpw/" + email + "/" + sha_email;
            smtpTransport.sendMail({
                from: 'iori <iori.kr>',
                to: email,
                subject : '[iori.kr] 비밀번호 재설정 안내',
                'html' : '<div style="width : 100%; text-align : center; font-size : 10pt; line-height : 24px;"><img src="http://iori.kr/svg/logo.svg" style="width : 100px; margin : 30px 0 30px 0;"><div style="border-top : 1px solid #4c0e25; border-bottom : 1px solid #4c0e25; padding-top : 60px; padding-bottom : 60px; margin-bottom : 20px;">안녕하세요. ' + user.name + '님.<br><br>iori.kr의 로그인 아이디의 비밀번호 재설정을 요청하셨기에 이메일로 안내해 드립니다.<br>아래 링크를 클릭하시면 비밀번호를 재설정 하실 수 있습니다.<br><a href="' + string + '" style="display : block; margin-top : 20px; text-decoration:none;color:' + require('./settings.js').defaultColor.hex + ';font-weight:bold;">여기를 눌러 비밀번호 재설정</a><br>만약 비밀번호 재설정 요청을 하지 않으셨다면 위의 링크를 클릭하지 마시고<br>본 이메일을 무시하셔도 좋습니다.<br><br>감사합니다.<br>오늘도 좋은 하루되세요<br><br>운영진 드림.<br></div></div>'
            }, function( error, response ){
                if( error ){
                    throw error;
                } else {
                    res.send("이메일로 비밀번호를 다시 설정하는 방법을 보내드렸습니다.");
                }
            });
        } else {
            res.send("입력하신 메일을 찾을 수 없습니다.");
        }
    });
});


router.post('/api/auth/local', function( req, res, next ){
	passport.authenticate('local', function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.send({ msg : info.message });
		} else {
			req.logIn( user, function( error ){
				if( error ){
					return next( error );
				} else {
					return res.send({ session : user });
				}
			});
		}
	})( req, res, next );
});

/*
router.get('/api/auth/token', passport.authenticate('facebook-token', { scope : ['email'] }), function( req, res ){
	res.send(req.user?req.user:401);
});
*/

router.get('/api/auth/twitter', passport.authenticate('twitter') );

router.get('/api/auth/twitter/callback', function( req, res, next ){
	passport.authenticate('twitter' , function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.redirect('/');
		} else if ( req.user != undefined && req.user.signUp == true ){
			return res.redirect('/');
		} else {
			user._json = {
				email : user.emails[0].value,
				displayName : user.displayName,
				token : user.token,
				secret : user.secret,
				username : user.username
			}
			db.Users.findOne({ email : user._json.email, signUp : true, be : true }, function( err, account ){
				if( err ){
					throw err;
				} else {
					req.logIn( user, function( error ){
						if( error ){
							return next(error);
						} else {
							if( account ){
								req.user = account;
								res.cookie("twitter","true",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
								if( req.session.returnTo && req.session.returnTo != "/"){
									if( req.session.returnTo[0] == '/' ){
										return res.redirect(req.session.returnTo);
									} else {
										return res.redirect('/' + req.session.returnTo.replace(/\-/g,"/") );
									}
								} else {
									return res.redirect('/');
								}
							} else {
								req.user = user._json;
								req.user.signUp = false;
								if( req.session.returnTo[0] == '/' ){
									return res.redirect(req.session.returnTo);
								} else {
									return res.redirect('/' + req.session.returnTo.replace(/\-/g,"/") );
								}
								//return res.redirect('/register');
							}
						}
					});
				}
			});
		}
	})( req, res, next );
});

router.get('/api/auth/twitter/:link', function( req, res ){
	req.session.returnTo = req.params['link'];
	res.redirect('/api/auth/twitter');
});


router.get('/api/auth/google', passport.authenticate('google', { scope: ['email'] }));
router.get('/api/auth/google/callback', function( req, res, next ){
	passport.authenticate('google' , function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.redirect('/');
		} else if ( req.user != undefined && req.user.signUp == true ){
			return res.redirect('/');
		} else {
			user._json = {}
			user._json["email"] = user.emails[0].value,
			user._json["displayName"] = user.displayName
			db.Users.findOne({ email : user._json.email, signUp : true, be : true }, function( err, account ){
				if( err ){
					throw err;
				} else {
					req.logIn( user, function( error ){
						if( error ){
							return next(error);
						} else {
							if( account ){
								req.user = account;
								res.cookie("google","true",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
								if( req.session.returnTo && req.session.returnTo != "/"){
									if( req.session.returnTo[0] == '/' ){
										return res.redirect(req.session.returnTo);
									} else {
										return res.redirect('/' + req.session.returnTo.replace(/\-/g,"/") );
									}
								} else {
									return res.redirect('/');
								}
							} else {
								req.user = user._json;
								req.user.signUp = false;
								return res.redirect('/register');
							}
						}
					});
				}
			});
		}
	})( req, res, next );
});

router.get('/api/auth/google/:link', function( req, res ){
	req.session.returnTo = req.params['link'];
	res.redirect('/api/auth/google');
});

router.get('/api/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
router.get('/api/auth/facebook/callback', function( req, res, next ){
	passport.authenticate('facebook' , function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.redirect('/');
		} else if ( req.user != undefined && req.user.signUp == true ){
			return res.redirect('/');
		} else {
			db.Users.findOne({ email : user._json.email, signUp : true, be : true }, function( err, account ){
				if( err ){
					throw err;
				} else {
					req.logIn( user, function( error ){
						if( error ){
							return next(error);
						} else {
							if( account ){
								req.user = account;
								res.cookie("facebook","true",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
								if( req.session.returnTo && req.session.returnTo != "/"){
									if( req.session.returnTo[0] == '/' ){
										return res.redirect(req.session.returnTo);
									} else {
										return res.redirect('/' + req.session.returnTo.replace(/\-/g,"/") );
									}
								} else {
									return res.redirect('/');
								}
							} else {
								req.user = user._json;
								req.user.signUp = false;
								return res.redirect('/register');
							}
						}
					});
				}
			});
		}
	})( req, res, next );
});

router.get('/api/auth/facebook/:link', function( req, res ){
	req.session.returnTo = req.params['link'];
	res.redirect('/api/auth/facebook');
});

function logOut( req, res, message ){
	res.clearCookie("email");
	res.clearCookie("password");
	res.clearCookie("uid");
	res.clearCookie("facebook");
	res.clearCookie("twitter");
	res.clearCookie("google");
	res.cookie("facebook","false",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
	res.cookie("twitter","false",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
	res.cookie("google","false",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
	req.logout();
	req.session.destroy( function( err ){
		if( req.user ){
			delete req.user;
		}
		if( req.method == "GET" ){
			res.redirect('/');
		} else {
			res.send( message );
		}
	});
}
router.get('/api/auth/logout', logOut );

router.post('/api/auth/changepw', function( req, res ){
	var password = req.body['password'];
	if( password && password.length > 0 ){
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
		if( score >= 2 && password.length >= 8 && password.length <= 20 ){
			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			var sha_pw = shasum.digest('hex');
			if( req.user && req.user.signUp ){
				db.Users.update({ id : req.user.id }, { password : sha_pw }, function( err, result ){
					if( err ){
						throw err;
					} else if( result ){
						req.logout();
						res.send("success");
					} else {
						res.end();
					}
				});
			} else {
				var link = req.body['link'];
				var email = req.body['email'];
				var shasum2 = crypto.createHash('sha1');
				shasum2.update(email);
				var sha_email = shasum2.digest('hex');
				if( link == sha_email ){
					db.Users.update({ email : email }, { password : sha_pw }, function( err, result ){
						if( err ){
							throw err;
						} else if( result ){
							req.logout();
							res.send("success");
						} else {
							res.end();
						}
					});
				} else {
					res.end();
				}
			}
		} else {
			res.send('유효하지 않은 비밀번호입니다.');
		}
	} else {
		res.end("");
	}
});

function checkSession( req, res, next ){
	if( req.user && req.user.signUp ){
		return next();
	} else {
		makeObj( req, res, "login" );
	}
}

function checkAdmin( req, res, next ){
	if( req.user && req.user.signUp ){
		db.Users.findOne({ id : req.user.id }, function( err, result ){
			if( result.admin == true ){
				return next();
			} else {
				makeObj(req,res,"404");
			}
		});
	} else {
		makeObj(req,res,"404");
	}
}

module.exports = {
	router : router,
	checkSession : checkSession,
	checkAdmin : checkAdmin,
	logOut : logOut
}
