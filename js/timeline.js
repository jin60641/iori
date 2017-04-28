'use strict';

var postLoading = false;
var realfiles = { '0' : [] };
var post_origin = {};
var fileindex = {};

//모바일을 위한 터치 이벤트 리스너
/*
	if( !document.webkitIsFullScreen ){
		imglayer.style.opacity="0";
		lefthover.style.display="none";
		righthover.style.display="none";
		imgmenuhover.style.display="none";
		imgviewing=0;
	} else {
	}
*/

window.addEventListener("click", hidemenu);
window.addEventListener("keydown",keydown);
window.addEventListener('scroll',preventDefault);
window.addEventListener('touchmove',preventDefault);
window.addEventListener('mousewheel',preventDefault);

function preventDefault(event) {
	if( imgviewing ){
		event.stopPropagation();
		event.preventDefault();
		event.returnValue = false;
		return false;
	}
}

//크롬전체화면
document.addEventListener('webkitfullscreenchange', function(){
	event.stopPropagation();
	event.preventDefault();
	if(!document.webkitIsFullScreen){
		imgbox.style.width="";
		imgbox.style.height="";
		imgbox.style.top="";
		imgbox.style.left="";
		imgbox.style.position="";
		for( var j=imgbox.childNodes.length - 1 ; j>=1; --j ){
			imgbox.childNodes[j].style.border="";
		}
	}
});

function getAudio( pid ){
	alert("영상에 따라 추출 시 약간의 시간이 소요될 수 있습니다.");
	var vid = $('#link_preview_' + pid).href.split('v=')[1];
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var obj;
		try {
			obj = JSON.parse(xhr.responseText);
			var download = $("a");
			var title = $('#link_preview_title_' + pid);
			download.download = title.innerText + "." + obj.type;
			download.href = '/api/audio/getaudio/' + vid;
			download.click();
		} catch(e){
			alert(xhr.responseText);
		}
	}};
	xhr.open("POST", "/api/audio/add/" + vid, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();

}

//게시물,덧글 메뉴닫기
function hidemenu(){
	var post_menu = $(".post_menu");
	var reply_menu = $(".reply_menu");
	for(var i = reply_menu.length-1;i>=0;i--){
		reply_menu[i].style.display="none";
	}
	for(var i = post_menu.length-1;i>=0;i--){
		post_menu[i].style.display="none";
	}
	if( select ){
		select.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
		select.style.boxShadow = "initial";
	}
}

//보고싶지 않습니다(덧글)
function dontseeReply(pid,reply_id){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var reply = $("#reply_" + pid + "_" + reply_id);
		reply.parentNode.removeChild(reply);
	}};
	xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=reply&obj_id='+reply_id);
}

//보고싶지 않습니다(게시물)
function dontsee(pid){
	var postwrap = $('#post_wrap');
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( location.pathname.substr(0,6) == "/post/" ){
			location.href = "/";
		} else {
			var post = $("#post_"+pid);
			post.style.display="none";
			var menu = $("div");
			menu.className = "post";
			menu.style.paddingBottom = "8px";
			menu.innerText = "뉴스피드에 이 게시물이 표시되지 않습니다.";
			var span = $('span');
			span.className = "dontsee_span";
			span.innerText = "취소";
			menu.appendChild(span);
			var btn = $('span');
			btn.className = "dontsee_btn";
			btn.addEventListener('click', function(){	
				this.parentNode.parentNode.removeChild(this.parentNode);
			});
			menu.appendChild(btn);
			postwrap.insertBefore(menu,post);
		}
	}}
	xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=post&obj_id='+pid);
}

//보고싶지 않습니다 취소
function dontsee_cancle(pid){
	var postwrap = $('#post_wrap');
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var post = $("#post_"+pid);
		post.style.display="";
		postwrap.removeChild(post.previousElementSibling);
	}}
	xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=post&obj_id='+pid);
}

//관심글 등록, 취소
function postFavorite(pid,add){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var menu_favorite = $("#favorite_"+pid);
		if(add){
			menu_favorite.onclick=function(){
				postFavorite(pid,0)
			}
			menu_favorite.innerText="관심글해제";
			var span = $("span")
			span.className="post_favorite";
			span.id="post_favorite_"+pid;
			$("#post_"+pid).insertBefore(span,$("#post_inside_"+pid));
			if( $('#imgmenu_favorite') ){
				$('#imgmenu_favorite').src='/img/favorite_remove.png';
				$('#imgmenu_favorite').onclick = function(){
					event.stopPropagation();
					postFavorite(pid,0)
				}
			}
		} else {
			menu_favorite.onclick=function(){
				postFavorite(pid,1)
			}
			menu_favorite.innerText = "관심글등록";
			$("#post_"+pid).removeChild($("#post_favorite_"+pid));
			if( $('#imgmenu_favorite') ){
				$('#imgmenu_favorite').src='/img/favorite.png';
				$('#imgmenu_favorite').onclick = function(){
					postFavorite(pid,1)
				}
			}
		}
	}}
	xhr.open("POST", "/api/newsfeed/favorite", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid);
}


function postShare(pid,add){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var menu_share = $("#share_"+pid);
		if(add){
			menu_share.onclick = function(){
				postShare(pid,0)
			}
			menu_share.innerText="공유취소";
			if( $('#imgmenu_share') ){
				$('#imgmenu_share').src='/img/share_remove.png';
				$('#imgmenu_share').onclick = function(){
					event.stopPropagation();
					postShare(pid,0)
				}
			}
		} else {
			menu_share.onclick=function(){
				postShare(pid,1)
			}
			menu_share.innerText = "공유하기";
			if( $('#imgmenu_share') ){
				$('#imgmenu_share').src='/img/share.png';
				$('#imgmenu_share').onclick = function(){
					postShare(pid,1)
				}
			}
		}
	}}
	xhr.open("POST", "/api/newsfeed/share", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid);
}

// 게시글 수정
function changePost(pid){
	var cancle = $("div");
	cancle.id = "changecancle_"+pid;
	cancle.onclick = function(){
		cancleChange(pid);
	}
	cancle.innerText="수정 취소";
	$("#menu_"+pid).replaceChild(cancle,$("#changepost_"+pid))
	var inside = $("#post_inside_"+pid);
	inside.style.paddingBottom = "39px";
	var preview = $("#link_preview_"+pid);
	if( preview ){
		preview.style.display = "none";
	}
	var textarea = $("textarea");
	if( inside.firstChild && inside.firstChild.lastElementChild ){
		inside.firstChild.lastElementChild.click();
	}
	if( inside.firstChild ){
		textarea.value = inside.firstChild.innerText;
	} else {
		textarea.value = "";
	}
	textarea.onkeypress=function(){post_resize(this)};
	textarea.onkeydown=function(){post_resize(this)}; 
	textarea.onkeyup=function(){post_resize(this)};
	textarea.placeholder="글을 입력하세요.";
	if( inside.firstChild && inside.firstChild.innerText ){
		post_origin[pid]=inside.firstChild.cloneNode(true);
		inside.replaceChild(textarea,inside.firstChild);
	} else {
		inside.insertBefore(textarea,inside.firstChild);
	}
	var postbtn = $("div");
	postbtn.className = "post_change_button";
	postbtn.innerText = "게시";
	postbtn.onclick=function(){
		changePost_apply(this.parentNode);
	}
	var label = $("label");
	label.className = "post_change_label";
	label.htmlFor = "post_file_"+pid;
	inside.insertBefore(label,textarea.nextElementSibling);
	inside.insertBefore(postbtn,textarea.nextElementSibling);
	var input = $("input");
	input.className = "post_change_file";
	input.id = "post_file_"+pid;
	input.type = "file";
	input.accept = "image/*";
	input.multiple = "multiple";
	input.onchange = function(event){
		openfile_post(event,this.id.split('_').pop());
	}
	inside.insertBefore(input,postbtn);
	var output = $("div");
	output.className = "output_change";
	output.id = "changeoutput_"+pid;
	inside.insertBefore(output,postbtn);
	var post_span = inside.parentNode.childNodes[1];
	fileindex[pid] = [];
	realfiles[pid] = [];
	var fileindex_tmp = fileindex[pid];
	if(post_span.className == "post_span"){
		for(var j = 0; j < inside.childElementCount; ++j){
		//for(var j = inside.childElementCount - 1; j>=0; --j){
			var img = inside.childNodes[j].firstElementChild;
			if( img != undefined && img.tagName == "IMG"){
				var src = img.src;
				for(var i = 0; i < parseInt(post_span.innerText); ++i){
					fileindex_tmp[i] = i + 1;
					var imgbox = $("div");
					imgbox.id = "postimg_" +( i + 1);
					imgbox.className='post_imgbox';
					output.appendChild(imgbox);
					output.style.display="block";
					imgbox.addEventListener("dragstart",function(evt){
						evt.stopPropagation();
						evt.preventDefault();
						return false;
					});
					var dataURL = event.target.result;
					src = src.replace(/(.*post\/)(.*\/)(.*)\?/i,"$1"+"$2"+(i+1)+"?");
					imgbox.style.background="url('" + src + "') center center no-repeat"
					imgbox.style.backgroundSize="cover";
					imgbox.style.backgroundClip="content-box";
					var deletebtn = $("div");
					deletebtn.className='delete_postimg';
					deletebtn.onclick= function(){	
						fileindex_tmp.splice( parseInt(this.parentNode.id.split('_').pop()) - 1 , 1);
						output.removeChild(this.parentNode);  
						for( var k = 0; k < output.childElementCount; ++k ){
							output.children[k].id = "postimg_" + (k+1);
						}
					}
					imgbox.appendChild(deletebtn);
				}
				inside.removeChild(inside.childNodes[j]);
			} 
		}
	}
	textarea.focus();
}


//게시글 수정 완료
function changePost_apply(inside){
	if(!confirm("수정된 사항을 저장하시겠습니까?")){
		return false;
	}
	var formdata = new FormData();
	var pid = inside.id.split('_').pop();
	var realfiles_change = realfiles[pid];
	var fileindex_tmp = fileindex[pid];
	if( fileindex_tmp[0] || inside.firstElementChild.value.length>= 1 ){
		for( var i = 0; i < realfiles_change.length; ++i ){
//		for( var i=realfiles_change.length-1; i>=0; --i){
			formdata.append("file",realfiles_change[i]);
		}
		formdata.append("text",inside.firstChild.value);
		
		var xhr = new XMLHttpRequest();
	} else {
		alert("게시글이 비어 있습니다.");
		return false;
	}
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		inside.style.paddingBottom="3px";
		var preview_cnt = 0;
		if(xhr.responseText){ 
			var xhrResult = JSON.parse( xhr.responseText );
			var text = inside.firstElementChild.value.replace(/((\r\n)|\n|\r)/gm,"<br />"); 
			var textspan = $("span");
			textspan.className = "textspan";
			var texts = text.split("\r\n");
			var textmore = $("yyspan");
			for( var k = 0; k < texts.length; ++k ){
				var textindex = 0;
				while(1){
					var link = /(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-])*[\w@?^=%&amp;\/~+#-])?/gi.exec( texts[k].substr( textindex ) );
					if( link != null ){
						var str = link[0];
						var replace_str = "<a target='_blank' href='" + str + "'>" + link[0] + "</a>";
						textindex += link.index + replace_str.length ;
						if( !preview_cnt++ ){
							if( xhrResult.file == undefined || xhrResult.file == 0 ){
								makePreview(str,texts[k],pid,inside);
							}
						}
						texts[k] = texts[k].replace( link[0].toString(), replace_str );
					} else {
						break;
					}
				}
				textspan.innerHTML += texts[k].toString() + '<br />';
			}
			inside.appendChild(textspan);
			var date = new Date( xhrResult.date ).getTime();
			var post_span = inside.parentNode.childNodes[1];
			if(post_span.className == "post_span"){
				if(xhrResult.file){
					if(post_span.innerText == xhrResult.file ){ 
					} else { 
						post_span.innerText = xhrResult.file;
					}
				} else {
					post_span.parentNode.removeChild(post_span);
				}
			} else {
				if(xhrResult.file){
					var span = $("span");
					span.className = "post_span";
					span.addEventListener('click', function(e){ 
						$("#postimg_" +pid).click();
					}, false);
					span.innerHTML = xhrResult.file;
					inside.parentNode.insertBefore(span,inside.parentNode.firstElementChild.nextElementSibling);
				}
			}

			if(xhrResult.file){
//				inside.innerHTML+="<img src='/files/post/"+pid+"/1?"+xhrResult.date+"' id='postimg_"+pid+"' class='postimg' onclick='viewimg("+pid+","+xhrResult.file+",\""+ xhrResult.date+"\")' ></img>"
			}
			cancleChange(pid,true);
			/*
			// 수정됨 삽입기능 ( 모바일이 좁아서 보류 )
			var post_date;
			for( var i = inside.parentNode.childElementCount - 1; i >= 0; --i){
				if( inside.parentNode.childNodes[i].className == "post_changed"){
					break;
				} else if( inside.parentNode.childNodes[i].className == "date" ){
					post_date = inside.parentNode.childNodes[i];
				} else if( i == 0 ){
					var span = $("span");
					span.className='post_changed';
					span.onclick= function(){
						alert(getDateString(date,false,true));
					}
					span.innerHTML="수정됨";
					inside.parentNode.insertBefore(span,post_date.nextElementSibling)
				}
			}
			*/
			//socket.emit( 'post_change' );
		}
	}}
	if( fileindex_tmp[0] ){
		xhr.open("POST","/api/newsfeed/changepost/" + pid + "/" + fileindex_tmp, false); xhr.send(formdata)
	} else {
		xhr.open("POST","/api/newsfeed/changepost/" + pid + "/0", false); xhr.send(formdata)
	}
}

//게시글 수정 취소
function cancleChange(pid,change){
	delete realfiles[pid];
	delete fileindex[pid];
	var div = $("div")
	div.id = "changepost_"+pid;
	div.onclick = "changePost("+pid+")";
	div.innerText="게시글수정";
	div.onclick=function(){
		changePost(pid);
	}
	var inside = $("#post_inside_"+pid);
	inside.style.paddingBottom="3px";
	$("#menu_"+pid).replaceChild(div,$("#changecancle_"+pid))
	for(var i = inside.childElementCount - 1; i>=0; --i){
		var child = inside.childNodes[i];
		if(child.tagName=="TEXTAREA"){
			var origin;
			try {
				origin = post_origin[pid];
				if( origin == undefined || origin == null ){
					origin = $('span');
					origin.className = "textspan";
				}
			}
			catch(err){
				inside.removeChild(child);
				continue;
			}
			origin.innerText = child.value;
			inside.replaceChild(origin,child);
			delete post_origin[pid];
		} else if((child.tagName=="SPAN"||child.tagName=="IMG"||child.tagName=="BR"||child.tagName=="A")&&change!=true){
			child.style.display = "";
		} else {
			inside.removeChild(child);
		}
	}
	var post_span = inside.parentNode.childNodes[1];
	if(post_span.className == "post_span"){
		var div = $('div');
		div.className = "postimg_div";
		inside.appendChild(div);
		var d = new Date();
		var preview = $('div');
		preview.className = "postimg_preview";
		var img = $('img');
		img.src = "/files/post/" + pid + "/1?" + d;
		img.id = "postimg_" + pid;
		img.className = "postimg_img";
		img.onclick = function(){
			viewimg(Post.id,post_span.innerText,d);
		}
		preview.appendChild(img);
		inside.appendChild(preview);
		
	}
}

//파일열기(writepost) paste
function openfile_paste(event,pid){

}

//파일열기(writepost)
function openfile_post(event,pid){
	event.stopPropagation();
	event.preventDefault();
	if( event.dataTransfer ){
		event.dataTransfer.dropEffect = 'copy';
	}
	var realfiles_tmp;
	var fileindex_tmp;
	if(pid){
		var output = $("#changeoutput_"+pid);
		realfiles_tmp = realfiles[pid];
		fileindex_tmp = fileindex[pid];
	} else {
		realfiles_tmp = realfiles[0];
		if( realfiles_tmp == undefined ){
			realfiles_tmp = [];
		}
		var output = output_post;
	}
	var input=event.target;
	var files;
	if(input.files){
		input.style.borderTop="1px solid rgb(86,210,199)";
		input.style.borderBottom="1px solid rgb(86,210,199)";
		input.focus();
		files = input.files;
	} else {
		files = event.dataTransfer.files;
	}
	for( var i = 0; i<files.length; ++i){
		if(realfiles_tmp.length>=20){
			alert("사진은 최대 20장까지만 업로드 가능합니다.");
			return false;
		}
		realfiles_tmp.push(files[i]);
		if(pid){
			var post_span = input.parentNode.parentNode.childNodes[1];
			if(post_span.className == "post_span"){
				if( fileindex_tmp[fileindex_tmp.length - 1] < parseInt(post_span.innerText) ){
					fileindex_tmp.push(parseInt(post_span.innerText)+1);
				} else {
					fileindex_tmp.push(fileindex_tmp[fileindex_tmp.length - 1] + 1);
				}
			} else {
				fileindex_tmp.push(1);
			}
		}
		var reader = new FileReader();
		reader.addEventListener("progress",function(evt){ // 진행도 표시
			// Math.round((evt.loaded / evt.total) * 100) 
			if(evt.lengthComputable){
				var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
				if( percentLoaded < 100 ){
					//progress.style.width = percentLoaded + '%';
					//progress.innerHTML = percentLoaded + '%';
				}
			}
		});
		reader.addEventListener("load",function(event){
			var imgbox = $("div");
			imgbox.id = "postimg_" +( output.childElementCount + 1);
			imgbox.className='post_imgbox';
			output.appendChild(imgbox);
			output.style.display="block";
			imgbox.addEventListener("dragstart",function(evt){
				evt.stopPropagation();
				evt.preventDefault();
				return false;
			});
			var dataURL = event.target.result;
			imgbox.style.background="url('"+dataURL+"') center center no-repeat"
			imgbox.style.backgroundSize="cover";
			imgbox.style.backgroundClip="content-box";
			var deletebtn = $("div");
			deletebtn.className='delete_postimg';
			if(pid){
				deletebtn.onclick= function(){
					var pid = this.parentNode.parentNode.id.substr(13);
					var realfiles_tmp = realfiles[pid];
					var fileindex_tmp = fileindex[pid];
					var index = parseInt(this.parentNode.id.substr(8)) - 1;
					realfiles_tmp.splice( index - output.childElementCount + realfiles_tmp.length , 1 );
					fileindex_tmp.splice( index , 1);
					output.removeChild(this.parentNode);  
					for( var j=0; j<output.childElementCount;++j){
						output.children[j].id = "postimg_" + (j+1);
					}
				}
			} else {
				deletebtn.onclick= function(){
					var realfiles_tmp = realfiles[0];
					realfiles_tmp.splice( (parseInt(this.parentNode.id.substr(8)) - 1), 1 );
					output.removeChild(this.parentNode);  
					for( var j=0; j<output.childElementCount;++j){
						output.children[j].id = "postimg_" + (j+1);
					}
				}
			}
			imgbox.appendChild(deletebtn);
			if(input.type=="file"){
				input.value="";
			}
		});
		reader.readAsDataURL(files[i]);
	}
	//input.value="";
}

//파일열기(댓글쓰기)
function openfile_reply(event,change){
	var input=event.target;
	var reader = new FileReader();
	reader.addEventListener("load",function(event){
		var deleteimg = $("div");
		deleteimg.className = "delete_replyimg";
		if( change ){
			var output = $("#replyoutput_change_"+input.id.split('_').pop());
			$("#replyinput_change_"+input.id.split('_').pop()).style.display="none";
			deleteimg.onclick= function(){
				input.previousElementSibling.previousElementSibling.style.display="";
				this.parentNode.removeChild(this.previousElementSibling); 
				this.style.display = "none";
				input.value="";
			}
		} else {
			var output = $("#replyoutput_"+input.id.split('_').pop());
			$("#replywrite_"+input.id.split('_').pop()).lastElementChild.style.display="none";
			deleteimg.onclick= function(){
				input.previousElementSibling.lastElementChild.style.display="";
				this.parentNode.removeChild(this.previousElementSibling);
				this.style.display = "none";
				input.value="";
			}
			deleteimg.onmouseover = function(){
				this.style.display = "block";
			}
		}
		var dataURL = event.target.result;
		output.style.display="block";
		var div = $("div");
		div.className = "replyoutput_img"
		div.style.background = "url('"+dataURL+"') center center no-repeat"
		div.style.backgroundSize="cover";
		div.style.backgroundClip="content-box";
		div.addEventListener('mouseover', function(){
			this.nextElementSibling.style.display = "block";
		});
		div.addEventListener('mouseout', function(){
			this.nextElementSibling.style.display = "none";
		});
		output.innerHTML = "";
		output.appendChild(div);
		output.appendChild(deleteimg);
	});
	reader.readAsDataURL(input.files[0]);
}

//댓글 수정
function changeReply(pid,id){
	var reply = $("#reply_"+pid+"_"+id);
	reply.onkeydown = function(event){ capturekey_replychange(event,pid,id)}
	reply.lastElementChild.style.display="none";
	reply.innerHTML += "<textarea type='text' style='margin-left:7px;' id='replychange_" + id + "' class='writereply' onkeyup='reply_resize(this)' onkeydown='reply_resize(this)' onkeypress='reply_resize(this)' placeholder='댓글을 입력하세요...' ></textarea><label for='replyinput_change_" + id + "' class='replyinput_label'></label>";
	var replywrite = $("#replychange_"+id);
	if( reply.childNodes[1].childNodes[2].data ){
		replywrite.value = reply.childNodes[1].childNodes[2].data;
	} else {
		replywrite.value = "";
	}
	reply_resize(replywrite);
	var cancle = $("div");
	cancle.id = "cancle_change_reply_" + id;
	cancle.style.fontSize = "12px";
	cancle.style.marginLeft = "49px";
	cancle.style.display="inline-block";
	reply.appendChild(cancle);
	replywrite.onfocus = function(){
		cancle.onclick = "";
		cancle.innerText = "수정을 취소하시려면 ESC키를 누르세요";
		cancle.style.color= "#aaaaaa";
		cancle.style.cursor = "";
	}
	replywrite.addEventListener("focusout", function(){
		cancle.onclick = function(){
			cancleChange_reply(pid,id);
		}
		cancle.innerText = "취소";
		cancle.style.color = session.color.hex;
		cancle.style.cursor = "pointer";
	});
	replywrite.focus();
	var reply_upload = $("input");
	reply_upload.type = "file";
	reply_upload.accept = 'image/*';
	reply_upload.id="replyinput_change_" + id;
	reply_upload.onchange = function(event){ openfile_reply(event,1) }
	reply.appendChild(reply_upload);
	var reply_output = $("div");
	reply_output.className = "replyoutput";
	reply_output.id = "replyoutput_change_" + id;
	reply.appendChild(reply_output);
	
}

//댓글 수정 취소
function cancleChange_reply(pid,id){
	var reply = $("#reply_"+pid+'_'+id)

	for( var i = reply.childElementCount - 1 ; i >= 2 ; --i ){
		reply.removeChild(reply.childNodes[i]);
	}
	reply.childNodes[1].style.display="";
	reply.childNodes[1].firstElementChild.onclick = function(){
		event.stopPropagation();
		event.preventDefault();
		this.firstElementChild.style.display="block";
	}
}

//박스크기변경(댓글 수정)
function capturekey_replychange(e,pid,id){
	if( e.keyCode == 13 && !e.shiftKey){
		changeReply_apply(pid,id)
	} else if( e.keyCode == 27){
		cancleChange_reply(pid,id);
	}
}

//댓글 수정 완료
function changeReply_apply(pid,id){
	var tmp = event.target.value.toString();
	event.stopPropagation();
	event.preventDefault();
	$("#replychange_"+id).value = "";
	var formdata = new FormData();
	var input = $("#replyinput_change_"+id);
	var reply = event.target.parentNode;
	//$("#replywrite_"+input.id.substr(11)).lastElementChild.style.display="block";
	if( input.files.length || tmp.length >= 1 ){
		formdata.append("file",input.files[0]);
		formdata.append("text",tmp);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (evt){ if(xhr.readyState == 4 && xhr.status == 200){
			reply.childNodes[1].childNodes[2].innerText = tmp;
			var reply_menu_btn = reply.childNodes[1].childNodes[0];
			reply_menu_btn.onclick = function(event){
				event.stopPropagation();
				event.preventDefault();
				this.firstElementChild.style.display="block"
			}	
			for( var i = reply.childElementCount - 1; i >= 2; --i ){
				reply.removeChild(reply.childNodes[i]);
			}
			reply.childNodes[1].style.display = "inline-block";
			//소켓연동
		}}
		xhr.open("POST", "/api/newsfeed/changereply/"+ id, false); xhr.send(formdata);
	} else {
		alert("댓글이 비어 있습니다. 글을 입력해주세요");
	}
}

//댓글 삭제
function removeReply(pid,id){
	if(!confirm("정말로 삭제하시겠습니까?")){
		return false;
	}
	var reply = $("#reply_"+pid+"_"+id);
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		if( xhr.responseText == "댓글이 삭제되었습니다."){
			reply.parentNode.removeChild(reply)
		} else {
			alert(xhr.responseText);
		}
	}}
	xhr.open("POST", "/api/newsfeed/removereply", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('reply_id='+id);
}

//게시글 삭제
function removePost(pid){
	var postwrap = $('#post_wrap');
	if(!confirm("정말로 삭제하시겠습니까?")){
		return false;
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		if( xhr.responseText == "게시글이 삭제되었습니다."){			
			if( location.pathname.substr(0,6) == "/post/" ){
				location.href = "/";
			} else {
				var post = $("#post_"+pid);
				post.addEventListener('transitionend', function(){
					if(this.style.opacity=="0"){
						postwrap.removeChild(post);
					}
				});
				post.style.opacity="0";
				socket.emit( 'post_remove', pid )
				var post_cnt = $('#user_list_tab_value_post');
				if( post_cnt ){
					post_cnt.innerText = parseInt(post_cnt.innerText) - 1;
				}
				getPosts(1);
			}
		} else {
			alert(xhr.responseText);
		}
	}}
	xhr.open("POST", "/api/newsfeed/removepost", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid);
}

//날짜텍스트 구하기
function getDateString(date,reply,change){
	var postdate = new Date(date);
	var now = new Date();
	var postdate_time = Math.floor(postdate.getTime()/1000)
	var now_time = Math.floor(now.getTime()/1000)
	var gap = now_time - postdate_time;
	var dateString = (postdate.getYear()+1900)+'년 '+ (postdate.getMonth()+1) + "월 " + postdate.getDate() + "일"; 
	var timeString = postdate.getHours() + "시 " + postdate.getMinutes() + "분";
	if( change ){
		/*
			return ~~;
		*/
	}
	if( gap < 3600 ){
		if( gap < 60 ){
			return "방금"; 
		} else {
			return Math.floor(gap/60)+"분 전";
		}
	} else if( gap < 86400 ){
		return Math.floor(gap/3600)+"시간 전";
	} else if( gap >= 86400 ){
		if(Math.floor(gap/86400) == 1){
			return "어제 " + timeString;
			/*
			if( reply ){
				return "어제 " + timeString;
			} else {
				return "<span style='padding-right:25px;'>어제</span><img src='/img/postdate.png' onclick='alert(\"" + dateString + "\")' style='cursor:pointer'>";
			}
			*/
		} else if( reply ){
			return dateString;
		} else {
			var b = new Date();
			b.setHours(0);
			b.setMinutes(0);
			b.setSeconds(0);
			b.setMilliseconds(0);
			return Math.floor((b.getTime()/1000 - postdate_time)/86400) + "일 전";
			/*
			return "<span style='padding-right:25px;'>" + Math.floor((b.getTime()/1000 - postdate_time)/86400) + "일 전</span><img src='/img/postdate.png' onclick='alert(\"" + dateString + "\")' style='cursor:pointer'>";
			*/
		}
	}
	return date;
}


//날짜 업데이트
var dateUpdateId;
function dateUpdate(){
	var dates = $(".date");
	var i = dates.length - 1
	for( ; i >= 0; --i ){
		var date = new Date( parseInt(dates[i].id.substr(5)) )
		if(dates[i].childNodes[1]){
			if(dates[i].childNodes[1].className=="viewing"){
				var a = date.toLocaleTimeString().replace(':',"시 ");
				dates[i].firstChild.innerText = a.substr(0,a.indexOf(":"))+"분";
			} else {
				dates[i].innerHTML = getDateString(date);
			}
		} else {
			if(dates[i].parentNode.className == "reply_text"){
				dates[i].innerHTML = getDateString(date,1);
			} else {
				dates[i].innerHTML = getDateString(date);
			}
		}
	}
}

/*
//날짜 토글 (현재안씀)
function toggleDate(obj){
	postdate = new Date(parseInt(obj.parentNode.id.substr(5)));
	if(obj.className=="viewing"){
		obj.previousSibling.innerText = PointToDate(postdate.toLocaleDateString());
		obj.className="";
	} else {
		var a = postdate.toLocaleTimeString().replace(':',"시 ");
		obj.previousSibling.innerText = a.substr(0,a.indexOf(":"))+"분";
		obj.className="viewing";
	}
}
*/


// 게시글전송
function capturekey(e,post){
	if( e.keyCode == 13 && !e.shiftKey){
		replyWrite(post)
	}
}


//게시글쓰기 리사이징
function post_resize(obj){
	if(obj.scrollHeight > 104){
		obj.style.height="1px";
		obj.style.height=obj.scrollHeight+"px";
	}
	if( obj.scrollHeight <= 104 ){	
		obj.style.height="100px";
	}
//	obj.style.borderTop="1px solid rgb(86,210,199)";
//	obj.style.borderBottom="1px solid rgb(86,210,199)";
}

//덧글쓰기 리사이징
function reply_resize(obj){
	obj.style.height="1px";
	obj.style.height=obj.scrollHeight-18+"px";
}

var skip = 0;
var posts = 0;

//덧글 불러오기
function getReplys(obj,limit){
	var replywrap = obj.parentNode;
	replywrap.style.display = "";
	var reply_skip = 0;
	if(obj.id.substr(10,1) == '_'){
		var pid = obj.id.substr(11);
		reply_skip = 0;
	} else {
		var pid = obj.id.substr(10);
		reply_skip = replywrap.childElementCount-4;
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){if (xhr.readyState == 4 && xhr.status == 200){
		var xhrResult = JSON.parse(xhr.responseText);
		var Replys = xhrResult.sort(function(a,b){if(a.id < b.reply_id){return -1;} else{ return 1;}});
		for( var i = Replys.length - 1; i>=0;i--){
			if( typeof(Replys[i]) == "string" ){
				var reply = $("div");
				reply.id = 'replymore_' + pid;
				reply.className = 'reply_more';
				reply.innerHTML += "이전 댓글 보기";
				reply.onclick= function(){
					getReplys(this,8);
				}
				replywrap.insertBefore(reply,replywrap.firstElementChild);
			} else {
				var reply = makeReply(Replys[i],pid);
				if( obj.id.substr(10,1) == '_'){
					reply.style[getBrowser()+"Animation"] = 'fade_post .5s linear';
					replywrap.insertBefore(reply,replywrap.lastElementChild.previousElementSibling.previousElementSibling);
				} else {
					replywrap.insertBefore(reply,replywrap.firstElementChild);
				}
			}
		}
		if(obj.id.substr(10,1) != '_'){
			replywrap.removeChild(obj);
		}
	}}
	xhr.open("POST","/api/newsfeed/getreplys", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid+'&skip='+reply_skip+'&limit='+limit);
}

function makePreview( link, text, pid, inside ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText != "" ){
			var metas = JSON.parse(xhr.responseText);
			var preview = $("a");
			preview.href = link;
			preview.target = "_blank";
			preview.id = "link_preview_" + pid;
			preview.className = "link_preview";
			var preview_img = $("div");
			preview_img.className = "link_preview_img";

			preview.appendChild( preview_img );

			var preview_text = $("div");
			preview_text.className = "link_preview_text";
			preview.appendChild( preview_text );

			var preview_title = $("div");
			preview_title.id = "link_preview_title_" + pid;
			preview_title.innerHTML = metas.title;
			preview_title.className = "link_preview_title";
			preview_text.appendChild( preview_title );



			var vid;
			var vindex;
			vindex = link.indexOf("youtu.be/");
			if( vindex >= 0 ){
				vid = link.substr( vindex + 9 );
			}
			vindex = link.indexOf("youtube.com/watch?v=");
			if( vindex >= 0 ){	
				vid = link.substr( vindex + 20 );
			}
			if( vid != "" && vid != null ){
				preview_img.id = vid;
				preview_img.onclick = function(event){
					event.stopPropagation();
					event.preventDefault();
					this.nextElementSibling.className = "link_preview_text_big";
					var iframe = $("iframe");
					iframe.style.height = this.clientHeight;
					iframe.src = "https://youtube.com/embed/"  + this.id.split('&')[0]; 
					iframe.allowFullscreen = true;
					this.parentNode.replaceChild(iframe,this);
				}
			} else {
				var preview_description = $("div");
	//			preview_description.innerHTML = metas.description;
				preview_description.innerHTML = metas.description;
				preview_text.appendChild( preview_description );
				if( metas.description.length > 100 ){
					preview_description.innerHTML += '... <span>자세히</span>';
				}
				preview_description.className = "link_preview_description";
			}

			var tmpimg = new Image;
			tmpimg.src = metas.image;
			var realimg = $('img');
			realimg.src = metas.image;
			preview_img.appendChild(realimg);
			tmpimg.onload = function(){
				if( tmpimg.naturalWidth >= preview_img.parentNode.clientWidth ){
					preview_img.className += " link_preview_img_big";
					preview_text.className += " link_preview_text_big";
				} else {
					preview_img.className += " link_preview_img_small";
					preview_text.className += " link_preview_text_small";
				}
			}
			inside.appendChild( preview );
			var preview_helper = $("div");
			preview_helper.className = "link_preview_helper";
			preview_img.appendChild(preview_helper);
			$('#menu_'+pid).innerHTML+="<div id='getaudio_" + pid + "' onclick='getAudio(" + pid + ")'>음원 추출</div>";
		}
	}};
	xhr.open("POST", "/api/newsfeed/linkpreview", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('link='+link);
}

function makeReply( Reply, pid ){
	var reply = $("div");
	reply.id = 'reply_' + pid + '_' + Reply.id;
	reply.className = 'reply';
	var a = $("a");
	a.href = "/@" + Reply.user.uid;
	a.addEventListener('mouseover',profileHover);
	a.addEventListener('mouseleave',profileLeave);
	reply.appendChild(a);
	a.innerHTML += "<img src='/files/profile/" + Reply.user.uid + "'  class='profileimg_reply'>";
	var reply_text = $('div');
	reply_text.className = "reply_text";
	var btn = $('div');
	btn.className = "reply_menu_btn";
	reply_text.appendChild(btn);
	var reply_name = $('a');
	reply_name.innerTexxt = Reply.user.name.toString();
	reply_name.href = a.href;
	reply_name.addEventListener('mouseover',profileHover);
	reply_name.addEventListener('mouseleave',profileLeave);
	var span = $('span');
	span.innerText = Reply.text.toString() + '\r\n';
	reply_text.appendChild(span);
	if( Reply.file ){
		var img = $('img');
		img.src = "/files/post/" + pid + "/reply/" + Reply.id + "?" + Reply.date;
		reply_text.appendChild(img);
	}
	var date_span = $('span');
	date_span.id = "date_" + new Date(Reply.date).getTime();
	date_span.className = "date";
	date_span.innerText = getDateString(Reply.date,1);
	reply_text.appendChild(date_span);
	reply.appendChild(reply_text);

	if( session != "" && session.signUp == true ){
		var reply_menu_btn = reply.lastElementChild.firstChild;
		reply_menu_btn.id = "reply_menu_btn_" + pid + '_' + Reply.id
		reply.onmouseleave=function(event){
			event.stopPropagation();
			event.preventDefault();
			$('#'+this.id.replace("reply","reply_menu_btn")).firstElementChild.style.display = "none";
		}
		var reply_menu = $("div");
		reply_menu_btn.appendChild(reply_menu);
		reply_menu_btn.onclick = function(event){
			event.stopPropagation();
			event.preventDefault();
			this.firstElementChild.style.display="block" 
		}
		reply_menu.className = "reply_menu";
		if( session.uid == Reply.user.uid ){
			reply_menu_btn.style.backgroundImage = "url('/img/change_reply.png')";
			reply_menu.innerHTML += "<div onclick='removeReply(" + pid + "," + Reply.id + ")' >댓글삭제</div>";
			reply_menu.innerHTML += "<div onclick='changeReply(" + pid + "," + Reply.id + ")' >댓글수정</div>";
		} else {
			reply_menu_btn.style.backgroundImage = "url('/img/remove_reply.png')"
			reply_menu.innerHTML += "<div onclick='dontseeReply(" + pid + "," + Reply.id + ")' >보고싶지 않습니다</div>";
			reply_menu.innerHTML += "<div onclick='reportReply(" + pid + "," + Reply.id + ")' >댓글신고</div>";
		}
	}
	return reply;
}

function makePost( Post ){
	var Replys = [];
	if( Post.reply ){
		for( var j = Post.reply.length - 1; j>=0;j--){
			Replys.push(Post.reply[j]);
		}
		Replys.sort(function(a,b){if(a.id < b.id){return 1;} else{ return -1;}});
	}
	Post.date = new Date(Post.date);
	var post_wrap = $('#post_wrap');
	var div = $("div");
	div.id = 'post_' + Post.id;
	div.className = 'post';
	if( Post.share != undefined ){
		var share = $('a');
		share.href = "/@" + Post.share.uid;
		share.addEventListener('mouseover',profileHover);
		share.addEventListener('mouseleave',profileLeave);
		share.id = "post_share_" + Post.id;
		share.className = "post_share";
		share.innerText = Post.share.name += "님이 공유하셨습니다";
		div.appendChild(share);
	}
	var a = $("a");
	a.addEventListener('mouseover',profileHover);
	a.addEventListener('mouseleave',profileLeave);
	a.href = '/@'+Post.user.uid;
	a.addEventListener('mouseover',profileHover);
	a.addEventListener('mouseleave',profileLeave);
	a.className = 'post_name';
	a.innerHTML += "<img src='/files/profile/" + Post.user.uid + "' class='profileimg_post'>";
	a.innerHTML += Post.user.name.toString();
	div.appendChild(a);
	var inside = $("div");
	inside.id = "post_inside_" + Post.id;
	var preview_cnt = 0;
	if( Post.text && Post.text.length >= 1 ){
		//inside.innerHTML+="<span>"+Post.text.toString() +"</span>";
		var textspan = $("span");
		textspan.className = "textspan";
		var texts = Post.text.split("\r\n");
		var textmore = $("yyspan");
		for( var k = 0; k < texts.length; ++k ){
			var textindex = 0;
			while(1){
				var link = /(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-])*[\w@?^=%&amp;\/~+#-])?/gi.exec( texts[k].substr( textindex ) );
				if( link != null ){
					var str = link[0];
					var replace_str = "<a target='_blank' href='" + str + "'>" + link[0] + "</a>";
					textindex += link.index + replace_str.length ;
					if( !preview_cnt++ ){
						if( Post.file == 0 ){
							makePreview(str,texts[k],Post.id,inside);
						}
					}
					texts[k] = texts[k].replace( link[0].toString(), replace_str );
				} else {
					break;
				}
			}
			textspan.innerHTML += texts[k].toString() + '<br />';
		}
		var tmp_post = $("div");
		tmp_post.className = "post";
		tmp_post.appendChild(textspan);
		post_wrap.appendChild(tmp_post);
		textspan.style.display = "block";
		textspan.style.width = post_wrap.clientWidth - 60 + "px";
		if( textspan.clientHeight >= 75 ){
			var textmore_btn = $("span");
			textmore_btn.className = "textmore_btn";
			textmore_btn.innerHTML = "더보기";
			textmore_btn.id = "textmore_btn_" + Post.id;
			textmore_btn.addEventListener("click",function(){
				this.previousElementSibling.style.maxHeight = "initial";
				this.parentNode.removeChild(this);
			});
			inside.appendChild(textmore_btn);
		}
		if( inside.firstElementChild != null ){
			inside.insertBefore(textspan,inside.firstElementChild);
		} else {
			inside.appendChild(textspan);
		}
		post_wrap.removeChild(tmp_post);
		textspan.style.display = "";
		textspan.style.width = "";
	}
	if( Post.html ){
		inside.innerHTML = Post.html;	
	}
	if( Post.file ){
		var post_span = $("span");
		post_span.className = "post_span";
		post_span.onclick = function(){
			$('#postimg_'+Post.id).click();
		}
		post_span.innerText = Post.file ;
		div.appendChild(post_span);

		var date_span = $("span");
		date_span.className = "date";
		date_span.id = "date_" + Post.date.getTime();
		date_span.onclick = function(){
			$('#postimg_'+Post.id).click();
		}
		date_span.innerText = getDateString(Post.date);
		div.appendChild(date_span);

		/*
		//수정됨 표시 ( 모바일화면작아서 일단은 보류 )
		if( Post.change ){
			div.innerHTML+="<span class='post_changed' onclick='alert(\"" + getDateString(Post.change,false,true) + "\")'>수정됨</span>";
			inside.innerHTML+="<img src='/files/post/" + Post.id + "/1" + "?" + Post.change + "' id='postimg_" + Post.id + "' class='postimg' onclick='viewimg(" + Post.id + "," + Post.file + ",\"" + Post.change + "\")' >";
		} else {
		*/
		var preview = $('div');
		preview.className = "postimg_preview";
		var img = $('img');
		img.src = "/files/post/" + Post.id + "/1?" + Post.date;
		img.id = "postimg_" + Post.id;
		img.className = "postimg_img";
		img.onclick = function(){
			viewimg(Post.id,Post.file,Post.date);
		}
		preview.appendChild(img);
		inside.appendChild(preview);
		//}
	} else {
		var date_span = $("span");
		date_span.className = "date";
		date_span.onclick = function(){
			$('#postimg_'+Post.id).click();
		}
		date_span.innerText = getDateString(Post.date);
		date_span.id = "date_" + Post.date.getTime();
		div.appendChild(date_span);

		/* 수정됨
		if( Post.change ){
			div.innerHTML+="<span class='post_changed' onclick='alert(\"" + getDateString(Post.change,false,true) + "\")'>수정됨</span>";
		}
		*/
	}
	if( Post.isFavorite ){
		div.innerHTML+="<span class='post_favorite' id='post_favorite_"+Post.id + "' ></span>";
	}
	inside.className="post_inside";
	div.appendChild(inside);
	if( session != "" && session.signUp == true ){
		var btn = $("div");
		btn.className = 'postmenubtn';
		if( Post.share != undefined ){
			btn.style.top = "24px";
		}
		btn.addEventListener('click', function(){ showmenu(this) });
		div.appendChild(btn);
		var menu = $("div")
		menu.id = 'menu_' + Post.id;
		menu.className = 'post_menu';
		if( session.id == Post.user.id ){
			menu.innerHTML="<div id='postremove_" + Post.id + "' class='postremove' onclick='removePost(" + Post.id + ")'>게시글삭제</div>";
			menu.innerHTML+="<div id='changepost_" + Post.id + "' onclick='changePost(" + Post.id + ")'>게시글수정</div>";
		} else {
			menu.innerHTML+="<div id='dontsee_" + Post.id + "' onclick='dontsee(" + Post.id + ")'>보고싶지 않습니다</div>";
		}
		if( Post.isFavorite ){
			menu.innerHTML+="<div id='favorite_" + Post.id + "' onclick='postFavorite(" + Post.id + ',0' + ")'>관심글해제</div>";
		} else {
			menu.innerHTML+="<div id='favorite_" + Post.id + "' onclick='postFavorite(" + Post.id + ',1' + ")'>관심글등록</div>";
		}
		if( Post.isShare ){
			menu.innerHTML+="<div id='share_" + Post.id + "' onclick='postShare(" + Post.id + ',0' + ")'>공유취소</div>";
		} else {
			menu.innerHTML+="<div id='share_" + Post.id + "' onclick='postShare(" + Post.id + ',1' + ")'>공유하기</div>";
		}
		div.appendChild(menu);
	}

	var replywrap = $("div");
	replywrap.className = 'replywrap';
	div.appendChild(replywrap);
	if( Replys.length == 0 && session.signUp != true ){
		replywrap.style.display = "none";
	}
	for( var i = Replys.length - 1; i >=0; i-- ){
		if(typeof(Replys[i]) == "string"){
			var reply = $("div");
			reply.id = 'replymore_' + Post.id;
			reply.className = 'reply_more';
			reply.innerHTML += "이전 댓글 보기";
			reply.onclick= function(){
				getReplys(this,8);
			}
			replywrap.insertBefore(reply,replywrap.firstElementChild);
		} else {
			replywrap.appendChild(makeReply(Replys[i],Post.id));
		}
	}
	if( session != "" && session.signUp == true ){
		var reply = $("div");
		reply.onkeydown = function(event){ capturekey(event,this)}
		reply.id = 'replywrite_' + Post.id;
		reply.className = 'reply';
		reply.innerHTML += "<img src='/files/profile/" + session.uid + "' class='profileimg_reply'>";
		reply.innerHTML += "<textarea type='text' class='writereply' onkeyup='reply_resize(this)' onkeydown='reply_resize(this)' onkeypress='reply_resize(this)' placeholder='댓글을 입력하세요...' ></textarea><label for='replyinput_" + Post.id + "' class='replyinput_label'></label>"
		replywrap.appendChild(reply);
		var reply_upload = $("input");
		reply_upload.type = "file";
		reply_upload.accept = 'image/*';
		reply_upload.id="replyinput_" + Post.id;
		reply_upload.onchange = function(event){ openfile_reply(event) }
		replywrap.appendChild(reply_upload);
		var reply_output = $("div");
		reply_output.className = "replyoutput";
		reply_output.id = "replyoutput_" + Post.id;
		replywrap.appendChild(reply_output);
	}
	return div;
}

//게시글 불러오기
function getPosts(limit){
	var postwrap = $('#post_wrap');
	postwrap.style.display = "";
	if( $("#post_none") ){
		postwrap.removeChild($("#post_none").parentNode);
	}
	if( skip > posts ){
		skip = posts;
	}
	if( !dateUpdateId ){
		dateUpdateId = setInterval(dateUpdate,30000)
	} else {
		dateUpdate();
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){
		if (xhr.readyState == 4 && xhr.status == 200){
			if(xhr.responseText!='[]'){
				postLoading = false;
				var xhrResult = JSON.parse(xhr.responseText);
				var Posts = xhrResult.sort(function(a,b){if(a._id < b._id){return -1;} else{ return 1;}});
				posts += Posts.length;
				skip = posts;
				for( var i = Posts.length-1; i >= 0; --i){
					if( $('#post_'+Posts[i].id) != undefined ){
						continue;
					}
					var div = makePost(Posts[i]);
					if( limit ){
						postwrap.appendChild(div);
					} else {
						div.style[getBrowser()+"Animation"] = 'fade_post .5s linear';
						postwrap.insertBefore(div,postwrap.firstElementChild.nextElementSibling);
					}
					
				}
			} else if( posts == 0 ){
				var post = $("div");
				post.className = "post";
				var post_inside = $("div");
				post_inside.className = "post_inside";
				post_inside.id = "post_none";
				if( postOption.favorite == "true" ){
					post_inside.innerText = "아직 관심글로 표시한 게시글이 없습니다.";
				} else {
					post_inside.innerText = "아직 작성된 게시글이 없습니다.";
				}
				post.appendChild(post_inside);
				postwrap.appendChild(post);
			}
		}
	}
	xhr.open("POST","/api/newsfeed/getposts", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	var params = "skip=";
	if( limit ){
		params += skip + "&limit=" + limit;
	} else if(limit == 0){
		params += "0&limit=1";
	}
	if( skip > posts ){
		skip = posts;
	}
	if( postOption ){
		var obj_keys = Object.keys(postOption);
		for( var i = 0; obj_keys.length > i; ++i ){
			params += "&" + obj_keys[i] + "=" + postOption[obj_keys[i]];
		}
	}
	xhr.send(params);
}


// 이미지 보고있을때 단축키들
var select;
function keydown(e){
	var postwrap = $('#post_wrap');
	if( imgviewing != undefined && imgviewing == true ){
		event.stopPropagation();
	//	event.preventDefault();
		if(e.keyCode==39 || e.keyCode == 40){
			event.preventDefault();
			$('#rightbtn').click();
		} else if(e.keyCode==37 || e.keyCode == 38){
			event.preventDefault();
			$('#leftbtn').click();
		} else if( e.keyCode==27 ){
			event.preventDefault();
			$('#imglayer').style.opacity="0";
			$('#lefthover').style.display="none";
			$('#righthover').style.display="none";
			$('#imgmenuhover').style.display="none";
			imgviewing = 0;
		}
	} else if( document.activeElement == document.body ){
		if((e.shiftKey==false&&e.keyCode==9)||e.keyCode==40||e.keyCode==39){
			event.preventDefault();
			if( select ){
				select.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
				select.style.boxShadow = "initial";
				if( select.nextSibling ){
					select = select.nextSibling;
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = session.color.hex;
					select.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
				} else {
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = session.color.hex;
					select.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
					return;
				}
			} else {
				select = postwrap.firstElementChild
				select.style.borderColor = session.color.hex;
				select.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
			}
		} else if((e.shiftKey==true&&e.keyCode==9)||e.keyCode==38||e.keyCode==37){
			event.preventDefault();
			if( select ){
				select.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
				select.style.boxShadow = "initial";
				if( select.previousSibling ){
					select = select.previousSibling;
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = session.color.hex;
					select.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
				} else {
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = session.color.hex;
					select.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
					return;
				}
			} else {
				select = postwrap.firstElementChild
				select.style.borderColor = session.color.hex;
				select.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
			}
		}
	}
}



// 파일 업로드시 드래그이벤트

function DragOut(evt){
	evt.stopPropagation();
	evt.preventDefault();
	var obj = evt.target.style;
	obj.margin = "";
	obj.borderTop="";
	obj.borderBottom="";
	obj.borderLeft="";
	obj.paddingLeft = "";
	obj.borderRight="";
}

function DragOver(evt){
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
	obj = evt.target.style;
	obj.border="1px dashed #bbb";
	obj.paddingLeft = "2px";
}

window.addEventListener('load',function(){
	var postwrap = $("div");
	postwrap.id = 'post_wrap'
	$('#wrap_mid').appendChild(postwrap);
	if( session && postOption.uid == null && postOption.search == null){
		var write = $("div");
		write.id = "write";
		write.innerHTML+='<div id="output_post"></div>';
		write.innerHTML+='<div id="post_write_button" onclick="postWrite();">게시</div>';
		write.innerHTML+='<label for="post_file" id="post_file_label"></label>';
		write.innerHTML+='<input type="file" accept="image/*" id="post_file" name="file" multiple="multiple" onchange="openfile_post(event)">';
		write.className = "post";
	
		var postwrite = $("textarea");
		postwrite.id = 'post_write';
		postwrite.placeholder = "글을 입력하세요";
		postwrite.addEventListener('keydown', function(){ post_resize(this) }, false);
		postwrite.addEventListener('keypress', function(){ post_resize(this) }, false);
		postwrite.addEventListener('keyup', function(){ post_resize(this) }, false);
		postwrite.addEventListener('dragover', DragOver, false);
		postwrite.addEventListener('dragleave', DragOut, false);
		postwrite.addEventListener('mouseout', DragOut, false);
		postwrite.addEventListener('drop', openfile_post, false);
		postwrite.addEventListener('paste', openfile_paste, false);
		
		write.insertBefore(postwrite,write.firstElementChild);

		if( typeof(user) != "undefined" && user.id ){
			if( user.id == session.id ){
				postwrap.appendChild(write);
			} else {
				
			}
		} else if( typeof(Post) == "object" ){
		} else {
			postwrap.appendChild(write);
		}
	}
	var output_post = $("#output_post");
	var post_file = $("#post_file");

	window.addEventListener('scroll', function(e){
		if( $('#post_wrap') != null && postLoading == false ){
			if ((window.innerHeight + document.body.scrollTop) + 200 >= document.body.scrollHeight && $('#post_wrap').style.display != "none" ){
				postLoading = true;
				getPosts(10);
			}
		}
	});

	if( location.pathname.substr(0,6) == "/post/" ){
		if( Post.length ){
			Post = Post[0]
			postwrap.appendChild(makePost(Post));
		} else {
			location.href = "/";
		}
	} else if( postOption.uid != null || postOption.search != null ){
		
	} else {
		getPosts(10);
		socket.on( 'post_new', function(){
			getPosts(0,1);
		});
		socket.on( 'post_removed', function( pid ){
			postwrap.removeChild($("#post_"+pid));	
		});
	}


	socket.on( 'connect_failed', function(){
	});
	socket.onbeforeunload = function(){
	}
	socket.on( 'disconnect', function(){
	});
	socket.on( 'reply_new', function( data ){
		if( $( "#post_" + data.pid ) ){
			getReplys( $( "#replywrite_" + data.pid ), 1 );
		}
	});
	socket.on( 'reply_removed', function( replyid ){
		$("#"+replyid).parentNode.removeChild($("#" + replyid));	
	});
});

//포스트 메뉴 보이기
function showmenu(dom){
	hidemenu();
	$("#menu_" + dom.parentNode.id.substr(5)).style.display="block"
	event.stopPropagation();
}


// 덧글쓰기
function replyWrite(post){
	var pid = post.id.substr(11);
	var tmp = post.lastElementChild.previousElementSibling.value.toString();
	var formdata = new FormData();
	var input = $("#replyinput_"+pid);
	$("#replywrite_"+input.id.substr(11)).lastElementChild.style.display="block";
	if( input.files.length || tmp.length >= 1 ){
		formdata.append("file",input.files[0]);
		formdata.append("text",tmp);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			var replyid = xhr.responseText;
			getReplys(post,1);
//			getReplys($("#replywrite_" + pid),1);
		}}
		xhr.open("POST","/api/newsfeed/writereply/" + pid, false); xhr.send(formdata)
		input.value="";
		post.lastElementChild.previousElementSibling.value="";
		event.preventDefault(); 
		reply_resize(post.lastElementChild.previousElementSibling);
		$("#replyoutput_" + pid).style.display="none";
		$("#replyoutput_" + pid).innerHTML="";
	} else {
		alert("댓글이 비어 있습니다. 글을 입력해주세요");
		post.lastElementChild.previousElementSibling.value="";
	}
}

// 게시글쓰기
function postWrite(){
	var postwrite = $('#post_write');
	var tmp = postwrite.value;
	var formdata = new FormData();
	var realfiles_tmp = realfiles[0];
	if( realfiles_tmp == undefined ){
		realfiles_tmp = [];
	}
	if( realfiles_tmp[0] || tmp.length>= 1 ){
		for( var i=0; i<realfiles_tmp.length; ++i){
//		for( var i=realfiles_tmp.length-1; i>=0; --i){
			formdata.append("file",realfiles_tmp[i]);
		}
		formdata.append("text",tmp);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			var pid = parseInt(xhr.responseText);
			getPosts(0);
			var post_cnt = $('#user_list_tab_value_post');
			if( post_cnt ){
				post_cnt.innerText = parseInt(post_cnt.innerText) + 1;
			}
//			socket.emit( 'post_write', pid );
		}}
		xhr.open("POST","/api/newsfeed/writepost", false);  xhr.send(formdata);
		realfiles[0] = [];
		post_write.value="";
		post_file.value="";
		output_post.innerHTML="";
		//output_post.style.display="none";
		$('#post_write').style.borderTop="1px solid rgba(0,0,0,0.2)";
		$('#post_write').style.borderBottom="1px solid rgba(0,0,0,0.2)";
	} else {
		alert("게시글이 비어 있습니다.");
	}
}


