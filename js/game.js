var listenstart;
var mousestart;
var waveformRenderId;
var audioPlayId;
var audio;
var waveformArray;
var FPS = 45;
var sin_index = 0;
var max = 0;

Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

function waveformRender() {
	waveformCtx.clearRect(0, 0, waveform.width, waveform.height);
	if( waveformArray != undefined && waveformArray.length >= 1 && listenstart != null ){
		/*
		var audioCurrentTime = audio.currentTime;
		var audioDuration = audio.duration;
		for( var i = 0; i < waveformArray.length; ++i ){
		//	if( i*6 >= -listenstart + waveform.width / 2 && i*6 <= -listenstart + waveform.width / 2 + 10 ){
				//if( i*6 / ( audio.duration * 5 ) < audioCurrentTime / audioDuration ){
				if( i / waveformArray.length < audioCurrentTime / audioDuration ){
					waveformCtx.fillStyle = "#ff5c26";
				} else {
					waveformCtx.fillStyle = "#FFB5AB";
				}
		//	} else {
		//		waveformCtx.fillStyle = "#D0D9DD";
		//	}
			waveformCtx.fillRect( i*6 + listenstart, ( waveform.height - waveformArray[i]/max * ( waveform.height ) ) * (7/10), 4, waveformArray[i]/max * (7/10) * ( waveform.height ) + 2 );
			waveformCtx.fillStyle = "#000000";
			if( (i*6 - 2)%50 == 0 ){
				waveformCtx.fillRect( i*6 + listenstart , waveform.height * 7/10, 2 ,waveform.height * 1/10);
				waveformCtx.textAlign = "center";
				waveformCtx.font = "20px Arial";
				waveformCtx.fillText( ((i*6 - 2)/5), i*6 - 2 + listenstart, waveform.height * 4/5 + 15 );
			}
		}
		*/
		var val = waveformArray[Math.floor(waveformArray.length*audio.currentTime/audio.duration)];
		waveformCtx.fillStyle = "#ff5c26";
			waveformCtx.fillRect( listenstart, ( waveform.height - val/max * ( waveform.height ) ) * (7/10), 4, val/max * (7/10) * ( waveform.height ) + 2 );
	} else {
		var sections = waveform.width;
		for( var i = 0; i < sections; i += 7 ){
			var x = i;
			var sin = Math.sin(( x*(1920/window.innerWidth) + sin_index*6 )/(480)) * waveform.height;
			sin = waveform.height / 2 + sin/2;
			waveformCtx.save();
			waveformCtx.globalAlpha = 0.5;
			waveformCtx.fillStyle = "#ff5c26";
			waveformCtx.fillRect( x, waveform.height - sin , 4, sin );
			waveformCtx.fillStyle = "#f15c3e";
			waveformCtx.fillRect( x, sin, 4, waveform.height - sin );
			waveformCtx.restore();
		}
		sin_index += 10;
	}
}

function uploadMusic( url ){
	var vid;
	var vindex;
	vindex = url.indexOf("youtu.be/");
	if( vindex >= 0 ){
		vid = url.substr( vindex + 9 );
	}
	vindex = url.indexOf("youtube.com/watch?v=");
	if( vindex >= 0 ){
		vid = url.substr( vindex + 20 );
	}
	if( vid == null || vid == "" ){
		alert("잘못된 링크입니다");
		return;
	}
	vid = vid.split('&')[0];
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText && xhr.responseText.length ){
			var vals = JSON.parse( xhr.responseText );
			getMusic(vid);
			loadMusicArray(vals);
		}
	}};
	xhr.open("POST", "/api/audio/add/" + vid, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
}

function getMusic( vid ){
	if( audio ){
		audio.pause();
	}
//	play_btn.onclick = null;
	audio = new Audio();
	audio.src = "/api/audio/getaudio/" + vid;
	audio.onloadedmetadata = function(){
		listenstart = (-(audio.duration * (2.5))) + (window.innerWidth/2);
	}
	audio.controls = false;
	audio.autoplay = false;
	audio.loop = false;
	audio.onplay = function(){
				/*
		play_btn.style.cursor = "default";
		play_btn.onclick = null;
		waveform.style.cursor="initial";
		audio.currentTime = - (listenstart - window.innerWidth/2 ) / 5;
				*/
		clearInterval( audioPlayId );	
		audioPlayId = setInterval( function(){
			if( audio == null ){
				clearInterval( audioPlayId );
			} else if( audio.currentTime  - ( - (listenstart - window.innerWidth/2 ) / 5 ) >= 2 ){
				/*
				audio.pause();
				clearInterval( audioPlayId );	
				*/
			}
		}, 10);
	}
}

function loadMusicArray( data ){
	waveformArray = data;
	max = waveformArray.max();
	waveform.style.cursor="move";
	if( waveformRenderId != null ){
		clearInterval( waveformRenderId );
		waveformRenderId = setInterval( waveformRender, 1000 / FPS );
	}
	socket.emit( 'game_loaded' );
	play_btn.style.cursor = "pointer";
	play_btn.onclick = function(){
		audio.play();
	};
	sin_index = 0;
}

window.addEventListener( 'load', function(){
	game = document.createElement("div");
	game.id = "game";
	document.body.appendChild( game );

	play_btn = document.createElement("div");
	play_btn.innerHTML = "<img src='/img/play.jpg'>"
	play_btn.id = "play_btn";

	waveform = document.createElement("canvas");
	waveform.id = "waveform";

	window.onresize = function(){
		waveform.width = window.innerWidth;
		waveform.height = window.innerHeight / 4;
	}
	window.onresize();

	function moveWaveform(spot){
		if( spot != null && mousestart != null && audio != null && audio.duration >= 0 && play_btn.onclick != null ){
			listenstart += spot - mousestart;
			if( listenstart < -( audio.duration * 12 - window.innerWidth / 2 - 10 ) ){
				listenstart = -( audio.duration * 12  - window.innerWidth / 2 - 10 );
			} else if( listenstart > window.innerWidth / 2 ){
				listenstart = window.innerWidth / 2;
			}
			mousestart = spot;
		}
	}

	if( 'ontouchstart' in window ){
		waveform.addEventListener('touchstart', function(){
			mousestart = event.touches[0].pageX;
		});

		waveform.addEventListener('touchmove', function(){
			moveWaveform( event.touches[0].pageX )
		});

		waveform.addEventListener('touchend', function(){
			mousestart = null;
		});
	}

	waveform.addEventListener('mousedown', function(){
		mousestart = event.clientX;
	});

	waveform.addEventListener('mousemove', function(){
		moveWaveform( event.clientX )
	});

	waveform.addEventListener('mouseup', function(){
		mousestart = null;
	});

	if( waveformRenderId == null ){
		waveformRenderId = setInterval( waveformRender, 1000 / FPS );
	}

	waveformCtx = waveform.getContext('2d');
	game.appendChild(waveform);
	game.appendChild(play_btn);

});
