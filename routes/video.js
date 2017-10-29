'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');

var fs = require('fs-extra');
var makeObj = require('./makeObj.js');
var checkSession = require("./auth.js").checkSession;

var ytdl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');

router.get( '/api/video/getvideo/:vid/:type', function( req, res ){
	var path = __dirname + "/../video/" + req.params['vid'] + ".";
	var type = req.params['type'];
	var flag;
	if( type == "mp4" && fs.existsSync(path+"mp4") ){
		flag = "mp4";
	} else if( type == "gif" && fs.existsSync(path+"gif") ){
		flag = "gif";
	}
	path += flag;
	if( flag != undefined ){
		var file = fs.readFileSync( path );
		var stat = fs.statSync( path );
		res.writeHead(200, { 'Content-Type' : (flag=="gif"?"image/gif":"video/mp4"), 'Content-Length':stat.size,'Accept-Ranges':stat.size });
		res.end( file );
	} else {
		res.end();
	}
});

router.post( '/api/video/add/:vid', function( req, res ){
	var vid = req.params['vid'];
	var url = 'http://www.youtube.com/watch?v=' + vid;
	var path = __dirname + "/../video/" + vid + ".";
	var type = req.body['gif']=="true"?"gif":"mp4";
	path += type;
	if( fs.existsSync(path) ){
		res.send({ type : type });
	} else {
		ytdl.getInfo( url,[], { maxBuffer : 1000*1024 }, function( err, info ){
			var duration;
			if( info && info.duration ){
				duration = info.duration.split(':');
			}
			if( err ){
				console.log(err);
			} else{
				console.log("not error");
			}
			if( info == undefined || info.duration == undefined ){
				res.send("잘못된 링크입니다.");
			} else if( duration.length >= 3 || ( duration.length == 2 && duration[0] > 2 ) ){
				res.send("2분 이내의 영상만 영상을 추출하실 수 있습니다.");
			} else {
				console.log(duration);
				console.log("format check");
				ytdl.exec( url, ['-F'], { maxBuffer : 1000*1024 }, function( err, list ){
					if( err ){
						res.send("저작권 문제로 사용하실 수 없는 영상입니다. 죄송합니다.");
					} else {
						var flag = 0;
						async.each( list, function( value, cb ){
							if( ( ( type == "gif" && value.indexOf("audio only") == -1 && ( value.indexOf("webm") >= 0 || value.indexOf("mp4") >= 0 ) ) || ( type == "mp4" && value.indexOf("only") == -1 && value.indexOf("mp4v") == -1 && value.indexOf("mp4") >= 0 ) ) && flag == 0 ){
								flag = 1;
								console.log(type);
								console.log(value);
								var num = value.split(' ')[0];
								var ystream = ytdl(url,['-f',num],{ maxBuffer : 1000*1024 });
								var fstream = fs.createWriteStream( path );
								var command;
								if( type == "gif" ){
									command = ffmpeg(ystream).format("gif");
									var stream = command.pipe(fstream);
									stream.on('finish',function(){
										res.send({info:info,type:type});
									});
								} else {
									var stream = ystream.pipe(fstream);
									stream.on('finish',function(){
										res.send({info:info,type:type});
									});
								}
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


module.exports = router;
