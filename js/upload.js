var listenstart;
var mousestart;
var waveformRenderId;
var audioPlayId;
var audio = new Audio;
var waveformArray = [];
var FPS = 45;
var sin_index = 0;
var max = 0;
var realfile;

Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

function waveformRender() {
	var waveform = $('#waveform');
	var waveformCtx = waveform.getContext('2d');
	waveformCtx.clearRect(0, 0, waveform.width, waveform.height);
	if( waveformArray != undefined && waveformArray.length >= 1 && listenstart != null ){
		var audioCurrentTime = audio.currentTime + ( -listenstart + waveform.width / 2 ) / 6;
		var audioDuration = waveformArray.length;
		for( var i = 0; i < waveformArray.length; ++i ){
		/*
		//  if( i*6 >= -listenstart + waveform.width / 2 && i*6 <= -listenstart + waveform.width / 2 + 10 ){
				//if( i*6 / ( waveformArray.length * 5 ) < audioCurrentTime / audioDuration ){
				if( i / waveformArray.length < audioCurrentTime / audioDuration ){
					waveformCtx.fillStyle = "#ff5c26";
				} else {
					waveformCtx.fillStyle = "#FFB5AB";
				}
		//  } else {
		//	  waveformCtx.fillStyle = "#D0D9DD";
		//  }
		*/
			if( i*6 >= -listenstart + waveform.width / 2 && i*6 <= -listenstart + waveform.width / 2 + 17.5 ){
				if( i / waveformArray.length < audioCurrentTime / audioDuration ){
					waveformCtx.fillStyle = "#ff5c26";
				} else {
					waveformCtx.fillStyle = "#FFB5AB";
				}
			} else {
				waveformCtx.fillStyle = "#D0D9DD";
			}
		
			var height;
			if( max > waveform.height * (7/10) ){
				height = waveformArray[i] / (max/(waveform.height*(7/10)))
			} else {
				height = waveformArray[i];
			}
			waveformCtx.fillRect( i*6 + listenstart, ( waveform.height - height ) * (7/10), 4, height * (7/10) + 2 );
//			waveformCtx.fillRect( i*6 + listenstart, ( waveform.height - waveformArray[i]/max * ( waveform.height ) ) * (7/10), 4, waveformArray[i]/max * (7/10) * ( waveform.height ) + 2 );
			waveformCtx.fillStyle = "#000000";
			if( i%10 == 0 && i ){
				waveformCtx.fillRect( i*6 + listenstart , waveform.height * 7/10 + 2, 2 ,waveform.height * 1/10 - 6 );
				waveformCtx.textAlign = "center";
				waveformCtx.font = "16px Arial";
				waveformCtx.fillText( i, i*6 + listenstart, waveform.height * 4/5 + 15 );
			}
		}
		/*
		var val = waveformArray[Math.floor(waveformArray.length*audioCurrentTime/waveformArray.length)];
		waveformCtx.fillStyle = "#ff5c26";
		waveformCtx.fillRect( listenstart, ( waveform.height - val/max * ( waveform.height ) ) * (7/10), 4, val/max * (7/10) * ( waveform.height ) + 2 );
		*/
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



function getMusicInfo( file ){
	console.log("getMusic");
	console.log(file);
	console.log("--------");
	var audio = new Audio();
	audio.src = URL.createObjectURL(file);
	audio.controls = false;
	console.log("getMusic) waveformCreate 호출");
	var reader = new FileReader();
	reader.onload = function(e){
		console.log("getMusic reader");
		var result = reader.result;
		var ID3Size = 0;
		for( var i = 6; i <= 9; ++i ){
			ID3Size += result.charCodeAt( i ) * Math.pow( 256 , Math.abs( i - 9 ) );
		}
		result = result.substr( 0, ID3Size );
		var tit2Index = result.indexOf("TIT2");
		var tpe1Index = result.indexOf("TPE1");
		var apicIndex = result.indexOf("APIC");
		/*
		var lyricIndex = result.indexOf("USLT");
		if( lyricIndex >= 0 ){
			var lyricSize = 0;
			for( var i = 0; i <= 3; ++i ){
				lyricSize += result.charCodeAt( i + lyricIndex + 4 ) * Math.pow( 256 , Math.abs( i - 3 ) );
			}
			var lyric_str = result.substr( lyricIndex, lyricSize + 10 );

			var lyrics = "";
			var isUTF16 = 0;
			if( lyric_str.charCodeAt( 10 ) == 1 ){
				isUTF16 = 1;
			}
			for( var i = 14; i < lyricSize + 10; i += 1 + isUTF16 ){
				var charCode = lyric_str.charCodeAt(i) + lyric_str.charCodeAt(i+1)*256
				if( charCode == 12288 ){
					lyrics += "\n";
				} else if( charCode == 13 ){
					lyrics += "\r";
				} else if( charCode == 10 ){
					lyrics += "\n";
				} else {
					lyrics += String.fromCharCode(lyric_str.charCodeAt(i) + lyric_str.charCodeAt(i + 1) * 256 * isUTF16);
				}
			}
			var lyric = $("div");
			lyric.innerHTML = lyrics.replace(/\r\n/g,"\n").replace(/\n|\r/g,"<br>");
		}
		*/
		/*
		if( tit2Index >= 0 ){
			var tit2Size = 0;
			for( var i = 0; i<= 3; ++i ){
				tit2Size += result.charCodeAt( i + tit2Index + 4 ) * Math.pow( 256, Math.abs( i - 3 ) );
			}
			var tit2_str = result.substr( tit2Index, tit2Size + 10);
			var tit2 = "";
			var isUTF16 = 0;
			if( tit2_str.charCodeAt( 10 ) == 1 ){
				isUTF16 = 1;
			}
			for( var i = 13; i < tit2Size + 10; i += 1 + isUTF16 ){
				tit2 += String.fromCharCode(tit2_str.charCodeAt(i) + tit2_str.charCodeAt(i + 1) * 256 * isUTF16 );
			}
			title.value = tit2;
		}
		*/
		if( apicIndex >= 0 ){
			var apicSize = 0;
			for( var i = 0; i<= 3; ++i ){
				apicSize += result.charCodeAt( i + apicIndex + 4 ) * Math.pow( 256, Math.abs( i - 3 ) );
			}
			var apic_str = result.substr( apicIndex + 10, apicSize );
			var mimeType = apic_str.substring(1,apic_str.indexOf(String.fromCharCode(0),1));
			var imageStart;
			var img = $('#upload_img');
			if( mimeType == 'image/jpeg' ){
				imageStart = apic_str.indexOf('\xFF\xD8\xFF', 1 + mimeType.length + 1);
				img.src = "data:image/jpeg;base64," + btoa(apic_str.substr(imageStart));
			} else if( mimeType == 'image/png' ){
				imageStart = apic_str.indexOf('\x89\x50\x4E\x47\x0D\x0A\x1A\x0A', 1 + mimeType.length + 1 );
				img.src = "data:image/png;base64," + btoa(apic_str.substr(imageStart));
			}
		} else {
			var img = $('#upload_img');
			img.src = "/img/apicnone.png";
		}
		/*
		if( tpe1Index >= 0 ){
			var tpe1Size = 0;
			for( var i = 0; i<= 3; ++i ){
				tpe1Size += result.charCodeAt( i + tpe1Index + 4 ) * Math.pow( 256, Math.abs( i - 3 ) );
			}
			var tpe1_str = result.substr( tpe1Index, tpe1Size + 10);
			var tpe1 = "";
			var isUTF16 = 0;
			if( tpe1_str.charCodeAt( 10 ) == 1 ){
				isUTF16 = 1;
			}
			for( var i = 13; i < tpe1Size + 10; i += 1 + isUTF16 ){
				tpe1 += String.fromCharCode(tpe1_str.charCodeAt(i) + tpe1_str.charCodeAt(i + 1) * 256 * isUTF16 );
			}
			artist.value = tpe1;
		}
		*/
		var send = $('#upload_send');
		send.style.backgroundColor = "";
		send.style.cursor = "";
	}
	reader.readAsBinaryString(file);

}

function DragOver(evt){
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
}

function openMusic(evt){
	evt.stopPropagation();
	evt.preventDefault();
	if( event.dataTransfer ){
		event.dataTransfer.dropEffect = 'copy';
	}
	var input = event.target;
	var file;
	if( input.files ){
		file = input.files[0];
	} else {
		file = event.dataTransfer.files[0];
	}
	realfile = file;
	var reader = new FileReader();
	reader.onload = function(e){
		console.log("open Music reader result");
		console.log(reader.result);
		getMusicInfo(new Blob([reader.result]));
	}
	reader.readAsArrayBuffer( file );
	$("#label").src="";
}

window.addEventListener('load',function(){
	var name = $("div");
	name.innerText = "업로드";
	name.id = "upload_name";
	document.body.appendChild(name);
	var body = $("div");
	body.id = "upload_wrap";
	document.body.appendChild(body);
	var helper = $("div");
	helper.id = "helper";
	body.appendChild(helper);
	var form = $("form");
	form.id = "upload_form";
	var music = $("input")
	music.type = "file";
	music.accept = ".mp3";
	music.id = "upload_file";
	music.onchange = openMusic;
	music.style.display = "none";
	form.appendChild(music);
	var label = $("label");
	label.id = "label";
	label.htmlFor = "upload_file";
	label.addEventListener('dragover', DragOver, false);
	label.addEventListener('drop', openMusic, false);
	form.appendChild(label);
	var img = $("img");
	img.id = "upload_img";
	img.src = "/img/upload.png";
	label.appendChild(img);
	/*
	title = $("input")
	title.placeholder = "제목";
	title.type = "text";
	form.appendChild(title);
	artist = $("input")
	artist.placeholder = "가수";
	artist.type = "text";
	form.appendChild(artist);
	genre = $("input")
	genre.placeholder = "장르";
	genre.type = "text";
	form.appendChild(genre);
	*/
	var send = $("div")
	send.innerText = "전송하기";
	send.id = "upload_send";
	send.className = "upload_btn";
	send.style.backgroundColor = "gray";
	send.style.cursor = "initial";
	send.onclick = function(){
		if( this.style.backgroundColor == "gray" ){
			alert("파일을 선택해주세요");
//		} else if( title.value.length >= 1 && artist.value.length >= 1 && genre.value.length >= 1 ){
		} else {
			uploadMusic();
		}
	}
	form.appendChild(send);

	var ytsend = $("div")
	ytsend.id = "upload_youtube";
	ytsend.innerText = "YouTube";
	ytsend.className = "upload_btn";
	ytsend.onclick = function(){
		var url = prompt("YouTube 링크를 입력해주세요");
		if( url != null && url.length >= 1 ){
			uploadMusic(url);
		}
	}
	form.appendChild(ytsend);
	body.appendChild(form);
});

function gameStart(){
	var wrap = $("div");
	wrap.id = "wave_wrap";
	document.body.appendChild( wrap );
	$('#upload_wrap').style.display = "none";

	var play_btn = $("div");
	play_btn.innerHTML = "<img src='/img/play.jpg'>"
	play_btn.id = "play_btn";
 
	var waveform = $("canvas");
	waveform.id = "waveform";
	wrap.appendChild(waveform);

	window.onresize = function(){
		var waveform = $('#waveform');
		waveform.width = window.innerWidth;
		waveform.height = window.innerHeight / 4;
	}
	window.onresize();

	function moveWaveform(spot){
		var play_btn = $('#play_btn');
		if( spot != null && mousestart != null && audio != null && waveformArray.length >= 0 && play_btn.onclick != null ){
			listenstart += spot - mousestart;
			if( listenstart < -( waveformArray.length * 6 - window.innerWidth  * (2/4) ) ){
				listenstart = -( waveformArray.length * 6 - window.innerWidth * (2/4) );
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

	wrap.appendChild(play_btn);
	wrap.appendChild($('#upload_form'));
}


function uploadMusic( url ){
	waveformArray = [];
	audio.pause();
	if( url ){
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
				try {
					var obj = JSON.parse( xhr.responseText );
					getMusic(vid);
					loadMusicArray(obj.vals);
				} catch(e){
					alert(xhr.responseText);
				}
			}
		}};
		xhr.open("POST", "/api/audio/add/" + vid, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send();
	} else if( $('#upload_file').files[0] != null ){
		var formdata = new FormData();
		formdata.append("file",$('#upload_file').files[0]);
		/*
		formdata.append("title",title.value);
		formdata.append("artist",artist.value);
		formdata.append("genre",genre.value);
		*/
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText && xhr.responseText.length ){
				try {
					var obj = JSON.parse( xhr.responseText );
					console.log("end");
					console.log("obj");
					loadMusicArray(obj.vals);
				} catch(e){
					alert(xhr.responseText);
				}
			}
		}};
		xhr.open("POST","/api/audio/add", true); xhr.send(formdata);
		getMusic();
	}
	gameStart();
}

function getMusic( vid ){
	if( audio ){
		audio.pause();
	}
//  play_btn.onclick = null;
	audio = new Audio();
	if( vid ){
		audio.src = "/api/audio/getaudio/" + vid;
	} else {
		//audio.src = URL.createObjectURL($('#upload_file').files[0]);
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
	listenstart = (-(waveformArray.length * (2.5))) + (window.innerWidth/2);
	max = waveformArray.max();
	var waveform = $('#waveform');
	waveform.style.cursor = "move";
	if( waveformRenderId != null ){
		clearInterval( waveformRenderId );
		waveformRenderId = setInterval( waveformRender, 1000 / FPS );
	}
	socket.emit( 'game_loaded' );
	var play_btn = $('#play_btn');
	play_btn.style.cursor = "pointer";
	play_btn.onclick = function(){
		audio.src = "/api/audio/getaudio/1/" + (( -listenstart + waveform.width / 2 ) / 6) + "?" + new Date().getTime();
		//audio.currentTime = ( -listenstart + waveform.width / 2 ) / 6;
		audio.play();
	};
	sin_index = 0;
}


