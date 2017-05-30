'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');

var db = require('./dbconfig.js');
var fs = require('fs-extra');

Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

var makeObj = require('./makeObj.js');
var makeNotice = require('./notice.js').makeNotice;
var checkSession = require("./auth.js").checkSession;

var ytdl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');
var AudioContext = require('web-audio-api').AudioContext;

var alsong = require('alsong');

var mediaserver = require('mediaserver');

// srt표준 timestamp를 만들기 위해 사용하는 함수 hh:mm:ss,mmm 이런식이다
function makeTimeStamp( msec ){
	var sec = Math.floor(msec/1000);
	var h = Math.floor(sec/3600);
	var m = Math.floor(sec%3600/60);
	var s = sec%60;
	var ms = msec%1000;
	if( h < 10 ){
		h = '0' + h;
	}
	if( m < 10 ){
		m = '0' + m;
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

router.get( '/upload', checkSession, function( req, res ){
	makeObj(req,res,"upload");
});

router.post( '/api/subtitle/get/:aid/:start/:end', checkSession, function( req, res ){
	var start = Math.floor(parseInt((req.params['start'])));
	var end = Math.floor(parseInt(req.params['end']));

	var write_path = __dirname + '/../subtitle/' + req.user.id + '.srt';

	var wstream = fs.createWriteStream(write_path);
	var aid = parseInt(req.params['aid']);
	if( isNaN(aid) || isNaN(start) || isNaN(end) ){
		res.end();
	} else {
		var cnt = 0;
		db.Audios.findOne({ id : aid }, function( err, result ){
			if( err ){
				throw err;
			}
			async.each( result.script , function( script, cb ){
				if( script.start > start*1000 && script.end < end*1000 ){
					wstream.write(++cnt + '\n' + makeTimeStamp(parseInt(script.start-start*1000)) + ' --> ' + makeTimeStamp(parseInt(script.end-start*1000)) + '\n' + script.text + '\n\n' );
				}
				cb();
			}, function( err2 ){
				if( err2 ){
					throw err2;
				}
				wstream.end();
				wstream.on('finish',function(){
					console.log('가사커팅완료');
					var srt_string = fs.readFileSync( write_path, 'utf8' );
					res.send(srt_string);
				});
			});
		});
	}
});

router.get( '/api/audio/getaudio/youtube/:vid/:start/:duration', checkSession, function( req, res ){
	var vid = req.params['vid'];
	var read_path = __dirname + "/../audio/" + vid + ".mp3";
	var write_path = __dirname + "/../audio/" + vid + "-" + req.user.id + ".mp3";
	var start = Math.floor(parseInt((req.params['start'])));
	var duration = parseInt(req.params['duration']);
	if( fs.existsSync( read_path ) ){
		ffmpeg(fs.createReadStream(read_path)).setStartTime(start).duration(duration).on('end', function(){
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
	if( isNaN( start ) ){
		res.end();
	} else {
	if( fs.existsSync( read_path ) ){
		ffmpeg(fs.createReadStream(read_path)).setStartTime(start).duration(3).on('end', function(){
			fs.createReadStream( write_path ).pipe(res);
		}).save(write_path);
	} else {
		console.log("파일이 존재하지 않습니다.");
		res.end();
	}
	}
});

router.get( '/api/audio/getaudio/:vid', function( req, res ){
	var path = __dirname + "/../audio/" + req.params['vid'] + ".";
	var flag;
	if( fs.existsSync(path+"mp3") ){
		flag = "mp3";
	} else if( fs.existsSync(path+"mp4") ){
		flag = "mp4";
	} else if( fs.existsSync(path+"webm") ){
		flag = "webm";
	} 
	path += flag;
	if( flag != undefined ){
		var file = fs.readFileSync( path );
		var stat = fs.statSync( path );
		res.writeHead(200, { 'Content-Type' : 'video/' + flag, 'Content-Length':stat.size,'Accept-Ranges':stat.size });
		res.end( file );
	} else {
		res.end();
	}
});

router.post( '/api/audio/add/:vid', function( req, res ){
	var vid = req.params['vid'];
	var wave = req.params['wave']=="true"?true:false;
	var url = 'http://www.youtube.com/watch?v=' + vid;
	var path = __dirname + "/../audio/" + vid;
//	var path = __dirname + "/../audio/" + req.user.id + ".mp3";
	
	var type;
	var exists = false;
	if( req.body["mp3"] == "true" ){
		type = "mp3";
		exists = fs.existsSync(path+".mp3");
		console.log(path+"."+type, exists);
	} else if( fs.existsSync(path+".mp4") ){
		exists = true;
		type = "mp4";
	} else if( fs.existsSync(path+".webm") ){
		exists = true;
		type = "webm";
	}
	if( exists ){
		if( wave ){
			makeWave( fs.createReadStream( path ), function( vals ){
				res.send({ vals : vals });
			});
		} else {
			res.send({ type : type });
		}
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
			} else if( duration.length >= 3 || ( duration.length == 2 && duration[0] > 10 ) ){
				res.send("10분 이내의 영상만 음원을 추출하실 수 있습니다.");
			} else {
				console.log(duration);
				console.log("format check");
				ytdl.exec( url, ['-F'], { maxBuffer : 1000*1024 }, function( err, list ){
					if( err ){
						res.send("저작권 문제로 사용하실 수 없는 영상입니다. 죄송합니다.");
					} else {
						var flag = 0;
						async.each( list, function( value, cb ){
							if( value.indexOf("audio only") >= 0 && ( value.indexOf("webm") >= 0 || value.indexOf("mp4") >= 0 ) && flag == 0 ){
								flag = 1;
								var num = value.split(' ')[0];
								var ystream = ytdl(url,['-f',num],{ maxBuffer : 1000*1024 });
								path += ".";
								if( value.indexOf("webm") >= 0 ){
									type = "webm";
								}
								if( wave ){
									path += "mp3";
									var fstream = fs.createWriteStream( path );
									var command = ffmpeg(ystream).format('mp3').audioCodec('libmp3lame');
									var stream = command.pipe(fstream);
									stream.on('finish',function(){
										makeWave( fs.createReadStream( path ), function( vals ){
											res.send({ vals : vals, info : info });
										});
									});
								} else {
									if( req.body["mp3"] == "true" ){
										type = "mp3";
									}
									path += type;
									var fstream = fs.createWriteStream( path );
									var stream;
									if( type == "mp3" ){
										var command = ffmpeg(ystream).format('mp3').audioCodec('libmp3lame');
										stream = command.pipe(fstream);
									} else {
										stream = ystream.pipe(fstream);
									}
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

router.get( '/share/:aid/:start/:end', checkSession, function( req, res ){
	var start = Math.floor(parseInt((req.params['start'])));
	var end = Math.floor(parseInt(req.params['end']));
	var aid = parseInt(req.params['aid']);
	var duration = end - start;
	if( isNaN( aid ) || isNaN( start ) || isNaN( duration ) || start < 0 || duration < 0 ){
		res.end();
	} else {
		var read_path = __dirname + "/../audio/" + aid + ".mp3";
		var write_path = __dirname + "/../audio/" + aid + "_short.mp3";
		console.log(aid);
		db.Audios.findOne({ id : aid },function(err,result){
			if( err ){
				throw err;
			} else if( result ){
				ffmpeg()
				.input( read_path )
				.seek(start)
				.on('start',function(m){
					console.log(m);
				})
				.on('error',function(error){
					console.log(error);
				})
				.on('end', function(){
					makeObj(req,res,"share");
				})
				.outputOptions(['-acodec copy','-vcodec copy', '-t '+duration])
				.save(write_path);
			} else {
				res.end();
			}
		});
	}
});


router.get( '/api/video/get',  function( req, res ){
	var write_path = __dirname + '/../video/' + req.user.id + '.mp4';
	fs.createReadStream( write_path ).pipe(res);
});

router.get( '/api/audio/get/:aid', checkSession, function( req, res ){
	var aid = parseInt(req.params['aid']);
	if( isNaN(aid) ){
		res.end();
	} else {
		var url = __dirname + '/../audio/' + req.user.id + "_short.mp3";
		mediaserver.pipe(req,res,url);
	}
});

router.post( '/api/audio/add', checkSession, function( req, res ){
	var body = {
		uid : req.user.id,
		script : []
	};
	console.log("upload start");
	db.Audios.findOne().sort({id:-1}).exec( function( err, audio ){
		if( err ){
			throw err;
		}
		if( audio ){
			body.id = audio.id + 1;
		} else {
			body.id = 1;
		}
		req.pipe( req.busboy );
		req.busboy.on( 'file', function( fieldname, file, filename ){
			var path = __dirname + "/../audio/" + req.user.id + ".mp3";
			var fstream = fs.createWriteStream( path );
			var stream = file.pipe(fstream);
			stream.on('finish',function(){
				makeWave( fs.createReadStream( path ), function( vals ){
					res.send({ vals : vals, aid : body.id });
				});
			});
		});
		req.busboy.on( 'field', function( fieldname, val ){
			body[fieldname] = val;
		});
		req.busboy.on( 'finish', function(){
			alsong( body.artist, body.title ).then( function( v ){
				var lyric = v[0].lyric;
				var times = Object.keys(lyric);
				var cnt = 0;
				async.each( times, function( time, cb ){
					if( ++cnt < times.length ){
						body.script.push({
							start : parseInt(time),
							end : parseInt(times[cnt])-100,
							text : lyric[time].join('\n')
						});
					} else {
						body.script.push({
							start : parseInt(time),
							end : parseInt(time) + 5000,
							text : lyric[time].join('\n')
						});
					}
					cb( null );
				}, function( err2 ){
					if( err2 ){
						throw err2;
					}
					console.log(body);
					var current = new db.Audios(body);
					current.save( function( err3 ){
						if( err3 ){
							throw err3;
						}
						console.log("데이터 저장 완료 ");
					});
				});
			});
		});
	});
});

function makeWave( stream, cb ){
	var buffers = [];
	var flag = true;
	stream.on('data', function(buffer) {
 		buffers.push(buffer);
	});
	stream.on('end', function() {
		var b = Buffer.concat(buffers);
		var context = new AudioContext;
		context.decodeAudioData( b, function( buffer ){
			var channel = buffer.getChannelData(0);
			var channel2 = buffer.getChannelData(1);
			var sections = Math.floor( buffer.duration );
			console.log("duration : " + buffer.duration);
			var len = Math.floor( channel.length / sections );
			var vals = [];
			var sum = 0.0;
			var i = 0;
			async.each(channel, function( tmp, callback ){
				var value;
				if( isNaN( tmp ) == false && isNaN( channel2[i] ) == false ){
					value = tmp + channel2[i];
				} else if( isNaN( tmp ) == true ){
					value = channel2[i];
				} else if( Math.abs(tmp) < Math.abs(channel2[i]) ){
					value = channel2[i];
				}
				if( isNaN( value ) == false ){
					sum += value*value;
				}
				if( i % len == 0 ){
					var a = Math.sqrt( sum / channel.length ) * 10000;
					a = a * a;
					vals.push(a);
					sum = 0.0;
				}
				i++;
				callback(null);
			}, function( err ){
				if( err ){
					throw err;
				} else {
					cb(vals);
				}
			});
		}, function(e){
			if( e != undefined && flag ){
				cb([]);
				flag = false;
			}
		});
	});
}

function makeVideo(req,res,body){
	var srt_path = __dirname + '/../subtitle/' + req.user.id + '.srt';	 // 자막경로
	var audio_path = __dirname + '/../audio/' + req.user.id + '.mp3';	  // 음원경로
	var tmp_path = __dirname + '/../video/' + req.user.id + '_tmp.mp4';	// 영상경로
	var write_path = __dirname + '/../video/' + req.user.id + '.mp4';	// 영상경로
	var concat_path = __dirname + '/../ffconcat/' + req.user.id + '.txt';  // ffconcat경로 ( 각기 다른 duration을 가진 여러개의 img를 ffmpeg로 input 하기위해 필요 )

	var cnt = 0;
	var tmp_duration = body.duration;
	var wstream = fs.createWriteStream( concat_path );
	// img가 출력되기 시작하는 시간이 imgTimeArray에 담겨있기때문에 다음 이미지에서 현재이미지의 차가 duration이 됨
	async.each( body.imgArray, function( img, cb ){
		console.log(cnt,body.imgTimeArray);
		console.log(body.imgTimeArray[cnt+1],body.imgTimeArray[cnt]);
		if( cnt+1 < body.imgArray.length ){
			tmp_duration -= parseInt(body.imgTimeArray[cnt+1]) - parseInt(body.imgTimeArray[cnt]);
			if( cnt == 0 ){
				wstream.write( 'file ' + body.imgArray[cnt] + '\n' + 'duration ' + ( parseInt(body.imgTimeArray[cnt+1]) - parseInt(body.imgTimeArray[cnt]) + body.start )+ '\n' );
			} else {
				wstream.write( 'file ' + body.imgArray[cnt] + '\n' + 'duration ' + ( parseInt(body.imgTimeArray[cnt+1]) - parseInt(body.imgTimeArray[cnt]) )+ '\n' );
			}
			cnt++;
		} else if( cnt == 0 ){
			wstream.write( 'file ' + body.imgArray[cnt] + '\n' + 'duration ' + (body.start+body.duration) + '\n' );
		} else {
			wstream.write( 'file ' + body.imgArray[cnt] + '\n' + 'duration ' + (body.duration) + '\n' );
		}
		cb(null);
	}, function( err ){
		//ffmpeg에서 마지막이미지가 제대로 처리안될때가 있어서 최대한 길게 한번 더넣어줌
		if( body.imgArray.length >= 1 ){
			wstream.write( 'file ' + body.imgArray[body.imgArray.length-1] + '\n' + 'duration ' + (body.duration) + '\n' );
		} else {
			// 아무 이미지도 안골랐을 때
			wstream.write( 'file ' + __dirname + '/../img/default.png' + '\n' + 'duration ' + (body.duration+body.start) + '\n' );
			wstream.write( 'file ' + __dirname + '/../img/default.png' + '\n' + 'duration ' + (body.duration) + '\n' );
		}
		// file stream 닫기
		wstream.end();
		wstream.on('finish',function(){
			ffmpeg().input(audio_path).seek(body.start).on('start',function(command){
				console.log(command);
				console.log("곧 작업이 시작됩니다.");
			}).on('progress',function(data){
				if( data.currentKbps ){
					if( data.timemark ){
						var time = data.timemark.split(':');
						var current = parseInt(time[0])*3600+parseInt(time[1])*60+parseInt(time[2]);
						console.log(Math.floor(current/body.duration*100)+"%");
					}
				}
			}).on('end',function(){
				console.log("100%");
				console.log("인코딩 완료!");
				ffmpeg().input(tmp_path)
				.on('end',function(){
					console.log("커팅 완료! 전송을 시작합니다!");
					fs.createReadStream( write_path ).pipe(res);
				})
				.outputOptions(['-t '+body.duration, '-scodec copy'])
				.save(write_path)
			}).on('error',function(error){
				console.log(error);
			})
			.input(concat_path)
			.inputOptions(['-f concat','-safe 0'])
			.input(srt_path)
			.outputOptions([
			// by vf
			//'-vf fps=25,scale=640:480,subtitles=filename='+srt_path+':force_style="FontName=NanumGothic"', 
			// by filter_complex
			'-map 0:a', '-map 1:v', '-map 2:s', '-map [outv]', '-filter_complex [1:v][2:s]overlay[outv]',
			'-pix_fmt yuv420p', '-vcodec libx264', '-acodec copy', '-c:s mov_text', '-crf 5', '-t '+body.duration])
			.save(tmp_path);
		});
	});
}

router.post( '/api/video/get', checkSession, function( req, res ){
	console.log("upload start");
	req.pipe( req.busboy );
	var body = {};
	body.imgArray = [];
	var fcnt = 0;
	var result = 0;
	var finished = false;
	req.busboy.on( 'field', function( fieldname, val ){ // parameter 처리 ( start, duration, img별 duration )
		console.log(fieldname + " : " + val );
		if( fieldname == "imagetimearray" ){
			body.imgTimeArray = val.split(',');
		} else {
			body[fieldname] = Math.floor(parseInt(val));
		}
	});
	req.busboy.on( 'file', function( fieldname, file, filename ){  // file upload
		var img_path = __dirname + '/../files/video/' + req.user.id + '_' + ++fcnt + '.jpg';
		++result;
		var wstream = fs.createWriteStream( img_path );
		wstream.on('close', function(){
			--result;
			if(result == 0 && finished == true ){
				makeVideo( req, res,body);
			}
		});
		file.pipe(wstream);
		body.imgArray.push(img_path);
	});
	req.busboy.on( 'finish', function(){
		finished = true;
		if( body.imgTimeArray[0] == '' ){
			body.imgTimeArray = [];
			makeVideo( req, res, body);
		}
	});
});


module.exports = router;
