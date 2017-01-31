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

var FileReader = require('filereader');
var AudioContext = require('web-audio-api').AudioContext;
var ytdl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');

router.get( '/api/audio/getaudio', function( req, res ){
	var vid = "eZ-S1AUZCVM";
	var path = __dirname + "/../audio/" + vid + ".mp3";
	var file = fs.readFileSync( path );
	res.writeHead(200, { 'Content-Type' : 'audio/mpeg' });
	res.end( file );
});

router.post( '/api/audio/add/:vid', function( req, res ){
	var vid = req.params['vid'];
	var url = 'http://www.youtube.com/watch?v=' + vid;
	var path = __dirname + "/../audio/" + vid + ".mp3";
	var exists = fs.existsSync(path);
	if( exists ){
		var file = fs.createReadStream( path );
		makeWave( file, function( vals ){
			res.send(vals);
		});
	} else {
		ytdl.exec( url, ['-F'], {}, function( err, list ){
			if( err ){
				throw err;
			}
			for( var i = 0; i < list.length; ++i ){
				if( list[i].indexOf("audio only") >= 0 && list[i].indexOf("webm") >= 0 ){
					var num = list[i].split(' ')[0];
					var ystream = ytdl(url,['-f',num]);
					var fstream = fs.createWriteStream( path );
					var command = ffmpeg(ystream).format('mp3');
					var stream = command.pipe(fstream);
					stream.on('finish',function(){
						var file = fs.createReadStream( path );
						makeWave( file, function( vals ){
							res.send("success");
						});
					});
					break;
				}
			}
		});
	}
});

router.post( '/api/audio/add', function( req, res ){
	req.pipe( req.busboy );
	req.busboy.on( 'file', function( fieldname, file, filename ){
		makeWave( file, function( vals ){
			res.send(vals);
		})
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
		context.decodeAudioData( b, function( buffer ){
			var channel = buffer.getChannelData(0);
			var sections = Math.floor( buffer.duration * 5 );
			var len = Math.floor( channel.length / sections );
			var vals = [];
			for( var k = 0; k < sections; k += 10 ){
				( function(i){
					var sum = 0.0;
					var ref = i * len + len - 1;
					for( var j = i * len; j <= ref; ++j ){
						sum += channel[j]*channel[j];
						if( j + 1 > ref ){
							vals.push( Math.floor( Math.sqrt( sum / channel.length ) * 10000 ));
							if( i + 10 > sections ){
								cb(vals);
							}
						}
					}
				}(k));
			}
		});
	});
}

module.exports = router;
