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
var AudioBuffer = require('audio-buffer');
var AudioContext = require('web-audio-api').AudioContext;

router.post( '/api/context/test', function( req, res ){
	req.pipe( req.busboy );
	req.busboy.on( 'file', function( fieldname, file, filename ){
		var buffers = [];
		file.on('data', function(buffer) {
	 		buffers.push(buffer);
		});
		file.on('end', function() {
			var context = new AudioContext;
			context.decodeAudioData( Buffer.concat(buffers), function( buffer ){
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
									
								}
							}
						}
					}(k));
				}
			});
		});
	});
	req.busboy.on( 'field', function( fieldname, val ){
	});
	req.busboy.on( 'finish', function(){
		console.log("busboy finish");
		res.end();
	});
});

module.exports = router;
