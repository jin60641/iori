'use strict';

let inits = [];
let view;

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

function profileHover(e){
	clearTimeout(profileTimer);
	let target = this;
	profileTimer = setTimeout( function(){
		openProfileHover(target);
	}, 100 );
}

function profileLeave(){
	clearTimeout(profileTimer);
	profileTimer = setTimeout( closeProfileHover, 200 );
}

let profileTimer;
function openProfileHover(target){
	if( (/(BB|iPad|iPhone|iPod|Android|\.NET)/i.test( navigator.userAgent )) ){
		return;
	}
	let div = $('#profile_hover');
	if( target != div ){
		div.style.display = "";
		div.style.opacity = "";
		let uid = target.href.split('@')[1].split('/')[0];
		let current = div.className.split('_').pop();
		if( uid == current ){
			return;
		}
		let position = target.getBoundingClientRect();
		div.style.top = position.top + 10 + document.body.scrollTop + position.height + "px"
		div.style.left = position.left + "px"
		div.style.display = "block";
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			while( div.firstChild ){
				div.removeChild(div.firstChild);
			}
			div.className = "profile_hover_" + uid;
			div.style[getBrowser()+"Animation"] = 'fade_in .1s ease-in';
			div.appendChild(makeUserCard(JSON.parse(xhr.responseText)));
		}}
		xhr.open("POST","/@" + uid, false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
	}
}
function closeProfileHover(){
	clearTimeout(profileTimer);
	let div = $('#profile_hover');
	if( div ){
		div.className = "";
		div.style.opacity = "0";
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


let searchResultView=0;
function searchResultNone(){
	if(searchResultView){
		return 0;
	} else {
		$("#search_result").style.display="none";
	}
}

function sessionLogOut(){
	let date = "Thu, 01 Jan 1970 00:00:01 GMT"
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
	let xhr = new XMLHttpRequest();
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
	let speed = Math.round( time / 100 );
	let timer = 0;
	if( start > end ){
		for( let i = start; i >= end; --i ){
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
		for( let i = start; i <= end; ++i ){
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
	let toast = $("div");
	toast.id = "toast";
	document.body.appendChild(toast);
	toast.innerHTML = text;
	fade( toast, 0, 70, 500 );
	setTimeout( function(){
		fade( toast, 70, 0, 500 );
	}, 500 );
}

function refreshRecommendList(skip,limit){
	let refresh = $('#recommend_refresh');
	refresh.onclick = function(){
		refreshRecommendList(skip+3,limit);
	}
	let divs = $('.recommend_li');
	let list = $('#recommend_list');

	for( let i = divs.length-1; i >= 0; --i ){
		list.removeChild(divs[i]);
	}
	getRecommendList(skip,limit);
}

function getRecommendList(skip,limit){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(event){ if( xhr.readyState == 4 && xhr.status == 200 ){
		let result = JSON.parse(xhr.responseText);
		let div = $('#recommend_list');
		if( result.length < limit ){
			$('#recommend_refresh').onclick = function(){
				refreshRecommendList(0,limit);
			}
		}
		for( let i = 0; i < result.length; ++i ){
			let user = result[i];
			let li = $('div');
			li.className = "recommend_li";
			let img = $('a');
			img.addEventListener('mouseover',profileHover);
			img.addEventListener('mouseleave',profileLeave);
			img.id = "recommend_img";
			img.style.backgroundImage = "url('/files/profile/" + user.uid + "')";
			makeHref( img, "/@"+user.uid );
			li.appendChild(img);
			let box = $("div");
			box.className = "recommend_box";
			let a = $('a');
			a.addEventListener('mouseover',profileHover);
			a.addEventListener('mouseleave',profileLeave);
			makeHref( a, img.href );
			a.innerText = user.name;
			let span = $('span');
			span.innerText = "@"+user.uid;
			a.appendChild(span);
			box.appendChild(a);
			let followers = user.followers;
			let text = $('div');
			text.className = "recommend_text";
			if( followers.length == 1 ){
				let a1 = $('a');
				a1.addEventListener('mouseover',profileHover);
				a1.addEventListener('mouseleave',profileLeave);
				makeHref( a1, "/@"+ followers[0].uid );
				a1.innerText = followers[0].name;
				text.appendChild(a1);
				let text1 = $('text');
				text1.innerText = " 님이 팔로우 중";
				text.appendChild(text1);
			} else if( followers.length == 2 ){
				let a1 = $('a');
				a1.addEventListener('mouseover',profileHover);
				a1.addEventListener('mouseleave',profileLeave);
				makeHref( a1, "/@" + followers[0].uid );
				a1.innerText = followers[0].name;
				text.appendChild(a1);
				let text1 = $('text');
				text1.innerText = " 님, ";
				text.appendChild(text1);
				let a2 = $('a');
				a2.addEventListener('mouseover',profileHover);
				a2.addEventListener('mouseleave',profileLeave);
				makeHref( a2, "/@" + followers[1].uid );
				a2.innerText = followers[1].name;
				text.appendChild(a2);
				let text2 = $('text');
				text2.innerText = " 님이 팔로우 중";
				text.appendChild(text2);
			} else {
				let a1 = $('a');
				a1.addEventListener('mouseover',profileHover);
				a1.addEventListener('mouseleave',profileLeave);
				makeHref( a1, "/@" + followers[0].uid );
				a1.innerText = followers[0].name;
				text.appendChild(a1);
				let text1 = $('text');
				text1.innerText = " 님 외 ";
				text.appendChild(text1);
				let a2 = $('a');
				makeHref( a2, "/@"+user.uid+"/follower_together" );
				a2.innerText = "다수";
				text.appendChild(a2);
				let text2 = $('text');
				text2.innerText = "가 팔로우 중";
				text.appendChild(text2);
			}
			box.appendChild(text);
			let user_follow = $('div');;
			user_follow.innerText = "팔로우"
			user_follow.className = "user_follow_btn_small"
			user_follow.id = "user_follow_" + user.id;
			user_follow.onclick = function(){
				let uid = this.id.split('_').pop();
				let tmp = this;
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
	let params = "";
	params += 'skip=' + skip + '&limit=' + limit;
	xhr.send(params);
}

window.addEventListener('load',function(){
	let body = $("div");
	body.id = "body";
	document.body.appendChild(body);

	let wrap0 = $("div");
	wrap0.id = "wrap_top";
	body.appendChild(wrap0);

	let wrap1 = $("div");
	wrap1.id = "wrap_left";
	body.appendChild(wrap1);

	let wrap2 = $("div");
	wrap2.id = "wrap_mid";
	body.appendChild(wrap2);

	let wrap3 = $("div");
	wrap3.id = "wrap_right";
	body.appendChild(wrap3);

	let head = $("div");
	head.id = "head";
	document.body.insertBefore( head, document.body.firstChild );

	if( !(/(BB|iPad|iPhone|iPod|Android|\.NET)/i.test( navigator.userAgent )) ){
		let hover = $('div');
		hover.id = "profile_hover";
		hover.addEventListener('transitionend', function(){
			if(this.style.opacity == "0" ){
				this.style.display = "none";
			}
		});
		hover.addEventListener('mouseover',profileHover);
		hover.addEventListener('mouseleave',profileLeave);
		document.body.appendChild(hover);
	}

	$('#wrap_left').appendChild(makeUserCard(session));
	makeRecommendList();

	getPage(location.pathname);
	window.onpopstate = function(e){
		if( view != location.pathname ){
			getPage(location.pathname);
		} else {
			history.go(-1);
		}
	}
});

function makeRecommendList(){
	if( session != null && session.signUp == true  ){
		let div = $('div');
		div.id = "recommend_list";
		let title = $('span');
		title.id = "recommend_title";
		title.innerText = "팔로우 추천";
		div.appendChild(title);
		let refresh = $('span');
		refresh.id = "recommend_refresh";
		refresh.className = "recommend_span";
		refresh.innerText = "새로고침";
		refresh.onclick = function(){
			refreshRecommendList(0,3);
		}
		div.appendChild(refresh);
		let all = $('a');
		makeHref( all, "/recommend" );
		all.className = "recommend_span";
		all.innerText = "모두보기";
		div.appendChild(all);
		$('#wrap_right').appendChild(div);
		refresh.click();
	}

}

function makeHref(a,link){
	a.href = link;
	a.onclick = function(event){
		if( event.ctrlKey || event.shiftKey ){
		} else {
			event.preventDefault();
			getPage(a.href);
		}
	};
}

function getPage(path){
	if( $('#page_loading') ){
		return ;
	}
	closeProfileHover();
	if( path.split('/iori.kr')[1] ){
		path = path.split('/iori.kr')[1];
	}
	if( view == path.split('#')[0].split('?')[0] ){
		return ;
	}
	history.pushState(null,null,path);
	document.title = "iori.kr";
	if( location.pathname.length >= 2 ){
		document.title += " - " + location.pathname.substr(1);
	}
	view = location.pathname;
	if( $('#navi_tab') ){
		findTabNow();
	}
	var head = document.getElementsByTagName('head')[0];
	for( let name in inits ){
		inits[name].exit();
	}

	let loading;
	if( $('#wrap_mid') ){
		loading = $('div');
		loading.id = "page_loading";
		$('#wrap_mid').appendChild(loading);
	}

	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		if( $('#wrap_mid') && loading != undefined  ){
			$('#wrap_mid').removeChild(loading);
		}
		let includes = $('.included');
		for( let i = includes.length - 1; i >= 0 ; --i ){
			head.removeChild(includes[i]);
		}
		inits = [];
		var obj = JSON.parse(xhr.responseText);
		for( let i in obj.js ){
			var script = $('script');
			script.className = "included";
			script.src = '/js/' + obj.js[i] + '.js';
			script.onload = function(){
				if( Object.keys(inits).length == obj.js.length ){
					for( let j in inits ){
						inits[j].init();
					}
				}
			}
			head.appendChild(script);
		}
		for( let i in obj.css ){
			let link = $('link');
			link.className = "included";
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = '/css/' + obj.css[i] + '.css';
			head.appendChild(link);
		}
	}}
	xhr.open("GET",path.split('#')[0]+"?loaded=true", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
}
