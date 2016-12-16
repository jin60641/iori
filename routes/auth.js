var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var cookieParser = require('cookie-parser')
var cookie = require('cookie')
router.use(cookieParser())
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var session = require('express-session')
var sessionstore = require('sessionstore');
global.store = sessionstore.createSessionStore();
var sessionMiddleware = {
	store: global.store,
	secret: require('./settings.js').sessionSecret,
	cookie: { path: '/', domain: 'iori.kr', expires : false }
}
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.use(session(sessionMiddleware));
router.use(passport.initialize()).use(passport.session());
passport.serializeUser(function(user, done) {
	if( user && user._json ){
		db.Users.findOne({ email : user._json.email }, { _id : 0, __v : 0, date : 0, email : 0, password : 0 }, function( err, result ){
			if( err ){
				throw err;
			} else if( result && result.signUp ){
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

var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
	clientID: require('./settings.js').facebookClientID,
	clientSecret: require('./settings.js').facebookClientSecret,
	callbackURL: "http://iori.kr/api/auth/facebook/callback",
	profileFields: ['id', 'emails', 'displayName']
}, function(accessToken, refreshToken, profile, done) {
	return done(null, profile);
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

passport.use(new LocalStrategy({ usernameField : 'userid', passwordField : 'password' }, function( userid, password, next ){
	db.Users.findOne({ $or : [{ email : userid }, { user_id : userid }] }, function( err, user ){
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
				} else if( user ){
					var tmp = {
						id : user.id,
						name : user.name,
						user_id : user.user_id,
						signUp : user.signUp
					}
					return next(null,tmp);
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


router.post('/api/auth/local', function( req, res, next ){
	passport.authenticate('local', function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.send(info.message);
		} else {
			req.logIn( user, function( error ){
				if( error ){
					return next( error );
				} else {
					return res.send("success");
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

router.get('/api/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
router.get('/api/auth/facebook/callback', function( req, res, next ){
	passport.authenticate('facebook' , function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.redirect('/');
		} else if ( req.user && req.user.signUp == 1 ){
			return res.redirect('/');
		} else {
			db.Users.findOne({ email : user._json.email, signUp : true }, function( err, account ){
				if( err ){
					throw err;
				} else {
					req.logIn( user, function( error ){
						if( error ){
							return next(error);
						} else {
							if( account ){
								res.cookie("facebook","true",{ maxAge : 900000, expire : new Date(Date.now() + 900000), domain : "iori.kr", path : "/" });
								if( req.session.returnTo && req.session.returnTo != "/"){
									return res.redirect('/' + req.session.returnTo.replace(/\-/g,"/") );
								} else {
									return res.redirect('/');
								}
							} else {
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

router.get('/api/auth/logout', function( req, res){
	res.clearCookie("email")
	res.clearCookie("password")
	res.clearCookie("userid")
	res.clearCookie("facebook")
    req.logout();
	req.session.destroy( function( err ){
		if( req.user ){
			delete req.user;
		}
	    res.redirect('/');
	});
});

router.post('/changepw', function( req, res ){
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

module.exports = router;
