inits["video"] = {
	init : function(){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			that.links = JSON.parse(xhr.responseText);
			if( that.links.length ){
				that.start();
			} else {
				location.href = "/";
			}
		}};
		xhr.open("POST", "api/twitter/get/video", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
	},
	start : function(){
		var wrap = $('div');
		wrap.id = "video_wrap";
		var img_preview = $('div');
		img_preview.id = "img_preview";
		wrap.appendChild(img_preview);
		for( var i = 0; i < this.links.length; ++i ){
			var img = $('div');
			img.className = "imgbox";
			img.style.backgroundImage = 'url("' +  this.links[i] + '")';
			img_preview.appendChild(img);
		}
		document.body.appendChild(wrap);
	},
	exit : function(){
		document.body.removeChild($('#video_wrap'));
	}
}
