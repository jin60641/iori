var listenstart;
var mousestart;
var waveformRenderId;
var audioPlayId;
var audio;
var waveformArray;
var FPS = 45;
var sin_index = 0;

function makeExam( exam ){
	var exams = document.getElementsByClassName("example")
	for( var i = exams.length - 1; i >= 0; --i ){
		exams[i].parentNode.removeChild(exams[i]);
	}
	for( var i = 0; i < exam.length; ++i ){
		var example = document.createElement("div");
		example.className = "example";
		example.id = exam[i];
		var number = document.createElement("div");
		number.className = "number";
		number.innerHTML = i+1;
		example.appendChild(number);
		var title = document.createElement("div");
		title.className = "title";
		switch(i){
			case 0: title.innerText="로";
				break;
			case 1: title.innerText="딩";
				break;
			case 2: title.innerText="중";
				break;
			case 3: title.innerText="^_^";
				break;
		}
		example.appendChild(title);
		game.appendChild(example);
	}
}

function waveformRender() {
	waveformCtx.clearRect(0, 0, waveform.width, waveform.height);
	if( waveformArray != undefined && waveformArray.length >= 1 && listenstart != null ){
		var audioCurrentTime = audio.currentTime;
		var audioDuration = audio.duration;
		for( var i = 0; i < waveformArray.length; ++i ){
			if( i*2 >= -listenstart + waveform.width / 2 && i*2 <= -listenstart + waveform.width / 2 + 10 ){
				if( i*2 / ( audio.duration * 5 ) < audioCurrentTime / audioDuration ){
					waveformCtx.fillStyle = "#ff5c26";
				} else {
					waveformCtx.fillStyle = "#FFB5AB";
				}
			} else {
				waveformCtx.fillStyle = "#D0D9DD";
			}
			waveformCtx.fillRect( i*2 + listenstart, ( waveform.height - waveformArray[i] * ( waveform.height ) ) * (7/10), 4, waveformArray[i] * (7/10) * ( waveform.height ) + 2 );
			waveformCtx.fillStyle = "#000000";
			if( (i*2 - 2)%50 == 0 ){
				waveformCtx.fillRect( i*2 + listenstart , waveform.height * 7/10, 2 ,waveform.height * 1/10);
				waveformCtx.textAlign = "center";
				waveformCtx.font = "20px Arial";
				waveformCtx.fillText( ((i*2 - 2)/5), i*2 - 2 + listenstart, waveform.height * 4/5 + 15 );
			//} else {
			//	waveformCtx.fillRect( i*2 + listenstart, waveform.height * 3/5, 1 ,waveform.height * 1/5 - 10);
			}
		}
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

function uploadMusic(){
	var vid =  "eZ-S1AUZCVM";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText && xhr.responseText.length ){
			var vals = JSON.parse( xhr.responseText );
			loadMusicArray(vals);
		}
	}};
	xhr.open("POST", "/api/audio/add/" + vid, false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
}

function getMusic(){
	if( audio ){
		audio.pause();
		timegraph.style.transition = "";
		timegraph.style.backgroundPosition = "0"; 
	}
//	play_btn.onclick = null;
	audio = new Audio();
	audio.src = "/api/audio/getaudio";
	audio.onloadedmetadata = function(){
		listenstart = (-(audio.duration * (2.5))) + (window.innerWidth/2);
	}
	audio.controls = false;
	audio.autoplay = false;
	audio.loop = false;
	audio.onplay = function(){
		play_btn.style.cursor = "default";
		play_btn.onclick = null;
		waveform.style.cursor="initial";
		audio.currentTime = - (listenstart - window.innerWidth/2 ) / 5;
		clearInterval( audioPlayId );	
		audioPlayId = setInterval( function(){
			if( audio == null ){
				clearInterval( audioPlayId );
			} else if( audio.currentTime  - ( - (listenstart - window.innerWidth/2 ) / 5 ) >= 2 ){
				audio.pause();
				clearInterval( audioPlayId );	
			}
		}, 10);
	}
}

function loadMusicArray( data ){
	waveformArray = data;
	timegraph.style.transition = "10s linear";
	timegraph.style.backgroundPosition = "100%"; 

	waveform.style.cursor="move";
	if( waveformRenderId != null ){
		clearInterval( waveformRenderId );
		waveformRenderId = setInterval( waveformRender, 1000 / FPS );
	}
	var examples = document.getElementsByClassName("example");
	for( var i = examples.length - 1; i >= 0; --i ){
		examples[i].lastChild.innerHTML = examples[i].id;
		examples[i].onclick = function(){
			var examples = document.getElementsByClassName("example");
			for( var j = examples.length - 1; j >= 0; --j ){
				examples[j].onclick = "";
			}
			listenstart = null;
			timegraph.style.transition = "";
			timegraph.style.backgroundPosition = "0"; 
			socket.emit('game_answer', this.lastChild.innerText);
		}
	}
	socket.emit( 'game_loaded' );
	play_btn.style.cursor = "pointer";
	play_btn.onclick = function(){
		audio.play();
	};
	sin_index = 0;
}

window.addEventListener('load',function(){
});
