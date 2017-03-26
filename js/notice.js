window.addEventListener('load',function(){
	var wrap = $('div');
	wrap.id = "notice_wrap";
	$('#wrap2').appendChild(wrap);
	for( var i = 0; i < notices.length; ++i ){
		wrap.appendChild(makeNotice(notices[i]));
	}

	socket.on( 'notice_new', function( notice ){
		console.log(notice);
		getNotice(0);
	});
	checkNoticeNone();
});

function getDateString(origin_date){
	var date = new Date(origin_date);
	var now = new Date();
	var date_time = Math.floor(date.getTime()/1000)
	var now_time = Math.floor(now.getTime()/1000)
	var gap = now_time - date_time;
	if( gap < 86400 ){
		return ((date.getDate()!=now.getDate())?"어제 ":"") + (date.getHours()<=9?"0":"") + date.getHours() + ":" + (date.getMinutes()<=9?"0":"") + date.getMinutes();
	} else if( date.getDate() != now.getDate() ){
		return (date.getYear()-100)+'/'+(date.getMonth()<=8?"0":"")+(date.getMonth()+1)+'/'+(date.getDate()<=9?0:"")+date.getDate();
	}
}


function makeNotice( notice ){
	var box = $('a');
	box.href = notice.link;
	box.id = "notice_"+notice.id;
	box.className = "notice";

	var date = $('div');
	date.className = "notice_date";
	date.innerText = getDateString(notice.date);
	box.appendChild(date);

	var profileimg = $('img');
	profileimg.src = "/files/profile/" + notice.from.uid;
	profileimg.className = "notice_profileimg";
	box.appendChild( profileimg );
		
	var message = $('div');
	message.className = "notice_message";
	var text = $('div');
	text.innerHTML = "<span>" + notice.from.name + "</span>";
	switch( notice.type ){
		case "chat":
			text.innerHTML+= "님이 쪽지를 보내셨습니다";
			break;
		case "follow":
			text.innerHTML+= "님이 나를 팔로우했습니다";
			break;
		case "reply":
			text.innerHTML+= "님이 당신의 게시글에 댓글을 남겼습니다";
	}
	message.appendChild( text );
		
	if( notice.desc ){
		var desc = $('div');
		desc.className = "notice_desc";
		if( notice.desc.length >= 10 ){
			notice.desc = notice.desc.substr(0,10) + "...";
		}
		desc.innerText = notice.desc;
		message.appendChild( desc );
	}
	box.appendChild( message );


	return box;
}

function getNotice( limit ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		var Notices = JSON.parse(xhr.responseText);
		if( Notices.length >= 1 ){
			var wrap = $('#notice_wrap');
			for( var i = 0; i < Notices.length; ++i ){
				notices.push(Notices[i]);
				var div = makeNotice(Notices[i]);
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
			checkNoticeNone();
		}
	}}
	xhr.open("POST","/api/notice/getnotices", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	var skip = $('.notice').length;
	var params = "skip=";
	if( limit >= 1 ){
		params += skip + "&limit=" + limit;
	} else {
		params += "0&limit=1";
	}
	xhr.send(params);
}

function checkNoticeNone(){
	var wrap = $('#notice_wrap');
	var none = $('#notice_wrap_none')
	if( notices.length == 0 && none == undefined ){
		none = $('div');
		none.id = "notice_wrap_none";
		none.innerText = "아직 확인하지 않은 알림이 없습니다";
		wrap.appendChild(none);
	} else if( none ){
		wrap.removeChild(none);
	}
}
