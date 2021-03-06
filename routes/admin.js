'use strict';

var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var async = require('async');

var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkAdmin;


function showAdminPage( req, res ){
	var page = req.params['page'];
	if( page == undefined || page.length == 0 ){
		page = "stat";
		res.redirect('/admin/' + page);
	} else {
		var oid = parseInt(req.params['oid']);
		var schema = db[page[0].toUpperCase() + page.substr(1) + 's'];
		if( oid != undefined && schema != undefined && oid > 0 ){
			schema.findOne({ id : oid }, function( err, result ){
				if( err ){
					throw err;
				} else {
					makeObj( req, res, "admin" );
				}
			})
		} else {
			makeObj( req, res, "admin" );
		}
	}
}

router.get('/admin', checkSession, showAdminPage ); 
router.get('/admin/:page', checkSession, showAdminPage ); 
router.get('/admin/:page/:oid', checkSession, showAdminPage ); 

router.post( '/api/admin/getkeys', checkSession, function( req, res ){
	var tb = req.body["table"];
	var schema = db[tb];
	if( schema != undefined ){
		//var keys = Object.keys(db[tb].schema.tree);
		var keys = Object.keys(db[tb].schema.paths);
		res.send(keys);
	} else {
		res.send([]);
	}
});

router.post( '/api/admin/getdocs', checkSession, function( req, res ){
	var tb = req.body["table"];
	var skip = parseInt(req.body["skip"]);
	var limit = parseInt(req.body["limit"]);
	var orderby = req.body["orderby"];
	if( orderby == undefined ){
		orderby = "id";
	}
	var asc = req.body["asc"];
	var sort = {};
	sort[orderby] = (asc=="true")?1:-1;
	var query = { be : true };
	
	if( db[tb] ){
		db[tb].find(query,{_id : 0, __v : 0, password : 0 }).limit( limit ).skip( skip ).sort( sort ).exec( function( err, objs ){
			if( err ){
				throw err;
			}
			res.send( objs );	
		});
	} else {
		res.end();
	}
});

router.post( '/api/admin/removedocs', checkSession, function( req, res ){
	var tb = req.body["table"];
	var ids = req.body["id"].split(',');
	async.map(ids,function(value,cb){
		var a = parseInt(value);
		if( a >= 1 ){
			cb(null,parseInt(value));
		} else {
			res.send("error");
		}
	}, function( e, r ){
		db[tb].update( { id : { $in : ids } }, { be : false },{ multi : true }, function( err, result ){
			if( err ){
				throw err;
			} else {
				res.send(result);
			}
		});
	});
});

router.post( '/api/admin/getcnt', checkSession, function( req, res ){
	var tb = req.body["table"];
	if( db[tb] != undefined ){
		db[tb].find({be:true}).count( function( err, result ){
			if( err ){
				throw err;
			}
			res.send(result.toString());
		});
	} else {
		res.end();
	}
});

module.exports = router;
