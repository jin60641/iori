function getCookie(cname) {
	var cookie_array = document.cookie.split(', ');
	for(var i = 0; i < cookie_array.length; ++i ){
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

if( session == "" && document.cookie ){
	if ( getCookie("facebook") == "true" ){
		if( document.URL.indexOf("login") ){
			location.href = "/api/auth/facebook/" + document.URL.split('/').slice(4).join('-');
		} else {
			location.href = "/api/auth/facebook/" + document.URL.split('/').slice(3).join('-');
		}
	} else if( getCookie("uid") && getCookie("password") ){
		var params = "password=" + getCookie("password") + "&uid=" + getCookie("uid");
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(event){
			if( xhr.readyState == 4 && xhr.status == 200 ){
				if( xhr.responseText == "success" ){
					if( document.URL.indexOf("login") ){
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
} else if ( session != "" && session.signUp == 0 ){
	location.href = "/api/auth/facebook/" + register;
}
if( session.level >= 9 ){
	//관리자
}


//유저검색(헤더)
function sendData_search( query ){
	if( query ){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			var result = $("#head_search_result");
	console.log(xhr.responseText);
			if( xhr.responseText != "[]" ){
				result.innerHTML="";
				var xhrResult = JSON.parse( xhr.responseText );
				if( xhrResult.length ){
					for( var i = xhrResult.length - 1; i>=0; i--){
						result.innerHTML+='<a href="/@' + xhrResult[i].uid + '"><div><img src="/files/profile/' + xhrResult[i].id + '"><span><div class="head_search_result_uid">@' + xhrResult[i].uid.toString() + '</div>' + xhrResult[i].name.toString() + '</span></div></a>';
					}
				}
			} else {
				result.innerHTML='<div id="head_search_none">표시할 검색 결과가 없습니다.</div>';
			}
		}}
		xhr.open("POST", "/api/user/search", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('query='+query);
	} else {
		search_result.innerHTML='<div id="head_search_none">표시할 검색 결과가 없습니다.</div>';
	}
}


// 알림로딩
function getNotices(cnt){
	var xhr = new XMLHttpRequest();
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
	var Timer;
	var winHeight = document.body.scrollTop;
	if( Timer ){
		clearTimeout( Timer );
	}
	startx = 0;
	starty = winHeight;
	if( !orix || orix < 0 ){
		orix = 0;
	}
	if( !oriy || oriy < 0 ){
		oriy = 0;
	}
	var speed = 7;
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
	var posX = Math.ceil( desx );
	var posY = Math.ceil( desy );
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

function head_menu_show( boolean ){
	event.stopPropagation();
	var head_menu = $("#head_menu");
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
	var search_result = $("#head_search_result");
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

window.addEventListener('load',function(){
	var head = $("div");
	document.body.insertBefore( head, document.body.firstChild );
	head.id = "head";

	var navi_tab = $("div");
	navi_tab.id = "navi_tab";

	var navi_tab_home = $("a");
	navi_tab_home.href = '/';
	navi_tab_home.id = "navi_tab_home";
	navi_tab_home.innerText = "홈";
	navi_tab.appendChild(navi_tab_home);
	
	var navi_tab_notice = $("a");
	navi_tab_notice.href = '/notice';
	navi_tab_notice.id = "navi_tab_notice";
	navi_tab_notice.innerText = "알림";
	navi_tab.appendChild(navi_tab_notice);
	
	var navi_tab_chat = $("a");
	navi_tab_chat.href = '/chat';
	navi_tab_chat.id = "navi_tab_chat";
	navi_tab_chat.innerText = "쪽지";
	navi_tab.appendChild(navi_tab_chat);
	
	head.appendChild(navi_tab);
	var navi_tab_now = $("#navi_tab_" + location.pathname.substr(1));
	if( navi_tab_now ){
		navi_tab_now.style.color = "#ff5c3e";
		navi_tab_now.style.height = "24px";
		navi_tab_now.style.borderBottom = "5px solid #ff5c3e";
	} else if ( document.URL.split('/').slice(3)[0] == "" ){
		navi_tab_home.style.color = "#ff5c3e";
		navi_tab_home.style.height = "24px";
		navi_tab_home.style.borderBottom = "5px solid #ff5c3e";
	}
	
		

	var search = $("input");
	search.id = "head_search";
	search.type = "text";
	search.name = "query";
	search.onkeyup = function(){
		sendData_search(this.value);
	}
	search.placeholder = "친구 찾기";
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

	var search_result = $("div");
	search_result.id = "head_search_result";
	search_result.onmouseover = function(){
		searchResultView = 1;
	}
	search_result.onmouseout = function(){
		searchResultView = 0;
	}
	var search_none = $("div");
	search_none.id = "head_search_none";
	search_none.innerText = "표시할 검색 결과가 없습니다.";
	search_result.appendChild(search_none);
	head.appendChild(search_result);

	var head_logo = $("img");
	head_logo.id = "head_logo";
	head_logo.src = "/img/logo_orange.png";
	head_logo.onclick = function(){ 
		goTop();
	}
	head.appendChild(head_logo);


	window.addEventListener('click', close_all );
	window.addEventListener('touchstart', close_all );
	window.addEventListener('touch', close_all );

	var navi_search = $("div");
	navi_search.id = "navi_search";
	navi_search.className = "navi_menu";
	navi_search.innerHTML = "<a href='/search' ><img src='/img/navi_search.jpg'></a>";
	head.appendChild(navi_search);

	var navi_profile = $("div");
	navi_profile.id = "navi_profile";
	navi_profile.className = "navi_menu";
	navi_profile.innerHTML = "<img src='/files/profile/" + session.id + "'>";
	if( session == "" || session.signUp != 1 ){
		navi_profile.onclick = function(){
			location.href = "/login/" + document.URL.split('/').slice(3).join("-");
		}
	} else {
		navi_profile.onclick = head_menu_show;
	}
	head.appendChild(navi_profile);

	var head_menu = $("div");
	head_menu.id = "head_menu";
	head_menu.innerHTML += "<div class='dropdown_caret'><div class='caret_outer'></div><div class='caret_inner'></div></div>";
	head_menu.innerHTML += "<a href='/@" + session.uid + "'><img src='/img/menu_home.png'>| 프로필</a>";
	head_menu.innerHTML += "<a href='/room'><img src='/img/menu_game.png'>| 게임</a>";
	head_menu.innerHTML += "<a href='/ranking'><img src='/img/menu_ranking.png'>| 랭킹</a>";
	if( session == "" ){
	} else if( session.signUp == 1 ){
		head_menu.innerHTML += "<a href='#' onclick='sessionLogOut(this)' ><img src='/img/menu_logout.png'>| 로그아웃</a>";
	}

	head_menu.style.display = "none";
	head.appendChild(head_menu);
	//<span onclick='sessionLogOut()'>로그아웃</span>";
	search_result = $("#head_search_result");

	//getNotices(0);
	/*
	notice.addEventListener('click', function(){
		if( parseInt( this.innerHTML ) >= 1 ){
			var xhr2 = new XMLHttpRequest();
			xhr2.onreadystatechange = function (event){ if(xhr2.readyState == 4 && xhr2.status == 200){
				var notices = JSON.parse( xhr2.responseText );
				for( var i = 0; i < notices.length; ++i ){
					//notice_box.innerHTML =
				}
			}}
			xhr2.open("POST", "/api/newsfeed/getnotice", false); xhr2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr2.send('cnt='+parseInt(notice.innerHTML));
		}
	});
	*/
});


socket.on( 'notice_reply_new', function( data ){
	makeToast(data.from.name + "님의 답글 : " + data.text);
});

