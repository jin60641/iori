function $(query){
	switch( query[0] ){
		case '#' :
			return document.getElementById(query.substr(1));
		case '.' :
			return document.getElementsByClassName(query.substr(1));
		default :
			return document.createElement(query);
	}
}


//브라우저가 무엇인지 판단
function getBrowser(){
	if( /webkit/i.test( navigator.userAgent ) ){
		return "webkit";
	} else if( /Trident||msie||\.net/i.test( navigator.userAgent ) ){
		return "ms";
	} else if( /moz/i.test( navigator.userAgent ) ){
		return "moz";
	} else {
		return "webkit";
	}
}


var searchResultView=0;
function searchResultNone(){
	if(searchResultView){
		return 0;
	} else {
		$("#search_result").style.display="none";
	}
}

function sessionLogOut(){
	var date = "Thu, 01 Jan 1970 00:00:01 GMT"
	/*
	document.cookie = "facebook=;expires=" + date + ";domain=iori.kr;path=/";
	document.cookie = "uid=;expires=" + date + ";domain=iori.kr;path=/";
	document.cookie = "email=;expires=" + date + ";domain=iori.kr;path=/";
	document.cookie = "password=;expires=" + date + ";domain=iori.kr;path=/";
	*/
	document.cookie = "facebook=,uid=,email=,password=;expires=" + date + ";domain=iori.kr;path=/";

	location.href = "/api/auth/logout";
}

function followUser( uid, callback ){
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		if( xhr.responseText == "follow" ){
			callback(1);
		} else if( xhr.responseText == "unfollow" ){
			callback(0);
		}
	}}
	xhr.open("POST","/api/user/follow", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send('uid='+uid);
}

function fade(obj, start, end, time ) {
	var speed = Math.round( time / 100 );
	var timer = 0;
	if( start > end ){
		for( i = start; i >= end; --i ){
			( function( tmp ){
				setTimeout(function(){
					obj.style.opacity = (tmp / 100);
					if( (tmp/100) <= 0 ){
						if( toast.parentNode ){
							document.body.removeChild(toast);
						}
					}
				}, (timer * speed));
				timer++;
			}(i));
		}
	} else if( start < end ){
		for( i = start; i <= end; ++i ){
			( function( tmp ){
				setTimeout(function(){
					obj.style.opacity = (tmp / 100);
				}, (timer * speed));
				timer++;
			}(i));
		}
	}
}

function makeToast(text){
	var toast = $("div");
	toast.id = "toast";
	document.body.appendChild(toast);
	toast.innerHTML = text;
	fade( toast, 0, 70, 500 );
	setTimeout( function(){
		fade( toast, 70, 0, 500 );
	}, 500 );
}

postOption = {};
