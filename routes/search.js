var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var async = require('async');

router.use(require('body-parser').urlencoded());
var makeObj = require('./makeObj.js');

var checkSession = require('./auth.js').checkSession;
router.get('/search', function( req, res ){
	makeObj( req, res, "error" );
});
router.get('/search/:query/:tb', findDocs );
router.get('/search/:query', findDocs );
router.post( '/api/search', findDocs );

function findDocs( req, res ){
	var tb;
	var query;
	var docs = {};
	async.waterfall([
		function( callback ){
			if( req.method == "GET" ){
				query = req.params['query'];
				if( query != undefined && query.length >= 1 ){
					makeObj( req, res, "search" );
				} else {
					makeObj( req, res, "error" );
				}
			} else if( req.method == "POST" && req.body['query'] != undefined && req.body['query'].length >= 1 ){
				query = req.body['query'];
				if( req.body['tb'] != undefined ){
					tb = req.body['tb'];
				}
				callback( null );
			} else {
				res.send("검색어를 입력해 주십시오.");
			}
		}, function( callback ){
			if( tb == undefined || tb == "user" ){
				db.Users.find({ be : true, $or : [{ name : { $regex : query } }, { uid : { $regex : query } }], signUp : true },{ id :1 , uid : 1 }).lean().exec( function( err, result ){
					if( err ){
						throw err;
					}
					docs.users = result;
					callback( null );
				});
			} else {
				callback( null );
			}
		}, function( callback ){
			if( tb == undefined || tb == "post" ){
				db.Posts.find({ be : true, $or : [{ text : { $regex : query } }, { html : { $regex : query } }]  }).lean().exec( function( err, result ){
					if( err ){
						throw err;
					}
					docs.posts = result;
					callback( null );
				});
			}
		}
	], function( err ){
		if( err ){
			throw err;
		}
		res.send(docs);
	});
}

module.exports = router;
