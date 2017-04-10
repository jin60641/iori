var fs = require('fs-extra');
var db = require('./dbconfig.js');
var async = require('async');
var color = require('./settings.js').defaultColor;

function makeObj( req, res, ejs, obj ){
    if( obj == undefined ){
        obj = new Object();
    }
	if( req.user ){
	    obj.session = JSON.stringify(req.user);
		async.parallel([
			function(cb){
				db.Posts.count({ "user.id" : req.user.id }, function( err, count ){
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
			if( req.user.signUp ){
				obj.color_hex = req.user.color.hex;
				obj.color_r = req.user.color.r;
				obj.color_g = req.user.color.g;
				obj.color_b = req.user.color.b;
			} else {
				obj.color_hex = color.hex;
				obj.color_r = color.r;
				obj.color_g = color.g;
				obj.color_b = color.b;
			}
			obj.info = JSON.stringify({
				post : result[0],
				following : result[1],
				follower : result[2]
			});
			renderPage( res, ejs, obj );
		});
	} else {
	    obj.session = JSON.stringify({ "color" : color });
		obj.color_hex = color.hex;
		obj.color_r = color.r;
		obj.color_g = color.g;
		obj.color_b = color.b;
	    obj.info = null;
		renderPage( res, ejs, obj );
	}

}

function renderPage( res, ejs, obj ){
	var url = __dirname + "/../views/" + ejs + ".ejs";
	fs.exists( url, function( exists ){
		if( exists ){
	    	res.render( url, obj );
		} else {
			res.render( __dirname + "/../views/error.ejs", obj );
		}
	});
}



module.exports = makeObj;

