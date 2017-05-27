'use strict';

inits["upload"] = {
	listenstart : null,
	mousestart : null,
	waveformRenderId : null,
	audioPlayId : null,
	audio : new Audio,
	waveformArray : [],
	FPS : 45,
	sin_index : 0,
	max : 0,
	realfile : null,
	uploading : false,
	moveWaveform : function(spot){
		let that = this;
		let play_btn = $('#play_btn');
		if( spot != null && that.mousestart != null && that.audio != null && that.waveformArray.length >= 0 && play_btn.onclick != null ){
			that.listenstart += spot - that.mousestart;
			if( that.listenstart < -( that.waveformArray.length * 6 - window.innerWidth  * (2/4) )+18 ){
				that.listenstart = -( that.waveformArray.length * 6 - window.innerWidth * (2/4) )+18;
			} else if( that.listenstart > window.innerWidth / 2 - 18){
				that.listenstart = window.innerWidth / 2 - 18;
			}
			that.mousestart = spot;
		}
	},
	waveformRender : function(){
		let waveform = $('#waveform');
		let waveformCtx = waveform.getContext('2d');
		waveformCtx.clearRect(0, 0, waveform.width, waveform.height);
		if( this.waveformArray != undefined && this.waveformArray.length >= 1 && this.listenstart != null ){
			let audioCurrentTime = this.audio.currentTime + ( -this.listenstart + waveform.width / 2 ) / 6;
			let audioDuration = this.waveformArray.length;
			for( let i = 0; i < this.waveformArray.length; ++i ){
			/*
			//  if( i*6 >= -this.listenstart + waveform.width / 2 && i*6 <= -this.listenstart + waveform.width / 2 + 10 ){
					//if( i*6 / ( this.waveformArray.length * 5 ) < audioCurrentTime / audioDuration ){
					if( i / this.waveformArray.length < audioCurrentTime / audioDuration ){
						waveformCtx.fillStyle = "#ff5c26";
					} else {
						waveformCtx.fillStyle = "#FFB5AB";
					}
			//  } else {
			//	  waveformCtx.fillStyle = "#D0D9DD";
			//  }
			*/
				if( i*6 >= -this.listenstart + waveform.width / 2 && i*6 <= -this.listenstart + waveform.width / 2 + 17.5 ){
					if( i / this.waveformArray.length < audioCurrentTime / audioDuration ){
						waveformCtx.fillStyle = "#ff5c26";
					} else {
						waveformCtx.fillStyle = "#FFB5AB";
					}
				} else {
					waveformCtx.fillStyle = "#D0D9DD";
				}
			
				let height = this.waveformArray[i];
				waveformCtx.fillRect( i*6 + this.listenstart, ( waveform.height*0.7 - height ) , 4, height );
	//			waveformCtx.fillRect( i*6 + this.listenstart, ( waveform.height - this.waveformArray[i]/this.max * ( waveform.height ) ) * (7/10), 4, this.waveformArray[i]/this.max * (7/10) * ( waveform.height ) + 2 );
				waveformCtx.fillStyle = "#000000";
				if( i%10 == 0 && i ){
					waveformCtx.fillRect( i*6 + this.listenstart , waveform.height * 7/10 + 2, 2 ,waveform.height * 1/10 - 6 );
					waveformCtx.textAlign = "center";
					waveformCtx.font = "16px Arial";
					waveformCtx.fillText( i, i*6 + this.listenstart, waveform.height * 4/5 + 15 );
				}
			}
			/*
			let val = this.waveformArray[Math.floor(this.waveformArray.length*audioCurrentTime/this.waveformArray.length)];
			waveformCtx.fillStyle = "#ff5c26";
			waveformCtx.fillRect( this.listenstart, ( waveform.height - val/this.max * ( waveform.height ) ) * (7/10), 4, val/this.max * (7/10) * ( waveform.height ) + 2 );
			*/
		} else {
			let sections = waveform.width;
			for( let i = 0; i < sections; i += 7 ){
				let x = i;
				let sin = Math.sin(( x*(1920/window.innerWidth) + this.sin_index*6 )/(480)) * waveform.height;
				sin = waveform.height / 2 + sin/2;
				waveformCtx.save();
				waveformCtx.globalAlpha = 0.5;
				waveformCtx.fillStyle = "#ff5c26";
				waveformCtx.fillRect( x, waveform.height - sin , 4, sin );
				waveformCtx.fillStyle = "#f15c3e";
				waveformCtx.fillRect( x, sin, 4, waveform.height - sin );
				waveformCtx.restore();
			}
			this.sin_index += 10;
		}
	},
	getMusicInfo : function( file ){
		console.log("getMusic");
		console.log(file);
		console.log("--------");
		let audio = new Audio();
		audio.src = URL.createObjectURL(file);
		audio.controls = false;
		console.log("getMusic) waveformCreate 호출");
		let reader = new FileReader();
		reader.onload = function(e){
			console.log("getMusic reader");
			let result = reader.result;
			let ID3Size = 0;
			for( let i = 6; i <= 9; ++i ){
				ID3Size += result.charCodeAt( i ) * Math.pow( 256 , Math.abs( i - 9 ) );
			}
			result = result.substr( 0, ID3Size );
			let tit2Index = result.indexOf("TIT2");
			let tpe1Index = result.indexOf("TPE1");
			let apicIndex = result.indexOf("APIC");
			/*
			let lyricIndex = result.indexOf("USLT");
			if( lyricIndex >= 0 ){
				let lyricSize = 0;
				for( let i = 0; i <= 3; ++i ){
					lyricSize += result.charCodeAt( i + lyricIndex + 4 ) * Math.pow( 256 , Math.abs( i - 3 ) );
				}
				let lyric_str = result.substr( lyricIndex, lyricSize + 10 );
	
				let lyrics = "";
				let isUTF16 = 0;
				if( lyric_str.charCodeAt( 10 ) == 1 ){
					isUTF16 = 1;
				}
				for( let i = 14; i < lyricSize + 10; i += 1 + isUTF16 ){
					let charCode = lyric_str.charCodeAt(i) + lyric_str.charCodeAt(i+1)*256
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
				let lyric = $("div");
				lyric.innerHTML = lyrics.replace(/\r\n/g,"\n").replace(/\n|\r/g,"<br>");
			}
			*/
			/*
			if( tit2Index >= 0 ){
				let tit2Size = 0;
				for( let i = 0; i<= 3; ++i ){
					tit2Size += result.charCodeAt( i + tit2Index + 4 ) * Math.pow( 256, Math.abs( i - 3 ) );
				}
				let tit2_str = result.substr( tit2Index, tit2Size + 10);
				let tit2 = "";
				let isUTF16 = 0;
				if( tit2_str.charCodeAt( 10 ) == 1 ){
					isUTF16 = 1;
				}
				for( let i = 13; i < tit2Size + 10; i += 1 + isUTF16 ){
					tit2 += String.fromCharCode(tit2_str.charCodeAt(i) + tit2_str.charCodeAt(i + 1) * 256 * isUTF16 );
				}
				title.value = tit2;
			}
			*/
			if( apicIndex >= 0 ){
				let apicSize = 0;
				for( let i = 0; i<= 3; ++i ){
					apicSize += result.charCodeAt( i + apicIndex + 4 ) * Math.pow( 256, Math.abs( i - 3 ) );
				}
				let apic_str = result.substr( apicIndex + 10, apicSize );
				let mimeType = apic_str.substring(1,apic_str.indexOf(String.fromCharCode(0),1));
				let imageStart;
				let img = $('#upload_img');
				if( mimeType == 'image/jpeg' ){
					imageStart = apic_str.indexOf('\xFF\xD8\xFF', 1 + mimeType.length + 1);
					img.src = "data:image/jpeg;base64," + btoa(apic_str.substr(imageStart));
				} else if( mimeType == 'image/png' ){
					imageStart = apic_str.indexOf('\x89\x50\x4E\x47\x0D\x0A\x1A\x0A', 1 + mimeType.length + 1 );
					img.src = "data:image/png;base64," + btoa(apic_str.substr(imageStart));
				}
			} else {
				let img = $('#upload_img');
				img.src = "/img/apicnone.png";
			}
			/*
			if( tpe1Index >= 0 ){
				let tpe1Size = 0;
				for( let i = 0; i<= 3; ++i ){
					tpe1Size += result.charCodeAt( i + tpe1Index + 4 ) * Math.pow( 256, Math.abs( i - 3 ) );
				}
				let tpe1_str = result.substr( tpe1Index, tpe1Size + 10);
				let tpe1 = "";
				let isUTF16 = 0;
				if( tpe1_str.charCodeAt( 10 ) == 1 ){
					isUTF16 = 1;
				}
				for( let i = 13; i < tpe1Size + 10; i += 1 + isUTF16 ){
					tpe1 += String.fromCharCode(tpe1_str.charCodeAt(i) + tpe1_str.charCodeAt(i + 1) * 256 * isUTF16 );
				}
				artist.value = tpe1;
			}
			*/
			let send = $('#upload_send');
			send.style.backgroundColor = "";
			send.style.cursor = "";
		}
		reader.readAsBinaryString(file);
	},
	DragOver : function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
	},
	openMusic : function(evt){
		let that = this;
		evt.stopPropagation();
		evt.preventDefault();
		if( event.dataTransfer ){
			event.dataTransfer.dropEffect = 'copy';
		}
		let input = event.target;
		let file;
		if( input.files ){
			file = input.files[0];
		} else {
			file = event.dataTransfer.files[0];
		}
		this.realfile = file;
		let reader = new FileReader();
		reader.onload = function(e){
			console.log("open Music reader result");
			console.log(reader.result);
			that.getMusicInfo(new Blob([reader.result]));
		}
		reader.readAsArrayBuffer( file );
		$("#label").src="";
	},
	init : function(){
		let that = this;
		$('#body').style.display = "none";
		let name = $("div");
		name.innerText = "업로드";
		name.id = "upload_name";
		document.body.appendChild(name);
	
		let wave_wrap = $("div");
		wave_wrap.id = "wave_wrap";
		wave_wrap.style.display = "none";
		document.body.appendChild( wave_wrap );
	
	
		let body = $("div");
		body.id = "upload_wrap";
		document.body.appendChild(body);
		let helper = $("div");
		helper.id = "helper";
		body.appendChild(helper);
		let form = $("form");
		form.id = "upload_form";
		let music = $("input")
		music.type = "file";
		music.accept = ".mp3";
		music.id = "upload_file";
		music.onchange = function(e){
			that.openMusic(e);
		}
		music.style.display = "none";
		form.appendChild(music);
		let label = $("label");
		label.id = "label";
		label.htmlFor = "upload_file";
		label.addEventListener('dragover', function(e){
			that.DragOver(e);
		}, false);
		label.addEventListener('drop', function(e){
			that.openMusic(e);
		}, false);
		form.appendChild(label);
		let img = $("img");
		img.onclick = function(e){
			label.click();
			e.preventDefault();
			e.stopPropagation();
		}
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
		let send = $("div")
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
				that.uploadMusic();
			}
		}
		form.appendChild(send);
	
		let ytsend = $("div")
		ytsend.id = "upload_youtube";
		ytsend.innerText = "YouTube";
		ytsend.className = "upload_btn";
		ytsend.onclick = function(){
			let url = prompt("YouTube 링크를 입력해주세요");
			if( url != null && url.length >= 1 ){
				that.uploadMusic(url);
			}
		}
		form.appendChild(ytsend);
		body.appendChild(form);
	
		let waveform = $("canvas");
		waveform.id = "waveform";
		wave_wrap.appendChild(waveform);
	
		let play_btn = $("div");
		play_btn.innerHTML = "<img src='/img/play.jpg'>"
		play_btn.id = "play_btn";
		wave_wrap.appendChild(play_btn);
	
		window.onresize = function(){
			let waveform = $('#waveform');
			waveform.width = window.innerWidth;
			waveform.height = window.innerHeight / 4;
		}
		window.onresize();
		if( 'ontouchstart' in window ){
			waveform.addEventListener('touchstart', function(){
				that.mousestart = event.touches[0].pageX;
			});
	
			waveform.addEventListener('touchmove', function(){
				that.moveWaveform( event.touches[0].pageX )
			});
	
			waveform.addEventListener('touchend', function(){
				that.mousestart = null;
			});
		}
	
		waveform.addEventListener('mousedown', function(){
			that.mousestart = event.clientX;
		});
	
		waveform.addEventListener('mousemove', function(){
			that.moveWaveform( event.clientX )
		});
	
		waveform.addEventListener('mouseup', function(){
			that.mousestart = null;
		});

		if( that.waveformRenderId == null ){
			that.waveformRenderId = setInterval( function(){
				that.waveformRender()
			}, 1000 / this.FPS );
		}
	},
	gameStart : function(){
		let wrap = $('#wave_wrap');
		wrap.style.display = "block";
		$('#upload_wrap').className = "wrap_started";
	},
	uploadMusic : function( url ){
		let that = this;
		if( this.uploading == true ){
			alert("현재 업로드가 완료된 뒤 시도해주세요");
			return false;
		}
		this.uploading = true;
		this.waveformArray = [];
		this.audio.pause();
		if( url ){
			let vid;
			let vindex;
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
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
				if( xhr.responseText && xhr.responseText.length ){
					try {
						let obj = JSON.parse( xhr.responseText );
						that.getMusic(vid);
						that.loadMusicArray(obj.vals,vid);
					} catch(e){
						console.log(e);
						alert(xhr.responseText);
					}
				}
			}};
			xhr.open("POST", "/api/audio/add/" + vid, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
			xhr.send();
			that.gameStart();
			$('#play_btn').onclick = null;
		} else if( realfile != null ){
			let formdata = new FormData();
			formdata.append("file",realfile);
			/*
			formdata.append("title",title.value);
			formdata.append("artist",artist.value);
			formdata.append("genre",genre.value);
			*/
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
				if( xhr.responseText && xhr.responseText.length ){
					try {
						let obj = JSON.parse( xhr.responseText );
						that.loadMusicArray(obj.vals);
					} catch(e){
						alert(xhr.responseText);
					}
				}
			}};
			xhr.open("POST","/api/audio/add", true); xhr.send(formdata);
			that.getMusic();
			that.gameStart();
			$('#play_btn').onclick = null;
		}
	},
	getMusic : function( vid ){
		if( this.audio ){
			this.audio.pause();
		}
	//  play_btn.onclick = null;
		let audio = new Audio();
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
			audio.currentTime = - (this.listenstart - window.innerWidth/2 ) / 5;
					*/
			clearInterval( this.audioPlayId );
			this.audioPlayId = setInterval( function(){
				if( audio == null ){
					clearInterval( this.audioPlayId );
				} else if( audio.currentTime  - ( - (this.listenstart - window.innerWidth/2 ) / 5 ) >= 2 ){
					/*
					audio.pause();
					clearInterval( this.audioPlayId );
					*/
				}
			}, 10);
		}
	},
	loadMusicArray : function( data, vid ){
		let that = this;
		this.uploading = false;
		this.waveformArray = data;
		let waveform = $('#waveform');
		this.listenstart = (-(this.waveformArray.length * (2.5))) + (window.innerWidth/2);
		this.max = Math.max.apply(null, this.waveformArray );
		for( let i = 0; i < this.waveformArray.length; ++i ){
			this.waveformArray[i] = this.waveformArray[i]/this.max*waveform.height*(7/10);
		}
		waveform.style.cursor = "move";
		if( that.waveformRenderId != null ){
			clearInterval( this.waveformRenderId );
			that.waveformRenderId = setInterval( function(){
				that.waveformRender();
			}, 1000 / this.FPS );
		}
		socket.emit( 'game_loaded' );
		let play_btn = $('#play_btn');
		play_btn.style.cursor = "pointer";
		play_btn.onclick = function(){
			if( vid ){
				that.audio.src = "/api/audio/getaudio/youtube/" + vid + "/" + (( -that.listenstart + waveform.width / 2 ) / 6) + "?" + new Date().getTime();
			} else {
				that.audio.src = "/api/audio/getaudio/1/" + (( -that.listenstart + waveform.width / 2 ) / 6) + "?" + new Date().getTime();
			}
			//audio.currentTime = ( -this.listenstart + waveform.width / 2 ) / 6;
			that.audio.play();
		};
		this.sin_index = 0;
	}
}
