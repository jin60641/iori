var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkSession;

router.admin('/admin/@:uid(*)', function( req, res ){
	var uid = req.params['uid'];
	db.Users.findOne({ uid : uid }, function( err, user ){
		if( err ){
			throw err;
		} else if( user ){
	});
});

router.post( '/admin/api/user/search', function( req, res){
	var query = req.body['query'];
	if( query ){
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

module.exports = router;
