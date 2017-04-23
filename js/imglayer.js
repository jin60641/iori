'use strict';

var imgviewing = 0;
window.addEventListener('load',function(){
	var imglayer = $("div");
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
			imgviewing=0;
			lefthover.style.display="none";
			righthover.style.display="none";
			imgmenuhover.style.display="none";
			document.body.style.overflowY = "";
			document.body.style.position = "";
		}
	}
	var rightbtn = $("div");
	rightbtn.onclick = function(e){
		e.stopPropagation();
		e.preventDefault();
		var imgbox = $('#imgbox');
		var imgdownload = $('#imgdownload');
		var img = $("#imglayer_img");
		if( img != undefined ){
			var params = { 
				flag : "gt",
				type : location.hash.substr(1,1),
				dialog_id : location.hash.split('?')[1],
				now : img.src.split('/').pop()
			}
			var query = "";
			var param_key = Object.keys(params);
			for( var i = 0; i < param_key.length; ++i ){
				query += param_key[i] + '=' + params[param_key[i]] + "&";
			}
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
				if( xhr.responseText != "" ){
					var src = "/files/chat/" + xhr.responseText;
					img.src = src;
				}
			}}
			xhr.open("POST", "/api/chat/getfile", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
		} else {
			for( var j = imgbox.childNodes.length - 1 ; j>=1; --j ){
				if(imgbox.childNodes[j].style.display == "inline-block" ){
					var postid = imgbox.childNodes[1].src.split("post/")[1].split("/")[0];
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
	var righthover = $("div");
	righthover.onclick = rightbtn.onclick;
	righthover.id = "righthover";
	imglayer.appendChild(righthover);
	rightbtn.id = "rightbtn";
	imglayer.appendChild(rightbtn);
	var leftbtn = $("div");
	leftbtn.onclick = function(e){
		e.stopPropagation();
		e.preventDefault();
		var imgbox = $('#imgbox');
		var imgdownload = $('#imgdownload');
		var img = $("#imglayer_img");
		if( img != undefined ){
			var params = {
				flag : "lt", 
				type : location.hash.substr(1,1),
				dialog_id : location.hash.split('?')[1],
				now : img.src.split('/').pop()
			}
			var query = "";
			var param_key = Object.keys(params);
			for( var i = 0; i < param_key.length; ++i ){
				query += param_key[i] + '=' + params[param_key[i]] + "&";
			}
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
				if( xhr.responseText ){
					var src = "/files/chat/" + xhr.responseText;
					img.src = src;
				}
			}}
			xhr.open("POST", "/api/chat/getfile", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);		
		} else {
			for( var j=1; j<imgbox.childNodes.length; ++j ){
				if(imgbox.childNodes[j].style.display == "inline-block" ){
					var postid = imgbox.childNodes[1].src.split("post/")[1].split("/")[0];
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
	var lefthover = $("div");
	lefthover.onclick = leftbtn.onclick;
	lefthover.id = "lefthover";
	imglayer.appendChild(lefthover);
	leftbtn.id = "leftbtn";
	imglayer.appendChild(leftbtn);
	var imgmenuhover = $("div");
	imgmenuhover.id = "imgmenuhover";
	imgmenuhover.onclick = function(){
	}
	imglayer.appendChild(imgmenuhover);
	var imgmenu = $("div");
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
	if( typeof postFavorite != "undefined" ){
		imgmenu.innerHTML="<img id='imgmenu_favorite' src='/img/favorite.png'>";
	}
	imgmenu.innerHTML+="<a id='imgdownload' download><img src='/img/download.png'></a>"; //<img src='/img/share.png'>";
	if( !(/(BB|iPad|iPhone|iPod|Android|\.NET)/i.test( navigator.userAgent )) ){
		imgmenu.innerHTML += "<img src='/img/imgfull.png' onclick='viewfull(this)' >";
	} else {
		imglayer.onclick = function(){ document.body.style.overflowY=""; imglayer.style.opacity="0";imgviewing=0;}
	}
	imglayer.appendChild(imgmenu);
	var imgbox = $("div");
	imgbox.id = "imgbox";
	imglayer.appendChild(imgbox);
	
	document.body.appendChild(imglayer);
	
	imgmenu_resize();

	window.addEventListener('resize', function(){

		imgmenu_resize();
	});

});

// 이미지 전체화면
function viewfull(obj){
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
		for( var j=imgbox.childNodes.length - 1 ; j>=1; --j ){
			imgbox.childNodes[j].style.border="0";
		}
		obj.src="/img/imgfull_exit.png";
	}
}
// 이미지 자세히보기
function viewimg(postid,filecount,date,url,controller){
	imgmenu_resize();
//  document.body.style.overflowY = "scroll";
//  document.body.style.position = "fixed";
	imgviewing = 1;
	var imglayer = $('#imglayer');
	var imgmenu_favorite = $('#imgmenu_favorite');
	var imgmenu_share = $('#imgmenu_favorite');
	var imgbox = $('#imgbox');
	var imgmenuhover = $('#imgmenuhover');
	var lefthover= $('#lefthover');
	var righthover= $('#righthover');
	imglayer.style.zIndex="300";
	imglayer.style.visibility="visible";
	imglayer.style.opacity="1";
	imgbox.innerHTML="<div id='helper'></div>";
	imgmenuhover.style.display="block";
	imgmenu.style.display = "block";
	if( url ){
		imgmenu.style.display = "none";
	} else if( $("#post_favorite_"+postid) ){
		imgmenu_favorite.src = '/img/favorite_remove.png';
		imgmenu_favorite.onclick = function(){
			postFavorite(postid,0);
		}
	} else if( postid != undefined ){
		imgmenu_favorite.src = '/img/favorite.png';
		imgmenu_favorite.onclick = function(){
			postFavorite(postid,1);
		}
	}
	if( filecount >= 2 || url != undefined ){
		lefthover.style.display="block";
		righthover.style.display="block";
	} else if( filecount == 1 || (/(BB|iPad|iPhone|iPod|Android)/i.test( navigator.userAgent )) || controller == false ){
		lefthover.style.display="none";
		righthover.style.display="none";
	}
	for(var i = 1; i <= filecount; ++i){
		var img = $("img");
		if( postid != undefined ){
			img.src="/files/post/" + postid + "/" + i + "?" + date;
			imgdownload.download = postid+'_'+1+'';
		} else if( url ){
			img.src = url + '?' + date;
			imgdownload.download = "iori_"+new Date().getTime() + ".jpg";
			img.id = "imglayer_img";
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
}

//이미지 메뉴 리사이징
function imgmenu_resize(){
	var imgmenu = $('#imgmenu');
	/*
	if(window.innerWidth < 530 ){
		imgmenu.style.display="none";
	} else {
		imgmenu.style.display="block";
	}
	*/
	imgmenu.style.left = ( $('#imglayer').clientWidth - imgmenu.clientWidth ) / 2 + "px"
}

