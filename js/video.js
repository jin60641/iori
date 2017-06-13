inits["video"] = {
	link : null,
	init : function(){
		var wrap = $('div');
		wrap.id = "video_wrap";
		document.body.appendChild(wrap);
		var link_box = $('div');
		link_box.id = "link_box";
		wrap.appendChild(link_box);
	
		let that = this;
		if( document.URL.split('/').length == 5 ){
			that.link = document.URL.split('/').pop();
			return that.start();
		} 
		link_box.innerText = "영상을 만들고 있어요! " 
		var progress_span = $('span');
		link_box.appendChild(progress_span);
		socket.on('video_progress', function( text ){
			progress_span.innerText = text;
		});
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText == "error" ){
				link_box.innerText = "영상 제작에 실패했습니다. 관리자에게 문의해주세요 ㅠㅠ";
			} else {
				that.link = xhr.responseText;
				history.pushState(null,null,"video/" + that.link);
				that.start();
			}
		}};
		xhr.open("POST", "api/twitter/get/video", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
	},
	start : function(){
		let that = this;
		var wrap = $('#video_wrap');
		var link_box = $('#link_box');
		link_box.innerText = "https://iori.kr/v/" + that.link;
		link_box.onclick = function(){
			window.prompt("Copy to clipboard: Ctrl+C, Enter", this.innerText);
		}
		
		var video_preview = $('video');
		video_preview.id = "video_preview";
		video_preview.controls = "controls";
		video_preview.autoplay = "autoplay";
		var source = $('source');
		source.src="/v/" + that.link;
		source.type="video/mp4";
		video_preview.appendChild(source);

		wrap.appendChild(video_preview);
		
		let down_btn = $("div");
		down_btn.innerHTML = "<img src='/img/download.png'>"
		down_btn.id = "down_btn";
		wrap.appendChild(down_btn);
		down_btn.onclick = function(){
			let download = $("a");
			download.download = that.link + ".mp4";
			download.href = '/v/' + that.link;
			download.style.display = "none";
			document.body.appendChild(download);
			download.click();
			document.body.removeChild(download);
		}
		
		let tweet_btn = $("a");
		tweet_btn.innerHTML = "<img src='/img/ic_twitter.png'>"
		tweet_btn.id = "tweet_btn";
		tweet_btn.href = "https://twitter.com/intent/tweet?text=iori.kr에서 내 타임라인으로부터 영상을 만들었어요!&url=https://iori.kr/v/"+that.link
        tweet_btn.target = "_blank";
		wrap.appendChild(tweet_btn);
	},
	exit : function(){
		document.body.removeChild($('#video_wrap'));
	}
}
