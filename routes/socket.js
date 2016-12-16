var db = require("./dbconfig");
var cookie = require('cookie');

var io;
function socketjs( server ){
	io = require('socket.io').listen(server);
	io.on( 'connection', socketCore );
}

function socketCore( socket ){
	global.store.get( cookie.parse( socket.request.headers.cookie )[ 'connect.sid' ].split('.')[0].substring(2) , function( err, session ){
		if( session && session.passport && session.passport.user && session.passport.user.signUp == 1 ){
			socket.user = session.passport.user;
			console.log("socket connected (" + socket.user.name + ")");
		} else {
			console.log("socket connected (guest)");
//			socket.disconnect();
		}
	});

	socket.on( 'post_write', function(){
		if( socket.user && socket.user.id ){
			db.Follows.find({ to_id : socket.user.id }, function( err, followers ){
				if( err ){
					throw err;
				} else if( followers.length >= 1 ) {
					var sockets = Object.keys(io.sockets.sockets);
					for( var i = 0; i < followers.length; ++i ){
						for( var j = 0; j < sockets.length; ++j ){
							var to = io.sockets.sockets[sockets[j]];
							if( to && to.user && to.user.id ){
								if( followers[i].from_id == to.user.id ){
									to.emit( 'post_new' );
								}
							}
						}
					}
				}
			});
		}
	});
}



module.exports = socketjs;

