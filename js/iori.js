'use strict';

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
		for( var i = start; i >= end; --i ){
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
		for( var i = start; i <= end; ++i ){
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

function makeRecommendList(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(event){ if( xhr.readyState == 4 && xhr.status == 200 ){
		var result = JSON.parse(xhr.responseText);
		var div = $('div');
		div.id = "recommend_list";
		var title = $('div');
		title.id = "recommend_title";
		title.innerText = "팔로우 추천";
		div.appendChild(title);
		for( var i = 0; i < result.length; ++i ){
			var user = result[i];
			var li = $('div');
			var img = $('a');
			img.id = "recommend_img";
			img.style.backgroundImage = "url('/files/profile/" + user.uid + "')";
			img.href = "/@"+user.uid;
			li.appendChild(img);
			var box = $("div");
			box.className = "recommend_box";
			var a = $('a');
			a.href = img.href;
			a.innerText = user.name;
			var span = $('span');
			span.innerText = "@"+user.uid;
			a.appendChild(span);
			box.appendChild(a);
			var followers = user.followers;
			var text = $('text');
			if( followers.length == 1 ){
				var a1 = $('a');
				a1.href = "/@"+followers[0].uid;
				a1.innerText = followers[0].name;
				console.log(a1);
				text.appendChild(a1);
				text.innerHTML += " 님이 팔로우 중";
			} else if( followers.length == 2 ){
				var a1 = $('a');
				a1.href = "/@"+followers[0].uid;
				a1.innerText = followers[0].name;
				text.appendChild(a1);
				text.innerHTML += " 님, ";
				var a2 = $('a');
				a2.href = "/@"+followers[1].uid;
				a2.innerText = followers[1].name;
				text.appendChild(a2);
				text.innerHTML += " 님이 팔로우 중";
			} else {
				var a1 = $('a');
				a1.href = "/@"+followers[0].uid;
				a1.innerText = followers[0].name;
				text.appendChild(a1);
				text.innerHTML += "님 외 ";
				var a2 = $('a');
				a2.href = "/@"+user.uid+"/follower_together";
				a2.innerText = "다수";
				text.appendChild(a2);
				text.innerHTML += "가 팔로우 중";
			}
			box.appendChild(text);
			var user_follow = $('div');;
			user_follow.innerText = "팔로우"
			user_follow.className = "user_follow_btn_small"
			user_follow.id = "user_follow_" + user.id;
			user_follow.onclick = function(){
				var uid = this.id.split('_').pop();
				var tmp = this;
				followUser( uid, function( result ){
					if( result ){
						tmp.innerText = "언팔로우"
					} else {
						tmp.innerText = "팔로우"
					}
				});
			}
			box.appendChild(user_follow);
			li.appendChild(box);
			div.appendChild(li);
		}
		$('#wrap_right').appendChild(div);
	}}
	xhr.open("POST", "/api/user/recommend", false);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send();
}
window.addEventListener('load',function(){
	var body = $("div");
	body.id = "body";
	document.body.appendChild(body);

	var wrap0 = $("div");
	wrap0.id = "wrap_top";
	body.appendChild(wrap0);

	var wrap1 = $("div");
	wrap1.id = "wrap_left";
	body.appendChild(wrap1);

	var wrap2 = $("div");
	wrap2.id = "wrap_mid";
	body.appendChild(wrap2);

	var wrap3 = $("div");
	wrap3.id = "wrap_right";
	body.appendChild(wrap3);

	var head = $("div");
	head.id = "head";
	document.body.insertBefore( head, document.body.firstChild );

	if( session != null && session.signUp == true  ){
		wrap1.appendChild(makeUserCard(session));
		makeRecommendList();
	}
});



var postOption = {};


