
function getCookie(cname) {
	var cookie_array = document.cookie.split(', ');
	for(var i = 0; i < cookie_array.length; ++i ){
		if( cname == cookie_array[i].split('=')[0] ){
			return cookie_array[i].split('=')[1];
		}
	}
	return "";
}

if( document.cookie ){
	if ( getCookie("facebook") == "true" ){
		var returnTo = document.URL.split('/').slice(3).toString();
		location.href = "/api/auth/facebook/" + returnTo;
	} else if( getCookie("userid") && getCookie("password") ){
		var params = "password=" + getCookie("password") + "&userid=" + getCookie("userid");
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
}

if( session.level >= 9 ){
	//관리자
}


//유저검색(헤더)
function sendData_search( query ){
	if( query ){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			var result = search_result;
			if( xhr.responseText != "[]" ){
				result.innerHTML="";
				var xhrResult = JSON.parse( xhr.responseText );
				if( xhrResult.length ){
					for( var i = xhrResult.length - 1; i>=0; i--){
						result.innerHTML+='<a href="/@' + xhrResult[i].user_id + '"><div><img src="/profileimg/' + xhrResult[i].id + '"><span><div class="search_result_userid">@' + xhrResult[i].user_id.toString() + '</div>' + xhrResult[i].name.toString() + '</span></div></a>';
					}
				}
			} else {
				result.innerHTML='<div id="search_none">표시할 검색 결과가 없습니다.</div>';
			}
		}}
		xhr.open("POST", "/api/user/search", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('query='+query);
	} else {
		search_result.innerHTML='<div id="search_none">표시할 검색 결과가 없습니다.</div>';
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
	var head_menu = document.getElementById("head_menu");
	if( boolean != undefined ){
		if( boolean ){
			search_result_show( false );
			document.getElementById("navi_profile").firstElementChild.style.borderRadius = "2px";
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
	var search_result = document.getElementById("search_result");
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

window.addEventListener('load',function(){
	var head = document.createElement("div");
	document.body.insertBefore( head, document.body.firstChild );
	head.id = "head";
	var search = document.createElement("input");
	search.id = "search";
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

	var search_result = document.createElement("div");
	search_result.id = "search_result";
	search_result.onmouseover = function(){
		searchResultView = 1;
	}
	search_result.onmouseout = function(){
		searchResultView = 0;
	}
	var search_none = document.createElement("div");
	search_none.id = "search_none";
	search_none.innerText = "표시할 검색 결과가 없습니다.";
	search_result.appendChild(search_none);
	head.appendChild(search_result);

	var head_logo = document.createElement("img");
	head_logo.src = "/img/logo_orange.png";
	head_logo.onclick = goTop;


	window.addEventListener('click', function(){
		document.getElementById("search_result").style.display = "none";
		document.getElementById("navi_profile").firstElementChild.style.borderRadius = "";
		head_menu_show(false);
	});

	var navi_search = document.createElement("div");
	navi_search.id = "navi_search";
	navi_search.className = "navi_menu";
	navi_search.innerHTML = "<a href='/search' ><img src='/img/navi_search.jpg'></a>";
	head.appendChild(navi_search);

	var navi_profile = document.createElement("div");
	navi_profile.id = "navi_profile";
	navi_profile.className = "navi_menu";
	navi_profile.innerHTML = "<img src='/profileimg/" + session.id + "'>";
	if( session == "" ){
		navi_profile.onclick = function(){
			location.href = "/login/" + document.URL.split('/').slice(3).join("-");
		}
	} else {
		navi_profile.onclick = head_menu_show;
	}
	head.appendChild(navi_profile);

	var head_menu = document.createElement("div");
	head_menu.id = "head_menu";
	head_menu.innerHTML += "<div class='dropdown_caret'><div class='caret_outer'></div><div class='caret_inner'></div></div>";
	head_menu.innerHTML += "<a href='/'><img src='/img/menu_home.png'>| 홈</a>";
	head_menu.innerHTML += "<a href='/room'><img src='/img/menu_game.png'>| 게임</a>";
	head_menu.innerHTML += "<a href='/ranking'><img src='/img/menu_ranking.png'>| 랭킹</a>";
	if( session == "" ){
	} else {
		head_menu.innerHTML += "<a href='#' onclick='sessionLogOut(this)' ><img src='/img/menu_logout.png'>| 로그아웃</a>";
	}

	head_menu.style.display = "none";
	head.appendChild(head_menu);
	//<span onclick='sessionLogOut()'>로그아웃</span>";
	search_result = document.getElementById("search_result");

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



