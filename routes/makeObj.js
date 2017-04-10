var fs = require('fs-extra');
var db = require('./dbconfig.js');
var async = require('async');

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
			obj.info = JSON.stringify({
				post : result[0],
				following : result[1],
				follower : result[2]
			});
			renderPage( res, ejs, obj );
		});
	} else {
	    obj.session = null;
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

