var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var async = require("async")
var request = require("request");

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
		db.Dontsees.remove({ type : type, obj_id : obj_id, user_id : req.user.id }, function( err, dontsee ){
			if( dontsee == 1 ){
				res.end();
			} else {
				db.Dontsees.findOne().sort({id:-1}).exec( function( err, result ){
					if( !result ){
						dontsee_id = 1;
					} else {
						dontsee_id = result.id + 1;
					}
					var current = new db.Dontsees({
						id : dontsee_id,
						type : type,
						user_id : req.user.id,
						obj_id : obj_id
					});
					current.save( function( err ){
						if( err ){
							throw err;
						}
						res.end();
					});
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
		db.Favorites.findOne({ post_id : postid, user_id : req.user.id }, function( err, result ){
			if( result ){
				result.remove( function(){
					res.end();
				})
			} else {
				db.Favorites.findOne().sort({id:-1}).exec(
					function( err, result ){
						if( !result ){
							favoriteid = 1;
						} else {
							favoriteid = result.id + 1;
						}
						var current = new db.Favorites({
							id : favoriteid,
							user_id : req.user.id,
							post_id : postid
						});
						current.save( function( err ){
							if( err ){
								throw err;
							}
							res.end();
						});
					}
				);
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
	var userid = parseInt(req.body['userid']);
	var tos = new Array();
	async.waterfall([
		function( callback ){
			db.Dontsees.find({ user_id : req.user.id }, function( err, dontsees ){
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
			db.Follows.find({ from_id : req.user.id }, function( err, follows ){
				if( err ){
					throw err;
				} else if( follows && follows.length ){
					for( var i = follows.length - 1 ; i >= 0 ; --i ){
						tos.push( follows[i].to_id );
						if( !i ){
							callback( null );
						}
					}
				} else {
					callback( null );
				}
			});	
		}, function( callback ){
			tos.push( req.user.id );
			if( userid ){
				tos.push( userid );
			}
			db.Posts.find({ id : { $nin : dontsee_posts }, user_id : { $in : tos } } ).sort({ id : -1 }).limit( limit ).skip( skip ).exec( function( err, posts ){
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
			db.Replys.find({ id : { $nin : dontsee_replys }, post_id : post.id }).sort({ id : -1 }).exec( function( err, reply ){
				var replys;
				if( reply.length > 4 ){
					replys = reply.slice(0,4)
					replys.push("더있어요");
				} else {
					replys = reply;
				}
				db.Favorites.findOne({ post_id : post.id, user_id : req.user.id }, function( err, favorite ){
					var isfavorite = false;
					if( favorite ){
						isfavorite = true;
					}
					var result = {
						id : post.id,
						user_id : post.user_id,
						user_userid : post.user_userid,
						user_name : post.user_name,
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
	db.Replys.find({ post_id : postid }).skip( skip ).sort({ id : -1 }).exec( function( err, reply ){
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
			if( req.user.id == reply.user_id ){
				var post_id = reply.post_id
				var uploadedFile = __dirname + '/files/postimg/' + post_id + '/reply/' + reply_id;
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
	var post_id = req.body['post_id'];
	db.Posts.findOne( { id : post_id }, function( err, post ){
		if( post ){
			if( req.user.id == post.user_id ){
				post.remove( function( err2, result ){
					db.Replys.remove( { post_id : post_id }, function( error ){
						var rimraf = require('rimraf');
						rimraf( __dirname + '/../files/postimg/' + post_id , function(){
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
			var uploadedFile = __dirname + '/../files/postimg/' + postid  + '/reply' ;
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
					user_id : req.user.id,
					user_name : req.user.name,
					user_userid : req.user.user_id,
					post_id : postid,
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
	db.Replys.findOne({ id : replyid, user_id : req.user.id }, function( err, reply ){
		if( err ){
			throw err;
		} else if( reply ){
			req.pipe( req.busboy );
			req.busboy.on( 'file', function( fieldname, file, filename ){
				++filecount;
				var uploadedFile = __dirname + '/../files/postimg/' + reply.post_id + '/reply/' + replyid;
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
				db.Replys.update({ id : replyid, user_id : req.user.id },{ text : text, file : filecount },function( err2, count ){
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
	var uploadedFile = __dirname + '/../files/postimg/' + postid +'/';
	if( change == "0" ){
		change = [];
	} else {
		change = change.split(',');
	}
	db.Posts.findOne({ id : postid, user_id : req.user.id }, function( err, post ){
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
		var uploadedFile = __dirname + '/../files/postimg/' + postid;
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
					user_id : req.user.id,
					user_userid : req.user.user_id,
					user_name : req.user.name,
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
						res.send( current.id.toString() );
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

