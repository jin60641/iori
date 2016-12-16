var db = require("./dbconfig");
var async = require('async');
function userUpdate( req, res ){
	var shoes = parseInt(req.body['shoes']);
	var etc = req.body['etc'];
	var address = req.body['address'];
	var zonecode = req.body['zonecode'];
	if( isNaN(shoes) ){
		res.end();
	} else {
		var current = {
			shoes : shoes,
			etc : etc,
			address : address,
			zonecode : zonecode
		};
		db.Users.update({ id : req.user.id }, current, function( err, result ){
			if( err ){
				throw err;
			} else {
				req.user.shoes = current.shoes;
				req.user.etc = current.etc;
				req.user.address = current.address;
				req.user.zonecode = current.zonecode
				res.send(current);
			}
		});
	}
}

module.exports = userUpdate;
