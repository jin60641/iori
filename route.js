'use strict';

var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var db = require('./routes/dbconfig.js');
var fs = require('fs-extra');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());
var busboy = require('connect-busboy');
router.use(busboy())
var makeObj = require('./routes/makeObj.js');

router.use(require('./routes/auth.js').router);
router.use(require('./routes/notice.js').router);
router.use(require('./routes/audio.js'));
router.use(require('./routes/newsfeed.js').router);
router.use(require('./routes/user.js').router);
router.use(require('./routes/chat.js').router);
router.use(require('./routes/admin.js'));
router.use(require('./routes/search.js'));
router.use(require('./routes/game.js'));

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

function fillCss( req, res, path, color ){
	let link = path.replace('.css','.ejs');
	if( fs.existsSync( link ) ){
		var file = fs.readFileSync( link, 'utf8' );
	
		file = file.replace(/<%= color_hex %>/gi,color.hex).replace(/<%= color_r %>/gi,color.r).replace(/<%= color_g %>/gi,color.g).replace(/<%= color_b %>/gi,color.b);
		var type = "text/css";
		res.writeHead(200, { 'Content-Type' : type });
		res.end( file );
	} else {
		res.end();
	}
}

function fillSvg( req, res, path, hex ){
	var file = fs.readFileSync( path, 'utf8' );
	file = file.replace("#000000",hex);
	var type = "image/svg+xml";
	res.writeHead(200, { 'Content-Type' : type });
	res.end( file );
}

function checkAdmin( req, res, next ){
	if( req.user && req.user.signUp && req.user.level == 9 ){
		return next();
	} else {
		makeObj( req, res, "error" );
	}
}
router.get('/', function( req, res ){
	if( req.user && req.user.signUp ){
		makeObj( req, res, "timeline" );
	} else {
		makeObj( req, res, "slider" );
	}
});

router.get('/timeline', function( req, res ){
	if( req.user && req.user.signUp ){
		makeObj( req, res, "timeline" );
	} else {
		makeObj( req, res, "slider" );
	}
});

router.get('/login', function( req, res ){
	if( req.user && req.user.signUp ){
		makeObj( req, res, "timeline" );
	} else {
		req.session.returnTo = "/";
		makeObj( req, res, "login" );
	}
});

router.get('/login/:link', function( req, res ){
	var link = req.params['link'];
	if(!link){
		link = "";
	}
	console.log(link);
	if( req.user && req.user.signUp ){
		console.log(1);
		makeObj( req, res, req.params['link'].replace(/\-/g,'/') );
	} else {
		console.log(2);
		req.session.returnTo = "/" + req.params['link'].replace(/\-/g,'/');
		makeObj( req, res, "login" );
	}
});

router.get('/register', function( req, res ){
	if( req.user && req.user.signUp ){
		res.redirect('/');
	} else {
		makeObj( req, res, "register" );
	}
});
router.post('/register', require('./routes/register.js'));

router.get('/changepw/:email/:link',function( req, res){
	makeObj( req, res, "changepw" );
});


router.get( '/files/header/:uid', function( req, res ){
	var uid = req.params['uid'];
	var id = parseInt(uid);
	if( ( id >= 0 ) == false ){
		id = -1;
	}
	fs.exists( __dirname + '/files/header/' + id, function( exists ){
		if( exists ){
			res.sendFile(__dirname + '/files/header/' + id );
		} else {
			db.Users.findOne({ $or : [{ uid : uid },{ id : id }] }, function( err, user ){
				if( err ){
					throw err;
				} else if( user ){
					fs.exists( __dirname + '/files/header/' + user.id, function( exists ){
						if( exists ){
							res.sendFile(__dirname + '/files/header/' + user.id );
						} else {
							res.end();
//							res.sendFile(__dirname + '/svg/profile.svg' );
						}
					});
				} else {
					res.end();
//					res.sendFile(__dirname + '/img/profile_back.png' );
				}
			});
		}
	});
});

router.get( '/files/group/:gid', function( req, res ){
	var gid = req.params['gid'];
	fs.exists( __dirname + '/files/group/' + parseInt(gid), function( exists ){
		if( exists ){
			res.sendFile(__dirname + '/files/profile/' + parseInt(gid) );
		} else {
			res.sendFile(__dirname + '/svg/profile.svg' );
		}
	});
});

router.get( '/files/profile/:uid', function( req, res ){
	var uid = req.params['uid'];
	var id = parseInt(req.params['uid']);
	if( ( id >= 0 ) == false ){
		id = -1;
	}
	fs.exists( __dirname + '/files/profile/' + id, function( exists ){
		if( exists ){
			res.sendFile(__dirname + '/files/profile/' + id );
		} else {
			db.Users.findOne({ $or : [{ uid : uid },{ id : id }] }, function( err, user ){
				if( err ){
					throw err;
				} else if( user ){
					fs.exists( __dirname + '/files/profile/' + user.id, function( exists ){
						if( exists ){
							res.sendFile(__dirname + '/files/profile/' + user.id );
						} else {
							fillSvg( req, res, __dirname + '/svg/profile.svg', user.color.hex )
						}
					});
				} else {
					fillSvg( req, res, __dirname + '/svg/profile.svg', require('./routes/settings.js').defaultColor.hex );
				}
			});
		}
	});
});

router.get('/:dir/:filename', function( req, res ){
	var dir = req.params['dir'];
	var filename = req.params['filename'];
	var type;
	switch( dir ){
		case "js":
			type = 'text/javascript';
			break;
		case "css":
			type = 'text/css';
			break;
		case "img":
			type = 'image/png';
			break;
		case "font":
			type = "application/x-font-woff";
			break;
		case "svg":
			type = "image/svg+xml";
			break;
		case "sound":
			type = "audio/mpeg";
			break;
	}
	if( type ){
		var url = __dirname + '/' + dir + '/' + filename;
		fs.exists( url, function( exists ){	
			if( exists == true && fs.lstatSync(url).isFile() ){
				if( dir == "svg" ){
					if( req.user && req.user.signUp == 1 ){
						fillSvg(req,res,url,req.user.color.hex);
					} else {
						fillSvg(req,res,url,require('./routes/settings.js').defaultColor.hex);
					}
				} else {
					var file = fs.readFileSync( url );
					res.writeHead(200, { 'Content-Type' : type });
					res.end( file );
				}
			} else if( dir == "css" ){
				if( req.user && req.user.signUp == 1 ){
					fillCss(req,res,url,req.user.color);
				} else {
					fillCss(req,res,url,require('./routes/settings.js').defaultColor);
				}
			} else {
				defaultRoute( req, res, "error" );
			}
		});
	} else {
		defaultRoute( req, res, "error" );
	}
});

//router.get('/:dir/:page/:filename', function( req, res ){
router.get('/:dir/:link([a-zA-Z0-9]*)', function( req, res ){
	var dir = req.params['dir']
	var link = req.params['link']
	if( dir == "img" || dir == "files" ){
		var filename = req.params['filename'];
		var type = 'image/png';
		var url = __dirname + '/' + dir + '/' + link;
		fs.exists( url, function( exists ){
			if( exists ){
				var file = fs.readFileSync( url );
				res.writeHead(200, { 'Content-Type' : type });
				res.end( file );
			} else {
				defaultRoute( req, res, "error" );
			}
		});
	}
});


router.get('/:link(*)', function( req, res ){
	defaultRoute( req, res, req.params['link'] );
});

function defaultRoute( req, res, url ){
	if( url == "favicon.ico" ){
		res.end();
	} else {
		if( url == undefined || url == "" ){
			makeObj( req, res, "error" );
		} else {
			makeObj( req, res, url );
		}
	}
}



module.exports = router;
