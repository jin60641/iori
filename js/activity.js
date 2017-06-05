'use strict';

inits["activity"] = {	
	activitys : [],
	listeners : [],
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
	makeActivity : function( activity ){
		let that = this;
		let box = $('a');
		box.href = activity.link;
//		box.addEventListener('mouseover',profileHover);
//		box.addEventListener('mouseleave',profileLeave);
		box.id = "activity_"+activity.id;
		box.className = "activity";
	
		let date = $('div');
		date.className = "activity_date";
		date.innerText = that.getDateString(activity.date);
		box.appendChild(date);
	
		let profileimg = $('img');
		profileimg.src = "/files/profile/" + activity.to.uid;
		profileimg.className = "activity_profileimg";
		box.appendChild( profileimg );
			
		let message = $('div');
		message.className = "activity_message";
		let text = $('div');
		let span = $('span');
		text.appendChild(span);
		span.innerText = activity.to.name;
		switch( activity.type ){
			case "chat":
				text.innerHTML += "님에게 쪽지를 보냈습니다";
				break;
			case "follow":
				text.innerHTML += "님을 팔로우했습니다";
				break;
			case "reply":
				text.innerHTML += "님의 게시글에 댓글을 남겼습니다";
				break;
			case "favorite":
				text.innerHTML += "님의 게시글을 관심글로 표시했습니다.";
				break;
			case "share":
				text.innerHTML += "님의 게시글을 공유했습니다.";
				break;
		}
		message.appendChild( text );
			
		if( activity.desc ){
			let desc = $('div');
			desc.className = "activity_desc";
			if( activity.desc.length >= 10 ){
				activity.desc = activity.desc.substr(0,10) + "...";
			}
			desc.innerText = activity.desc;
			message.appendChild( desc );
		}
		box.appendChild( message );
	
	
		return box;
	},
	getActivity : function( limit ){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			let Activitys = JSON.parse(xhr.responseText);
			if( Activitys.length >= 1 ){
				let wrap = $('#activity_wrap');
				for( let i = 0; i < Activitys.length; ++i ){
					that.activitys.push(Activitys[i]);
					let div = that.makeActivity(Activitys[i]);
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
				that.checkActivityNone();
			}
		}}
		xhr.open("POST","/api/notice/getactivitys", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		let skip = $('.activity').length;
		let params = "skip=";
		if( limit >= 1 ){
			params += skip + "&limit=" + limit;
		} else {
			params += "0&limit=1";
		}
		xhr.send(params);
	},
	checkActivityNone : function(){
		let that = this;
		let wrap = $('#activity_wrap');
		let none = $('#activity_wrap_none')
		if( that.activitys.length == 0 && none == undefined ){
			none = $('div');
			none.id = "activity_wrap_none";
			none.innerText = "확인가능한 활동로그가 존재하지 않습니다.";
			wrap.appendChild(none);
		} else if( none ){
			wrap.removeChild(none);
		}
	},
	init : function(){
		let wrap = $('div');
		let that = this;
		wrap.id = "activity_wrap";
		$('#wrap_mid').appendChild(wrap);
		for( let i = 0; i < that.activitys.length; ++i ){
			wrap.appendChild(that.makeActivity(that.activitys[i]));
		}
		socket.on( 'activity_new', function( activity ){
			that.getActivity(0);
		});
		that.getActivity(20);
		that.checkActivityNone();
		that.addListener(window,'scroll', function(e){
			if( $('#activity_wrap') != null ){
				let top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

				if ((window.innerHeight + top) + 200 >= document.body.scrollHeight  ){
					that.getActivity(10);
				}
			}
		});
	},
	exit : function(){
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = this.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		$('#wrap_mid').removeChild($('#activity_wrap'));
	}
}
