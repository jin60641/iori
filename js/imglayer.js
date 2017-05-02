'use strict';

inits["imglayer"] = {
	imgviewing : 0,
	listeners : [],
	init : function(){
		let that = this;
		let imglayer = $("div");
		imglayer.id="imglayer";
		imglayer.addEventListener('transitionend', function(){ if(this.style.opacity=="0"){
			this.style.zIndex="-500";
		} else {
			this.style.visibility="visibile";
		}});
		imglayer.onclick = function(evt){
			if(document.webkitIsFullScreen){
				evt.stopPropagation();
				evt.preventDefault();
			} else {
				imglayer.style.zIndex="300";
				imglayer.style.opacity="0";
				that.imgviewing=0;
				lefthover.style.display="none";
				righthover.style.display="none";
				imgmenuhover.style.display="none";
				document.body.style.overflowY = "";
				document.body.style.position = "";
			}
		}
		let rightbtn = $("div");
		rightbtn.onclick = function(e){
			e.stopPropagation();
			e.preventDefault();
			let imgbox = $('#imgbox');
			let imgdownload = $('#imgdownload');
			let img = $("#imglayer_img");
			if( img != undefined ){
				let params = { 
					flag : "gt",
					type : location.hash.substr(1,1),
					dialog_id : location.hash.split('?')[1],
					now : img.src.split('/').pop()
				}
				let query = "";
				let param_key = Object.keys(params);
				for( let i = 0; i < param_key.length; ++i ){
					query += param_key[i] + '=' + params[param_key[i]] + "&";
				}
				let xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
					if( xhr.responseText != "" ){
						let src = "/files/chat/" + xhr.responseText;
						let image = new Image();
						image.src = src;
						img.src = "";
						let wait = setInterval( function(){
							let w = image.naturalWidth ;
							let h = image.naturalHeight;
							if( w && h ){
								clearInterval(wait);
								img.src = src;
							}
						},10);
					}
				}}
				xhr.open("POST", "/api/chat/getfile", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
			} else {
				for( let j = imgbox.childNodes.length - 1 ; j>=1; --j ){
					if(imgbox.childNodes[j].style.display == "inline-block" ){
						let postid = imgbox.childNodes[1].src.split("post/")[1].split("/")[0];
						imgbox.childNodes[j].style.display = "none";
						if(imgbox.childNodes[j+1]){
							imgbox.childNodes[j+1].style.display = "inline-block";
							imgdownload.download=postid+'_'+ ( j + 1 ) +''
							imgdownload.href=imgbox.childNodes[j + 1].src;
							break;
						} else {
							imgbox.childNodes[1].style.display = "inline-block";
							imgdownload.download=postid+'_'+ 1 +''
							imgdownload.href=imgbox.childNodes[1].src;
							break;
						}
					}
				}
			}
		}
		let righthover = $("div");
		righthover.onclick = rightbtn.onclick;
		righthover.id = "righthover";
		imglayer.appendChild(righthover);
		rightbtn.id = "rightbtn";
		imglayer.appendChild(rightbtn);
		let leftbtn = $("div");
		leftbtn.onclick = function(e){
			e.stopPropagation();
			e.preventDefault();
			let imgbox = $('#imgbox');
			let imgdownload = $('#imgdownload');
			let img = $("#imglayer_img");
			if( img != undefined ){
				let params = {
					flag : "lt", 
					type : location.hash.substr(1,1),
					dialog_id : location.hash.split('?')[1],
					now : img.src.split('/').pop()
				}
				let query = "";
				let param_key = Object.keys(params);
				for( let i = 0; i < param_key.length; ++i ){
					query += param_key[i] + '=' + params[param_key[i]] + "&";
				}
				let xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
					if( xhr.responseText ){
						let src = "/files/chat/" + xhr.responseText;
						let image = new Image();
						image.src = src;
						img.src = "";
						let wait = setInterval( function(){
							let w = image.naturalWidth ;
							let h = image.naturalHeight;
							if( w && h ){
								clearInterval(wait);
								img.src = src;
							}
						},10);
					}
				}}
				xhr.open("POST", "/api/chat/getfile", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);		
			} else {
				for( let j=1; j<imgbox.childNodes.length; ++j ){
					if(imgbox.childNodes[j].style.display == "inline-block" ){
						let postid = imgbox.childNodes[1].src.split("post/")[1].split("/")[0];
						imgbox.childNodes[j].style.display = "none";
						if(j==1){
							imgbox.childNodes[imgbox.childNodes.length-1].style.display = "inline-block";
							imgdownload.download=postid+'_'+ ( imgbox.childNodes.length - 1 ) +''
							imgdownload.href=imgbox.childNodes[imgbox.childNodes.length - 1].src;
							break;
						} else {
							imgbox.childNodes[j-1].style.display = "inline-block";
							imgdownload.download=postid+'_'+(j-1)+''
							imgdownload.href=imgbox.childNodes[j-1].src;
							break;
						}
					}
				}
			}
		}
		let lefthover = $("div");
		lefthover.onclick = leftbtn.onclick;
		lefthover.id = "lefthover";
		imglayer.appendChild(lefthover);
		leftbtn.id = "leftbtn";
		imglayer.appendChild(leftbtn);
		let imgmenuhover = $("div");
		imgmenuhover.id = "imgmenuhover";
		imgmenuhover.onclick = function(){
		}
		imglayer.appendChild(imgmenuhover);
		let imgmenu = $("div");
		imgmenu.id = "imgmenu";
		imgmenu.onclick = function(event){
			event.stopPropagation();
	//	  event.preventDefault();
		}
		leftbtn.addEventListener('transitionend', function(){
			event.stopPropagation();
			event.preventDefault();
		});
		rightbtn.addEventListener('transitionend', function(){
			event.stopPropagation();
			event.preventDefault();
		});
		imgmenu.addEventListener('transitionend', function(){
			event.stopPropagation();
			event.preventDefault();
		});
		if( inits["timeline"]  != "undefined" ){
			let imgmenu_favorite = $('img');
			imgmenu_favorite.id = "imgmenu_favorite";
			imgmenu_favorite.src = "/img/favorite.png";
			imgmenu.appendChild(imgmenu_favorite);
			let imgmenu_share = $('img');
			imgmenu_share.id = "imgmenu_share";
			imgmenu_share.src = "/img/share.png";
			imgmenu.appendChild(imgmenu_share);
		}
		imgmenu.innerHTML+="<a id='imgdownload' download><img src='/img/download.png'></a>"; //<img src='/img/share.png'>";
		if( !(/(BB|iPad|iPhone|iPod|Android|\.NET)/i.test( navigator.userAgent )) ){
			let imgfull = $('img');
			imgfull.src = "/img/imgfull.png";
			imgfull.onclick = function(){
				that.viewfull(this);
			}
			imgmenu.appendChild(imgfull);
		} else {
			imglayer.onclick = function(){ 
				document.body.style.overflowY=""; 
				imglayer.style.opacity="0";
				that.imgviewing = 0;
			}
		}
		imglayer.appendChild(imgmenu);
		let imgbox = $("div");
		imgbox.id = "imgbox";
		imglayer.appendChild(imgbox);
		
		document.body.appendChild(imglayer);
		
		that.imgmenu_resize();
	
		that.addListener( window,'resize', function(){
			that.imgmenu_resize();
		});
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
		document.body.removeChild($('#imglayer'));
		document.body.style.overflowY = "";
		document.body.style.position = "";
	},
	viewfull : function(obj){
		if(document.webkitIsFullScreen){
			document.webkitCancelFullScreen();
			obj.src="/img/imgfull.png";
			event.stopPropagation();
			event.preventDefault();
		} else {
			imgbox.style.width="100%";
			imgbox.style.height="100%";
			imgbox.style.top="0";
			imgbox.style.left="0";
			imgbox.style.position="absolute";
			imglayer.webkitRequestFullScreen();
			for( let j=imgbox.childNodes.length - 1 ; j>=1; --j ){
				imgbox.childNodes[j].style.border="0";
			}
			obj.src="/img/imgfull_exit.png";
		}
	},
	viewimg : function(postid,filecount,date,url,controller){
		let that = this;
		that.imgmenu_resize();
	//  document.body.style.overflowY = "scroll";
	//  document.body.style.position = "fixed";
		that.imgviewing = 1;
		let imgmenu = $('#imgmenu');
		let imglayer = $('#imglayer');
		let imgmenu_favorite = $('#imgmenu_favorite');
		let imgmenu_share = $('#imgmenu_share');
		let imgbox = $('#imgbox');
		let imgmenuhover = $('#imgmenuhover');
		let lefthover= $('#lefthover');
		let righthover= $('#righthover');
		imglayer.style.zIndex="300";
		imglayer.style.visibility="visible";
		imglayer.style.opacity="1";
		imgbox.innerHTML="<div id='helper'></div>";
		imgmenuhover.style.display="block";
		imgmenu.style.display = "block";
		let favorite = $('#favorite_'+postid);
		let share = $('#share_'+postid);
		if( url ){
	//		imgmenu.style.display = "none";
		} else {
			if( favorite.innerText == "관심글해제" ){
				imgmenu_favorite.src = '/img/favorite_remove.png';
				imgmenu_favorite.onclick = function(){
					inits["timeline"].postFavorite(postid,0);
				}
			} else if( postid != undefined ){
				imgmenu_favorite.src = '/img/favorite.png';
				imgmenu_favorite.onclick = function(){
					inits["timeline"].postFavorite(postid,1);
				}
			}
			if( share.innerText == "공유취소" ){
				imgmenu_share.src = '/img/share_remove.png';
				imgmenu_share.onclick = function(){
					inits["timeline"].postShare(postid,0);
				}
			} else if( postid != undefined ){
				imgmenu_share.src = '/img/share.png';
				imgmenu_share.onclick = function(){
					inits["timeline"].postShare(postid,1);
				}
			}
		}
		if( filecount >= 2 || ( url != undefined && controller == true )){
			lefthover.style.display="block";
			righthover.style.display="block";
		} else if( filecount == 1 || (/(BB|iPad|iPhone|iPod|Android)/i.test( navigator.userAgent )) || controller == false ){
			lefthover.style.display="none";
			righthover.style.display="none";
		}
		for(let i = 1; i <= filecount; ++i){
			let img = $("img");
			if( url ){
				img.src = url + '?' + date;
				imgdownload.download = "iori_"+new Date().getTime() + ".jpg";
				img.id = "imglayer_img";
			} else if( postid != undefined ){
				img.src="/files/post/" + postid + "/" + i + "?" + date;
				imgdownload.download = postid+'_'+1+'';
			}
			imgdownload.href = img.src;
			img.onclick = function(){
				event.stopPropagation();
				event.preventDefault();
				rightbtn.click();
			}
			/* 이미지 호버시 오른쪽버튼 등장!
			if( !(/(BB|iPad|iPhone|iPod|Android)/i.test( navigator.userAgent )) ){
				img.onmouseover = function(){
					rightbtn.style.right = "0px";
				}
				img.onmouseout = function(){
					rightbtn.style.right = "";
				}
			}
			*/
			imgbox.appendChild(img);
		}
		imgbox.childNodes[1].style.display="inline-block";
	},
	imgmenu_resize : function(){
		let imgmenu = $('#imgmenu');
		/*
		if(window.innerWidth < 530 ){
			imgmenu.style.display="none";
		} else {
			imgmenu.style.display="block";
		}
		*/
		imgmenu.style.left = ( $('#imglayer').clientWidth - imgmenu.clientWidth ) / 2 + "px"
	}
}

