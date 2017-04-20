'use strict';

var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var async = require('async');

router.use(require('body-parser').urlencoded());
var makeObj = require('./makeObj.js');
var getPosts = require('./newsfeed.js').getPosts;
var getUsers = require('./user.js').getUsers;

var checkSession = require('./auth.js').checkSession;
router.get('/search', function( req, res ){
	makeObj( req, res, "error" );
});
router.get('/search/:query/:tb', findDocs );
router.post( '/api/search', findDocs );

function findDocs( req, res ){
	var tb;
	var query;
	var docs = {};
	async.waterfall([
		function( callback ){
			if( req.method == "GET" ){
				query = req.params['query'];
				tb = req.params['tb'];
				if( query != undefined && query.length >= 1 && ( tb == "user" || tb == "post" ) ){
					makeObj( req, res, "search" );
				} else {
					makeObj( req, res, "error" );
				}
			} else if( req.method == "POST" && req.body['query'] != undefined && req.body['query'].length >= 1 ){
				query = req.body['query'];
				tb = req.body['tb'];
				if( query != undefined && query.length >= 1 && ( tb == "user" || tb == "post" ) ){
					callback( null );
				} else {
					res.send("");
				}
			} else {
				res.send("검색어를 입력해 주십시오.");
			}
		}, function( callback ){
			if( tb == "user" ){
				getUsers( req, function( result ){
					docs = result;
					callback( null );
				});
			} else {
				callback( null );
			}
		}, function( callback ){
			if( tb == "post" ){
				getPosts( req, function( result ){
					docs = result;
					callback( null );
				});
			} else {
				callback( null );
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
