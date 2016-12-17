var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var db = require('./routes/dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./routes/makeObj.js');

router.use(require('./routes/auth.js'));
router.use(require('./routes/newsfeed.js'));
router.use(require('./routes/user.js'));

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

function checkAdmin( req, res, next ){
	if( req.user && req.user.signUp && req.user.level == 9 ){
		return next();
	} else {
		res.redirect('/');
	}
}

function checkSession( req, res, next ){
	if( req.user && req.user.signUp ){
		return next();
	} else {
		res.redirect('/login/' + req.url.substr(1).replace(/\//g,'-'));
	}
}

router.get('/', function( req, res ){
	makeObj( req, res, "index" );
});

router.get('/login', function( req, res ){
	if( req.user && req.user.signUp ){
		res.redirect('/');
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
	if( req.user && req.user.signUp ){
		res.redirect('/');
	} else {
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

router.get('/findpw', function( req, res ){
	if( req.user && req.user.signUp ){
		res.redirect('/');
	} else {
		makeObj( req, res, "findpw" );
	}
});

router.get( '/profile_header/:userid', function( req, res ){
    var userid = parseInt(req.params['userid']);
    fs.exists( __dirname + '/files/headerimg/' + userid, function( exists ){
        if( exists ){
            res.sendfile(__dirname + '/files/headerimg/' + userid );
        } else {
            res.sendfile(__dirname + '/img/profile_back.png' );
        }
    });
});
router.get( '/profileimg/:userid', function( req, res ){
    var userid = parseInt(req.params['userid']);
    fs.exists( __dirname + '/files/profileimg/' + userid, function( exists ){
        if( exists ){
            res.sendfile(__dirname + '/files/profileimg/' + userid );
        } else {
            res.sendfile(__dirname + '/img/profile.jpg' );
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
	}
	if( type ){
		var url = __dirname + '/' + dir + '/' + filename;
		fs.exists( url, function( exists ){	
			if( exists == true && fs.lstatSync(url).isFile() ){
				var file = fs.readFileSync( url );
				res.writeHead(200, { 'Content-Type' : type });
				res.end( file );
			} else {
				res.end();
			}
		});
	} else {
		res.end();
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
				res.end();
			}
		});
	}
});

router.get('/:link(*)', function( req, res ){
	if( req.params['link'] == "favicon.ico" ){
		res.end();
	} else {
		makeObj( req, res, req.params['link'] );
	}
});


module.exports = router;
