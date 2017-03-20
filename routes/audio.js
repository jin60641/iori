var express = require('express');
var router = express.Router();

var db = require('./dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy());

Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;
var checkSession = require("./auth.js").checkSession;

var ytdl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');
var AudioContext = require('web-audio-api').AudioContext;

router.get( '/api/audio/getaudio/:uid/:start', checkSession, function( req, res ){
	var uid = req.params['uid'];
	var read_path = __dirname + "/../audio/" + uid + ".mp3";
	var write_path = __dirname + "/../audio/" + uid + "-" + req.user.id + ".mp3";
	var start = Math.floor(parseInt((req.params['start'])));
	console.log(" start : " + start);
	if( fs.existsSync( read_path ) ){
		ffmpeg(fs.createReadStream(read_path)).setStartTime(start).duration(3).on('end', function(){
			fs.createReadStream( write_path ).pipe(res);
		}).save(write_path);
	} else {
		console.log("파일이 존재하지 않습니다.");
		res.end();
	}
});

router.get( '/api/audio/getaudio/:vid', function( req, res ){
	var path = __dirname + "/../audio/" + req.params['vid'] + ".mp3";
	if( fs.existsSync( path ) ){
		var file = fs.readFileSync( path );
		var stat = fs.statSync( path );
		res.writeHead(200, { 'Content-Type' : 'audio/mpeg','Content-Length':stat.size,'Accept-Ranges':stat.size });
		res.end( file );
	} else {
		res.end();
	}
});

router.post( '/api/audio/add/:vid', checkSession, function( req, res ){
	var vid = req.params['vid'];
	var url = 'http://www.youtube.com/watch?v=' + vid;
//	var path = __dirname + "/../audio/" + vid + ".mp3";
	var path = __dirname + "/../audio/" + req.user.id + ".mp3";
	
//	var exists = fs.existsSync(path);
//	if( exists ){
//		makeWave( fs.createReadStream( path ), function( vals ){
//			res.send({ vals : vals });
//		});
//	} else {
		ytdl.getInfo( url, function( err, info ){
			var duration;
			if( info && info.duration ){
				duration = info.duration.split(':');
			}
			if( info == undefined || info.duration == undefined ){
				res.send("잘못된 링크입니다.");
			} else if( duration.length >= 3 || duration[0] > 10 ){
				res.send("10분 이내의 영상만 음원을 추출하실 수 있습니다.");
			} else {
				ytdl.exec( url, ['-F'], {}, function( err, list ){
					if( err ){
						res.send("저작권 문제로 사용하실 수 없는 영상입니다. 죄송합니다.");
					} else {
						for( var i = 0; i < list.length; ++i ){
							console.log(list[i]);
	//						if( list[i].indexOf("audio only") >= 0 && list[i].indexOf("webm") >= 0 ){
							if( list[i].indexOf("audio only") >= 0 && ( list[i].indexOf("webm") >= 0 || list[i].indexOf("mp4") >= 0 ) ){
								var num = list[i].split(' ')[0];
								var ystream = ytdl(url,['-f',num]);
								var fstream = fs.createWriteStream( path );
								var command = ffmpeg(ystream).format('mp3');
								var stream = command.pipe(fstream);
								console.log("downloading");
								stream.on('finish',function(){
									makeWave( fs.createReadStream( path ), function( vals ){
										res.send({ vals : vals, info : info });
									});
								});
								break;
							} else if( i + 1 == list.length ){
								res.send("잘못된 링크입니다.");
							}
						}
					}
				});
			}
		});
//	}
});

router.post( '/api/audio/add', checkSession, function( req, res ){
	req.pipe( req.busboy );
	req.busboy.on( 'file', function( fieldname, file, filename ){
		makeWave( file, function( vals ){
			res.send({ vals : vals });
		});
		var path = __dirname + "/../audio/" + req.user.id + ".mp3";
		var fstream = fs.createWriteStream( path );
		file.pipe(fstream);
	});
	req.busboy.on( 'field', function( fieldname, val ){
	});
	req.busboy.on( 'finish', function(){
	});
});

function makeWave( stream, cb ){
	var buffers = [];
	stream.on('data', function(buffer) {
 		buffers.push(buffer);
	});
	stream.on('end', function() {
		var b = Buffer.concat(buffers);
		var context = new AudioContext;
		console.log("decoding now");
		context.decodeAudioData( b, function( buffer ){
			var channel = buffer.getChannelData(0);

			var sections = Math.floor( buffer.duration );
			var len = Math.floor( channel.length / sections );
			var vals = [];
			for( var itmp = 0; itmp < sections; ++itmp ){
				( function(i){
					var sum = 0.0;
					var ref = (i+1) * len;
					for( var jtmp = i * len; jtmp < ref; ++jtmp ){
						( function(j){
							sum += channel[j]*channel[j];
							if( j + 1 >= ref ){
								var a = sum/channel.length*45000;
								a = a*a;
								//vals.push( Math.floor( Math.sqrt( sum / channel.length ) * 10000 ));
								vals.push(a);
								if( vals.length >= sections ){
									cb(vals);
								}
							}
						}(jtmp));
					}
				}(itmp));
			}
			/*
			var sections = Math.floor( buffer.duration * 5);
			var len = Math.floor( channel.length / sections );
			var vals = [];
			for( var itmp = 0; itmp < sections; itmp += 5 ){
				( function(i){
					var sum = 0.0;
					var ref = i * len;
					for( var jtmp = ref; jtmp < ref + len; ++jtmp ){
						( function(j){
							sum += channel[j]*channel[j];
							if( j + 1 >= ref + len ){
								vals.push( Math.floor( Math.sqrt( sum / channel.length ) * 10000 ));
//								console.log(Math.floor( Math.sqrt( sum / channel.length ) * 10000 ));
//								console.log(vals.length,sections);
								if( i + 5 >= sections ){
									console.log("end");
									cb(vals);
								}
							}
						}(jtmp));
					}
				}(itmp));
			}
			*/
		});
	});
}

module.exports = router;
