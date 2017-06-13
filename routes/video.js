'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');

var db = require('./dbconfig.js');
var fs = require('fs-extra');

var makeObj = require('./makeObj.js');

var ffmpeg = require('fluent-ffmpeg');
var mediaserver = require('mediaserver');
var crypto = require('crypto');
var Twit = require('twit');
var consumerKey = require('./settings.js').twitterConsumerKey;
var consumerSecret = require('./settings.js').twitterConsumerSecret;
var request = require('request');

function checkToken(req,res,next){
	if( req.user && req.user.token && req.user.secret && req.user.username ){
		return next();
	} else {
		makeObj( req, res, "login" );
	}
}

router.get('/video', checkToken, function( req, res ){
	makeObj( req, res, "video" );
});

router.get('/video/:link', checkToken, function( req, res ){
	makeObj( req, res, "video" );
});

function makeTimeStamp( msec ){
	var sec = Math.floor(msec/1000);
	var h = Math.floor(sec/3600);
	var m = Math.floor(sec%3600/60);
	var s = sec%60;
	var ms = msec%1000;
	if( h < 0 ){
		h = 0;
	}
	if( h < 10 ){
		h = '0' + h;
	}
	if( m < 0 ){
		m = 0;
	}
	if( m < 10 ){
		m = '0' + m;
	}
	if( s < 0 ){
		s = 0;
	}
	if( s < 10 ){
		s = '0' + s;
	}
	if( ms < 10 ){
		ms = '00' + ms;
	} else if( ms < 100 ){
		ms = '0' + ms;
	}
	return h + ':' + m + ':' + s + ',' + ms;
}

router.get('/v/:link', function( req, res ){
	db.Videos.findOne({ link : req.params.link }, function( err, link ){
		if( err ){
			throw err;
		} else if( link ){
			var path = __dirname + '/../video/' + link.file + '.mp4';
			var stat = fs.statSync(path);
			var total = stat.size;
			if (req.headers['range']) {
				var range = req.headers.range;
				var parts = range.replace(/bytes=/, "").split("-");
				var partialstart = parts[0];
				var partialend = parts[1];

				var start = parseInt(partialstart, 10);
				var end = partialend ? parseInt(partialend, 10) : total-1;
				var chunksize = (end-start)+1;

				var file = fs.createReadStream(path, {start: start, end: end});
				res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
				file.pipe(res);
			} else {
				res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
				fs.createReadStream(path).pipe(res);
			}
		} else {
			res.end();
		}
	});
});

function makeLink(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 10; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

router.post('/api/twitter/get/video', checkToken, function( req, res ){
	var T = new Twit({
		consumer_key : consumerKey,
		consumer_secret : consumerSecret,
		access_token : req.user.token,
		access_token_secret : req.user.secret,
		timeout_ms : 60*1000
	});
	/*
	T.post('statuses/update', { status: '.' }, function(err, data, response) {
		if( err ){
			throw err;
		}
		res.send("successs");
	});
	*/
	T.get('search/tweets', { q: 'since:2000-01-01 -filter:retweets filter:images from:' + req.user.username, count : 10, result_type : "recent" }, function(err, data, response) {
		console.log(data.statuses.length);
		if( err ){
			throw err;
		} else if( data.statuses.length > 0 ){
			var length = data.statuses.length;
			var links = [];
			var img_path = __dirname + '/../files/video/';

			var srt_path = __dirname + '/../subtitle/' + req.user.username + '.srt';
			var srt_stream = fs.createWriteStream(srt_path);

			var concat_path = __dirname + '/../ffconcat/' + req.user.username + '.txt';
			var concat_stream = fs.createWriteStream(concat_path);
			var imgurl;

			concat_stream.write( 'ffconcat version 1.0\n' );
			async.each( data.statuses, function( status, cb ){
				var link = status.entities.media[0].media_url_https;
				links.push(link);
				imgurl = link.split('/').pop();
				var text = status.text;
				text = text.split(' https');
				text.pop();
				text.join(' https');
				srt_stream.write(links.length + '\n' + makeTimeStamp((links.length-1)*3000) + ' --> ' + makeTimeStamp(links.length*3000) + '\n' + text + '\n\n' );
				concat_stream.write( 'file ' + (img_path+imgurl) + '\nduration 3\n' );
				concat_stream.write( 'file ' + (img_path+imgurl) + '\nduration 0\n' );
				var fstream = request(link).pipe(fs.createWriteStream(img_path + imgurl))
				fstream.on('finish', function(){
					cb(null);
				});
			}, function( err ){
				concat_stream.write( 'file ' + (img_path+imgurl) + '\n' );
				srt_stream.end();
				concat_stream.end();
				var sid = socket_ids[ req.user.token ];
				var filename = makeLink();
				var audio_path = __dirname + '/../audio/test.mp3';
				var video_path = __dirname + '/../video/' + filename + '.mp4';
				ffmpeg().input(audio_path).seek(0).on('start',function(command){
				}).on('progress',function(data){
					if( data.currentKbps ){
						if( data.timemark ){
							var time = data.timemark.split(':');
							var current = parseInt(time[0])*3600+parseInt(time[1])*60+parseInt(time[2]);
							var text = Math.floor(current/(links.length*3)*100)+"%";
							if( sid && io.sockets.connected[sid] ){
								io.sockets.connected[sid].emit( 'video_progress', text );
							}
						}
					}
				}).on('end',function(){
					var key = req.user.username + filename;
					var hash = crypto.createHash('sha256').update(key).digest('base64').replace(/(\/|\-|\+)/g,"").substr(0,12);
					var current = new db.Videos({
						file : filename,
						user : req.user.username,
						link : hash
					});
					current.save( function( err2 ){
						if( err2 ){
							throw err2;
						}
						res.send( hash );
					});
				}).on('error',function(error){
					console.log(error);
					res.send("error");
				})
				.input(concat_path)
				.inputOptions(['-f concat','-safe 0'])
				//scale=640:trunc(ow/a/2)*2
				.outputOptions(['-vf fps=25,scale=\'min(640,iw)\':\'min(480,ih)\':force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2,subtitles=filename='+srt_path+":force_style='FontName=NanumGothic'", '-vcodec libx264', '-acodec copy', '-crf 5', '-t ' + length*3,'-pix_fmt yuv420p'])
//				.outputOptions(['-vf "fps=25,subtitles=filename='+srt_path+":force_style='FontName=NanumGothic'\"", '-vcodec libx264', '-acodec copy', '-crf 5', '-t 30','-pix_fmt yuv420p'])
				.save(video_path);
			});
		} else {
			res.send("error");
		}
	})
});

module.exports = router;

