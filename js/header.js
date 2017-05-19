'use strict';

function getCookie(cname) {
	let cookie_array = document.cookie.split(', ');
	for(let i = 0; i < cookie_array.length; ++i ){
		if( cname == cookie_array[i].split('=')[0] ){
			return cookie_array[i].split('=')[1];
		}
	}
	return "";
}

location.hash = location.hash.replace("#_=_","");
/*
if( location.hash && location.hash == "#_=_" ){
	location.href = location.origin + location.pathname;
}
*/

if( session.signUp == undefined && document.cookie ){
	if ( getCookie("facebook") == "true" ){
		if( document.URL.indexOf("login") >= 0 ){
			location.href = "/api/auth/facebook/" + document.URL.split('/').slice(4).join('-');
		} else {
			location.href = "/api/auth/facebook/" + document.URL.split('/').slice(3).join('-');
		}
	} else if( getCookie("uid") && getCookie("password") ){
		let params = "password=" + getCookie("password") + "&uid=" + getCookie("uid");
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(event){
			if( xhr.readyState == 4 && xhr.status == 200 ){
				if( xhr.responseText == "success" ){
					if( document.URL.indexOf("login") >= 0 ){
						location.href = "/" + document.URL.split('/').slice(4).toString().split('-').join('/');
					} else {
						location.reload()
					}
				}
			}
		}
		xhr.open("POST", "/api/auth/local", false);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(params);
	}
} else if ( session != "" && session.signUp == 0 && location.pathname.split('/')[1] != "register" ){
//	location.href = "/register";
}
if( session.level >= 9 ){
	//관리자
}

function getUsers( query, limit, cb ){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		let xhrResult = JSON.parse( xhr.responseText );
		cb(xhrResult);
	}}
	xhr.open("POST", "/api/user/search", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('query='+query+'&tb=user');
}

//유저검색(헤더)
function sendData_search( query ){
	if( query ){
		getUsers( query, 5, function(xhrResult){
			let result = $("#head_search_result");
			result.innerHTML="";
			if( xhrResult.length ){
				for( let i = xhrResult.length - 1; i>=0; i--){
					let a = $('a');
					makeHref( a, "/@" + xhrResult[i].uid );
					let div = $('div');
					a.appendChild(div);
					let img = $('img');
					img.src = "/files/profile/"+ xhrResult[i].uid;
					div.appendChild(img);
					let span = $('span');
					let result_uid = $('div');
					result_uid.className = "head_search_result_uid";
					result_uid.innerText = "@" + xhrResult[i].uid;
					span.appendChild(result_uid);
					let text = $('text');
					text.innerText = xhrResult[i].name;
					span.appendChild(text);
					div.appendChild(span);
					span.appendChild(result_uid);
					span.appendChild( result_uid );
					a.appendChild(div);
					result.appendChild(a);
				}
			} else {
				result.innerHTML='<div id="head_search_none">표시할 검색 결과가 없습니다.</div>';
			}
		});
	} else {
		$('#head_search_result').innerHTML='<div id="head_search_none">표시할 검색 결과가 없습니다.</div>';
	}
}


// 알림로딩
function getNotices(cnt){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
		if( xhr.responseText ){
			notice.innerHTML = xhr.responseText;
		} else {
			notice.innerHTML = 0;
		}
	}}
	xhr.open("POST", "/api/newsfeed/getnotice", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('cnt='+cnt);
}

// 맨위로

function goTop( orix, oriy, desx, desy ){
	let Timer;
	let winHeight = document.body.scrollTop;
	if( Timer ){
		clearTimeout( Timer );
	}
	let startx = 0;
	let starty = winHeight;
	if( !orix || orix < 0 ){
		orix = 0;
	}
	if( !oriy || oriy < 0 ){
		oriy = 0;
	}
	let speed = 7;
	if( !desx ){
		desx = 0 + startx;
	}
	if( !desy ){
		desy = 0 + starty;
	}
	desx += ( orix - startx) / speed;
	if ( desx < 0 ) desx = 0;
	desy += ( oriy - starty) / speed;
	if ( desy < 0 ) desy = 0;
	let posX = Math.ceil( desx );
	let posY = Math.ceil( desy );
	window.scrollTo( posX, posY );
	if((Math.floor(Math.abs(startx - orix)) < 1) && (Math.floor(Math.abs(starty - oriy)) < 1)){
		clearTimeout(Timer);
		window.scroll(orix,oriy);
	} else if ( posX != orix || posY != oriy ){
		Timer = setTimeout("goTop("+orix+","+oriy+","+desx+","+desy+")",15);
	} else {
		clearTimeout(Timer);
	}
}

function head_search_show( boolean ){
	let head_search = $('#head_search');
	if( boolean == false ){
		head_search.style.display = "";
		$('#head_search_result').style.display = "none";
	} else if( boolean == true ){
		head_search.style.display = "block";
	} else {
		if( head_search.style.display == "block" ){
			head_search.style.display = "";
			$('#head_search_result').style.display = "none";
		} else {
			head_search.style.display = "block";
		}
	}
}

function head_menu_show( boolean ){
	if( event.stopPropagation ){
		event.stopPropagation();
	}	
	let head_menu = $("#head_menu");
	if( boolean != undefined ){
		if( boolean ){
			search_result_show( false );
			$("#navi_profile").firstElementChild.style.borderRadius = "2px";
			head_menu.style.display = "block";
		} else {
			head_menu.style.display = "none";
		}
	} else if( head_menu.style.display == "block" ){
		head_menu.style.display = "none";
	} else {
		head_menu.style.display = "block";
	}
}

function search_result_show( boolean ){
	let search_result = $("#head_search_result");
	if( boolean != undefined ){
		if( boolean ){
			head_menu_show( false );
			search_result.style.display = "block";
		} else {
			search_result.style.display = "none";
		}
	} else if( head_menu.style.display == "block" ){
		search_result.style.display = "none";
	} else {
		search_result.style.display = "block";
	}
}

function close_all(){
	$("#navi_profile").firstElementChild.style.borderRadius = "";
	search_result_show(false);
	head_menu_show(false);
}

function findTabNow(){
	let path = location.pathname.substr(1);
	let navi_tab_now = $("#navi_tab_" + path);
	let navi_tabs = $('#navi_tab').childNodes;
	for( let i = 0; i < navi_tabs.length; ++i ){
		navi_tabs[i].className = "";
	}
	if( navi_tab_now ){
		navi_tab_now.className = "navi_tab_now";
	} else if ( path == "" ){
		$('#navi_tab_home').className = "navi_tab_now";
	}
}

window.addEventListener('load',function(){
	let navi_tab = $("div");
	navi_tab.id = "navi_tab";

	let navi_tab_home = $("a");
	makeHref( navi_tab_home, '/');
	navi_tab_home.id = "navi_tab_home";
	navi_tab_home.innerText = "홈";
	navi_tab.appendChild(navi_tab_home);
	
	let navi_tab_notice = $("a");
	makeHref( navi_tab_notice, '/notice' );
	navi_tab_notice.id = "navi_tab_notice";
	navi_tab_notice.innerText = "알림";
	navi_tab.appendChild(navi_tab_notice);
	
	let navi_tab_chat = $("a");
	makeHref( navi_tab_chat, '/chat' );
	navi_tab_chat.id = "navi_tab_chat";
	navi_tab_chat.innerText = "쪽지";
	navi_tab.appendChild(navi_tab_chat);
	
	let navi_tab_search = $("a");
	navi_tab_search.onclick = head_search_show;
	navi_tab_search.id = "navi_tab_search";
	navi_tab_search.innerText = "검색";
	navi_tab.appendChild(navi_tab_search);
	
	head.appendChild(navi_tab);

	findTabNow();

	let search = $("input");
	search.id = "head_search";
	search.type = "text";
	search.name = "query";
	search.onkeyup = function(e){
		if( e.keyCode == 13 ){
			head_search_show( false );
			getPage( "/search/"+this.value+"/user" );
		} else {
			sendData_search(this.value);
		}
	}
	search.onfocus = function(){
		search_result_show(true);
	}
	search.onfocusout = searchResultNone;
	search.onclick = function(event){
		head_menu_show(false);
	}
	search.onsubmit = function(){
		return false;
	}
	search.autocomplete = "off";
	head.appendChild(search);

	let search_result = $("div");
	search_result.id = "head_search_result";

	search_result.addEventListener('touch', function( evt ){
		evt.stopPropagation();
	});
	search_result.addEventListener('touchstart', function( evt ){
		evt.stopPropagation();
	});
	search_result.onmouseover = function(){
		searchResultView = 1;
	}
	search_result.onmouseout = function(){
		searchResultView = 0;
	}
	let search_none = $("div");
	search_none.id = "head_search_none";
	search_none.innerText = "표시할 검색 결과가 없습니다.";
	search_result.appendChild(search_none);
	head.appendChild(search_result);

	let head_logo = $("div");
	head_logo.id = "head_logo";
	head_logo.onclick = function(){ 
		goTop();
	}
	head.appendChild(head_logo);


	window.addEventListener('click', close_all );
	window.addEventListener('touchstart', close_all );
	window.addEventListener('touch', close_all );

	let navi_search = $("div");
	navi_search.id = "navi_search";
	navi_search.className = "navi_menu";
	let navi_search_a = $('a');
	navi_search.onclick = head_search_show;

	

	let navi_search_img = $('img');
	navi_search_img.src = "/svg/navi_search.svg";
	navi_search_a.appendChild(navi_search_img);
	navi_search.appendChild(navi_search_a);
	head.appendChild(navi_search);

	let navi_profile = $("div");
	navi_profile.id = "navi_profile";
	navi_profile.className = "navi_menu";
	navi_profile.innerHTML = "<img src='/files/profile/" + session.id + "'>";
	if( session == "" || session.signUp != true ){
		navi_profile.onclick = function(){
			if( document.URL.indexOf("login") >= 0 ){
				getPage( "/login/" + document.URL.split('/').slice(4).join("-") );
			} else {
				getPage( "/login/" + document.URL.split('/').slice(3).join("-") );
			}
		}
	} else {
		navi_profile.onclick = head_menu_show;
	}
	head.appendChild(navi_profile);

	let head_menu = $("div");
	head_menu.addEventListener('touch', function( evt ){
		evt.stopPropagation();
	});
	head_menu.addEventListener('touchstart', function( evt ){
		evt.stopPropagation();
	});
	head_menu.id = "head_menu";

	let head_menu_caret = $('div');
	head_menu_caret.className = "head_menu_caret";
	let head_menu_outer = $('div');
	head_menu_outer.className = "head_menu_caret_other";
	head_menu_caret.appendChild(head_menu_outer);
	let head_menu_inner = $('div');
	head_menu_inner.className = "head_menu_caret_inner";
	head_menu_caret.appendChild(head_menu_inner);
	head_menu.appendChild(head_menu_caret);
		
	let head_menu_home = $('a');
	makeHref( head_menu_home, "/@" + session.uid );
	let head_menu_home_img = $('img');
	head_menu_home_img.src = "/svg/menu_home.svg";
	head_menu_home.appendChild(head_menu_home_img);
	let head_menu_home_text = $('text');
	head_menu_home_text.innerText = "| 프로필";
	head_menu_home.appendChild(head_menu_home_text);
	head_menu.appendChild(head_menu_home);

	let head_menu_activity = $('a');
	makeHref( head_menu_activity, "/activity" );
	let head_menu_activity_img = $('img');
	head_menu_activity_img.src = "/svg/menu_activity.svg";
	head_menu_activity.appendChild(head_menu_activity_img);
	let head_menu_activity_text = $('text');
	head_menu_activity_text.innerText = "| 활동로그";
	head_menu_activity.appendChild(head_menu_activity_text);
	head_menu.appendChild(head_menu_activity);

	let head_menu_setting = $('a');
	makeHref( head_menu_setting, "/setting/account" );
	let head_menu_setting_img = $('img');
	head_menu_setting_img.src = "/svg/menu_setting.svg";
	head_menu_setting.appendChild(head_menu_setting_img);
	let head_menu_setting_text = $('text');
	head_menu_setting_text.innerText = "| 설정";
	head_menu_setting.appendChild(head_menu_setting_text);
	head_menu.appendChild(head_menu_setting);

	if( session == "" ){
	} else if( session.signUp == 1 ){
		let head_menu_logout = $('a');
		let head_menu_logout_img = $('img');
		head_menu_logout.onclick = function(e){
			sessionLogOut(this);
		}
		head_menu_logout_img.src = "/svg/menu_logout.svg";
		head_menu_logout.appendChild(head_menu_logout_img);
		let head_menu_logout_text = $('text');
		head_menu_logout_text.innerText = "| 로그아웃";
		head_menu_logout.appendChild(head_menu_logout_text);
		head_menu.appendChild(head_menu_logout);
	}

	head_menu.style.display = "none";
	head.appendChild(head_menu);
	//<span onclick='sessionLogOut()'>로그아웃</span>";
	search_result = $("#head_search_result");

	//getNotices(0);
	/*
	notice.addEventListener('click', function(){
		if( parseInt( this.innerHTML ) >= 1 ){
			let xhr2 = new XMLHttpRequest();
			xhr2.onreadystatechange = function (event){ if(xhr2.readyState == 4 && xhr2.status == 200){
				let notices = JSON.parse( xhr2.responseText );
				for( let i = 0; i < notices.length; ++i ){
					//notice_box.innerHTML =
				}
			}}
			xhr2.open("POST", "/api/newsfeed/getnotice", false); xhr2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr2.send('cnt='+parseInt(notice.innerHTML));
		}
	});
	*/
});

if( session.notice && session.notice.web == true ){
	socket.on( 'notice_new', function( notice ){
		let options = {
			body : notice.desc,
			icon : "/files/profile/"+notice.from.uid,
		}
		let title = notice.from.name;
		switch( notice.type ){
				case "chat":
				break;
			case "follow":
				title = "새 팔로워";
				options.body = notice.from.name + " 님이 나를 팔로우했습니다";
				break;
			case "reply":
				break;
			case "favorite":
				title = "새 관심글";
				options.body = notice.from.name + " 님이 당신의 게시글을 관심글로 표시했습니다.";
				break;
			case "share":
				title = "공유됨";
				options.body = notice.from.name + " 님이 당신의 게시글을 공유했습니다.";
				break;
		}

		let noti = new Notification(title,options);
		new Audio("/sound/notification.mp3").play();
		noti.onclick = function(){
			getPage( notice.link );
		}
	});
}

