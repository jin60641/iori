
window.addEventListener("click", hidemenu);
window.addEventListener("keydown",keydown);

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
function dontsee(postid){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( location.pathname.substr(0,6) == "/post/" ){
			location.href = "/";
		} else {
			var post = $("#post_"+postid);
			post.style.display="none";
			var dontsee_menu = $("div");
			dontsee_menu.className = "post";
			dontsee_menu.style.paddingBottom = "8px";
			dontsee_menu.innerHTML = "뉴스피드에 이 게시물이 표시되지 않습니다. <span style='color:#34a798;cursor:pointer;' onclick='dontsee_cancle(" + postid + ")'>취소</span>";
			dontsee_menu.innerHTML += "<img src='/img/remove_reply.jpg' style='width:16px; float:right; cursor:pointer' onclick='this.parentNode.parentNode.removeChild(this.parentNode)'><br>";
			postwrap.insertBefore(dontsee_menu,post);
		}
	}}
	xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=post&obj_id='+postid);
}

//보고싶지 않습니다 취소
function dontsee_cancle(postid){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var post = $("#post_"+postid);
		post.style.display="";
		postwrap.removeChild(post.previousElementSibling);
	}}
	xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=post&obj_id='+postid);
}

//관심글 등록, 취소
function favorite(postid,add){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var menu_favorite = $("#favorite_"+postid);
		if(add){
			menu_favorite.onclick=function(){
				favorite(this.id.substr(9),0)
			}
			menu_favorite.innerText="관심글해제";
			var span = $("span")
			span.className="post_favorite";
			span.innerHTML="<img src='/img/star.png'>";
			span.id="post_favorite_"+postid;
			$("#post_"+postid).insertBefore(span,$("#post_inside_"+postid));
			imgmenu_favorite.src='/img/favorite_remove.png';
			imgmenu_favorite.onclick = function(){
				event.stopPropagation();
				favorite(postid,0)
			}
		} else {
			menu_favorite.onclick=function(){
				favorite(this.id.substr(9),1)
			}
			menu_favorite.innerText = "관심글등록";
			$("#post_"+postid).removeChild($("#post_favorite_"+postid));
			imgmenu_favorite.src='/img/favorite.png';
			imgmenu_favorite.onclick = function(){
				favorite(postid,1)
			}
		}
	}}
	xhr.open("POST", "/api/newsfeed/favorite", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('postid='+postid);
}

// 게시글 수정
function changePost(postid){
	var cancle = $("div");
	cancle.id = "changecancle_"+postid;
	cancle.onclick = function(){
		cancleChange(this.id.substr(13));
	}
	cancle.innerText="수정 취소";
	$("#menu_"+postid).replaceChild(cancle,$("#changepost_"+postid))
	var inside = $("#post_inside_"+postid);
	inside.style.paddingBottom = "39px";
	var preview = $("#link_preview_"+postid);
	if( preview ){
		preview.style.display = "none";
	}
	var textarea = $("textarea");
	if( inside.firstChild && inside.firstChild.lastElementChild ){
		inside.firstChild.lastElementChild.click();
	}
	textarea.value = inside.firstChild.innerText;
	textarea.onkeypress=function(){post_resize(this)};
	textarea.onkeydown=function(){post_resize(this)}; 
	textarea.onkeyup=function(){post_resize(this)};
	textarea.placeholder="글을 입력하세요.";
	if(inside.firstChild.innerText){
		eval("origin_"+postid+"=inside.firstChild.cloneNode(true)");
		inside.replaceChild(textarea,inside.firstChild);
	} else {
		inside.insertBefore(textarea,inside.firstChild);
	}
	var postbtn = $("div");
	postbtn.className = "post_change_button";
	postbtn.onclick=function(){
		changePost_apply(this.parentNode);
	}
	var label = $("label");
	label.className = "post_change_label";
	label.htmlFor = "post_file_"+postid;
	inside.insertBefore(label,textarea.nextElementSibling);
	inside.insertBefore(postbtn,textarea.nextElementSibling);
	var input = $("input");
	input.className = "post_change_file";
	input.id = "post_file_"+postid;
	input.type = "file";
	input.accept = "image/*";
	input.multiple = "multiple";
	input.onchange = function(event){
		openfile_post(event,this.id.substr(10));
	}
	inside.insertBefore(input,postbtn);
	var output = $("div");
	output.className = "output_change";
	output.id = "changeoutput_"+postid;
	inside.insertBefore(output,postbtn);
	var post_span = inside.parentNode.childNodes[1];
	eval("fileindex_"+postid+"=[]");
	eval("var fileindex = fileindex_"+postid);
	eval("realfiles_"+postid+"=[]");
	if(post_span.className == "post_span"){
		for(var j = 0; j < inside.childElementCount; ++j){
		//for(var j = inside.childElementCount - 1; j>=0; --j){
			if(inside.childNodes[j].tagName == "IMG"){
				var src = inside.childNodes[j].src;
				for(var i = 0; i < parseInt(post_span.innerText); ++i){
					fileindex[i] = i + 1;
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
					src = src.replace(/(.*post\/)(.*\/)(.*)\?/i,"$1"+"$2"+(i+1)+"?");
					imgbox.style.background="url('" + src + "') center center no-repeat"
					imgbox.style.backgroundSize="cover";
					imgbox.style.backgroundClip="content-box";
					var deletebtn = $("div");
					deletebtn.className='delete_postimg';
					deletebtn.onclick= function(){
						eval("var realfiles = realfiles_"+this.parentNode.parentNode.id.substr(13));
						fileindex.splice( parseInt(this.parentNode.id.substr(8)) - 1 , 1);
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
	var postid = inside.id.substr(12);
	eval("var realfiles_change = realfiles_"+postid);
	eval("var fileindex = fileindex_"+postid);
	if( fileindex[0] || inside.firstElementChild.value.length>= 1 ){
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
		inside.innerHTML="<span>"+inside.firstChild.value.replace(/(\r\n|\n|\r)/gm,"<br />") +"</span><br />";  
		if(xhr.responseText){ 
			var xhrResult = JSON.parse( xhr.responseText );
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
						$("#postimg_" +postid).click();
					}, false);
					span.innerHTML = xhrResult.file;
					inside.parentNode.insertBefore(span,inside.parentNode.firstElementChild.nextElementSibling);
				}
			}
			if(xhrResult.file){
				inside.innerHTML+="<img src='/files/post/"+postid+"/1?"+xhrResult.date+"' id='postimg_"+postid+"' class='postimg' onclick='viewimg("+postid+","+xhrResult.file+",\""+ xhrResult.date+"\")' ></img>"
			}
			cancleChange(postid);
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
	if( fileindex[0] ){
		xhr.open("POST","/api/newsfeed/changepost/" + postid + "/" + fileindex, false); xhr.send(formdata)
	} else {
		xhr.open("POST","/api/newsfeed/changepost/" + postid + "/0", false); xhr.send(formdata)
	}
}

//게시글 수정 취소
function cancleChange(postid){
	eval("delete realfiles_"+postid);
	eval("delete fileindex_"+postid);
	var div = $("div")
	div.id = "changepost_"+postid;
	div.onclick = "changePost("+postid+")";
	div.innerText="게시글수정";
	div.onclick=function(){
		changePost(this.id.substr(11));
	}
	var inside = $("#post_inside_"+postid);
	inside.style.paddingBottom="3px";
	$("#menu_"+postid).replaceChild(div,$("#changecancle_"+postid))
	for(var i = inside.childElementCount - 1; i>=0; --i){
		var child = inside.childNodes[i];
		if(child.tagName=="TEXTAREA"){
			try {
				eval("origin = origin_"+postid);
			}
			catch(err){
				inside.removeChild(child);
				continue;
			}
			inside.replaceChild(origin,child);
			eval("delete origin_"+postid);
		} else if(child.tagName=="SPAN"||child.tagName=="IMG"||child.tagName=="BR"||child.tagName=="A"){
			child.style.display = "";
		} else {
			inside.removeChild(child);
		}
	}
	var post_span = inside.parentNode.childNodes[1];
	if(post_span.className == "post_span"){
		inside.innerHTML+="<img src='/files/post/" + postid + "/1" + "?" + new Date() + "' id='postimg_" + postid + "' class='postimg' onclick='viewimg(" + postid + "," + post_span.innerText + ",\"" + new Date() + "\")' >";
	}
}

//파일열기(writepost) paste
function openfile_paste(event,postid){

}

//파일열기(writepost)
function openfile_post(event,postid){
	event.stopPropagation();
	event.preventDefault();
	if( event.dataTransfer ){
		event.dataTransfer.dropEffect = 'copy';
	}
	if(postid){
		var output = $("#changeoutput_"+postid);
		eval("var realfiles = realfiles_"+postid);
		eval("var fileindex = fileindex_"+postid);
	} else {
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
		if(realfiles.length>=20){
			alert("사진은 최대 20장까지만 업로드 가능합니다.");
			return false;
		}
		realfiles.push(files[i]);
		if(postid){
			var post_span = input.parentNode.parentNode.childNodes[1];
			if(post_span.className == "post_span"){
				if( fileindex[fileindex.length - 1] < parseInt(post_span.innerText) ){
					fileindex.push(parseInt(post_span.innerText)+1);
				} else {
					fileindex.push(fileindex[fileindex.length - 1] + 1);
				}
			} else {
				fileindex.push(1);
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
			if(postid){
				deletebtn.onclick= function(){
					eval("var realfiles = realfiles_"+this.parentNode.parentNode.id.substr(13));
					eval("var fileindex = fileindex_"+this.parentNode.parentNode.id.substr(13));
					var index = parseInt(this.parentNode.id.substr(8)) - 1;
					realfiles.splice( index - output.childElementCount + realfiles.length , 1 );
					fileindex.splice( index , 1);
					output.removeChild(this.parentNode);  
					for( var j=0; j<output.childElementCount;++j){
						output.children[j].id = "postimg_" + (j+1);
					}
				}
			} else {
				deletebtn.onclick= function(){
					realfiles.splice( (parseInt(this.parentNode.id.substr(8)) - 1), 1 );
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
			var output = $("#replyoutput_change_"+input.id.substr(18));
			$("#replyinput_change_"+input.id.substr(18)).style.display="none";
			deleteimg.onclick= function(){
				input.previousElementSibling.previousElementSibling.style.display="";
				this.parentNode.removeChild(this.previousElementSibling); 
				this.style.display = "none";
				input.value="";
			}
		} else {
			var output = $("#replyoutput_"+input.id.substr(11));
			$("#replywrite_"+input.id.substr(11)).lastElementChild.style.display="none";
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
	replywrite.value = reply.childNodes[1].childNodes[2].data;
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
		cancle.style.color = "#34a798";
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
			reply.childNodes[1].childNodes[2].data = tmp;
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
			socket.emit( 'reply_remove', id )
		} else {
			alert(xhr.responseText);
		}
	}}
	xhr.open("POST", "/api/newsfeed/removereply", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('reply_id='+id);
}

//게시글 삭제
function removePost(pid){
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
				return "<span style='padding-right:25px;'>어제</span><img src='/img/postdate.jpg' onclick='alert(\"" + dateString + "\")' style='cursor:pointer'>";
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
			return "<span style='padding-right:25px;'>" + Math.floor((b.getTime()/1000 - postdate_time)/86400) + "일 전</span><img src='/img/postdate.jpg' onclick='alert(\"" + dateString + "\")' style='cursor:pointer'>";
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
	xhr.open("POST","/api/newsfeed/getreplys", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('postid='+pid+'&skip='+reply_skip+'&limit='+limit);
}

function makePreview( link, text, Post, inside ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText != "" ){
			var metas = JSON.parse(xhr.responseText);
			var preview = $("a");
			preview.href = link;
			preview.target = "_blank";
			preview.id = "link_preview_" + Post.id;
			preview.className = "link_preview";
			var preview_img = $("img");
			preview_img.id = link;
			preview_img.src = metas.image;
			preview_img.onclick = function(event){
				var vid;
				var vindex;
				vindex = this.id.indexOf("youtu.be/");
				if( vindex >= 0 ){
					vid = this.id.substr( vindex + 9 );
				}
				vindex = this.id.indexOf("youtube.com/watch?v=");
				if( vindex >= 0 ){	
					vid = this.id.substr( vindex + 20 );
				}
				if( vid != "" && vid != null ){
					event.stopPropagation();
					event.preventDefault();
					this.nextElementSibling.className = "link_preview_text_big";
					var iframe = $("iframe");
					iframe.style.height = this.clientHeight;
					iframe.src = "https://youtube.com/embed/"  + vid.split('&')[0]; 
					iframe.allowFullscreen = true;
					this.parentNode.replaceChild(iframe,this);
				}
			}
			var preview_title = $("div");
			preview_title.innerHTML = metas.title;
			preview_title.className = "link_preview_title";
			var preview_description = $("div");
			preview_description.innerHTML = metas.description;
			preview_description.className = "link_preview_description";
			preview.appendChild( preview_img );
			var preview_text = $("div");
			preview.appendChild( preview_text );
			preview_text.appendChild( preview_title );
			preview_text.appendChild( preview_description );
			preview_img.onload = function(){
				if( preview_img.naturalWidth >= preview_img.parentNode.clientWidth ){
					preview_img.className = "link_preview_img_big";
					preview_text.className = "link_preview_text_big";
				} else {
					preview_img.className = "link_preview_img_small";
					preview_text.className = "link_preview_text_small";
				}
			}
			inside.appendChild( preview );
		}
	}};
	xhr.open("POST", "/api/newsfeed/linkpreview", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('link='+link);
}

function makeReply( Reply, pid ){
	var reply = $("div");
	reply.id = 'reply_' + pid + '_' + Reply.id;
	reply.className = 'reply';
	var a = $("a");
	a.href = "/@" + Reply.user.uid;
	reply.appendChild(a);
	a.innerHTML += "<img src='/files/profile/" + Reply.user.uid + "'  class='profileimg_reply'>";
	if( Reply.file ){
		reply.innerHTML += '<div class="reply_text"><div class="reply_menu_btn"></div><a href="/@' + Reply.user.uid + '">' +  Reply.user.name.toString() + "</a>" + Reply.text.toString() + '<br><img src="/files/post/'+ pid + '/reply/' + Reply.id + "?" + Reply.date + '">' + "<br><span id='date_" + new Date(Reply.date).getTime() + "' class='date'>" + getDateString(Reply.date,1) + '</span></div>';
	} else {
		reply.innerHTML += '<div class="reply_text"><div class="reply_menu_btn"></div><a href="/@' + Reply.user.uid + '">' +  Reply.user.name.toString() + "</a>" + Reply.text.toString() + "<br><span id='date_" + new Date(Reply.date).getTime() + "' class='date'>" + getDateString(Reply.date,1) + '</span></div>';
	}
	if( session != "" && session.signUp == true ){
		reply_menu_btn = reply.lastElementChild.firstChild;
		reply_menu_btn.onmouseleave=function(event){
			event.stopPropagation();
			event.preventDefault();
			this.firstElementChild.style.display="none";
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
			reply_menu_btn.style.backgroundImage = "url('/img/change_reply.jpg')";
			reply_menu.innerHTML += "<div onclick='removeReply(" + pid + "," + Reply.id + ")' >댓글삭제</div>";
			reply_menu.innerHTML += "<div onclick='changeReply(" + pid + "," + Reply.id + ")' >댓글수정</div>";
		} else {
			reply_menu_btn.style.backgroundImage = "url('/img/remove_reply.jpg')"
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
	var post_wrap = $('#post_wrap');
	var div = $("div");
	div.id = 'post_' + Post.id;
	div.className = 'post';
	var a = $("a");
	a.href = '/@'+Post.user.uid;
	a.className = 'post_name';
	a.innerHTML += "<img src='/files/profile/" + Post.user.uid + "' class='profileimg_post'>";
	a.innerHTML += Post.user.name.toString();
	div.appendChild(a);
	var inside = $("div");
	inside.id = "post_inside_" + Post.id;
	if( Post.text && Post.text.length >= 1 ){
		//inside.innerHTML+="<span>"+Post.text.toString() +"</span>";
		var textspan = $("span");
		textspan.className = "textspan";
		var texts = Post.text.split("\r\n");
		var preview_cnt = 0;
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
						makePreview(str,texts[k],Post,inside);
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
		textspan.style.width = postwrap.clientWidth - 60 + "px";
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
		/*
		var span = $("span");
		span.className = "post_span";
		span.addEventListener('click', function(e){
			$("#postimg_" + e.target.parentNode.id.substr(5)).click();
		}, false);
		span.innerHTML = Post.file ;
		div.insertBefore(span,div.firstElementChild.nextElementSibling);
		*/
		div.innerHTML+="<span class='post_span' onclick='$(\"#postimg_" + Post.id + "\").click();'>" + Post.file + "</span>";
		div.innerHTML+="<span id='date_" + new Date(Post.date).getTime() + "' class='date'>" + getDateString(Post.date) + "</span>";
		/*
		//수정됨 표시 ( 모바일화면작아서 일단은 보류 )
		if( Post.change ){
			div.innerHTML+="<span class='post_changed' onclick='alert(\"" + getDateString(Post.change,false,true) + "\")'>수정됨</span>";
			inside.innerHTML+="<img src='/files/post/" + Post.id + "/1" + "?" + Post.change + "' id='postimg_" + Post.id + "' class='postimg' onclick='viewimg(" + Post.id + "," + Post.file + ",\"" + Post.change + "\")' >";
		} else {
		*/
		inside.innerHTML+="<img src='/files/post/" + Post.id + "/1" + "?" + Post.date + "' id='postimg_" + Post.id + "' class='postimg' onclick='viewimg(" + Post.id + "," + Post.file + ",\"" + Post.date + "\")' >";
		//}
	} else {
		div.innerHTML+="<span id='date_" + new Date(Post.date).getTime() + "' class='date'>" + getDateString(Post.date) + "</span>";
		/* 수정됨
		if( Post.change ){
			div.innerHTML+="<span class='post_changed' onclick='alert(\"" + getDateString(Post.change,false,true) + "\")'>수정됨</span>";
		}
		*/
	}
	if( Post.isfavorite ){
		div.innerHTML+="<span class='post_favorite' id='post_favorite_"+Post.id + "' ><img src='/img/star.png'></span>";
	}
	inside.className="post_inside";
	div.appendChild(inside);
	if( session != "" && session.signUp == true ){
		var btn = $("div");
		btn.className = 'postmenubtn';
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
		if( Post.isfavorite ){
			menu.innerHTML+="<div id='favorite_" + Post.id + "' onclick='favorite(" + Post.id + ',0' + ")'>관심글해제</div>";
		} else {
			menu.innerHTML+="<div id='favorite_" + Post.id + "' onclick='favorite(" + Post.id + ',1' + ")'>관심글등록</div>";
		}
		div.appendChild(menu);
	}

	var replywrap = $("div");
	replywrap.className = 'replywrap';
	div.appendChild(replywrap);
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
	if( $("#post_none") ){
		post_wrap.removeChild($("#post_none").parentNode);
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
				var xhrResult = JSON.parse(xhr.responseText);
				var Posts = xhrResult.sort(function(a,b){if(a.id < b.id){return -1;} else{ return 1;}});
				posts += Posts.length;
				skip = posts;
				for( var i = Posts.length-1; i >= 0; --i){
					var div = makePost(Posts[i]);
					if( limit ){
						postwrap.appendChild(div);
					} else {
						div.style[getBrowser()+"Animation"] = 'fade_post .5s linear';
						postwrap.insertBefore(div,postwrap.firstElementChild.nextElementSibling);
					}
				}
			} else if( posts == 0 && postOption.userid == undefined && ( session == "" || ( session != "" && session.signUp != 1 ) ) ){
				var post_slider = $("div");
				post_slider.id = "post_slider";
			
				var slide_imgs = $("div");
				slide_imgs.style.left = "0px";
				slide_imgs.id = "slide_imgs";

				var slide_count = 4;
				for( var i = 1; i <= slide_count; ++i ){
					var slide = $("div");
					slide.className = "slide";
					var colorcode = "";
					for( var j = 0; j < 3; ++j ){
						colorcode += Math.round(Math.random()*50 + 180).toString(16);
						if( colorcode.length % 2 ){
							colorcode += "0";
						}
					}
					slide.style.backgroundColor = '#' + colorcode;
//					slide.style.background = "url('/img/slider_" + i + ".jpg')";
					slide_imgs.appendChild(slide);
				};
			
				post_slider.appendChild(slide_imgs);
			/*
				var slide1 = $("img");
				slide1.className = "slide";
				slide1.src = "/img/main/img_main.png";
				slider.appendChild(slide1);
			*/
			
				post_slider.onmouseover = function(){
					var arrows = $(".slide_arrow");
					for( var i = 0; i < arrows.length; ++i ){
						arrows[i].style.display = "block";
					}
				}
			
				post_slider.onmouseout = function(){
					var arrows = $(".slide_arrow");
					for( var i = 0; i < arrows.length; ++i ){
						arrows[i].style.display = "none";
					}
				}
				var slide_box = $("div");
				slide_box.id = "slide_box";

				slide_logo = $("img");
				slide_logo.src = "/img/logo_white.png";
				slide_logo.id = "slide_logo";
				slide_box.appendChild(slide_logo);
			
				var slide_line = $("div");
				slide_line.id = "slide_line";
				slide_box.appendChild(slide_line);

				var slide_text = $("text");
				slide_text.innerHTML = "Lorem ipsum dolor sit amet, conectetur adipisicing elit<br>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
				slide_box.appendChild(slide_text);

				var slide_btn = $("div");
				slide_btn.id = "slide_btn";
				slide_btn.onclick = function(){
					location.href = "/register";
				}
				slide_btn.innerText = "지금 시작하기";
				slide_box.appendChild(slide_btn);
			
				post_slider.appendChild(slide_box);
			
				var slide_left = $("img");
				slide_left.className = "slide_arrow";
				slide_left.id = "slide_left";
				slide_left.src = "/img/btn_slide_left.png";
				post_slider.appendChild(slide_left);

				slide_left.onclick = function(){
					sliding(-1);
					clearInterval(sliderTimer);
					sliderTimer = setInterval(sliding,3000);
				}
			
				var slide_right = $("img");
				slide_right.id = "slide_right";
				slide_right.className = "slide_arrow";
				slide_right.src = "/img/btn_slide_right.png";
				post_slider.appendChild(slide_right);
			
				slide_right.onclick = function(){
					clearInterval(sliderTimer);
					sliderTimer = setInterval(sliding,3000);
					sliding(1);
				}
			
				document.body.removeChild(post_wrap);
				document.body.appendChild(post_slider);
				sliderTimer = setInterval(sliding,3000);
			} else if( posts == 0 ){
				var post = $("div");
				post.className = "post";
				var post_inside = $("div");
				post_inside.className = "post_inside";
				post_inside.id = "post_none";
				post_inside.innerText = "아직 작성된 게시글이 없습니다.";
				post.appendChild(post_inside);
				postwrap.appendChild(post);
			}
		}
	}
	xhr.open("POST","/api/newsfeed/getposts", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
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
		obj_keys = Object.keys(postOption);
		for( var i = 0; obj_keys.length > i; ++i ){
			params += "&" + obj_keys[i] + "=" + postOption[obj_keys[i]];
		}
	}
	xhr.send(params);
}

var sliding_tmp = 0;
function sliding( type ){
	if( !type ){
		type = 1;
	}
	var imgs = $("#slide_imgs");
	var margin = document.body.clientWidth;
	var current_left = parseInt(imgs.style.left.split("px")[0]);
	if( !sliding_tmp ){
		sliding_tmp = 1;
		if( ( type == -1 && current_left == 0 ) ){
			var img = imgs.childNodes[imgs.childElementCount-1];
			imgs.removeChild(img);
			img = img.cloneNode(true);
			img.style.marginLeft =  margin * type + "px";
			imgs.insertBefore(img,imgs.childNodes[0]);
			setTimeout(function(){
				img.style.marginLeft = "0px";
			}, 10);
			removeTimer = setTimeout(function(){
				sliding_tmp = 0;
			},500);
			return;
		} else if ( ( type == 1 && current_left >= -margin * ( imgs.childElementCount - 1 ) ) ){
			var img = imgs.childNodes[0];
			imgs.appendChild(img.cloneNode(true))
			img.style.transition = "margin-left .5s";
			img.style.marginLeft = -margin + "px";
			removeTimer = setTimeout(function(){
				sliding_tmp = 0;
				imgs.removeChild(imgs.firstChild)
			},500);
			return;
		}
		imgs.style.left = current_left - margin * type + "px";
	}
}




// 이미지 보고있을때 단축키들
var select;
function keydown(e){
	if(imgviewing){
		event.stopPropagation();
	//	event.preventDefault();
		if(e.keyCode==39 || e.keyCode == 40){
			event.preventDefault();
			rightbtn.click();
		} else if(e.keyCode==37 || e.keyCode == 38){
			event.preventDefault();
			leftbtn.click();
		} else if(e.keyCode==27){
			event.preventDefault();
			imglayer.style.opacity="0";
			lefthover.style.display="none";
			righthover.style.display="none";
			imgmenuhover.style.display="none";
			imgviewing=0;
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
					select.style.borderColor = "#ff5c26";
					select.style.boxShadow = "inset 0px 0px 0px 1px #ff5c26";
				} else {
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = "#ff5c26";
					select.style.boxShadow = "inset 0px 0px 0px 1px #ff5c26";
					return;
				}
			} else {
				select = postwrap.firstElementChild
				select.style.borderColor = "#ff5c26";
				select.style.boxShadow = "inset 0px 0px 0px 1px #ff5c26";
			}
		}
		if((e.shiftKey==true&&e.keyCode==9)||e.keyCode==38||e.keyCode==37){
			event.preventDefault();
			if( select ){
				select.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
				select.style.boxShadow = "initial";
				if( select.previousSibling ){
					select = select.previousSibling;
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = "#ff5c26";
					select.style.boxShadow = "inset 0px 0px 0px 1px #ff5c26";
				} else {
					select.scrollIntoViewIfNeeded();
					select.style.borderColor = "#ff5c26";
					select.style.boxShadow = "inset 0px 0px 0px 1px #ff5c26";
					return;
				}
			} else {
				select = postwrap.firstElementChild
				select.style.borderColor = "rgb(86, 210, 199)";
				select.style.boxShadow = "inset 0px 0px 0px 1px rgb(86, 210, 199)";
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
	obj.borderRight="";
}

function DragOver(evt){
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
	obj = evt.target.style;
	obj.border="2px dashed #bbb";
	obj.margin = "-1px 3px 17px 3px"; 
//	obj.marginLeft="2px";
//	obj.marginTop="-26px";
//	obj.marginBottom="-36px";
}

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
function viewimg(postid,filecount,date,url){
	document.body.style.overflowY = "scroll";
	document.body.style.position = "fixed";
	imgviewing = 1;
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
			favorite(postid,0);
		}
	} else {
		imgmenu_favorite.src = '/img/favorite.png';
		imgmenu_favorite.onclick = function(){
			favorite(postid,1);
		}
	}
	if(filecount == 1 || (/(BB|iPad|iPhone|iPod|Android)/i.test( navigator.userAgent )) ){
		lefthover.style.display="none";
		righthover.style.display="none";
	} else if (filecount >= 1){
		lefthover.style.display="block";
		righthover.style.display="block";
	}
	for(var i = 1; i<=filecount; ++i){
		var img = $("img");
		img.src="/files/post/" + postid + "/" + i + "?" + date;
		if( url ){
			img.src = url + '?' + date;
		}
		imgdownload.href=img.src;
		imgdownload.download=postid+'_'+1+'';
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
	if(window.innerWidth < 530 ){
		imgmenu.style.display="none";
	} else {
		imgmenu.style.display="block";
	}
	imgmenu.style.left=(window.innerWidth - imgmenu.clientWidth - 20 )/2 + "px";
	//imgmenuhover.style.left=(window.innerWidth - imgmenu.clientWidth)/2 + "px";
}

window.addEventListener('load',function(){
	postwrap = $("div");
	postwrap.id = 'post_wrap'
	document.body.appendChild(postwrap);

	if( session ){
		var write = $("div");
		write.id = "write";
		write.innerHTML+='<div id="output_post"></div>';
		write.innerHTML+='<div id="post_write_button" onclick="postWrite();"></div>';
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
	
	imgviewing = 0;
	imglayer = $("div");
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
	rightbtn = $("div");
	rightbtn.onclick = function(e){
		e.stopPropagation();
		e.preventDefault();
		for( var j=imgbox.childNodes.length - 1 ; j>=1; --j ){
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
	righthover = $("div");
	righthover.onclick = rightbtn.onclick;
	righthover.id = "righthover";
	imglayer.appendChild(righthover);
	rightbtn.id = "rightbtn";
	imglayer.appendChild(rightbtn);
	leftbtn = $("div");
	leftbtn.onclick = function(e){
		e.stopPropagation();
		e.preventDefault();
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
	lefthover = $("div");
	lefthover.onclick = leftbtn.onclick;
	lefthover.id = "lefthover";
	imglayer.appendChild(lefthover);
	leftbtn.id = "leftbtn";
	imglayer.appendChild(leftbtn);
	imgmenuhover = $("div");
	imgmenuhover.id = "imgmenuhover";
	imgmenuhover.onclick = function(){
		event.stopPropagation();
	}
	imglayer.appendChild(imgmenuhover);
	imgmenu = $("div");
	imgmenu.id = "imgmenu";
	imgmenu.onclick = function(event){
		event.stopPropagation();
//		event.preventDefault();
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
	imgmenu.innerHTML="<img id='imgmenu_favorite' src='/img/favorite.png'>";
	imgmenu.innerHTML+="<a id='imgdownload' download><img src='/img/download.png'></a>"; //<img src='/img/share.png'>";
	if( !(/(BB|iPad|iPhone|iPod|Android|\.NET)/i.test( navigator.userAgent )) ){
		imgmenu.innerHTML += "<img src='/img/imgfull.png' onclick='viewfull(this)' >";
	} else {
		imglayer.onclick = function(){ document.body.style.overflowY=""; imglayer.style.opacity="0";imgviewing=0;}
	}
	imglayer.appendChild(imgmenu);
	imgbox = $("div");
	imgbox.id = "imgbox";
	imglayer.appendChild(imgbox);
	document.body.appendChild(imglayer);
	output_post = $("#output_post");
	post_file = $("#post_file");

	window.addEventListener('scroll', function(e){
		if ((window.innerHeight + document.body.scrollTop) + 200 >= document.body.scrollHeight){
			getPosts(4);
		}
	});

	if( location.pathname.substr(0,6) == "/post/" ){
		if( Post.length ){
			Post = Post[0]
			postwrap.appendChild(makePost(Post));
		} else {
			location.href = "/";
		}
	} else {
		getPosts(10);
		socket.on( 'post_new', function(){
			getPosts(0,1);
		});
		socket.on( 'post_removed', function( postid ){
			postwrap.removeChild($("#post_"+postid));	
			getPosts(1);
		});
	}

	imgmenu_resize();
	
	window.addEventListener('resize', function(){
		imgmenu_resize();
	});


	socket.on( 'notice_new', function(){
//		notice.innerHTML = parseInt(notice.innerHTML)+1;
	})
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
	var postid = post.id.substr(11);
	var tmp = post.lastElementChild.previousElementSibling.value.toString();
	var formdata = new FormData();
	var input = $("#replyinput_"+postid);
	$("#replywrite_"+input.id.substr(11)).lastElementChild.style.display="block";
	if( input.files.length || tmp.length >= 1 ){
		formdata.append("file",input.files[0]);
		formdata.append("text",tmp);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			var replyid = xhr.responseText;
			getReplys(post,1);
//			getReplys($("#replywrite_" + postid),1);
		}}
		xhr.open("POST","/api/newsfeed/writereply/" + postid, false); xhr.send(formdata)
		input.value="";
		post.lastElementChild.previousElementSibling.value="";
		event.preventDefault(); 
		reply_resize(post.lastElementChild.previousElementSibling);
		$("#replyoutput_" + postid).style.display="none";
		$("#replyoutput_" + postid).innerHTML="";
	} else {
		alert("댓글이 비어 있습니다. 글을 입력해주세요");
		post.lastElementChild.previousElementSibling.value="";
	}
}

// 게시글쓰기
realfiles=[];
function postWrite(){
	var postwrite = $('#post_write');
	var tmp = postwrite.value;
	var formdata = new FormData();
	if( realfiles[0] || tmp.length>= 1 ){
		for( var i=0; i<realfiles.length; ++i){
//		for( var i=realfiles.length-1; i>=0; --i){
			formdata.append("file",realfiles[i]);
		}
		formdata.append("text",tmp);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			pid = parseInt(xhr.responseText);
			getPosts(0);
//			socket.emit( 'post_write', pid );
		}}
		xhr.open("POST","/api/newsfeed/writepost", false);  xhr.send(formdata);
		realfiles=[];
		post_write.value="";
		post_file.value="";
		output_post.innerHTML="";
		//output_post.style.display="none";
		$('#postwrite').style.borderTop="1px solid rgba(0,0,0,0.2)";
		$('#postwrite').style.borderBottom="1px solid rgba(0,0,0,0.2)";
	} else {
		alert("게시글이 비어 있습니다.");
	}
}


