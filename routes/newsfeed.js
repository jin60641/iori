var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var async = require("async");
var request = require("request");
var socketjs = require("./socket.js");
var io = global.io;
var socket_ids = global.socket_ids;

router.use(require('body-parser').urlencoded());
router.use(busboy())

function checkSession( req, res, next ){
	if( req.user && req.user.signUp ){
		return next();
	} else {
		res.redirect('/login/' + req.url.substr(1).replace(/\//g,'-'));
	}
}

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

String.prototype.xssFilter = function() {
	return this.replace( /</g , "&lt" ).replace( />/g , "&gt" );
}


router.post( '/api/newsfeed/dontsee', checkSession, function( req, res ){
	var type = req.body['type'];
	var obj_id = parseInt(req.body['obj_id']);
	if( type == "post" || type == "reply" || obj_id != "NaN" ){
		db.Dontsees.remove({ type : type, obj_id : obj_id, uid : req.user.id }, function( err, dontsee ){
			if( dontsee == 1 ){
				res.end();
			} else {
				var current = new db.Dontsees({
					type : type,
					uid : req.user.id,
					obj_id : obj_id
				});
				current.save( function( err ){
					if( err ){
						throw err;
					}
					res.end();
				});
			}
		});
	} else {
		res.end();
	}
});

router.post( '/api/newsfeed/favorite', checkSession, function( req, res){
	var postid = parseInt(req.body['postid']);
	if( postid ){
		db.Favorites.findOne({ pid : postid, uid : req.user.id }, function( err, result ){
			if( result ){
				result.remove( function(){
					res.end();
				})
			} else {
				var current = new db.Favorites({
					uid : req.user.id,
					pid : postid
				});
				current.save( function( err ){
					if( err ){
						throw err;
					}
					res.end();
				});
			}
		});
	} else {
		res.end();
	}
});


router.post( '/api/newsfeed/getposts', function( req, res ){
	if( req.user && req.user.id ){
	} else {
		req.user = { id : 0 };
	}
	var dontsee_posts = [];
	var dontsee_replys = [];
	var results = [];
	var skip = parseInt(req.body['skip']);
	var limit = parseInt(req.body['limit']);
	var uid = parseInt(req.body['uid']);
	var tos = new Array();
	async.waterfall([
		function( callback ){
			db.Dontsees.find({ uid : req.user.id }, function( err, dontsees ){
				if( err ){
					throw err;
				} else if( dontsees && dontsees.length ){
					for( var i = dontsees.length - 1 ; i >= 0 ; --i ){
						if( dontsees[i].type == "post" ){
							dontsee_posts.push( dontsees[i].obj_id );
						} else if( dontsees[i].type == "reply" ){
							dontsee_replys.push( dontsees[i].obj_id );
						}
						if( !i ){
							callback( null );
						}
					}
				} else {
					callback( null );
				}
			});
		}, function( callback ){
			db.Follows.find({ "from.id" : req.user.id }, function( err, follows ){
				if( err ){
					throw err;
				} else if( follows && follows.length ){
					for( var i = follows.length - 1 ; i >= 0 ; --i ){
						tos.push( follows[i].to.id );
						if( !i ){
							callback( null );
						}
					}
				} else {
					callback( null );
				}
			});	
		}, function( callback ){
			if( uid ){
				tos.push( uid );
			} else {
				tos.push( req.user.id );
			}
			db.Posts.find({ id : { $nin : dontsee_posts }, "user.id" : { $in : tos } } ).sort({ id : -1 }).limit( limit ).skip( skip ).exec( function( err, posts ){
				if( err ){
					throw err;
				} else if( posts.length <= 0 ){
					res.send("[]")
				} else {
					callback( null, posts );
				}
			});
		}
	],function( err, posts ){
		if( err ){
			throw err;
		}
		async.forEach( posts , function( post, key, callback ){
			db.Replys.find({ id : { $nin : dontsee_replys }, pid : post.id }).sort({ id : -1 }).exec( function( err, reply ){
				var replys;
				if( reply.length > 4 ){
					replys = reply.slice(0,4)
					replys.push("더있어요");
				} else {
					replys = reply;
				}
				db.Favorites.findOne({ pid : post.id, uid : req.user.id }, function( err, favorite ){
					var isfavorite = false;
					if( favorite ){
						isfavorite = true;
					}
					var result = {
						id : post.id,
						user : post.user,
						text : post.text,
						html : post.html,
						file : post.file,
						date : post.date,
						reply : replys,
						isfavorite : isfavorite
					};
					results.push( result );
					if( results.length == posts.length ){
						res.send({ post : results });
					}
				});
			});
		});
	});
});

router.post( '/api/newsfeed/getreplys' , checkSession, function( req, res ){
	var postid = parseInt(req.body['postid']);
	var skip = parseInt(req.body['skip']);
	var limit = parseInt(req.body['limit']);
	db.Replys.find({ pid : postid }).skip( skip ).sort({ id : -1 }).exec( function( err, reply ){
		if( reply && reply.length == 0 ){
			res.end();
		} else if( limit > 4 && reply.length > 4 ){
			replys = reply.slice(0,4)
			replys.push("더있어요");
			res.send( replys )
		} else if( reply.length >= 1 ) {
			replys = reply.slice(0,limit);
			res.send( replys )
		} else {
			res.end();
		}
	});
});

router.post( '/api/newsfeed/removereply' , checkSession, function( req, res){
	var reply_id = req.body['reply_id'];
	db.Replys.findOne( { id : reply_id }, function( err, reply ){
		if( reply ){
			if( req.user.id == reply.uid ){
				var pid = reply.pid
				var uploadedFile = __dirname + '/files/post/' + pid + '/reply/' + reply_id;
				reply.remove( function(){
					fs.exists( uploadedFile , function( exists ){
						if( exists ){
							fs.unlink( uploadedFile, function( err ){
								res.send("댓글이 삭제되었습니다.");
							});
						} else {
							res.send("댓글이 삭제되었습니다.");
						}
					});
				});
			} else {
				res.send("본인의 댓글만 지울 수 있습니다.");
			}
		} else {
			res.send("존재하지 않는 댓글입니다.");
		}
	});
});

router.post( '/api/newsfeed/removepost' , checkSession, function( req, res){
	var pid = req.body['pid'];
	db.Posts.findOne( { id : pid }, function( err, post ){
		if( post ){
			if( req.user.id == post.uid ){
				post.remove( function( err2, result ){
					db.Replys.remove( { pid : pid }, function( error ){
						var rimraf = require('rimraf');
						rimraf( __dirname + '/../files/post/' + pid , function(){
							res.send("게시글이 삭제되었습니다.");
						});
					});
				});
			} else {
				res.send("본인의 게시글만 지울 수 있습니다.");
			}
		} else {
			res.send("존재하지 않는 게시글입니다.");
		}
	});
});

router.post( '/api/newsfeed/writereply/:postid' , checkSession, function( req, res ){
	var replyid;
	var postid = parseInt(req.params['postid']);
	var filecount = 0;
	var text = "";
	db.Replys.findOne().sort({id:-1}).exec(	function( err, result ){
		var replyid;
		if( !result ){
			replyid = 1;
		} else {
			replyid = result.id + 1;
		}
		req.pipe( req.busboy );
		req.busboy.on( 'file', function( fieldname, file, filename ){
			var fstream;
			filecount++;
			var uploadedFile = __dirname + '/../files/post/' + postid  + '/reply' ;
			fstream = fs.createWriteStream( uploadedFile + '/' + replyid );
			file.pipe( fstream );
			fstream.on( 'close' , function(){	});
		});
		req.busboy.on( 'field', function( fieldname, val ){
			if( fieldname == "text" ){
				text =  val.trim().xssFilter();
			}
		});
		req.busboy.on( 'finish', function(){
			if( text.length >= 0 || filecount != 0 ){
				var current = new db.Replys({
					id : replyid,
					user : {
						id : req.user.id,
						name : req.user.name,
						uid : req.user.uid
					},
					pid : postid,
					text : text,
					file : filecount
				});
				current.save( function( error ){
					if( error ){
						throw error;
					}
					res.send( replyid.toString() );
				});
			}
		});
	});
});

router.post( '/api/newsfeed/changereply/:replyid' , checkSession, function( req, res ){
	var replyid = parseInt( req.params['replyid'] );
	var date = new Date();
	var filecount = 0;
	var text = "";
	db.Replys.findOne({ id : replyid, uid : req.user.id }, function( err, reply ){
		if( err ){
			throw err;
		} else if( reply ){
			req.pipe( req.busboy );
			req.busboy.on( 'file', function( fieldname, file, filename ){
				++filecount;
				var uploadedFile = __dirname + '/../files/post/' + reply.pid + '/reply/' + replyid;
				var fstream;
				fstream = fs.createWriteStream( uploadedFile );
				file.pipe( fstream );
				fstream.on( 'close' , function(){});
			});
			req.busboy.on( 'field', function( fieldname, val ){
				if( fieldname == "text" ){
					text = val.trim().xssFilter;
				}
			});
			req.busboy.on( 'finish', function(){
				db.Replys.update({ id : replyid, "user.id" : req.user.id },{ text : text, file : filecount },function( err2, count ){
					if( err2 ){
						throw err2;
					} else {
						res.end();
					}
				});
			});
		} else {
			res.end();
		}
	});
});

router.post( '/api/newsfeed/changepost/:postid/:change' , checkSession, function( req, res ){
	var postid = parseInt( req.params['postid'] );
	var change = req.params['change'];
	var date = new Date();
	var text = "";
	var filecount = 0;
	var uploadedFile = __dirname + '/../files/post/' + postid +'/';
	if( change == "0" ){
		change = [];
	} else {
		change = change.split(',');
	}
	db.Posts.findOne({ id : postid, "user.id" : req.user.id }, function( err, post ){
		if( err ){
			throw err;
		} else if( post ){
			req.pipe( req.busboy );
			if( change.length == 0 && post.file >= 1 ){
				for( var i = 1 ; i <= post.file ; ++i ){
					fs.unlink( uploadedFile + i , function( err ){
						if ( err ){
							throw err;
						}
					});
				}
			} else {
				req.busboy.on( 'file', function( fieldname, file, filename ){
					var fstream;
					fstream = fs.createWriteStream( uploadedFile + ( post.file + (++filecount) ) );
					file.pipe( fstream );
					fstream.on( 'close' , function(){});
				});
			}
			req.busboy.on( 'field', function( fieldname, val ){
				if( fieldname == "text" ){
					text = val.trim().xssFilter();
				}
			});
			req.busboy.on( 'finish', function(){
				filecount = post.file + filecount;
				var j = 0;
				for( var i = 1; i <= filecount; ++i ){
					if ( i == change[j] ){
						++j;
					} else if ( i== change[j] ){
						fs.unlink( uploadedFile + i );
					}
				}
				for( var i = 1; i <= change.length; ++i ){
					fs.rename( uploadedFile + change[i-1], uploadedFile + i);
				}
				db.Posts.update({ id : postid },{ text : text, file : change.length, change : date }, function( err, result ){
					   res.send({ file : change.length, date : date });
				});
			});
		} else {
			res.end();
		}
	});
});

router.post( '/api/newsfeed/writepost' , checkSession, function( req, res ){
	var filecount = 0;
	var text = "";
	db.Posts.findOne().sort({id:-1}).exec( function( err, result ){
		var postid;
		if( !result ){
			postid = 1;
		} else {
			postid = result.id + 1;
		}
		var uploadedFile = __dirname + '/../files/post/' + postid;
		fs.mkdir( uploadedFile, 0755, function( err ){
			if( err ){
				throw err;
			}
			req.pipe( req.busboy );
			req.busboy.on( 'file', function( fieldname, file, filename ){
				var fstream;
				++filecount;
				fstream = fs.createWriteStream( uploadedFile + '/' + filecount );
				file.pipe( fstream );
				fstream.on( 'close' , function(){
				});
			});
			req.busboy.on( 'field', function( fieldname, val ){
				if( fieldname == "text" ){
					text = val.trim().xssFilter();
				}
			});
			req.busboy.on( 'finish', function(){
				var current = new db.Posts({
					id : postid,
					user : {
						id : req.user.id,
						uid : req.user.uid,
						name : req.user.name,
					},
					text : text,
					file : filecount
				});
				current.save( function( error ){
					if( error ){
						throw error;
					}
					fs.mkdir( uploadedFile + '/reply' , 0755, function( err2 ){
						if( err2 ){
							throw err2;
						}
						res.end();
						db.Follows.find({ "to.id" : req.user.id }, function( err, followers ){
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
					});
				});
			});
		});
	});
});

function getMeta(body){
	var head = body.substring( body.indexOf("<head>") + 6, body.indexOf("</head>") - 1);
	var metas = {};
	while( head.indexOf('property="') ){
		var meta = head.substr( 0, head.indexOf(">") );
		var head = head.substr( meta.length + 1 );
		if( meta == "" ){
			break;
		}
		if( meta.indexOf('property="') >= 0 ){
			var property = meta.substr( meta.indexOf('property="og:') + 13 );
			property = property.substr( 0, property.indexOf('"') );
		} else {
			continue;
		}
		if( meta.indexOf('content="') >= 0 ){
			var content = meta.substr( meta.indexOf('content="') + 9 );
			content = content.substr( 0, content.indexOf('"') );
		} else {
			continue;
		}
		metas[ property ] = content;
	}
	return metas;
}

router.post( '/api/newsfeed/linkpreview', checkSession, function( req, res ){
	var url = req.body['link'];
	db.Links.findOne({ url : url },function( error, result ){
		if( error ){
			throw error;
		}
		if( result ){
			res.send(result);
		} else {
			request( url, function( err, response, body ){
				if( err ){
					throw err;
				}
				if( response.statusCode !== 200 ){
					res.end();
				}
				var metas = getMeta(body);
				if( metas.title ){
					var current = new db.Links({
						url : url,
						title : metas.title,
						description : metas.description,
						image : metas.image
					});
					current.save( function( err2 ){
						if( err2 ){
							throw err2;
							res.end();
						} else {
							res.send(metas);
						}
					});
				} else {
					res.end();
				}
			});
		}
	});
});


module.exports = router;

