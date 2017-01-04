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
				db.Users.update({ id : socket.user.id },{ last : new Date() }, function( err, result ){
					if( err ){
						throw err;
					} else {
						console.log("socket connected (" + socket.user.name + ")" );
					}
				});
			} else {
				console.log("socket connected (guest)");
//				socket.disconnect();
			}
		});
	} else {
		console.log("socket connected (guest)");
//		socket.disconnect();
	}

	socket.on( 'reply_write', function( reply_id ){
		if( socket.user && socket.user.id ){
			db.Replys.findOne({ id : reply_id, uid : socket.user.id }, function( err, reply ){
				if( err ){
					throw err;
				} else if( reply ){
					var data = {
						from : {
							id : socket.user.id,
							name : socket.user.name,
							uid : socket.user.uid,
						},
						text : reply.text,
						post_id : reply.post_id
					}
					db.Posts.findOne({ id : reply.post_id }, function( err, post ){
						if( err ){
							throw err;
						} else if( post ){ 
							if( post.uid != socket.user.id ){
								io.sockets.connected[socket_ids[post.uid]].emit( 'notice_reply_new', data );
								io.sockets.connected[socket_ids[post.uid]].emit( 'reply_new', data );
							}
							db.Follows.find({ to_id : post.uid }, function( err, followers ){
								if( err ){
									throw err;
								} else if( followers.length >= 1 ) {
									for( var i = 0; i < followers.length; ++i ){
										var socket_id = socket_ids[followers[i].from_id];
										if( socket_id != undefined && socket_id != socket.id ){
											io.sockets.connected[socket_id].emit( 'reply_new', data );
										}
									}
								}
							});
						}
					});
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

