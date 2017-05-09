'use strict';

var fs = require('fs-extra');
var db = require('./dbconfig.js');
var async = require('async');
var views = require('./views.js');

function makeObj( req, res, ejs, obj ){
    if( obj == undefined ){
        obj = new Object();
    }
	console.log(req.url);
	if( req.url.indexOf("loaded=true") != -1 ){ // loaded
		if( views[ejs] ){
			res.send(views[ejs]);
		} else {
			res.send(views["error"]);
		}
	} else {
		if( req.user ){
		    obj.session = JSON.stringify(req.user);
			async.parallel([
				function(cb){
					db.Posts.count({ "user.id" : req.user.id, be : true, share : null }, function( err, count ){
						cb(null,count);
					});	
				}, function(cb){
					db.Follows.count({ "from.id" : req.user.id }, function( err, count ){
						cb(null,count);
					});	
				}, function(cb){
					db.Follows.count({ "to.id" : req.user.id }, function( err, count ){
						cb(null,count);
					});	
				}
			], function( err, result ){
				obj.my_info = JSON.stringify({
					post : result[0],
					following : result[1],
					follower : result[2]
				});
				renderPage( req, res, ejs, obj );
			});
		} else {
		    obj.my_info = null;
			renderPage( req, res, ejs, obj );
		}
	}
}

function renderPage( req, res, ejs, obj ){
	if( views[ejs] ){
		res.render( __dirname + "/../views/index.ejs", obj );
	} else {
		res.render( __dirname + "/../views/index.ejs", obj );
	}
}


module.exports = makeObj;

