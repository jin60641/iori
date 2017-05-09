'use strict';

var fs = require('fs-extra');
var db = require('./dbconfig.js');
var async = require('async');

function makeObj( req, res, ejs, obj ){
    if( obj == undefined ){
        obj = new Object();
    }
	var color;
	if( obj.user != undefined ){
		color = obj.user.color;
	} else if( req.user && req.user.signUp ){
		color = req.user.color;
	}
	if( color == undefined ){	
		color = require('./settings.js').defaultColor;
	}
	obj.color_hex = color.hex;
	obj.color_r = color.r;
	obj.color_g = color.g;
	obj.color_b = color.b;
	if( req.user ){
	    obj.session = req.user;
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
			obj.my_info = {
				post : result[0],
				following : result[1],
				follower : result[2]
			};
			renderPage( req, res, ejs, obj );
		});
	} else {
	    obj.session = { "color" : color };
	    obj.my_info = null;
		renderPage( req, res, ejs, obj );
	}
}

function renderPage( req, res, ejs, obj ){
	var obj_keys = Object.keys(obj);
	for( var i = 0; i < obj_keys.length; ++i ){
		(function(j){
			process.nextTick(function(){
				if( typeof obj[obj_keys[j]] == "object" ){
					obj[obj_keys[j]] = JSON.stringify(obj[obj_keys[j]]);
				}
			});
		})(i);
	}
	var url = __dirname + "/../views/" + ejs + ".ejs";
	fs.exists( url, function( exists ){
		if( exists ){
			if( false ){ // loaded
			} else {
				res.cookie("loaded","true");
				obj.view = ejs;
				res.render( __dirname + "/../views/index.ejs", obj );
			}
		} else {
			obj.view = "error";
			res.render( __dirname + "/../views/index.ejs", obj );
		}
	});
}


module.exports = makeObj;

