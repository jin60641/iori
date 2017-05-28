'use strict';

inits["share"] = {
	listeners : [],
	start : parseInt(document.URL.split('/')[4]),
	end : parseInt(document.URL.split('/')[5]),
	lastClickImg : undefined,
	fileArray : [],
	imageArray : [],
	imageTimeArray : [],
	colorArray : [],
	srcArray : [],
	subitles : null,
	subtitleTimeArray : [],
	subtitleArray : [],
	startSubtitleIndex : 0,
	audio : new Audio(),
	FPS : 30,
	RenderId : null,
	decode : function(str){
		if(str && typeof str === 'string') {
			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
			str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
			var element = $('div');
			element.innerHTML = str;
			str = element.textContent;
		}
		return str;
	},
	loadSubtitle : function(){
		let that = this;
		let index = 0;
		let subIndex = 0;
		let strArr = that.subtitles.split('\n');
		for (var i = 0; i < strArr.length; ++i ) {
			if (strArr[i].indexOf("--&gt") != -1) {
				subIndex = i + 1;
				var time = hmsTos(strArr[i].substring(0,12));
				if( time < that.start ){
					that.startSubtitleIndex++;
					continue;
				} else if ( time >= that.end ){
					continue;
				}
				that.subtitleTimeArray[index] = Math.floor((time-that.start)*1000)/1000;
				while( subIndex < strArr.length && (strArr[subIndex].indexOf("--&gt") == -1) ) {
					subIndex++;
				}
				that.subtitleArray[index] = "";
				if (subIndex == strArr.length) {
					for (var j = i + 1; j < subIndex; ++j) {
						that.subtitleArray[index] += that.decode(strArr[j]) + "\n";
					}
				} else {
					for (var j = i + 1; j < subIndex - 2; ++j) {
						that.subtitleArray[index] += that.decode(strArr[j]) + "\n";
					}
				}
				var div = $('div');
				div.onclick = function(){
					that.audio.currentTime = hmsTos(this.innerText.substring(0,12))+0.01;
				}
				div.innerHTML += that.sTohms(that.subtitleTimeArray[index]) + "</br>" + that.subtitleArray[index].replace(/\n/g,"</br>") + "</br>";
				$('#subtitle_box').appendChild(div);
				index = index + 1;
				i = subIndex-1;
			}
		}
	},
	sortArr : function(){
		let that=this;
		var index = 0;
		for (index = 0; index < that.imageTimeArray.length - 1; index++) {
			if (index < 0) {
				index = 0;
			}
			if (that.imageTimeArray[index] > that.imageTimeArray[index + 1]) {
				var tmp_ = that.imageTimeArray[index];
				that.imageTimeArray[index] = that.imageTimeArray[index + 1];
				that.imageTimeArray[index + 1] = tmp_;
				tmp_ = that.imageArray[index];
				that.imageArray[index] = that.imageArray[index + 1];
				that.imageArray[index + 1] = tmp_;
				index = index -2;
			}
		}
	},
	checkVideoTime: function(Time){
		let that=this;
		if(that.imageTimeArray.length == 1){// 이미지 하나만 넣었을때
			return 0;
		}
		for(var videoIndex = 0; videoIndex < that.imageTimeArray.length - 1; videoIndex++){
			if(that.imageTimeArray[videoIndex] <= Time && Time <= that.imageTimeArray[videoIndex + 1]){
				return videoIndex;
			}
		}
		return that.imageTimeArray.length - 1;
	},
	checkSubtitleTime : function(Time){
		let that=this;
		if( that.subtitleTimeArray[0] > Time ){
			return -1;
		}
		if( that.subtitleTimeArray.length == 1){// 자막 하나만 넣었을때
			return 0;
		}
		for(var subtitleIndex = 0; subtitleIndex < that.subtitleTimeArray.length - 1; subtitleIndex++){
			if(that.subtitleTimeArray[subtitleIndex] <= Time && Time <= that.subtitleTimeArray[subtitleIndex + 1]){
				return subtitleIndex;
			}
		}
		return that.subtitleTimeArray.length - 1;
	},
	Render : function(){
		let that = this;
		//that.sortArr();
		let canvas = $('#canvas');
		let ctx = canvas.getContext('2d');
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,0,640,640);
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "center";
		if( that.imageArray.length > 0 ){
			var tmpImage = new Image();
			tmpImage.src = that.srcArray[that.imageArray[that.checkVideoTime(that.audio.currentTime)]];
			ctx.drawImage(tmpImage,0,0,640,480);
		}
		if( that.subtitleArray.length != 0 ){
			var sub_i = that.checkSubtitleTime(that.audio.currentTime);
			if( sub_i >= 0 ){
				that.drawTextBox(ctx,that.subtitleArray[sub_i], 320, 370,640,1.2);
			}
		}
	
		canvas = $('#seek_bar');
		ctx = canvas.getContext('2d');
		ctx.font = '24px Calibr1i'
		var seconds = 0;
		var nextseconds = 0;
		ctx.clearRect(0,0,640,100);
		if (that.imageArray.length != 0) {
			for (var i = 0; i < that.imageTimeArray.length; ++i) {
				seconds = that.imageTimeArray[i];
				if ((i + 1) == that.imageTimeArray.length) {
					nextseconds = that.duration;
				} else {
					nextseconds = that.imageTimeArray[i + 1];
				}
				ctx.fillStyle = "rgb(" + that.colorArray[that.imageArray[i]].r + "," + that.colorArray[that.imageArray[i]].g + "," + that.colorArray[that.imageArray[i]].b + ")";
				ctx.fillRect((seconds / that.duration) * 640, 0,((nextseconds - seconds) / that.duration) * 640 , 300 );
			}
		}
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,95,(that.audio.currentTime / that.duration) * 640,5);
	},
	drawTextBox : function(ctx, text, x, y, fieldWidth, spacing) {
		var line = "";
		var fontSize = parseFloat(ctx.font);
		ctx.fillStyle = "#ffffff";
		var currentY = y;
		ctx.textBaseline = "top";
		for(var i=0; i<text.length; i++) {
			var tempLine = line + text[i];
			var tempWidth = ctx.measureText(tempLine).width;
			if (tempWidth < fieldWidth && text[i] != '\n') {
				line = tempLine;
			}
			else {
				ctx.fillText(line, x, currentY);
				if(text[i] != '\n') line = text[i];
				else line = "";
				currentY += fontSize*spacing;
			}
		}
		ctx.fillText(line, x, currentY);
		ctx.stroke();
		/*
		ctx.fillStyle = "#cccccc";
		ctx.fillRect(0, y, fieldWidth, currentY-y+fontSize*spacing);
		*/
	},
	init : function(){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText && xhr.responseText.length ){
				that.subtitles = xhr.responseText;
				that.start();
			} else {
				alert("가사가 존재하지 않습니다. 제목곽 가수를 정확히 입력하여 다시 업로드해주세요.");
				getPage('/upload');
			}
		}};
		xhr.open("POST","/api/subtitle/get", true); xhr.send();
	},
	start : function(){
		let that=this;
		that.duration = that.end - that.start,
		that.addListener(window,'click',function(e){
			that.lastClickImg = null;
		});
		this.audio.src = "/audio/" + session.id + "_short.mp3?" + new Date().getTime();
		var body = $('div');
		body.id = "share_wrap";
		document.body.appendChild(body);
		var subtitle_box = $('div');
		subtitle_box.id = "subtitle_box";
		body.appendChild(subtitle_box);
	
		var wrap = $('div');
		wrap.id = "wrap";
		var canvas = $('canvas');
		canvas.onclick = function(){
			if( that.audio.paused ){
				that.audio.play();
			} else {
				that.audio.pause();
			}
		}
		canvas.width = "640";
		canvas.height = "480";
		canvas.id = "canvas";
		that.RenderId = setInterval( function(){
			that.Render();
		}, 1000/that.FPS );
		wrap.appendChild(canvas);
	
		var bar = $('canvas');
		bar.id = "seek_bar";
		bar.onclick = function(e){
			e.stopPropagation();
			if( that.lastClickImg == undefined ){
				that.audio.currentTime = Math.floor(((e.offsetX / 640) * that.duration) * 1000)/1000;
			}  else {
				if (that.imageTimeArray.length == 0) {
					that.imageTimeArray.push(0);
				} else {
					that.imageTimeArray.push( Math.floor(((e.offsetX / 640) * that.duration) * 1000)/1000 );
				}
				that.imageArray.push(that.lastClickImg);
			
				that.lastClickImg = undefined;
			}
		}
		bar.width = "640";
		bar.height = "100";
		wrap.appendChild(bar);
		body.appendChild(wrap);
	
		var img_preview = $('div');
		img_preview.id = "img_preview";
		img_preview.addEventListener('drop', function(e){
			that.openfile(e);
		}, false);
		img_preview.addEventListener('paste', function(e){
			that.openfile(e);
		}, false);
		img_preview.addEventListener('dragover', function(e){
			that.DragOver(e);
		}, false);
		img_preview.addEventListener('dragleave', function(e){
			that.DragOut(e);
		}, false);
		img_preview.addEventListener('mouseout', function(e){
			that.DragOut(e);
		}, false);
		body.appendChild(img_preview);


		var btn_wrap = $('div');
		btn_wrap.id = "btn_wrap";
		var save_btn = $('div');
		save_btn.id = "save_btn";
		save_btn.onclick = function(){
			that.saveVideo();
		}	
		var save_img = $('img');
		save_img.src = "/img/download.png";
		save_btn.appendChild(save_img);
		btn_wrap.appendChild(save_btn);
		body.appendChild(btn_wrap);

		that.loadSubtitle();
	},
	sTohms : function( second ){
		var msec = second*1000;
		var sec = Math.floor(msec/1000);
		var h = Math.floor(sec/3600);
		var m = Math.floor(sec%3600/60);
		var s = sec%60;
		var ms = Math.floor(msec%1000);
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
	},
	hmsTos : function(timeStr) {
		if (timeStr.length != 12) {
			return timeStr;
		}
		var time_h = parseInt(timeStr.substring(0,2));
		var time_m = parseInt(timeStr.substring(3,5));
		var time_s = parseInt(timeStr.substring(6, 8));
		var time_ms = timeStr.substring(9,12);
		time_ms = parseInt(time_ms)/1000;
	 	var resultTime = (time_h * 3600) + (time_m * 60) + (time_s) + time_ms;
		return resultTime;
	},
	saveVideo : function(){
		let that = this;
		let formdata = new FormData();
		formdata.append('start',that.start);
		formdata.append('duration', that.end - that.start);
		formdata.append('imagetimearray',that.imageTimeArray.toString());
		for( var i = 0; i <  that.fileArray.length; ++i ){
			formdata.append('file',that.fileArray[that.imageArray[i]]);
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText && xhr.responseText.length ){
				let download = $("a");
				download.download = "test" + "." + "mp4";
				download.href = '/api/video/get';
				download.style.display = "none";
				document.body.appendChild(download);
				download.click();
				document.body.removeChild(download);
			}
		}};
		xhr.open("POST","/api/video/get", true); xhr.send(formdata);
	},
	DragOut : function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		let obj = evt.target.style;
		obj.margin = "";
		obj.borderTop="";
		obj.borderBottom="";
		obj.borderLeft="";
		obj.borderRight="";
	},
	DragOver : function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
		let obj = evt.target.style;
		obj.border="1px dashed #bbb";
	},
	openfile : function(event){
		if( event.dataTransfer ){
			event.dataTransfer.dropEffect = 'copy';
		}
		let input = event.target;
		let output = $('#img_preview');
		let files = [];
		if( input.files ){
			files = input.files;
		} else {
			if( event.clipboardData ){
				let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
				for( let i = 0; i < items.length; ++i ){
					if( items[i].type.indexOf("image") === 0 ){
						files.push( items[i].getAsFile() );
					}
				}
			} else {
				files = event.dataTransfer.files;
			}
		}
		if( files.length ){
			event.stopPropagation();
			event.preventDefault();
		}
		for( let i = 0; i < files.length; ++i ){
			if( that.fileArray.length > 20 ){
				alert("사진은 최대 20장까지만 업로드 가능합니다.");
				return 0;
			}
			that.fileArray.push(files[i]);
			that.colorArray.push({ r : Math.floor(Math.random()*255), g : Math.floor(Math.random()*255),b : Math.floor(Math.random()*255)});
			let reader = new FileReader();
			reader.addEventListener("load",function(e){
				let imgbox = $('div');
				imgbox.id = "imgbox_" + ( output.childElementCount + 1 );
				imgbox.className = "imgbox";
				imgbox.addEventListener("dragstart",function(evt){
					evt.stopPropagation();
					evt.preventDefault();
					return false;
				});
				imgbox.onclick = function (e) {
					e.stopPropagation();
					var imgIndex = Number(this.id.substring(7,this.id.length)) - 1;
					that.lastClickImg = imgIndex;
//					this.style.backgroundColor = '#FFF4E9';
				}
				let dataURL = e.target.result;
				output.appendChild(imgbox);
				imgbox.style.background="url('"+dataURL+"') center center no-repeat"
				srcArray.push(dataURL);
				imgbox.style.backgroundSize="cover";
				imgbox.style.backgroundClip="content-box";
				imgbox.addEventListener('drop', function(e){
					e.preventDefault();
					e.stopPropagation();
				}, false);
				imgbox.addEventListener('paste', function(e){
					e.preventDefault();
					e.stopPropagation();
				}, false);
				imgbox.addEventListener('dragover', function(e){
					e.preventDefault();
					e.stopPropagation();
				}, false);
				imgbox.addEventListener('dragleave', function(e){
					e.preventDefault();
					e.stopPropagation();
				}, false);
				let deletebtn = $("div");
				deletebtn.className='imgbox_delete';
				deletebtn.onclick = function(){
					alert("개발중");
					// delte img
				};
				imgbox.appendChild(deletebtn);
				if(input.type=="file"){
					input.value="";
				}
			});
			reader.readAsDataURL(files[i]);
		}
	},
	addListener : function( element, event, handle ){
		element.addEventListener( event, handle, false );
		this.listeners.push({ element : element, event : event, handle : handle });
	},
	exit : function(){
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = this.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		document.body.removeChild($('#share_wrap'));
	}
}
