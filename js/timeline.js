'use strict';
	
inits["timeline"] = {
	Post : null,
	postOption : {},
	post_skip : 0,
	post_cnt : 0,
	postLoading : false,
	realfiles : { '0' : [] },
	post_origin : {},
	fileindex : {},
	listeners : [],
	dateUpdateId : null,
	selectedPost : null,
	makeReply : function( Reply, pid ){
		let that = this;
		let reply = $("div");
		reply.id = 'reply_' + pid + '_' + Reply.id;
		reply.className = 'reply';
		let a = $("a");
		makeHref( a,"/@" + Reply.user.uid);
		a.addEventListener('mouseover',profileHover);
		a.addEventListener('mouseleave',profileLeave);
		reply.appendChild(a);
		a.innerHTML += "<img src='/files/profile/" + Reply.user.uid + "'  class='profileimg_reply'>";
		let reply_text = $('div');
		reply_text.className = "reply_text";
		let btn = $('div');
		btn.className = "reply_menu_btn";
		reply_text.appendChild(btn);
		let reply_name = $('a');
		reply_name.innerTexxt = Reply.user.name.toString();
		makeHref( reply_name, a.href );
		reply_name.addEventListener('mouseover',profileHover);
		reply_name.addEventListener('mouseleave',profileLeave);
		let span = $('span');
		span.innerText = Reply.text.toString() + '\r\n';
		reply_text.appendChild(span);
		if( Reply.file ){
			let img = $('img');
			img.src = "/files/post/" + pid + "/reply/" + Reply.id + "?" + Reply.date;
			reply_text.appendChild(img);
		}
		let date_span = $('span');
		date_span.id = "date_" + new Date(Reply.date).getTime();
		date_span.className = "date";
		date_span.innerText = this.getDateString(Reply.date,1);
		reply_text.appendChild(date_span);
		reply.appendChild(reply_text);
	
		if( session != "" && session.signUp == true ){
			let reply_menu_btn = reply.lastElementChild.firstChild;
			reply_menu_btn.id = "reply_menu_btn_" + pid + '_' + Reply.id
			reply.onmouseleave=function(event){
				event.stopPropagation();
				event.preventDefault();
				$('#'+this.id.replace("reply","reply_menu_btn")).firstElementChild.style.display = "none";
			}
			let reply_menu = $("div");
			reply_menu_btn.appendChild(reply_menu);
			reply_menu_btn.onclick = function(event){
				event.stopPropagation();
				event.preventDefault();
				this.firstElementChild.style.display="block" 
			}
			reply_menu.className = "reply_menu";
			if( session.uid == Reply.user.uid ){
				reply_menu_btn.style.backgroundImage = "url('/img/change_reply.png')";
				let reply_remove = $('div');
				reply_remove.onclick = function(){
					that.removeReply( pid, Reply.id );
				}
				reply_remove.innerText = "댓글삭제";
				reply_menu.appendChild(reply_remove);
				
				let reply_change = $('div');
				reply_change.onclick = function(){
					that.changeReply( pid, Reply.id );
				}
				reply_change.innerText = "댓글수정";
				reply_menu.appendChild(reply_change);
			} else {
				reply_menu_btn.style.backgroundImage = "url('/img/remove_reply.png')"
				let reply_dontsee = $('div');
				reply_dontsee.onclick = function(){
					that.dontseeReply( pid, Reply.id );
				}
				reply_dontsee.innerText = "보고싶지 않습니다.";
				reply_menu.appendChild(reply_dontsee);
				
				let reply_report = $('div');
				reply_report.onclick = function(){
					that.Report( pid, Reply.id );
				}
				reply_report.innerText = "댓글신고";
				reply_menu.appendChild(reply_report);
			}
		}
		return reply;
	},
	getDateString : function(date,reply,change){
		let postdate = new Date(date);
		let now = new Date();
		let postdate_time = Math.floor(postdate.getTime()/1000)
		let now_time = Math.floor(now.getTime()/1000)
		let gap = now_time - postdate_time;
		let dateString = (postdate.getYear()+1900)+'년 '+ (postdate.getMonth()+1) + "월 " + postdate.getDate() + "일"; 
		let timeString = postdate.getHours() + "시 " + postdate.getMinutes() + "분";
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
				return "어제";
//				return "어제 " + timeString;
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
				let b = new Date();
				b.setHours(0);
				b.setMinutes(0);
				b.setSeconds(0);
				b.setMilliseconds(0);
				let days =  Math.floor((b.getTime()/1000 - postdate_time)/86400);
				if( days/30 >= 1 ){
					return Math.floor(days/30)+"달 전";
				} else {
					return days+ "일 전";
				}
				/*
				return "<span style='padding-right:25px;'>" + Math.floor((b.getTime()/1000 - postdate_time)/86400) + "일 전</span><img src='/img/postdate.png' onclick='alert(\"" + dateString + "\")' style='cursor:pointer'>";
				*/
			}
		}
		return date;
	},
	makePreview : function( link, text, pid, inside ){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText != "" ){
				let metas = JSON.parse(xhr.responseText);
				let preview = $("a");
				preview.href = link;
				preview.target = "_blank";
				preview.id = "link_preview_" + pid;
				preview.className = "link_preview";
				let preview_img = $("div");
				preview_img.className = "link_preview_img";
	
				preview.appendChild( preview_img );
	
				let preview_text = $("div");
				preview_text.className = "link_preview_text";
				preview.appendChild( preview_text );
	
				let preview_title = $("div");
				preview_title.id = "link_preview_title_" + pid;
				preview_title.innerHTML = metas.title;
				preview_title.className = "link_preview_title";
				preview_text.appendChild( preview_title );
	
				let vid;
				let vindex;
				vindex = link.indexOf("youtu.be/");
				if( vindex >= 0 ){
					vid = link.substr( vindex + 9 );
				}
				vindex = link.indexOf("youtube.com/watch?v=");
				if( vindex >= 0 ){	
					vid = link.substr( vindex + 20 );
				}
				if( vid != "" && vid != null ){
					vid = vid.split('&')[0];
					preview_img.id = vid;
					preview_img.onclick = function(event){
						event.stopPropagation();
						event.preventDefault();
						this.nextElementSibling.className = "link_preview_text_big";
						let iframe = $("iframe");
						iframe.style.height = this.clientHeight;
						iframe.src = "https://youtube.com/embed/"  + this.id.split('&')[0]; 
						iframe.allowFullscreen = true;
						this.parentNode.replaceChild(iframe,this);
					}
					if( $('#menu_'+pid ) ){
						let getaudio = $('div');
						getaudio.id = "getaudio_" + pid;
						getaudio.onclick = function(){
							that.getAudio(pid);
						}
						getaudio.innerText = "음원 추출";
						$('#menu_'+pid).appendChild(getaudio)
					}
				} else {
					let preview_description = $("div");
		//			preview_description.innerHTML = metas.description;
					preview_description.innerHTML = metas.description;
					preview_text.appendChild( preview_description );
					if( metas.description.length > 100 ){
						preview_description.innerHTML += '... <span>자세히</span>';
					}
					preview_description.className = "link_preview_description";
				}
	
				let tmpimg = new Image;
				tmpimg.src = metas.image;
				let realimg = $('img');
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
				let preview_helper = $("div");
				preview_helper.className = "link_preview_helper";
				preview_img.appendChild(preview_helper);
			}
		}};
		xhr.open("POST", "/api/newsfeed/linkpreview", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('link='+link);
	},
	makePost : function( Post ){
		let that = this;
		let Replys = [];
		if( Post.reply ){
			for( let j = Post.reply.length - 1; j>=0;j--){
				Replys.push(Post.reply[j]);
			}
			Replys.sort(function(a,b){if(a.id < b.id){return 1;} else{ return -1;}});
		}
		Post.date = new Date(Post.date);
		let post_wrap = $('#post_wrap');
		let div = $("div");
		div.id = 'post_' + Post.id;
		div.className = 'post';
		if( Post.share != undefined ){
			let share = $('span');
			share.id = "post_share_" + Post.id;
			share.className = "post_share";
			let share_name = $('a');
			makeHref( share_name, "/@" + Post.share.uid );
			share_name.addEventListener('mouseover',profileHover);
			share_name.addEventListener('mouseleave',profileLeave);
			share_name.innerText = Post.share.name;
			share.appendChild(share_name);
			let share_text = $('text');
			share_text.innerText = "님이 공유하셨습니다";
			share.appendChild(share_text);
			div.appendChild(share);
		}
		let a = $("a");
		a.addEventListener('mouseover',profileHover);
		a.addEventListener('mouseleave',profileLeave);
		makeHref( a, "/@" + Post.user.uid );
		a.addEventListener('mouseover',profileHover);
		a.addEventListener('mouseleave',profileLeave);
		a.className = 'post_name';
		a.innerHTML += "<img src='/files/profile/" + Post.user.uid + "' class='profileimg_post'>";
		a.innerHTML += Post.user.name.toString();
		div.appendChild(a);
		let inside = $("div");
		inside.id = "post_inside_" + Post.id;
		let preview_cnt = 0;
		if( Post.text && Post.text.length >= 1 ){
			//inside.innerHTML+="<span>"+Post.text.toString() +"</span>";
			let textspan = $("span");
			textspan.className = "textspan";
			let texts = Post.text.split("\r\n");
			let textmore = $("yyspan");
			for( let k = 0; k < texts.length; ++k ){
				let textindex = 0;
				while(1){
					let link = /(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-])*[\w@?^=%&amp;\/~+#-])?/gi.exec( texts[k].substr( textindex ) );
					if( link != null ){
						let str = link[0];
						let replace_str = "<a target='_blank' href='" + str + "'>" + link[0] + "</a>";
						textindex += link.index + replace_str.length ;
						if( !preview_cnt++ ){
							if( Post.file == 0 ){
								that.makePreview(str,texts[k],Post.id,inside);
							}
						}
						texts[k] = texts[k].replace( link[0].toString(), replace_str );
					} else {
						break;
					}
				}
				textspan.innerHTML += texts[k].toString() + '<br />';
			}
			let tmp_post = $("div");
			tmp_post.className = "post";
			tmp_post.appendChild(textspan);
			post_wrap.appendChild(tmp_post);
			textspan.style.display = "block";
			textspan.style.width = post_wrap.clientWidth - 60 + "px";
			if( textspan.clientHeight >= 75 ){
				let textmore_btn = $("span");
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
			let post_span = $("span");
			post_span.className = "post_span";
			post_span.onclick = function(){
				$('#postimg_'+Post.id).click();
			}
			post_span.innerText = Post.file ;
			div.appendChild(post_span);
	
			let date_span = $("span");
			date_span.className = "date";
			date_span.id = "date_" + Post.date.getTime();
			date_span.onclick = function(){
				$('#postimg_'+Post.id).click();
			}
			date_span.innerText = this.getDateString(Post.date);
			div.appendChild(date_span);
	
			/*
			//수정됨 표시 ( 모바일화면작아서 일단은 보류 )
			if( Post.change ){
				div.innerHTML+="<span class='post_changed' onclick='alert(\"" + this.getDateString(Post.change,false,true) + "\")'>수정됨</span>";
				inside.innerHTML+="<img src='/files/post/" + Post.id + "/1" + "?" + Post.change + "' id='postimg_" + Post.id + "' class='postimg' onclick='viewimg(" + Post.id + "," + Post.file + ",\"" + Post.change + "\")' >";
			} else {
			*/
			let preview = $('div');
			preview.className = "postimg_preview";
			let img = $('img');
			img.src = "/files/post/" + Post.id + "/1?" + Post.date;
			img.id = "postimg_" + Post.id;
			img.className = "postimg_img";
			img.onclick = function(){
				inits["imglayer"].viewimg(Post.id,Post.file,Post.date);
			}
			preview.appendChild(img);
			inside.appendChild(preview);
			//}
		} else {
			let date_span = $("span");
			date_span.className = "date";
			date_span.onclick = function(){
				$('#postimg_'+Post.id).click();
			}
			date_span.innerText = this.getDateString(Post.date);
			date_span.id = "date_" + Post.date.getTime();
			div.appendChild(date_span);
	
			/* 수정됨
			if( Post.change ){
				div.innerHTML+="<span class='post_changed' onclick='alert(\"" + this.getDateString(Post.change,false,true) + "\")'>수정됨</span>";
			}
			*/
		}
		if( Post.isFavorite ){
			div.innerHTML+="<span class='post_favorite' id='post_favorite_"+Post.id + "' ></span>";
		}
		inside.className="post_inside";
		div.appendChild(inside);
		if( session != "" && session.signUp == true ){
			let btn = $("div");
			btn.className = 'postmenubtn';
			btn.addEventListener('click', function(){ that.showmenu(this) });
			btn.addEventListener('touchstart', function(){ that.showmenu(this) });
			div.appendChild(btn);
			let menu = $("div")
			menu.id = 'menu_' + Post.id;
			if( Post.share != undefined ){
				btn.style.top = "24px";
				menu.style.top = "44px";
			}
			menu.className = 'post_menu';
			menu.ontouchstart = function(e){
				e.stopPropagation();
			}
			menu.onclick = function(e){
				e.stopPropagation();
			}
			if( session.id == Post.user.id ){
				let postremove = $('div');
				postremove.className = "postremove";
				postremove.id = "postremove_" + Post.id;
				postremove.onclick = function(){
					that.removePost( Post.id );
				};
				postremove.innerText = "게시글삭제";
				menu.appendChild(postremove);

				let postchange = $('div');
				postchange.className = "postchange";
				postchange.id = "postchange_" + Post.id;
				postchange.onclick = function(){
					that.changePost( Post.id );
				};
				postchange.innerText = "게시글수정";
				menu.appendChild(postchange);
			} else {
				let postdontsee = $('div');
				postdontsee.id = "dontsee_" + Post.id;
				postdontsee.onclick = function(){
					that.dontseePost( Post.id );
				}
				postdontsee.innerText = "보고싶지 않습니다.";
				menu.appendChild(postdontsee);
			}
			let postfavorite = $('div');
			postfavorite.id = "favorite_" + Post.id;
			menu.appendChild(postfavorite);
			if( Post.isFavorite ){
				postfavorite.onclick = function(){
					that.postFavorite( Post.id, 0 );
				}
				postfavorite.innerText = "관심글해제";
			} else {
				postfavorite.onclick = function(){
					that.postFavorite( Post.id, 1 );
				}
				postfavorite.innerText = "관심글등록";
			}
			let postshare = $('div');
			postshare.id = "share_" + Post.id;
			menu.appendChild(postshare);
			if( Post.isShare ){
				postshare.onclick = function(){
					that.postShare( Post.id, 0 );
				}
				postshare.innerText = "공유취소";
			} else {
				postshare.onclick = function(){
					that.postShare( Post.id, 1 );
				}
				postshare.innerText = "공유하기";
			}
			div.appendChild(menu);
		}
	
		let replywrap = $("div");
		replywrap.className = 'replywrap';
		div.appendChild(replywrap);
		if( Replys.length == 0 && session.signUp != true ){
			replywrap.style.display = "none";
		}
		for( let i = Replys.length - 1; i >=0; i-- ){
			if(typeof(Replys[i]) == "string"){
				let reply = $("div");
				reply.id = 'replymore_' + Post.id;
				reply.className = 'reply_more';
				reply.innerHTML += "이전 댓글 보기";
				reply.onclick= function(){
					that.getReplys(this,8);
				}
				replywrap.insertBefore(reply,replywrap.firstElementChild);
			} else {
				replywrap.appendChild(this.makeReply(Replys[i],Post.id));
			}
		}
		if( session != "" && session.signUp == true ){
			let reply = $("div");
			reply.onkeydown = function(event){ that.capturekey(event,this)}
			reply.id = 'replywrite_' + Post.id;
			reply.className = 'reply';
			
			let img = $('img');
			img.src = "/files/profile/" + session.uid;
			img.className = "profileimg_reply";
			reply.appendChild(img);

			let textarea = $('textarea');
			textarea.className = "writereply";
			textarea.onkeyup = function(){
				that.reply_resize(this);
			}
			textarea.onkeydown = textarea.onkeyup;
			textarea.onkeypress = textarea.onkeyup;
			textarea.placeholder = "댓글을 입력하세요...";
			textarea.id = "reply_textarea_" + Post.id;
			textarea.onpaste = function(event){ that.openfile_reply(event) }
			reply.appendChild(textarea);
			
			let label = $('label');
			label.htmlFor = "replyinput_" + Post.id;
			label.id = "replyinput_label_" + Post.id;
			label.className = "replyinput_label";
			reply.appendChild(label);
			
			replywrap.appendChild(reply);
			let reply_upload = $("input");
			reply_upload.type = "file";
			reply_upload.accept = 'image/*';
			reply_upload.id="replyinput_" + Post.id;

			reply_upload.onchange = function(event){ that.openfile_reply(event) }
			replywrap.appendChild(reply_upload);
			let reply_output = $("div");
			reply_output.className = "replyoutput";
			reply_output.id = "replyoutput_" + Post.id;
			replywrap.appendChild(reply_output);
		}
		return div;
	},
	dateUpdate : function(){
		var that = this;
		let dates = $(".date");
		let i = dates.length - 1
		for( ; i >= 0; --i ){
			let date = new Date( parseInt(dates[i].id.substr(5)) )
			if(dates[i].childNodes[1]){
				if(dates[i].childNodes[1].className=="viewing"){
					let a = date.toLocaleTimeString().replace(':',"시 ");
					dates[i].firstChild.innerText = a.substr(0,a.indexOf(":"))+"분";
				} else {
					dates[i].innerHTML = that.getDateString(date);
				}
			} else {
				if(dates[i].parentNode.className == "reply_text"){
					dates[i].innerHTML = that.getDateString(date,1);
				} else {
					dates[i].innerHTML = that.getDateString(date);
				}
			}
		}
	},
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
	preventDefault : function(event) {
		if( inits["imglayer"].imgviewing ){
			event.stopPropagation();
			event.preventDefault();
			event.returnValue = false;
			return false;
		}
	},
	getAudio : function( pid ){
		let mp3 = confirm("mp3로 변환받으시겠습니까?(영상에 따라 시간이 추가로 소요될 수 있습니다)");
		let link = $('#link_preview_' + pid).href;
		let vid;
		let vindex;
		vindex = link.indexOf("youtu.be/");
		if( vindex >= 0 ){
			vid = link.substr( vindex + 9 );
		}
		vindex = link.indexOf("youtube.com/watch?v=");
		if( vindex >= 0 ){	
			vid = link.substr( vindex + 20 );
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let obj;
			try {
				obj = JSON.parse(xhr.responseText);
				let download = $("a");
				let title = $('#link_preview_title_' + pid);
				download.download = title.innerText + "." + obj.type;
				download.href = '/api/audio/getaudio/' + vid;
				download.click();
			} catch(e){
				alert(xhr.responseText);
			}
		}};
		xhr.open("POST", "/api/audio/add/" + vid, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('mp3='+mp3);
	
	},
	hidemenu : function(){
		let that = this;
		let post_menu = $(".post_menu");
		let reply_menu = $(".reply_menu");
		for(let i = reply_menu.length-1;i>=0;i--){
			reply_menu[i].style.display="none";
		}
		for(let i = post_menu.length-1;i>=0;i--){
			post_menu[i].style.display="none";
		}
		if( that.selectedPost ){
			that.selectedPost.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
			that.selectedPost.style.boxShadow = "initial";
		}
	},
	dontseeReply : function(pid,reply_id){
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let reply = $("#reply_" + pid + "_" + reply_id);
			reply.parentNode.removeChild(reply);
		}};
		xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=reply&obj_id='+reply_id);
	},
	dontseePost : function(pid){
		let that = this;
		let postwrap = $('#post_wrap');
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( location.pathname.substr(0,6) == "/post/" ){
				location.href = "/";
			} else {
				let post = $("#post_"+pid);
				post.style.display="none";
				let menu = $("div");
				menu.className = "post";
				menu.style.paddingBottom = "8px";
				menu.innerText = "뉴스피드에 이 게시물이 표시되지 않습니다.";
				let span = $('span');
				span.className = "dontsee_span";
				span.innerText = "취소";
				span.onclick = function(){
					that.dontsee_cancel( pid );
				}
				menu.appendChild(span);
				let btn = $('span');
				btn.className = "dontsee_btn";
				btn.addEventListener('click', function(){	
					this.parentNode.parentNode.removeChild(this.parentNode);
				});
				menu.appendChild(btn);
				postwrap.insertBefore(menu,post);
			}
		}}
		xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=post&obj_id='+pid);
	},
	dontsee_cancel : function(pid){
		let postwrap = $('#post_wrap');
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let post = $("#post_"+pid);
			post.style.display="";
			postwrap.removeChild(post.previousElementSibling);
		}}
		xhr.open("POST", "/api/newsfeed/dontsee", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('type=post&obj_id='+pid);
	},
	postFavorite : function(pid,add){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let menu_favorite = $("#favorite_"+pid);
			if(add){
				menu_favorite.onclick=function(){
					that.postFavorite(pid,0)
				}
				menu_favorite.innerText="관심글해제";
				let span = $("span")
				span.className="post_favorite";
				span.id="post_favorite_"+pid;
				$("#post_"+pid).insertBefore(span,$("#post_inside_"+pid));
				if( $('#imgmenu_favorite') ){
					$('#imgmenu_favorite').src='/img/favorite_remove.png';
					$('#imgmenu_favorite').onclick = function(){
						event.stopPropagation();
						that.postFavorite(pid,0)
					}
				}
			} else {
				menu_favorite.onclick=function(){
					that.postFavorite(pid,1)
				}
				menu_favorite.innerText = "관심글등록";
				$("#post_"+pid).removeChild($("#post_favorite_"+pid));
				if( $('#imgmenu_favorite') ){
					$('#imgmenu_favorite').src='/img/favorite.png';
					$('#imgmenu_favorite').onclick = function(){
						that.postFavorite(pid,1)
					}
				}
			}
		}}
		xhr.open("POST", "/api/newsfeed/favorite", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid);
	},
	postShare : function(pid,add){
		let xhr = new XMLHttpRequest();
		let that = this;
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let menu_share = $("#share_"+pid);
			if(add){
				menu_share.onclick = function(){
					that.postShare(pid,0)
				}
				menu_share.innerText="공유취소";
				if( $('#imgmenu_share') ){
					$('#imgmenu_share').src='/img/share_remove.png';
					$('#imgmenu_share').onclick = function(){
						event.stopPropagation();
						that.postShare(pid,0)
					}
				}
			} else {
				menu_share.onclick=function(){
					that.postShare(pid,1)
				}
				menu_share.innerText = "공유하기";
				if( $('#imgmenu_share') ){
					$('#imgmenu_share').src='/img/share.png';
					$('#imgmenu_share').onclick = function(){
						that.postShare(pid,1)
					}
				}
			}
		}}
		xhr.open("POST", "/api/newsfeed/share", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid);
	},
	changePost : function(pid){
		let that = this;
		let cancel = $("div");
		cancel.id = "changecancel_"+pid;
		cancel.onclick = function(){
			that.cancelChange(pid);
		}
		cancel.innerText="수정 취소";
		$("#menu_"+pid).replaceChild(cancel,$("#postchange_"+pid))
		let inside = $("#post_inside_"+pid);
		inside.style.paddingBottom = "39px";
		let preview = $("#link_preview_"+pid);
		if( preview ){
			preview.style.display = "none";
		}
		let textarea = $("textarea");
		if( inside.firstChild && inside.firstChild.lastElementChild ){
			inside.firstChild.lastElementChild.click();
		}
		if( inside.firstChild ){
			textarea.value = inside.firstChild.innerText;
		} else {
			textarea.value = "";
		}
		textarea.onkeypress=function(){that.post_resize(this)};
		textarea.onkeydown=function(){that.post_resize(this)}; 
		textarea.onkeyup=function(){that.post_resize(this)};
		textarea.placeholder="글을 입력하세요.";
		if( inside.firstChild && inside.firstChild.innerText ){
			that.post_origin[pid]=inside.firstChild.cloneNode(true);
			inside.replaceChild(textarea,inside.firstChild);
		} else {
			inside.insertBefore(textarea,inside.firstChild);
		}
		let postbtn = $("div");
		postbtn.className = "post_change_button";
		postbtn.innerText = "게시";
		postbtn.onclick=function(){
			that.changePost_apply(this.parentNode);
		}
		let label = $("label");
		label.className = "post_change_label";
		label.htmlFor = "post_file_"+pid;
		inside.insertBefore(label,textarea.nextElementSibling);
		inside.insertBefore(postbtn,textarea.nextElementSibling);
		let input = $("input");
		input.className = "post_change_file";
		input.id = "post_file_"+pid;
		input.type = "file";
		input.accept = "image/*";
		input.multiple = "multiple";
		input.onchange = function(event){
			that.openfile_post(event,this.id.split('_').pop());
		}
		inside.insertBefore(input,postbtn);
		let output = $("div");
		output.className = "output_change";
		output.id = "changeoutput_"+pid;
		inside.insertBefore(output,postbtn);
		let post_span = inside.parentNode.childNodes[1];
		that.fileindex[pid] = [];
		that.realfiles[pid] = [];
		let fileindex_tmp = that.fileindex[pid];
		if(post_span.className == "post_span"){
			for(let j = 0; j < inside.childElementCount; ++j){
			//for(let j = inside.childElementCount - 1; j>=0; --j){
				let img = inside.childNodes[j].firstElementChild;
				if( img != undefined && img.tagName == "IMG"){
					let src = img.src;
					for(let i = 0; i < parseInt(post_span.innerText); ++i){
						fileindex_tmp[i] = i + 1;
						let imgbox = $("div");
						imgbox.id = "postimg_" +( i + 1);
						imgbox.className='post_imgbox';
						output.appendChild(imgbox);
						output.style.display="block";
						imgbox.addEventListener("dragstart",function(evt){
							evt.stopPropagation();
							evt.preventDefault();
							return false;
						});
						let dataURL = event.target.result;
						src = src.replace(/(.*post\/)(.*\/)(.*)\?/i,"$1"+"$2"+(i+1)+"?");
						imgbox.style.background="url('" + src + "') center center no-repeat"
						imgbox.style.backgroundSize="cover";
						imgbox.style.backgroundClip="content-box";
						let deletebtn = $("div");
						deletebtn.className='delete_postimg';
						deletebtn.onclick= function(){	
							fileindex_tmp.splice( parseInt(this.parentNode.id.split('_').pop()) - 1 , 1);
							output.removeChild(this.parentNode);  
							for( let k = 0; k < output.childElementCount; ++k ){
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
	},
	changePost_apply : function(inside){
		let that = this;
		if(!confirm("수정된 사항을 저장하시겠습니까?")){
			return false;
		}
		let formdata = new FormData();
		let pid = inside.id.split('_').pop();
		let realfiles_change = that.realfiles[pid];
		let fileindex_tmp = that.fileindex[pid];
		let xhr;
		if( fileindex_tmp[0] || inside.firstElementChild.value.length>= 1 ){
			for( let i = 0; i < realfiles_change.length; ++i ){
	//		for( let i = realfiles_change.length-1; i>=0; --i){
				formdata.append("file",realfiles_change[i]);
			}
			formdata.append("text",inside.firstChild.value);
			
			xhr = new XMLHttpRequest();
		} else {
			alert("게시글이 비어 있습니다.");
			return false;
		}
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			inside.style.paddingBottom="3px";
			let preview_cnt = 0;
			if(xhr.responseText){ 
				let xhrResult = JSON.parse( xhr.responseText );
				let text = inside.firstElementChild.value.replace(/((\r\n)|\n|\r)/gm,"<br />"); 
				let textspan = $("span");
				textspan.className = "textspan";
				let texts = text.split("\r\n");
				let textmore = $("yyspan");
				for( let k = 0; k < texts.length; ++k ){
					let textindex = 0;
					while(1){
						let link = /(http|https):\/\/([\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-])*[\w@?^=%&amp;\/~+#-])?/gi.exec( texts[k].substr( textindex ) );
						if( link != null ){
							let str = link[0];
							let replace_str = "<a target='_blank' href='" + str + "'>" + link[0] + "</a>";
							textindex += link.index + replace_str.length ;
							if( !preview_cnt++ ){
								if( xhrResult.file == undefined || xhrResult.file == 0 ){
									that.makePreview(str,texts[k],pid,inside);
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
				let date = new Date( xhrResult.date ).getTime();
				let post_span = inside.parentNode.childNodes[1];
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
						let span = $("span");
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
				that.cancelChange(pid,true);
				/*
				// 수정됨 삽입기능 ( 모바일이 좁아서 보류 )
				let post_date;
				for( let i = inside.parentNode.childElementCount - 1; i >= 0; --i){
					if( inside.parentNode.childNodes[i].className == "post_changed"){
						break;
					} else if( inside.parentNode.childNodes[i].className == "date" ){
						post_date = inside.parentNode.childNodes[i];
					} else if( i == 0 ){
						let span = $("span");
						span.className='post_changed';
						span.onclick= function(){
							alert(this.getDateString(date,false,true));
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
	},
	cancelChange : function(pid,change){
		let that = this;
		delete that.realfiles[pid];
		delete that.fileindex[pid];
		let div = $("div")
		div.id = "postchange_"+pid;
		div.innerText="게시글수정";
		div.onclick=function(){
			that.changePost(pid);
		}
		let inside = $("#post_inside_"+pid);
		inside.style.paddingBottom="3px";
		$("#menu_"+pid).replaceChild(div,$("#changecancel_"+pid))
		for(let i = inside.childElementCount - 1; i>=0; --i){
			let child = inside.childNodes[i];
			if(child.tagName=="TEXTAREA"){
				let origin;
				try {
					origin = that.post_origin[pid];
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
				delete that.post_origin[pid];
			} else if((child.tagName=="SPAN"||child.tagName=="IMG"||child.tagName=="BR"||child.tagName=="A")&&change!=true){
				child.style.display = "";
			} else {
				inside.removeChild(child);
			}
		}
		let post_span = inside.parentNode.childNodes[1];
		if(post_span.className == "post_span"){
			let div = $('div');
			div.className = "postimg_div";
			inside.appendChild(div);
			let d = new Date();
			let preview = $('div');
			preview.className = "postimg_preview";
			let img = $('img');
			img.src = "/files/post/" + pid + "/1?" + d;
			img.id = "postimg_" + pid;
			img.className = "postimg_img";
			img.onclick = function(){
				inits["imglayer"].viewimg(Post.id,post_span.innerText,d);
			}
			preview.appendChild(img);
			inside.appendChild(preview);
			
		}
	},
	//////////
	//파일열기(writepost) paste
	openfile_post : function(event,pid){
		let that = this;
		if( event.dataTransfer ){
			event.dataTransfer.dropEffect = 'copy';
		}
		let realfiles_tmp;
		let fileindex_tmp;
		let output;
		if(pid){
			output = $("#changeoutput_"+pid);
			realfiles_tmp = that.realfiles[pid];
			fileindex_tmp = that.fileindex[pid];
		} else {
			realfiles_tmp = that.realfiles[0];
			if( realfiles_tmp == undefined ){
				realfiles_tmp = [];
			}
			output = $('#output_post');
		}
		let input = event.target;
		let files = [];
		if(input.files){
			input.style.borderTop="1px solid rgb(86,210,199)";
			input.style.borderBottom="1px solid rgb(86,210,199)";
			input.focus();
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
		for( let i = 0; i<files.length; ++i){
			if(realfiles_tmp.length>=20){
				alert("사진은 최대 20장까지만 업로드 가능합니다.");
				return false;
			}
			realfiles_tmp.push(files[i]);
			if(pid){
				let post_span = input.parentNode.parentNode.childNodes[1];
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
			let reader = new FileReader();
			reader.addEventListener("progress",function(evt){ // 진행도 표시
				// Math.round((evt.loaded / evt.total) * 100) 
				if(evt.lengthComputable){
					let percentLoaded = Math.round((evt.loaded / evt.total) * 100);
					if( percentLoaded < 100 ){
						//progress.style.width = percentLoaded + '%';
						//progress.innerHTML = percentLoaded + '%';
					}
				}
			});
			reader.addEventListener("load",function(e){
				let imgbox = $("div");
				imgbox.id = "postimg_" +( output.childElementCount + 1);
				imgbox.className='post_imgbox';
				output.appendChild(imgbox);
				output.style.display="block";
				imgbox.addEventListener("dragstart",function(evt){
					evt.stopPropagation();
					evt.preventDefault();
					return false;
				});
				let dataURL = e.target.result;
				imgbox.style.background="url('"+dataURL+"') center center no-repeat"
				imgbox.style.backgroundSize="cover";
				imgbox.style.backgroundClip="content-box";
				let deletebtn = $("div");
				deletebtn.className='delete_postimg';
				if(pid){
					deletebtn.onclick= function(){
						let pid = this.parentNode.parentNode.id.substr(13);
						let realfiles_tmp = that.realfiles[pid];
						let fileindex_tmp = that.fileindex[pid];
						let index = parseInt(this.parentNode.id.substr(8)) - 1;
						realfiles_tmp.splice( index - output.childElementCount + realfiles_tmp.length , 1 );
						fileindex_tmp.splice( index , 1);
						output.removeChild(this.parentNode);  
						for( let j=0; j<output.childElementCount;++j){
							output.children[j].id = "postimg_" + (j+1);
						}
					}
				} else {
					deletebtn.onclick= function(){
						let realfiles_tmp = that.realfiles[0];
						realfiles_tmp.splice( (parseInt(this.parentNode.id.substr(8)) - 1), 1 );
						output.removeChild(this.parentNode);  
						for( let j=0; j<output.childElementCount;++j){
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
	},
	openfile_reply : function(event,change){
		let file;
		let input = event.target;
		let rid = input.id.split('_').pop();
		if( event.clipboardData ){
			let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
			for( let i = 0; i < items.length; ++i ) {
				let item = items[i];
				if( item.type.indexOf("image") === 0 ){
					file = item.getAsFile();
					break;
				}
			}
		} else {
			file = input.files[0];
		}
		if( !file ){
			return;
		}
		let reader = new FileReader();
		reader.addEventListener("load",function(e){
			let deleteimg = $("div");
			deleteimg.className = "delete_replyimg";
			let output;
			if( change ){
				output = $("#replyoutput_change_"+rid);
				
				$("#replyinput_change_"+rid).style.display="none";
				deleteimg.onclick= function(){
					$('#replyinput_label_'+rid).style.display="";
					this.parentNode.removeChild(this.previousElementSibling); 
					this.style.display = "none";
					input.value="";
				}
			} else {
				output = $("#replyoutput_"+rid);
				$("#replywrite_"+rid).lastElementChild.style.display="none";
				deleteimg.onclick= function(){
					$('#replyinput_label_'+rid).style.display="";
					this.parentNode.removeChild(this.previousElementSibling);
					this.style.display = "none";
					input.value="";
				}
				deleteimg.onmouseover = function(){
					this.style.display = "block";
				}
			}
			let dataURL = e.target.result;
			output.style.display="block";
			let div = $("div");
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
		reader.readAsDataURL(file);
	},
	changeReply : function(pid,id){
		let that = this;
		let reply = $("#reply_"+pid+"_"+id);
		reply.onkeydown = function(event){ that.capturekey_replychange(event,pid,id)}
		reply.lastElementChild.style.display="none";

		let textarea = $('textarea');
		textarea.style.marginLeft = "7px";
		textarea.id = "replychange_" + id;
		textarea.className = "writereply";
		textarea.onkeyup = function(){
			that.reply_resize(this);
		}
		textarea.onkeydown = textarea.onkeyup;
		textarea.onkeypress = textarea.onkeyup;
		textarea.placeholder = "댓글을 입력하세요...";
		reply.appendChild(textarea);
			
		let label = $('label');
		label.htmlFor = "replyinput_change_" + id;
		label.id = "replyinput_label_" + id;
		label.className = "replyinput_label";
		reply.appendChild(label);
			
		let replywrite = $("#replychange_"+id);
		if( reply.childNodes[1].childNodes[2].data ){
			replywrite.value = reply.childNodes[1].childNodes[2].data;
		} else {
			replywrite.value = "";
		}
		that.reply_resize(replywrite);
		let cancel = $("div");
		cancel.id = "cancel_change_reply_" + id;
		cancel.style.fontSize = "12px";
		cancel.style.marginLeft = "49px";
		cancel.style.display="inline-block";
		reply.appendChild(cancel);
		replywrite.onfocus = function(){
			cancel.onclick = "";
			cancel.innerText = "수정을 취소하시려면 ESC키를 누르세요";
			cancel.style.color= "#aaaaaa";
			cancel.style.cursor = "";
		}
		replywrite.addEventListener("focusout", function(){
			cancel.onclick = function(){
				that.cancelChange_reply(pid,id);
			}
			cancel.innerText = "취소";
			cancel.style.color = session.color.hex;
			cancel.style.cursor = "pointer";
		});
		replywrite.onpaste = function(event){ that.openfile_reply(event,1) }
		replywrite.focus();
		let reply_upload = $("input");
		reply_upload.type = "file";
		reply_upload.accept = 'image/*';
		reply_upload.id="replyinput_change_" + id;
		reply_upload.onchange = function(event){ that.openfile_reply(event,1) }
		reply.appendChild(reply_upload);
		let reply_output = $("div");
		reply_output.className = "replyoutput";
		reply_output.id = "replyoutput_change_" + id;
		reply.appendChild(reply_output);
	},
	cancelChange_reply : function(pid,id){
		let reply = $("#reply_"+pid+'_'+id)
	
		for( let i = reply.childElementCount - 1 ; i >= 2 ; --i ){
			reply.removeChild(reply.childNodes[i]);
		}
		reply.childNodes[1].style.display="";
		reply.childNodes[1].firstElementChild.onclick = function(){
			event.stopPropagation();
			event.preventDefault();
			this.firstElementChild.style.display="block";
		}
	},
	capturekey_replychange : function(e,pid,id){
		let that = this;
		if( e.keyCode == 13 && !e.shiftKey){
			that.changeReply_apply(pid,id)
		} else if( e.keyCode == 27){
			that.cancelChange_reply(pid,id);
		}
	},
	changeReply_apply : function(pid,id){
		let tmp = event.target.value.toString();
		event.stopPropagation();
		event.preventDefault();
		$("#replychange_"+id).value = "";
		let formdata = new FormData();
		let input = $("#replyinput_change_"+id);
		let reply = event.target.parentNode;
		//$("#replywrite_"+input.id.substr(11)).lastElementChild.style.display="block";
		if( input.files.length || tmp.length >= 1 ){
			formdata.append("file",input.files[0]);
			formdata.append("text",tmp);
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (evt){ if(xhr.readyState == 4 && xhr.status == 200){
				reply.childNodes[1].childNodes[1].innerText = tmp + '\r\n';
				let reply_menu_btn = reply.childNodes[1].childNodes[0];
				reply_menu_btn.onclick = function(event){
					event.stopPropagation();
					event.preventDefault();
					this.firstElementChild.style.display="block"
				}	
				for( let i = reply.childElementCount - 1; i >= 2; --i ){
					reply.removeChild(reply.childNodes[i]);
				}
				reply.childNodes[1].style.display = "inline-block";
				//소켓연동
			}}
			xhr.open("POST", "/api/newsfeed/changereply/"+ id, false); xhr.send(formdata);
		} else {
			alert("댓글이 비어 있습니다. 글을 입력해주세요");
		}
	},
	removeReply : function(pid,id){
		if(!confirm("정말로 삭제하시겠습니까?")){
			return false;
		}
		let reply = $("#reply_"+pid+"_"+id);
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			if( xhr.responseText == "댓글이 삭제되었습니다."){
				reply.parentNode.removeChild(reply)
			} else {
				alert(xhr.responseText);
			}
		}}
		xhr.open("POST", "/api/newsfeed/removereply", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('reply_id='+id);
	},
	removePost : function(pid){
		let postwrap = $('#post_wrap');
		if(!confirm("정말로 삭제하시겠습니까?")){
			return false;
		}
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			if( xhr.responseText == "게시글이 삭제되었습니다."){			
				if( location.pathname.substr(0,6) == "/post/" ){
					location.href = "/";
				} else {
					let post = $("#post_"+pid);
					post.addEventListener('transitionend', function(){
						if(this.style.opacity=="0"){
							postwrap.removeChild(post);
						}
					});
					post.style.opacity="0";
					socket.emit( 'post_remove', pid )
					let postcnt = $('#user_list_tab_value_post');
					if( postcnt ){
						postcnt.innerText = parseInt(postcnt.innerText) - 1;
					}
					that.getPosts(1);
				}
			} else {
				alert(xhr.responseText);
			}
		}}
		xhr.open("POST", "/api/newsfeed/removepost", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('pid='+pid);
	},
		/*
		//날짜 토글 (현재안씀)
		function toggleDate(obj){
			postdate = new Date(parseInt(obj.parentNode.id.substr(5)));
			if(obj.className=="viewing"){
				obj.previousSibling.innerText = PointToDate(postdate.toLocaleDateString());
				obj.className="";
			} else {
				let a = postdate.toLocaleTimeString().replace(':',"시 ");
				obj.previousSibling.innerText = a.substr(0,a.indexOf(":"))+"분";
				obj.className="viewing";
			}
		},
		*/
	capturekey : function(e,post){
		if( e.keyCode == 13 && !e.shiftKey){
			this.replyWrite(post)
		}
	},
	post_resize : function(obj){
		if(obj.scrollHeight > 104){
			obj.style.height="1px";
			obj.style.height=obj.scrollHeight+"px";
		}
		if( obj.scrollHeight <= 104 ){	
			obj.style.height="100px";
		}
	//	obj.style.borderTop="1px solid rgb(86,210,199)";
	//	obj.style.borderBottom="1px solid rgb(86,210,199)";
	},
	reply_resize : function(obj){
		obj.style.height="1px";
		obj.style.height=obj.scrollHeight-18+"px";
	},
	getReplys : function(obj,limit){
		let that = this;
		let replywrap = obj.parentNode;
		replywrap.style.display = "";
		let reply_skip = 0;
		let pid;
		if(obj.id.substr(10,1) == '_'){
			pid = obj.id.substr(11);
			reply_skip = 0;
		} else {
			pid = obj.id.substr(10);
			reply_skip = replywrap.childElementCount-4;
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){if (xhr.readyState == 4 && xhr.status == 200){
			let xhrResult = JSON.parse(xhr.responseText);
			let Replys = xhrResult.sort(function(a,b){if(a.id < b.reply_id){return -1;} else{ return 1;}});
			for( let i = Replys.length - 1; i>=0;i--){
				if( typeof(Replys[i]) == "string" ){
					let reply = $("div");
					reply.id = 'replymore_' + pid;
					reply.className = 'reply_more';
					reply.innerHTML += "이전 댓글 보기";
					reply.onclick= function(){
						that.getReplys(this,8);
					}
					replywrap.insertBefore(reply,replywrap.firstElementChild);
				} else {
					let reply = that.makeReply(Replys[i],pid);
					if( obj.id.substr(10,1) == '_'){
						reply.style[getBrowser()+"Animation"] = 'fade_in .5s linear';
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
	},
	keydown : function(e){
		let that = this;
		let postwrap = $('#post_wrap');
		if( that.selectedPost != null && that.selectedPost.clientWidth == 0 ){
			that.selectedPost = null;
		}
		if( inits["imglayer"].imgviewing != undefined && inits["imglayer"].imgviewing == true ){
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
				inits["imglayer"].imgviewing = 0;
			}
		} else if( document.activeElement == document.body ){
			if((e.shiftKey==false&&e.keyCode==9)||e.keyCode==40||e.keyCode==39){
				event.preventDefault();
				if( that.selectedPost ){
					that.selectedPost.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
					that.selectedPost.style.boxShadow = "initial";
					if( that.selectedPost.nextSibling ){
						that.selectedPost = that.selectedPost.nextSibling;
						that.selectedPost.scrollIntoViewIfNeeded();
						that.selectedPost.style.borderColor = session.color.hex;
						that.selectedPost.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
					} else {
						that.selectedPost.scrollIntoViewIfNeeded();
						that.selectedPost.style.borderColor = session.color.hex;
						that.selectedPost.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
						return;
					}
				} else {
					that.selectedPost = postwrap.firstElementChild;
					if( that.slectedPost ){
						that.selectedPost.style.borderColor = session.color.hex;
						that.selectedPost.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
					}
				}
			} else if((e.shiftKey==true&&e.keyCode==9)||e.keyCode==38||e.keyCode==37){
				event.preventDefault();
				if( that.selectedPost ){
					that.selectedPost.style.borderColor = "#e5e6e9 #dfe0e4 #d0d1d5";
					that.selectedPost.style.boxShadow = "initial";
					if( that.selectedPost.previousSibling ){
						that.selectedPost = that.selectedPost.previousSibling;
						that.selectedPost.scrollIntoViewIfNeeded();
						that.selectedPost.style.borderColor = session.color.hex;
						that.selectedPost.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
					} else {
						that.selectedPost.scrollIntoViewIfNeeded();
						that.selectedPost.style.borderColor = session.color.hex;
						that.selectedPost.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
						return;
					}
				} else {
					that.selectedPost = postwrap.firstElementChild;
					that.selectedPost.style.borderColor = session.color.hex;
					that.selectedPost.style.boxShadow = "inset 0px 0px 0px 1px " + session.color.hex;
				}
			}
		}
	},
	DragOut : function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		let obj = evt.target.style;
		obj.margin = "";
		obj.borderTop="";
		obj.borderBottom="";
		obj.borderLeft="";
		obj.paddingLeft = "";
		obj.borderRight="";
	},	
	DragOver : function(evt){
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
		let obj = evt.target.style;
		obj.border="1px dashed #bbb";
		obj.paddingLeft = "2px";
	},
	showmenu : function(dom){
		this.hidemenu();
		$("#menu_" + dom.parentNode.id.substr(5)).style.display = "block"
		event.stopPropagation();
	},
	replyWrite : function(post){
		let pid = post.id.substr(11);
		let that = this;
		let tmp = post.lastElementChild.previousElementSibling.value.toString();
		let formdata = new FormData();
		let input = $("#replyinput_"+pid);
		$("#replywrite_"+input.id.substr(11)).lastElementChild.style.display="block";
		if( input.files.length || tmp.length >= 1 ){
			formdata.append("file",input.files[0]);
			formdata.append("text",tmp);
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
				let replyid = xhr.responseText;
				that.getReplys(post,1);
	//			getReplys($("#replywrite_" + pid),1);
			}}
			xhr.open("POST","/api/newsfeed/writereply/" + pid, false); xhr.send(formdata)
			input.value="";
			post.lastElementChild.previousElementSibling.value="";
			event.preventDefault(); 
			that.reply_resize(post.lastElementChild.previousElementSibling);
			$("#replyoutput_" + pid).style.display="none";
			$("#replyoutput_" + pid).innerHTML="";
		} else {
			alert("댓글이 비어 있습니다. 글을 입력해주세요");
			post.lastElementChild.previousElementSibling.value="";
		}
	}, 
	postWrite : function(){
		let that = this;
		let postwrite = $('#post_write');
		let tmp = postwrite.value;
		let formdata = new FormData();
		let realfiles_tmp = that.realfiles[0];
		if( realfiles_tmp == undefined ){
			realfiles_tmp = [];
		}
		if( realfiles_tmp[0] || tmp.length>= 1 ){
			for( let i=0; i<realfiles_tmp.length; ++i){
	//		for( let i=realfiles_tmp.length-1; i>=0; --i){
				formdata.append("file",realfiles_tmp[i]);
			}
			formdata.append("text",tmp);
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
				let pid = parseInt(xhr.responseText);
				that.getPosts(0);
				let postcnt = $('#user_list_tab_value_post');
				if( postcnt ){
					postcnt.innerText = parseInt(postcnt.innerText) + 1;
				}
	//			socket.emit( 'post_write', pid );
			}}
			xhr.open("POST","/api/newsfeed/writepost", false);  xhr.send(formdata);
			that.realfiles[0] = [];
			$('#post_write').value="";
			$('#post_file').value="";
			$('#output_post').innerHTML="";
			//output_post.style.display="none";
			$('#post_write').style.borderTop="1px solid rgba(0,0,0,0.2)";
			$('#post_write').style.borderBottom="1px solid rgba(0,0,0,0.2)";
		} else {
			alert("게시글이 비어 있습니다.");
		}
	},
	init : function(){
		let that = this;
		this.addListener(window,"touchstart", function(){
			that.hidemenu()
		});
		this.addListener(window,"click", function(){
			that.hidemenu()
		});
		this.addListener(window,"keydown", function(e){
			that.keydown(e);
		});
		this.addListener(window,'scroll', function(e){
			that.preventDefault(e);
		});
		this.addListener(window,'touchmove', function(e){
			that.preventDefault(e);
		});
		this.addListener(window,'mousewheel', function(e){
			that.preventDefault(e);
		});
		//크롬전체화면
		this.addListener(document,'webkitfullscreenchange', function(event){
			event.stopPropagation();
			event.preventDefault();
			if(!document.webkitIsFullScreen){
				imgbox.style.width="";
				imgbox.style.height="";
				imgbox.style.top="";
				imgbox.style.left="";
				imgbox.style.position="";
				for( let j=imgbox.childNodes.length - 1 ; j>=1; --j ){
					imgbox.childNodes[j].style.border="";
				}
			}
		});

		let postwrap = $("div");
		postwrap.id = 'post_wrap'
		let output_post = $('div');
		let post_file = $('input');
		$('#wrap_mid').appendChild(postwrap);
		if( location.pathname.substr(1,1) == "@" ){
			that.postOption.uid = location.pathname.split('/')[1].substr(1);
		}
		if( session && that.postOption.uid == null && that.postOption.search == null && location.pathname.substr(0,6) != "/post/" ){
			let write = $("div");
			write.id = "write";
			output_post.id = "output_post";
			write.appendChild(output_post);
			let post_write_button = $('div');
			post_write_button.id = "post_write_button";
			post_write_button.onclick = function(){
				that.postWrite();
			}
			post_write_button.innerText = "게시";
			write.appendChild(post_write_button);
			let post_file_label = $('label');
			post_file_label.id = "post_file_label";
			post_file_label.htmlFor = "post_file";
			write.appendChild(post_file_label);
			post_file.type = "file";
			post_file.id = "post_file";
			post_file.name = "post_file";
			post_file.multiple = "true";
			post_file.onchange = function(event){
				that.openfile_post(event);
			}
			write.appendChild(post_file);
			write.className = "post";
		
			let postwrite = $("textarea");
			postwrite.id = 'post_write';
			postwrite.placeholder = "글을 입력하세요";
			postwrite.addEventListener('keydown', function(){ that.post_resize(this) }, false);
			postwrite.addEventListener('keypress', function(){ that.post_resize(this) }, false);
			postwrite.addEventListener('keyup', function(){ that.post_resize(this) }, false);
			postwrite.addEventListener('dragover', that.DragOver, false);
			postwrite.addEventListener('dragleave', that.DragOut, false);
			postwrite.addEventListener('mouseout', that.DragOut, false);
			postwrite.addEventListener('drop', function(e){
				that.openfile_post(e);
			}, false);
			postwrite.addEventListener('paste', function(e){
				that.openfile_post(e);
			}, false);
			
			write.insertBefore(postwrite,write.firstElementChild);
			if( typeof(user) != "undefined" && user.id ){
				if( user.id == session.id ){
					postwrap.appendChild(write);
				} else {
					
				}
			} else {
				postwrap.appendChild(write);
			}
		}
	
		this.addListener(window,'scroll', function(e){
			if( $('#post_wrap') != null && that.postLoading == false ){
				let top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
				if ((window.innerHeight + top) + 200 >= document.body.scrollHeight && $('#post_wrap').style.display != "none" ){
					that.postLoading = true;
					that.getPosts(10);
				}
			}
		});
	
		if( location.pathname.substr(0,6) == "/post/" ){
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
				that.Post = JSON.parse(xhr.responseText);
				if( that.Post.length ){
					that.Post = that.Post[0]
					postwrap.appendChild(that.makePost(that.Post));
				} else {
					location.href = "/";
				}
			}};
			xhr.open("POST", location.pathname, true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
		} else if( that.postOption.uid != null || that.postOption.search != null ){
			
		} else {
			that.getPosts(10);
			socket.on( 'post_new', function(){
				that.getPosts(0,1);
			});
			socket.on( 'post_removed', function( pid ){
				postwrap.removeChild($("#post_"+pid));	
			});
		}
	
	
		socket.on( 'reply_new', function( data ){
			if( $( "#post_" + data.pid ) ){
				that.getReplys( $( "#replywrite_" + data.pid ), 1 );
			}
		});
		socket.on( 'reply_removed', function( replyid ){
			$("#"+replyid).parentNode.removeChild($("#" + replyid));	
		});
	},
	getPosts : function(limit,cb){ // 게시글 불러오기
		let that = this;
		let postwrap = $('#post_wrap');
		if( postwrap ){
			postwrap.style.display = "";
		}
		if( $("#post_none") ){
			postwrap.removeChild($("#post_none").parentNode);
		}
		if( that.post_skip > that.post_cnt ){
			that.post_skip = that.post_cnt;
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){
			if (xhr.readyState == 4 && xhr.status == 200){
				if(xhr.responseText!='[]'){
					that.postLoading = false;
					let xhrResult = JSON.parse(xhr.responseText);
					let Posts = xhrResult.sort(function(a,b){if(a._id < b._id){return -1;} else{ return 1;}});
					that.post_cnt += Posts.length;
					that.post_skip = that.post_cnt;
					if( that.dateUpdateId == null ){
						setInterval(function(){
							that.dateUpdate();
						},30000);
					}
					for( let i = Posts.length-1; i >= 0; --i){
						if( $('#post_'+Posts[i].id) != undefined ){
							continue;
						}
						let div = that.makePost(Posts[i]);
						if( postwrap == undefined ){
							postwrap = $('#post_wrap');
						}
						if( limit ){
							postwrap.appendChild(div);
						} else {
							div.style[getBrowser()+"Animation"] = 'fade_in .5s linear';
							postwrap.insertBefore(div,postwrap.firstElementChild.nextElementSibling);
						}
					}
				} else if( that.post_cnt == 0 ){
					if( postwrap == undefined ){
						postwrap = $('#post_wrap');
					}
					let post = $("div");
					post.className = "post";
					let post_inside = $("div");
					post_inside.className = "post_inside";
					post_inside.id = "post_none";
					if( that.postOption.favorite == "true" ){
						post_inside.innerText = "아직 관심글로 표시한 게시글이 없습니다.";
					} else {
						post_inside.innerText = "아직 작성된 게시글이 없습니다.";
					}
					post.appendChild(post_inside);
					postwrap.appendChild(post);
				}
				if( cb ){
					cb(null);
				}
			}
		}
		xhr.open("POST","/api/newsfeed/getposts", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		let params = "skip=";
		if( limit ){
			params += that.post_skip + "&limit=" + limit;
		} else if(limit == 0){
			params += "0&limit=1";
		}
		if( that.post_skip > that.post_cnt ){
			that.post_skip = that.post_cnt;
		}
		if( that.postOption ){
			let obj_keys = Object.keys(that.postOption);
			for( let i = 0; obj_keys.length > i; ++i ){
				params += "&" + obj_keys[i] + "=" + that.postOption[obj_keys[i]];
			}
		}
		xhr.send(params);
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
		$('#wrap_mid').removeChild($('#post_wrap'));
		const socket_listeners = [ "post_new", "post_removed", "reply_new", "reply_removed" ]
		for( let i = 0; i < socket_listeners.length; ++i ){
			socket.removeAllListeners(socket_listeners[i]);
		}
	}
}
