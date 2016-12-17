var db = require("./dbconfig");
var cookie = require('cookie');

var io;
function socketjs( server ){
	io = require('socket.io').listen(server);
	io.on( 'connection', socketCore );
}

function socketCore( socket ){
	var socket_ids = {};
	if( socket.request.headers.cookie != undefined ){
		global.store.get( cookie.parse( socket.request.headers.cookie )[ 'connect.sid' ].split('.')[0].substring(2) , function( err, session ){
			if( session && session.passport && session.passport.user && session.passport.user.signUp == 1 ){
				socket.user = session.passport.user;
				socket_ids[socket.user.id] = socket.id;
				console.log("socket connected (" + socket.user.name + ")");
			} else {
				console.log("socket connected (guest)");
//				socket.disconnect();
			}
		});
	} else {
		console.log("socket connected (guest)");
//		socket.disconnect();
	}

	socket.on( 'post_write', function(){
		if( socket.user && socket.user.id ){
			db.Follows.find({ to_id : socket.user.id }, function( err, followers ){
				if( err ){
					throw err;
				} else if( followers.length >= 1 ) {
					for( var i = 0; i < followers.length; ++i ){
						var socket_id = socket_ids[followers[i].from_id];
						if( socket_id != undefined ){
							io.sockets.connected[socket_id].emit( 'post_new' );
						}
					}
				}
			});
		}
	});
	
	socket.on( 'disconnect', function(){
		if( socket && socket.user && socket.user.id ){
			delete socket_ids[socket.user.id];
		}
	});
}

module.exports = socketjs;

