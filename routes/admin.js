var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkAdmin;


function showAdminPage( req, res ){
	var page = req.params['page'];
	if( page == undefined || page.length == 0 ){
		page = "stat";
	}
	makeObj( req, res, "admin", { page : page });
}

router.get('/admin', checkSession, showAdminPage ); 
router.get('/admin/:page', checkSession, showAdminPage ); 

router.post( '/api/newsfeed/removepost' , checkSession, function( req, res){
	var pid = req.body['pid'];
	db.Posts.findOne( { id : pid }, function( err, post ){
		if( post ){
			post.remove( function( err2, result ){
				db.Replys.remove( { pid : pid }, function( error ){
					var rimraf = require('rimraf');
					rimraf( __dirname + '/../files/post/' + pid , function(){
						res.send("게시글이 삭제되었습니다.");
					});
				});
			});
		} else {
			res.send("존재하지 않는 게시글입니다.");
		}
	});
});


module.exports = router;
