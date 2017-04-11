var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy())
var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;

var checkSession = require('./auth.js').checkAdmin;


function showAdminPage( req, res ){
	var page = req.params['page'];
	if( page == undefined || page.length == 0 ){
		page = "stat";
	}
	var obj = { page : page };
	var oid = parseInt(req.params['oid']);
	var schema = db[page[0].toUpperCase() + page.substr(1) + 's'];
	if( oid != undefined && schema != undefined && oid > 0 ){
		schema.findOne({ id : oid }, function( err, result ){
			if( err ){
				throw err;
			} else {
				obj.doc = result;
				makeObj( req, res, "admin", obj );
			}
		})
	} else {
		makeObj( req, res, "admin", obj );
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
	var sort = {}
	sort[orderby] = (req.body["asc"]=="true")?1:-1;
	db[tb].find({},{_id : 0, __v : 0, password : 0 }).limit( limit ).skip( skip ).sort( sort ).exec( function( err, objs ){
		if( err ){
			throw err;
		}
		res.send( objs );	
	});
});


module.exports = router;
