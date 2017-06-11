'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');

var db = require('./dbconfig.js');
var fs = require('fs-extra');

var makeObj = require('./makeObj.js');

var ffmpeg = require('fluent-ffmpeg');
var mediaserver = require('mediaserver');
var Twit = require('twit');
var consumerKey = require('./settings.js').twitterConsumerKey;
var consumerSecret = require('./settings.js').twitterConsumerSecret;

function checkToken(req,res,next){
	if( req.user && req.user.token && req.user.secret ){
		return next();
	} else {
		makeObj( req, res, "login" );
	}
}

router.get('/test', checkToken, function(req, res){
	var T = new Twit({
		consumer_key : consumerKey,
		consumer_secret : consumerSecret,
		access_token : req.user.token,
		access_token_secret : req.user.secret,
		timeout_ms : 60*1000
	});
	/*
	T.post('statuses/update', { status: '.' }, function(err, data, response) {
		if( err ){
			throw err;
		}
		console.log(data)
		res.send("successs");
	});
	*/
	T.get('search/tweets', { q: '-filter:retweets filter:images from:' + req.user.username, count: 10 }, function(err, data, response) {
		res.send(data);
	})
});

module.exports = router;

