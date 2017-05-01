'use strict';

postOption.uid = user.id;

var profileLabelScale = 1;
var headerLabelScale = 1;

window.addEventListener("click", hideLabelMenu);

window.addEventListener('load', function(){
	if( session.signUp ){
		$('#user_list_self').style.display = "none";
	}
	var wrap = $("div");
	wrap.id = "profile_wrap";
	$('#wrap_top').appendChild(wrap);

	var container = $("div");
	container.id = "profile_container";
	wrap.appendChild(container);


	var headerimg_form = $("form");
	headerimg_form.id = "headerimg_form";
	
	var headerimg_back = $("div");
	headerimg_back.id = "headerimg_back";
	if( user.header ){
		headerimg_back.style.cursor = "pointer";
		headerimg_back.style.backgroundImage = "url('/files/header/" + user.id + "?')";
		//headerimg_back.style.backgroundImage = "url('/files/header/" + user.id + "?" + new Date().getTime() + "')";
		headerimg_back.onclick = function(){
			viewimg(0,1,new Date(),"/files/header/" + user.id);
		}
		container.style.height = "45vh";
		wrap.style.height = "45vh";
	} else {
		headerimg_back.style.backgroundColor = user.color.hex;
	}
	headerimg_form.appendChild(headerimg_back);

	var headerimg_file = $("input");
	headerimg_file.type = "file";
	headerimg_file.accept = "image/*";
	headerimg_file.id = "headerimg_file";
	headerimg_file.name = "headerimg_file";
	headerimg_file.style.display = "none";
	headerimg_form.appendChild(headerimg_file);

	var profileimg_form = $("form");
	profileimg_form.id = "profileimg_form";

	var profileimg_back = $("div");
	profileimg_back.id = "profileimg_back";
	if( user.profile ){
		profileimg_back.style.cursor = "pointer";
		profileimg_back.onclick = function( event ){
			viewimg(0,1,new Date(),"/files/profile/" + user.id);
		}
	} else {
		profileimg_back.style.backgroundColor = "white";
	}
	profileimg_back.style.backgroundImage = "url('/files/profile/" + user.id + "')";
	profileimg_form.appendChild(profileimg_back);

	var profileimg_file = $("input");
	profileimg_file.type = "file";
	profileimg_file.accept = "image/*";
	profileimg_file.id = "profileimg_file";
	profileimg_file.name = "profileimg_file";
	profileimg_file.style.display = "none";
	profileimg_form.appendChild(profileimg_file);

	profileimg_file.onchange = headerimg_file.onchange = function(event){
		var input = event.target
		var reader = new FileReader();
		reader.addEventListener("load",function(event){
            var dataURL = event.target.result;
			var label = $('#'+input.id.split('_')[0]+"_label");
			var img = new Image();
			img.src = dataURL;
			label.style.backgroundImage = "url('" + dataURL + "')";
			label.style.backgroundPositionX = "0px";
			label.style.backgroundPositionY = "0px";
			label.style.cursor = "move";
			label.onclick = function( evt ){
				evt.preventDefault();
			}
			resizeContainer();
			label.onmousewheel = function( evt ){
				backgroundMouseWheel( evt, img ); 
			}
			label.onmousemove = function( evt ){
				backgroundMouseMove( evt, img );
			}
			label.innerHTML = "";
        });
        reader.readAsDataURL(input.files[0]);
	}


	container.appendChild(headerimg_form);
	container.appendChild(profileimg_form);

	if( user.id == session.id ){
		var user_setting = makeUserButton("setting","프로필 수정");
		user_setting.onclick = settingStart
		container.appendChild(user_setting);
	} else {
		var user_follow = makeUserButton("follow");
		if( user.following ){
			user_follow.innerText = "언팔로우"
		} else {
			user_follow.innerText = "팔로우"
		}
		user_follow.onclick = function(){
			if( session.id ){
				followUser( user.id, function( result ){
					user.following = !user.following;
					if( result ){
						user_follow.innerText = "언팔로우"
					} else {
						user_follow.innerText = "팔로우"
					}
				});
			} else {
				location.href = "/login/" + document.URL.split('/').slice(3).join("-");
			}
		}
		container.appendChild(user_follow);

		var user_chat = makeUserButton("message");
		user_chat.onclick = function(){
			location.href = "/chat/#u?" + user.uid;
		}
		user_chat.innerText = "쪽지";
		container.appendChild(user_chat);
	}

	var user_name = $("div");
	user_name.id = "user_name";
	user_name.innerHTML = user.name;
	container.appendChild(user_name);

	var user_userid = $("div");
	user_userid.id = "user_userid";
	user_userid.innerHTML = "@" + user.uid;
	container.appendChild(user_userid);

	var user_tab = $("div");

	var tab_arr = [
		{ name : "게시글", id : "post" },
		{ name : "팔로잉", id : "following" },
		{ name : "팔로워", id : "follower" },
		{ name : "관심글", id : "favorite" }
	];
	for( var i = 0; i < tab_arr.length; ++i ){
		var tab = $("div");
		tab.className = "profile_tab";
		tab.id = "profile_tab_"+tab_arr[i].id;
		tab.innerText = tab_arr[i].name;
		tab.onclick = openUserTab;
		user_tab.appendChild(tab);
	}
	
	user_tab.id = "user_tab";
	
	if($('#post_wrap')){
		$('#wrap_mid').insertBefore(user_tab,$('#post_wrap'));
	} else {
		$('#wrap_mid').appendChild(user_tab);
	}

	window.addEventListener('scroll', resizeContainer );
	window.addEventListener('resize', resizeContainer );
	resizeContainer();
	
	var follow_wrap = $('div');
	follow_wrap.id = "follow_wrap";
	$('#wrap_mid').appendChild(follow_wrap);

	openUserTab();
});

function resizeContainer(){
	/*
	// for absolute
	if( document.body.scrollTop <= $('#wrap_mid').clientHeight + 42 - 130 ){
		container.style.top = "42px";
	} else {
		container.style.top = document.body.scrollTop + 42 - $('#wrap_mid').clientHeight + 80 + "px";
	}
	*/

	var size = 170;
	var form = $('#profileimg_form');
	var header_size = 42;
	var border_size = -20;
	var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
	if( $("#headerimg_label") ){ // profile changing now!
		$('#profile_container').style.top = header_size + "px";
	} else {
		var max_scroll = 200;
		var save_size = parseInt(window.innerHeight/6);
		var wrap = $('#profile_wrap');
		if( top <= wrap.clientHeight - save_size ){
			$('#profile_container').style.top = header_size - top + "px";
			size = 170;
			if( document.body.clientWidth <= 1000 ){
				size = 40;
			}
		} else {
			$('#profile_container').style.top = -wrap.clientHeight + header_size + save_size + "px";
			size = 40;
		}
	}
	changeLabelSize("profile");
	changeLabelSize("header");
	
	var bottom = size/2 + border_size;
	var left = document.body.clientWidth/100*12 - size;
	form.style.width = size + "px";
	form.style.height = size + "px";
	form.style.bottom = -bottom + "px";
	if( left < 10 ){
		left = 10;
	}
	form.style.left = left + "px";
	$('#user_name').style.left = left + size + 15 + "px";
	$('#user_userid').style.left = left + size + 15 + "px";
	if( document.body.clientWidth >= 1000 ){
		$('#profile_container').appendChild($('#user_tab'));
	} else {
		$('#wrap_mid').insertBefore(user_tab,$('#post_wrap'));
	}
}

function changeLabelSize(type){
	var label = $('#' + type + "img_label");
	if( label == null ){
		return;
	}

	var scale;
	if( type == "profile" ){
		scale = profileLabelScale;
	} else if ( type == "header" ){
		scale = headerLabelScale;
	}

	var img = new Image();
	img.src = label.style.backgroundImage.replace(/url\(|\)$|"/ig, '');

	var direction;
	var multi;
	if( img.width < label.clientWidth || img.height < label.clientHeight ){
		direction = (img.width/label.clientWidth < img.height/label.clientHeight)?"width":"height";
	}
	
	if( direction == "width" ){
		multi = label.clientWidth/img.width;
		label.style.backgroundSize = label.clientWidth * scale + "px " + img.height * multi * scale + "px";
	} else if( direction == "height" ){
		multi = label.clientHeight/img.height;
		label.style.backgroundSize = img.width * multi * scale + "px " + label.clientHeight * scale + "px";
	} else {
		label.style.backgroundSize = img.width * scale + "px " + img.height * scale + "px";
	}
}


function makeUserButton( id, text ){
	var div = $("div");
	div.id = "user_" + id;
	div.className = "user_button";
	div.innerText = text;
	return div;
}

function settingSave(){
	var flag = false;

	if( $('#headerimg_file').value != "" ){
		sendProfileImage( "header" );
		flag = true;
	} else if( $('#headerimg_back').style.backgroundImage == "" && user.header ){
		sendProfileImage( "header", false );
		flag = true;
	} else {
		$('#headerimg_form').removeChild($('#headerimg_label'));
	}

	if( $('#profileimg_file').value != "" ){
		sendProfileImage( "profile" );
		flag = true;
	} else if( $('#profileimg_back').style.backgroundImage == 'url("/svg/profile.svg")' && user.profile ){
		sendProfileImage( "profile", false );
		flag = true;
	} else {
		$('#profileimg_form').removeChild($('#profileimg_label'));
	}
	
	if( flag == false ){
		settingCancel();
	}
}

function sendProfileImage( type, boolean ){
	var xhr = new XMLHttpRequest();
	var label = $('#'+type+"img_label");
	if( user[type] && boolean == false ){
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			session[type] = false;
			user[type] = false;
			if( type == 'header' ){
				$('#headerimg_back').style.backgroundImage = "";
			} else {
				$('#profileimg_back').style.backgroundImage = 'url("/svg/profile.svg")';
			}
			$('#'+type+'img_form').removeChild($('#'+type+'img_label'));
			settingCancel(true);
		}}
		xhr.open("POST","/api/user/removeimg", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('imgtype='+type);
	} else {
		var file = $('#'+type+"img_file").files[0];

		var img = new Image();
		img.src = label.style.backgroundImage.replace(/url\(|\)$|"/ig, '');
	
		var formdata = new FormData();
		
		var x = -parseInt( label.style.backgroundPositionX.replace("px","") ) ;
		var y = -parseInt( label.style.backgroundPositionY.replace("px","") ) ;
		if( label.style.backgroundSize.split(' ')[1] == undefined ){
			alert("적절하지 않은 파일 형식입니다");
			return;
		}
		var w = parseInt( label.style.backgroundSize.split(' ')[0].replace("px","") ) / img.width;
		var h = parseInt( label.style.backgroundSize.split(' ')[1].replace("px","") ) / img.height;
	
	
		formdata.append( "x", x / w );
		formdata.append( "y", y / h );
		formdata.append( "width", label.clientWidth / w );
		formdata.append( "height", label.clientHeight / h );
		formdata.append( "file", file );
	
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			session[type] = true;
			user[type] = true;
			$('#'+type+"img_back").style.backgroundImage = "url('/files/" + type + "/" + user.id + "?" + new Date().getTime() + "')";
			$('#'+type+"img_form").reset();
			$('#'+type+'img_form').removeChild($('#'+type+'img_label'));
			settingCancel(true);
		}}
		xhr.open("POST","/api/user/" + type + "img", false); xhr.send(formdata);
	}
}

function settingCancel(boolean){
	if( $('#user_setting_cancel') ){
		$('#profile_container').removeChild($('#user_setting_cancel'));
	}

	if( $('#user_setting_save') ){
		$('#profile_container').removeChild($('#user_setting_save'));
	}
	if( !user.header ){
		$('#profile_container').style.height = "";
		$('#profile_wrap').style.height = "";
	}
	$('#user_setting').style.display = "";
	if( boolean == true ){
		return ;
	}
	if( user.header ){
		$('#headerimg_back').style.backgroundImage = "url('/files/header/" + user.id + "?" + new Date().getTime() + "')";
	}
	if( user.profile ){
		$('#profileimg_back').style.backgroundImage = "url('/files/profile/" + user.id + "?" + new Date().getTime() + "')";
	}
	var headerimg_form = $('#headerimg_form');
	var profileimg_form = $('#profileimg_form');
	headerimg_form.reset();
	profileimg_form.reset();
	if( $('#headerimg_label') ){
		headerimg_form.removeChild($('#headerimg_label'));
	}
	if( $('#profileimg_label') ){
		profileimg_form.removeChild($('#profileimg_label'));
	}

}


function settingStart(){
	profileLabelScale = 1;
	headerLabelScale = 1;
	this.style.display = "none";
	var wrap = $('#profile_wrap');
	var container = $('#profile_container');
	container.style.height = "45vh";
	wrap.style.height = "45vh";
	
	var headerimg_label = $("label")
	headerimg_label.id = "headerimg_label";
	headerimg_label.onclick = showLabelMenu;
	$('#headerimg_form').insertBefore(headerimg_label,headerimg_form.firstChild);

	var profileimg_label = $("label")
	profileimg_label.id = "profileimg_label";
	profileimg_label.onclick = showLabelMenu;
	$('#profileimg_form').insertBefore(profileimg_label,profileimg_form.firstChild);

	headerimg_label.appendChild(makePhotoHelper("header"));
	profileimg_label.appendChild(makePhotoHelper("profile"));

	var user_setting_save = makeUserButton("setting_save","저장");
	user_setting_save.onclick = settingSave;
	container.insertBefore(user_setting_save,this);

	var user_setting_cancel = makeUserButton("setting_cancel","취소");
	user_setting_cancel.onclick = settingCancel;
	container.insertBefore(user_setting_cancel,this);
		
	headerimg_label.style.display = "block";
	profileimg_label.style.display = "block";
	resizeContainer();
}

function makePhotoHelper( type, boolean ){
	var photohelper = $("div");
	photohelper.className = "photohelper";

	var photohelper_menu = $("div");
	photohelper_menu.innerHTML = "<div class='dropdown_caret'><div class='caret_outer'></div><div class='caret_inner'></div></div>";
	photohelper_menu.className = "photohelper_menu";
	var photohelper_change = $("div");
	photohelper_change.onclick = function( evt ){
		hideLabelMenu();
		$('#' + this.parentNode.parentNode.parentNode.id.replace("label","file") ).click();
	}
	photohelper_change.className = "photohelper_div";
	photohelper_menu.appendChild(photohelper_change);

	
	if( boolean == true || ( boolean == undefined && user[type] == true ) ) {
	//if( ( boolean == true || boolean == undefined ) && user[type] ){
		photohelper_change.innerText = "변경";
		var photohelper_remove = $("div");
		photohelper_remove.onclick = removeImage;
		photohelper_remove.className = "photohelper_div";
		photohelper_remove.innerText = "삭제";
		photohelper_menu.appendChild(photohelper_remove);
	} else {
		photohelper_change.innerText = "추가";
	}

	photohelper.appendChild(photohelper_menu);
	
	return photohelper;
}

function backgroundMouseWheel( evt, img ){
	var type = evt.target.id.split('img')[0];
	if( type == "header"){
		headerLabelScale -= 0.001 * evt.deltaY;
		if( headerLabelScale < 1 ){
			headerLabelScale = 1;
		} else if( headerLabelScale > 2 ){
			headerLabelScale = 2;
		}
		changeLabelSize("header");
		backgroundMouseMove( evt, img, true );
	} else if( type == "profile" ){
		profileLabelScale -= 0.001 * evt.deltaY;
		if( profileLabelScale < 1 ){
			profileLabelScale = 1;
		} else if( profileLabelScale > 2 ){
			profileLabelScale = 2;
		}
		changeLabelSize("profile");
		backgroundMouseMove( evt, img, true );
	}
	evt.preventDefault();
}

function backgroundMouseMove( evt, img, update ){
	if( evt.button || evt.buttons || update ){
		var label = evt.target;
		var type = label.id.split('img')[0];
		var scale;
		if( type == "profile" ){
			scale = profileLabelScale;
		} else if ( type == "header" ){
			scale = headerLabelScale;
		}

		var x = parseInt(label.style.backgroundPositionX.replace("px",""));
		var y = parseInt(label.style.backgroundPositionY.replace("px",""));
		if( update == undefined || update == false ){
			x += evt.movementX * 2;
			y += evt.movementY * 2;
			if( label.id == "profileimg_label" ){
				x += evt.movementX;
				y += evt.movementY;
			}
		}
					
		var imgWidth = img.width * scale;
		var imgHeight = img.height * scale;

		var direction;
		if( img.width < label.clientWidth || img.height < label.clientHeight ){
			direction = (img.width/label.clientWidth < img.height/label.clientHeight)?"width":"height";
		}
	
		if( x >= 0 ){
			x = 0;
		} else if( direction == undefined && imgWidth >= label.clientWidth && x < - label.clientWidth - imgWidth ){
			x = - label.clientWidth - imgWidth;
		} else if( direction == "height" && x < label.clientWidth - label.clientHeight/img.height * imgWidth ){
			x = label.clientWidth - label.clientHeight/img.height * imgWidth;
		} else if( direction == "width" && x < label.clientWidth - label.clientWidth * scale ){
			x = label.clientWidth - label.clientWidth * scale;
		} else if( direction == undefined && x < label.clientWidth - imgWidth ){
			x = label.clientWidth - imgWidth;
		}

		if( y >= 0 ){
			y = 0;
		} else if( direction == undefined && imgHeight >= label.clientHeight && y < - label.clientHeight - imgHeight ){
			y = - label.clientHeight - imgHeight;
		} else if( direction == "width" && y < label.clientHeight - label.clientWidth/img.width * imgHeight ){
			y = label.clientHeight - label.clientWidth/img.width * imgHeight;
		} else if( direction == "height" && y < label.clientHeight - label.clientHeight * scale){
			y = label.clientHeight - imgHeight * scale;
		} else if( direction == undefined && y < label.clientHeight - imgHeight ){
			y = label.clientHeight - imgHeight;
		}

		label.style.backgroundPositionX = x + "px";
		label.style.backgroundPositionY = y + "px";
	}
}

function showLabelMenu( evt ){
	hideLabelMenu();
	this.firstElementChild.firstElementChild.style.display = "block";
	evt.cancelBubble = true;
	evt.stopPropagation();
}

function hideLabelMenu(){
	var arr = $('.photohelper_menu');
	for( var i = 0; i < arr.length; ++i ){
		arr[i].style.display = "";
	}
}

function removeImage( evt ){
 	var type = this.parentNode.parentNode.parentNode.id.split('_')[0].replace("img","");
	var back = $('#' + type + 'img_back');
	if( type == "header" ){
		headerimg_back.style.backgroundColor = user.color.hex;
		headerimg_back.style.backgroundImage = "";
	} else if( type =="profile" ){
		back.style.backgroundImage = 'url("/svg/profile.svg")';
	}
	this.parentNode.style.display = "none";
	evt.stopPropagation();

	var label = $('#' + type + 'img_label');
	label.removeChild(label.firstChild);
	label.appendChild(makePhotoHelper(type,false));
}

function openUserTab( evt ){
	var tab;
	var tab_name;
	var history_str = "/@" + user.uid;
	if( evt ){
		tab = this;
		tab_name = this.id.split("_").pop();
	} else {
		tab_name = document.URL.split("/").pop().split('#')[0];
		tab = $('#profile_tab_' + tab_name);
	}
	if( tab_name == "post" || tab_name[0] == "@" ){
		tab = $('#profile_tab_post');
		tab_name = "";
	} else {
		history_str += '/' + tab_name;
	}
	skip = 0;
	posts = 0;
	var tabs = $('#user_tab').childNodes;
	for( var i = 0; i < tabs.length; ++i ){
		var t = tabs[i];
		t.className = "";
		t.style.color = "";
		t.style.height = "";
		t.style.borderBottom = "";
	}
	tab.className = "user_tab_now";
	$('#post_wrap').innerHTML = "";
	$('#post_wrap').style.display = "none";
	$('#follow_wrap').innerHTML = "";
	$('#follow_wrap').style.display = "none";
	$('#wrap_right').style.display = "";
	switch(tab_name){
		case "following":
			getFollows(6,"following");
			break;
		case "follower":
			getFollows(6,"follower");
			break;
		case "follower_together":
			tab = $('#profile_tab_follower');
			getFollows(6,"follower",true);
			break;
		case "favorite":
			postOption.favorite = "true";
			getPosts(10);
			break;
		default:
			postOption.favorite = "false";
			getPosts(10);
	}
	history.pushState(null,null,history_str);
	
}

function getFollows(limit,type,together){
	$('#wrap_right').style.display = "none";
	var wrap = $('#follow_wrap');
	wrap.style.display = "";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		if( xhr.responseText != "[]" ){
			var users = JSON.parse(xhr.responseText);
			for( var i = 0; i < users.length; ++i ){
				wrap.appendChild( makeUserCard( users[i],true ) );
			}
		} else {
			var none = $('div');
			none.id = "follow_wrap_none";
//			if( type == "following" ){
				none.innerText = "팔로우 중인 유저가 없습니다.";
//			} else {
//			}
			wrap.appendChild(none);
		}
	}}
	if( together == true ){
		xhr.open("POST","/api/user/recommend", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		var limit = 6;
		xhr.send('uid='+user.id+'&limit='+limit);
	} else {
		xhr.open("POST","/@" + user.uid + '/' + type, false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send();
	}
}
