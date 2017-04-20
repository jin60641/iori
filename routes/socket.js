'use strict';

var db = require("./dbconfig");
var cookie = require('cookie');

var io;
function socketjs( server ){
	io = require('socket.io').listen(server);
	global.io = io;
	io.on( 'connection', socketCore );
}

var socket_ids = {};
global.socket_ids = socket_ids;

function socketCore( socket ){
	if( socket.request.headers.cookie != undefined ){
		global.store.get( cookie.parse( socket.request.headers.cookie )[ 'connect.sid' ].split('.')[0].substring(2) , function( err, session ){
			if( session && session.passport && session.passport.user && session.passport.user.signUp ){
				socket.user = session.passport.user;
				socket_ids[socket.user.id] = socket.id;
				updateLast( socket.user.uid );
				console.log("socket connected (" + socket.user.name + ")" );
			} else {
				console.log("socket connected (guest)");
//				socket.disconnect();
			}
		});
	} else {
		console.log("socket connected (guest)");
//		socket.disconnect();
	}

	socket.on( 'disconnect', function(){
		if( socket && socket.user && socket.user.id ){
			updateLast( socket.user.uid );
			delete socket_ids[socket.user.id];
		}
	});


}

function updateLast( uid ){
	db.Follows.find({ "to.uid" : uid }, function( err, followers ){
		if( err ){
			throw err;
		} else if( followers.length >= 1 ) {
			for( var i = 0; i < followers.length; ++i ){
				var socket_id = socket_ids[followers[i].from.id];
				if( socket_id != undefined ){
					io.sockets.connected[socket_id].emit( 'update_last', uid );
				}
			}
		}
	});
	db.Users.update({ uid : uid }, { last : new Date() }, function( err ){
		if( err ){
			throw err;
		}
	});
};

module.exports = socketjs;

