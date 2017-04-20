'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');

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

router.get( '/api/audio/getaudio/youtube/:vid/:start', checkSession, function( req, res ){
	var vid = req.params['vid'];
	var read_path = __dirname + "/../audio/" + vid + ".mp3";
	var write_path = __dirname + "/../audio/" + vid + "-" + req.user.id + ".mp3";
	var start = Math.floor(parseInt((req.params['start'])));
	if( fs.existsSync( read_path ) ){
		ffmpeg(fs.createReadStream(read_path)).setStartTime(start).duration(3).on('end', function(){
			fs.createReadStream( write_path ).pipe(res);
		}).save(write_path);
	} else {
		console.log("파일이 존재하지 않습니다.");
		res.end();
	}
});

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
	var path = __dirname + "/../audio/" + vid + ".mp3";
//	var path = __dirname + "/../audio/" + req.user.id + ".mp3";
	
	var exists = fs.existsSync(path);
	if( exists ){
		makeWave( fs.createReadStream( path ), function( vals ){
			res.send({ vals : vals });
		});
	} else {
		console.log("getInfo Start");
		ytdl.getInfo( url, function( err, info ){
		console.log("getInfo End");
			var duration;
			if( info && info.duration ){
				duration = info.duration.split(':');
			}
			if( info == undefined || info.duration == undefined ){
				res.send("잘못된 링크입니다.");
			} else if( duration.length >= 3 || duration.length == 2 && duration[0] > 10 ){
				res.send("10분 이내의 영상만 음원을 추출하실 수 있습니다.");
			} else {
				console.log("format check");
				ytdl.exec( url, ['-F'], {}, function( err, list ){
					if( err ){
						res.send("저작권 문제로 사용하실 수 없는 영상입니다. 죄송합니다.");
					} else {
						var flag = false;
						async.each( list, function( value, cb ){
							if( flag == false && value.indexOf("audio only") >= 0 && ( value.indexOf("webm") >= 0 || value.indexOf("mp4") >= 0 ) ){
								flag = true;
								console.log(value);
								var num = value.split(' ')[0];
								var ystream = ytdl(url,['-f',num]);
								var fstream = fs.createWriteStream( path );
								var command = ffmpeg(ystream).format('adts');
								var stream = command.pipe(fstream);
								stream.on('finish',function(){
									makeWave( fs.createReadStream( path ), function( vals ){
										console.log("success");
										res.send({ vals : vals, info : info });
									});
								});
								return;
							} else {
								cb(null);
							}
						}, function( err ){
							if( err ){
								throw err;
							}
						});
					}
				});
			}
		});
	}
});

router.post( '/api/audio/add', checkSession, function( req, res ){
	req.pipe( req.busboy );
	req.busboy.on( 'file', function( fieldname, file, filename ){
		var path = __dirname + "/../audio/" + req.user.id + ".mp3";
		var fstream = fs.createWriteStream( path );
		var command = ffmpeg(file).format('adts');
		var stream = command.pipe(fstream);
		stream.on('finish',function(){
			makeWave( fs.createReadStream( path ), function( vals ){
//			makeWave( command, function( vals ){
//			makeWave( file, function( vals ){
				res.send({ vals : vals });
			});
		});
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
		console.log("decode");
		context.decodeAudioData( b, function( buffer ){
			console.log("end decode");
			var channel = buffer.getChannelData(0);
			var channel2 = buffer.getChannelData(1);
			var sections = Math.floor( buffer.duration );
			var len = Math.floor( channel.length / sections );
			var vals = [];
			var sum = 0.0;
			var i = 0;
			async.each(channel, function( tmp, callback ){
				var value;
				if( isNaN( tmp ) == true ){
					value = channel2[i];
				} else if( Math.abs(tmp) < Math.abs(channel2[i]) ){
					value = channel2[i];
				}
				if( isNaN( value ) == false ){
					sum += value*value;
				}
				if( i % len == 0 ){
					var a = Math.sqrt( sum / channel.length ) * 10000;
					vals.push(a);
					sum = 0.0;
				}
				i++;
				callback(null);
			}, function( err ){
				if( err ){
					throw err;
				}
				console.log(vals.length);
				cb(vals);
			});
		});
	});
}

module.exports = router;
