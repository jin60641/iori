'use strict';

inits["notice"] = {	
	listeners : [],
	notices : [],
	addListener : function( element, event, handle ){
		element.addEventListener( event, handle, false );
		this.listeners.push({ element : element, event : event, handle : handle });
	},
	getDateString : function(origin_date){
		let date = new Date(origin_date);
		let now = new Date();
		let date_time = Math.floor(date.getTime()/1000)
		let now_time = Math.floor(now.getTime()/1000)
		let gap = now_time - date_time;
		if( gap < 86400 ){
			return ((date.getDate()!=now.getDate())?"어제 ":"") + (date.getHours()<=9?"0":"") + date.getHours() + ":" + (date.getMinutes()<=9?"0":"") + date.getMinutes();
		} else if( date.getDate() != now.getDate() ){
			return (date.getYear()-100)+'/'+(date.getMonth()<=8?"0":"")+(date.getMonth()+1)+'/'+(date.getDate()<=9?0:"")+date.getDate();
		}
	},
	makeNotice : function( notice ){
		let that = this;
		let box = $('a');
		box.href = notice.link;
//		box.addEventListener('mouseover',profileHover);
//		box.addEventListener('mouseleave',profileLeave);
		box.id = "notice_"+notice.id;
		box.className = "notice";
	
		let date = $('div');
		date.className = "notice_date";
		date.innerText = that.getDateString(notice.date);
		box.appendChild(date);
	
		let profileimg = $('img');
		profileimg.src = "/files/profile/" + notice.from.uid;
		profileimg.className = "notice_profileimg";
		box.appendChild( profileimg );
			
		let message = $('div');
		message.className = "notice_message";
		let text = $('div');
		let span = $('span');
		text.appendChild(span);
		span.innerText = notice.from.name;
		switch( notice.type ){
			case "chat":
				text.innerHTML += "님이 쪽지를 보내셨습니다";
				break;
			case "follow":
				text.innerHTML += "님이 나를 팔로우했습니다";
				break;
			case "reply":
				text.innerHTML += "님이 당신의 게시글에 댓글을 남겼습니다";
				break;
			case "favorite":
				text.innerHTML += "님이 당신의 게시글을 관심글로 표시했습니다.";
				break;
			case "share":
				text.innerHTML += "님이 당신의 게시글을 공유했습니다.";
				break;
		}
		message.appendChild( text );
			
		if( notice.desc ){
			let desc = $('div');
			desc.className = "notice_desc";
			if( notice.desc.length >= 10 ){
				notice.desc = notice.desc.substr(0,10) + "...";
			}
			desc.innerText = notice.desc;
			message.appendChild( desc );
		}
		box.appendChild( message );
	
	
		return box;
	},
	getNotice : function( limit ){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			let Notices = JSON.parse(xhr.responseText);
			if( Notices.length >= 1 ){
				let wrap = $('#notice_wrap');
				for( let i = 0; i < Notices.length; ++i ){
					that.notices.push(Notices[i]);
					let div = that.makeNotice(Notices[i]);
					if( limit >= 1 ){
						wrap.appendChild(div);
					} else {
						if( wrap.firstElementChild ){
							div.style[getBrowser()+"Animation"] = 'fade_post .5s linear';
							wrap.insertBefore(div,wrap.firstElementChild);
						} else {
							wrap.appendChild(div);
						}
					}
				}
				that.checkNoticeNone();
			}
		}}
		xhr.open("POST","/api/notice/getnotices", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		let skip = $('.notice').length;
		let params = "skip=";
		if( limit >= 1 ){
			params += skip + "&limit=" + limit;
		} else {
			params += "0&limit=1";
		}
		xhr.send(params);
	},
	checkNoticeNone : function(){
		let that = this;
		let wrap = $('#notice_wrap');
		let none = $('#notice_wrap_none')
		if( that.notices.length == 0 && none == undefined ){
			none = $('div');
			none.id = "notice_wrap_none";
			none.innerText = "아직 확인하지 않은 알림이 없습니다";
			wrap.appendChild(none);
		} else if( none ){
			wrap.removeChild(none);
		}
	},
	init : function(){
		let wrap = $('div');
		let that = this;
		wrap.id = "notice_wrap";
		$('#wrap_mid').appendChild(wrap);
		for( let i = 0; i < that.notices.length; ++i ){
			wrap.appendChild(that.makeNotice(that.notices[i]));
		}
		socket.on( 'notice_new', function( notice ){
			that.getNotice(0);
		});
		that.getNotice(20);
		that.checkNoticeNone();
		that.addListener(window,'scroll', function(e){
			if( $('#notice_wrap') != null ){
				let top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

				if ((window.innerHeight + top) + 200 >= document.body.scrollHeight  ){
					that.getNotice(10);
				}
			}
		});
	},
	exit : function(){
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = this.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		$('#wrap_mid').removeChild($('#notice_wrap'));
	}
}
