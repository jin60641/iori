var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var async = require('async');

router.use(require('body-parser').urlencoded());
var makeObj = require('./makeObj.js');

var checkSession = require('./auth.js').checkSession;
router.get('/search', findDocs );
router.get('/search/:query', findDocs );
router.post( '/api/search', findDocs );

function findDocs( req, res ){
	var query;
	var docs = {};
	async.waterfall([
		function( callback ){
			if( req.method == "GET" && req.params['query'] != undefined && req.params['query'].length >= 1 ){
				query = req.params['query'];
				callback( null );
			} else if( req.method == "POST" && req.body['query'] != undefined && req.body['query'].length >= 1 ){
				query = req.body['query'];
				callback( null );
			} else {
				if( req.method == "GET" ){
					makeObj( req, res, "search", { "docs" : "" });
				} else {
					res.send("검색어를 입력해 주십시오.");
				}
			}
		}, function( callback ){
			db.Users.find({ be : true, $or : [{ name : { $regex : query } }, { uid : { $regex : query } }], signUp : true },{ id :1 , uid : 1 }).lean().exec( function( err, result ){
				if( err ){
					throw err;
				}
				docs.users = result;
				callback( null );
			});
		}, function( callback ){
			db.Posts.find({ be : true, $or : [{ text : { $regex : query } }, { html : { $regex : query } }]  }).lean().exec( function( err, result ){
				if( err ){
					throw err;
				}
				docs.posts = result;
				callback( null );
			});
		}
	], function( err ){
		if( err ){
			throw err;
		}
		if( req.method == "GET" ){
			makeObj( req, res, "search", { "docs" : docs });
		} else {
			res.send(docs);
		}
	});
}

module.exports = router;
