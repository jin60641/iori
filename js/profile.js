'use strict';

inits["profile"] = {
	profileLabelScale : 1,
	headerLabelScale : 1,
	listeners : [],
	getUser : function(){
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
		}}
		xhr.open("POST","/api/user/removeimg", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('imgtype='+type);
	},
	init : function(){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			if( xhr.responseText.length >= 1 ){
				that.start(JSON.parse(xhr.responseText));
			} else {
				that.start([]);
			}
		}}
		xhr.open("POST",location.pathname.split('/').slice(0,2).join('/'), false);  xhr.send();
	},
	start : function(user){
		let that = this;
		if( user ){
			that.user = user;
		}
		inits["timeline"].postOption.uid = that.user.id;
		this.addListener(window,"click", this.hideLabelMenu);
		let wrap = $("div");
		wrap.id = "profile_wrap";
		$('#wrap_top').appendChild(wrap);
	
		let container = $("div");
		container.id = "profile_container";
		wrap.appendChild(container);
	
	
		let headerimg_form = $("form");
		headerimg_form.id = "headerimg_form";
		
		let headerimg_back = $("div");
		headerimg_back.id = "headerimg_back";
		if( that.user.header ){
			headerimg_back.style.cursor = "pointer";
			headerimg_back.style.backgroundImage = "url('/files/header/" + that.user.id + "?')";
			//headerimg_back.style.backgroundImage = "url('/files/header/" + that.user.id + "?" + new Date().getTime() + "')";
			headerimg_back.onclick = function(){
				inits["imglayer"].viewimg(0,1,new Date(),"/files/header/" + that.user.id);
			}
			container.style.height = "45vh";
			wrap.style.height = "45vh";
		} else {
			console.log(that.user);
			headerimg_back.style.backgroundColor = that.user.color.hex;
		}
		headerimg_form.appendChild(headerimg_back);
	
		let headerimg_file = $("input");
		headerimg_file.type = "file";
		headerimg_file.accept = "image/*";
		headerimg_file.id = "headerimg_file";
		headerimg_file.name = "headerimg_file";
		headerimg_file.style.display = "none";
		headerimg_form.appendChild(headerimg_file);
	
		let profileimg_form = $("form");
		profileimg_form.id = "profileimg_form";
	
		let profileimg_back = $("div");
		profileimg_back.id = "profileimg_back";
		if( that.user.profile ){
			profileimg_back.style.cursor = "pointer";
			profileimg_back.onclick = function( event ){
				inits["imglayer"].viewimg(0,1,new Date(),"/files/profile/" + that.user.id);
			}
		} else {
			profileimg_back.style.backgroundColor = "white";
		}
		profileimg_back.style.backgroundImage = "url('/files/profile/" + that.user.id + "')";
		profileimg_form.appendChild(profileimg_back);
	
		let profileimg_file = $("input");
		profileimg_file.type = "file";
		profileimg_file.accept = "image/*";
		profileimg_file.id = "profileimg_file";
		profileimg_file.name = "profileimg_file";
		profileimg_file.style.display = "none";
		profileimg_form.appendChild(profileimg_file);
	
		profileimg_file.onchange = headerimg_file.onchange = function(event){
			let input = event.target
			let reader = new FileReader();
			reader.addEventListener("load",function(event){
				let dataURL = event.target.result;
				let label = $('#'+input.id.split('_')[0]+"_label");
				let img = new Image();
				img.src = dataURL;
				label.style.backgroundImage = "url('" + dataURL + "')";
				label.style.backgroundPositionX = "0px";
				label.style.backgroundPositionY = "0px";
				label.style.cursor = "move";
				label.onclick = function( evt ){
					evt.preventDefault();
				}
				that.resizeContainer();
				label.onmousewheel = function( evt ){
					that.backgroundMouseWheel( evt, img ); 
				}
				label.onmousemove = function( evt ){
					that.backgroundMouseMove( evt, img );
				}
				label.innerHTML = "";
			});
			reader.readAsDataURL(input.files[0]);
		}
	
	
		container.appendChild(headerimg_form);
		container.appendChild(profileimg_form);
	
		if( that.user.id == session.id ){
			let user_setting = that.makeUserButton("setting","프로필 수정");
			user_setting.onclick = function(e){
				that.settingStart(this);
			}
			container.appendChild(user_setting);
		} else {
			let user_follow = that.makeUserButton("follow");
			if( that.user.following ){
				user_follow.innerText = "언팔로우"
			} else {
				user_follow.innerText = "팔로우"
			}
			user_follow.onclick = function(){
				if( session.id ){
					followUser( that.user.id, function( result ){
						that.user.following = !that.user.following;
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
	
			let user_chat = that.makeUserButton("message");
			user_chat.onclick = function(){
				location.href = "/chat/#u?" + that.user.uid;
			}
			user_chat.innerText = "쪽지";
			container.appendChild(user_chat);
		}
	
		let user_name = $("div");
		user_name.id = "user_name";
		user_name.innerHTML = that.user.name;
		container.appendChild(user_name);
	
		let user_userid = $("div");
		user_userid.id = "user_userid";
		user_userid.innerHTML = "@" + that.user.uid;
		container.appendChild(user_userid);
	
		let user_tab = $("div");
	
		let tab_arr = [
			{ name : "게시글", id : "post" },
			{ name : "팔로잉", id : "following" },
			{ name : "팔로워", id : "follower" },
			{ name : "관심글", id : "favorite" }
		];
		for( let i = 0; i < tab_arr.length; ++i ){
			let tab = $("div");
			tab.className = "profile_tab";
			tab.id = "profile_tab_"+tab_arr[i].id;
			tab.innerText = tab_arr[i].name;
			tab.onclick = function(e){
				that.openUserTab(e,this);
			}
			user_tab.appendChild(tab);
		}
		
		user_tab.id = "user_tab";
		
		if($('#post_wrap')){
			$('#wrap_mid').insertBefore(user_tab,$('#post_wrap'));
		} else {
			$('#wrap_mid').appendChild(user_tab);
		}
	
		this.addListener(window,'scroll', function(){
			that.resizeContainer();
		});
		this.addListener(window,'resize', function(){
			that.resizeContainer();
		});
		that.resizeContainer();
		
		let follow_wrap = $('div');
		follow_wrap.id = "follow_wrap";
		$('#wrap_mid').appendChild(follow_wrap);
	
		that.openUserTab();
	},
	resizeContainer : function(){
		/*
		// for absolute
		if( document.body.scrollTop <= $('#wrap_mid').clientHeight + 42 - 130 ){
			container.style.top = "42px";
		} else {
			container.style.top = document.body.scrollTop + 42 - $('#wrap_mid').clientHeight + 80 + "px";
		}
		*/

		let size = 170;
		let form = $('#profileimg_form');
		let header_size = 42;
		let border_size = -20;
		let top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		if( $("#headerimg_label") ){ // profile changing now!
			$('#profile_container').style.top = header_size + "px";
		} else {
			let max_scroll = 200;
			let save_size = parseInt(window.innerHeight/6);
			let wrap = $('#profile_wrap');
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
		this.changeLabelSize("profile");
		this.changeLabelSize("header");
		
		let bottom = size/2 + border_size;
		let left = document.body.clientWidth/100*12 - size;
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
	},
	changeLabelSize : function(type){
		let label = $('#' + type + "img_label");
		if( label == null ){
			return;
		}
	
		let scale;
		if( type == "profile" ){
			scale = this.profileLabelScale;
		} else if ( type == "header" ){
			scale = this.headerLabelScale;
		}
	
		let img = new Image();
		img.src = label.style.backgroundImage.replace(/url\(|\)$|"/ig, '');
	
		let direction;
		let multi;
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
	},
	makeUserButton : function( id, text ){
		let div = $("div");
		div.id = "user_" + id;
		div.className = "user_button";
		div.innerText = text;
		return div;
	},
	settingSave : function(){
		let flag = false;
		let that = this;
		if( $('#headerimg_file').value != "" ){
			this.sendProfileImage( "header" );
			flag = true;
		} else if( $('#headerimg_back').style.backgroundImage == "" && that.user.header ){
			this.sendProfileImage( "header", false );
			flag = true;
		} else {
			$('#headerimg_form').removeChild($('#headerimg_label'));
		}

		if( $('#profileimg_file').value != "" ){
			this.sendProfileImage( "profile" );
			flag = true;
		} else if( $('#profileimg_back').style.backgroundImage == 'url("/svg/profile.svg")' && that.user.profile ){
			this.sendProfileImage( "profile", false );
			flag = true;
		} else {
			$('#profileimg_form').removeChild($('#profileimg_label'));
		}
	
		if( flag == false ){
			this.settingCancel();
		}
	},
	sendProfileImage : function( type, boolean ){
		let that = this;
		let xhr = new XMLHttpRequest();
		let label = $('#'+type+"img_label");
		if( that.user[type] && boolean == false ){
			xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
				session[type] = false;
				that.user[type] = false;
				if( type == 'header' ){
					$('#headerimg_back').style.backgroundImage = "";
				} else {
					$('#profileimg_back').style.backgroundImage = 'url("/svg/profile.svg")';
				}
				$('#'+type+'img_form').removeChild($('#'+type+'img_label'));
				taht.settingCancel(true);
			}}
			xhr.open("POST","/api/user/removeimg", false); 
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send('imgtype='+type);
		} else {
			let file = $('#'+type+"img_file").files[0];
	
			let img = new Image();
			img.src = label.style.backgroundImage.replace(/url\(|\)$|"/ig, '');
		
			let formdata = new FormData();
			
			let x = -parseInt( label.style.backgroundPositionX.replace("px","") ) ;
			let y = -parseInt( label.style.backgroundPositionY.replace("px","") ) ;
			if( label.style.backgroundSize.split(' ')[1] == undefined ){
				alert("적절하지 않은 파일 형식입니다");
				return;
			}
			let w = parseInt( label.style.backgroundSize.split(' ')[0].replace("px","") ) / img.width;
			let h = parseInt( label.style.backgroundSize.split(' ')[1].replace("px","") ) / img.height;
		
		
			formdata.append( "x", x / w );
			formdata.append( "y", y / h );
			formdata.append( "width", label.clientWidth / w );
			formdata.append( "height", label.clientHeight / h );
			formdata.append( "file", file );
		
			xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
				session[type] = true;
				that.user[type] = true;
				$('#'+type+"img_back").style.backgroundImage = "url('/files/" + type + "/" + that.user.id + "?" + new Date().getTime() + "')";
				$('#'+type+"img_form").reset();
				$('#'+type+'img_form').removeChild($('#'+type+'img_label'));
				that.settingCancel(true);
			}}
			xhr.open("POST","/api/user/" + type + "img", false); xhr.send(formdata);
		}
	},
	settingCancel : function(boolean){
		if( $('#user_setting_cancel') ){
			$('#profile_container').removeChild($('#user_setting_cancel'));
		}

		if( $('#user_setting_save') ){
			$('#profile_container').removeChild($('#user_setting_save'));
		}
		if( !that.user.header ){
			$('#profile_container').style.height = "";
			$('#profile_wrap').style.height = "";
		}
		$('#user_setting').style.display = "";
		if( boolean == true ){
			return ;
		}
		if( that.user.header ){
			$('#headerimg_back').style.backgroundImage = "url('/files/header/" + that.user.id + "?" + new Date().getTime() + "')";
		}
		if( that.user.profile ){
			$('#profileimg_back').style.backgroundImage = "url('/files/profile/" + that.user.id + "?" + new Date().getTime() + "')";
		}
		let headerimg_form = $('#headerimg_form');
		let profileimg_form = $('#profileimg_form');
		headerimg_form.reset();
		profileimg_form.reset();
		if( $('#headerimg_label') ){
			headerimg_form.removeChild($('#headerimg_label'));
		}
		if( $('#profileimg_label') ){
			profileimg_form.removeChild($('#profileimg_label'));
		}
	},
	settingStart : function(target){
		this.profileLabelScale = 1;
		this.headerLabelScale = 1;
		target.style.display = "none";
		let wrap = $('#profile_wrap');
		let container = $('#profile_container');
		container.style.height = "45vh";
		wrap.style.height = "45vh";
		
		let headerimg_label = $("label")
		headerimg_label.id = "headerimg_label";
		let that = this;
		headerimg_label.onclick = function(e){
			that.showLabelMenu(e,this);
		}
		$('#headerimg_form').insertBefore(headerimg_label,headerimg_form.firstChild);
	
		let profileimg_label = $("label")
		profileimg_label.id = "profileimg_label";
		profileimg_label.onclick = function(e){
			that.showLabelMenu(e,this);
		}
		$('#profileimg_form').insertBefore(profileimg_label,profileimg_form.firstChild);
		headerimg_label.appendChild(this.makePhotoHelper("header"));
		profileimg_label.appendChild(this.makePhotoHelper("profile"));
	
		let user_setting_save = this.makeUserButton("setting_save","저장");
		user_setting_save.onclick = function(){
			that.settingSave();
		}
		container.insertBefore(user_setting_save,target);
	
		let user_setting_cancel = this.makeUserButton("setting_cancel","취소");
		user_setting_cancel.onclick = function(){
			that.settingCancel();
		}
		container.insertBefore(user_setting_cancel,target);
			
		headerimg_label.style.display = "block";
		profileimg_label.style.display = "block";
		this.resizeContainer();
	},
	makePhotoHelper : function( type, boolean ){
		let photohelper = $("div");
		photohelper.className = "photohelper";
	
		let photohelper_menu = $("div");
		photohelper_menu.innerHTML = "<div class='dropdown_caret'><div class='caret_outer'></div><div class='caret_inner'></div></div>";
		photohelper_menu.className = "photohelper_menu";
		let photohelper_change = $("div");
		let that = this;
		photohelper_change.onclick = function( evt ){
			that.hideLabelMenu();
			$('#' + this.parentNode.parentNode.parentNode.id.replace("label","file") ).click();
		}
		photohelper_change.className = "photohelper_div";
		photohelper_menu.appendChild(photohelper_change);
	
		
		if( boolean == true || ( boolean == undefined && that.user[type] == true ) ) {
		//if( ( boolean == true || boolean == undefined ) && that.user[type] ){
			photohelper_change.innerText = "변경";
			let photohelper_remove = $("div");
			photohelper_remove.onclick = this.removeImage;
			photohelper_remove.className = "photohelper_div";
			photohelper_remove.innerText = "삭제";
			photohelper_menu.appendChild(photohelper_remove);
		} else {
			photohelper_change.innerText = "추가";
		}
	
		photohelper.appendChild(photohelper_menu);
		
		return photohelper;
	},
	backgroundMouseWheel : function( evt, img ){
		let that = this;
		let type = evt.target.id.split('img')[0];
		if( type == "header"){
			headerLabelScale -= 0.001 * evt.deltaY;
			if( headerLabelScale < 1 ){
				headerLabelScale = 1;
			} else if( headerLabelScale > 2 ){
				headerLabelScale = 2;
			}
			changeLabelSize("header");
			that.backgroundMouseMove( evt, img, true );
		} else if( type == "profile" ){
			profileLabelScale -= 0.001 * evt.deltaY;
			if( profileLabelScale < 1 ){
				profileLabelScale = 1;
			} else if( profileLabelScale > 2 ){
				profileLabelScale = 2;
			}
			that.changeLabelSize("profile");
			backgroundMouseMove( evt, img, true );
		}
		evt.preventDefault();
	},
	backgroundMouseMove : function( evt, img, update ){
		if( evt.button || evt.buttons || update ){
			let label = evt.target;
			let type = label.id.split('img')[0];
			let scale;
			if( type == "profile" ){
				scale = this.profileLabelScale;
			} else if ( type == "header" ){
				scale = this.headerLabelScale;
			}
	
			let x = parseInt(label.style.backgroundPositionX.replace("px",""));
			let y = parseInt(label.style.backgroundPositionY.replace("px",""));
			if( update == undefined || update == false ){
				x += evt.movementX * 2;
				y += evt.movementY * 2;
				if( label.id == "profileimg_label" ){
					x += evt.movementX;
					y += evt.movementY;
				}
			}
						
			let imgWidth = img.width * scale;
			let imgHeight = img.height * scale;
	
			let direction;
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
	},
	showLabelMenu : function( evt,target ){
		this.hideLabelMenu();
		target.firstElementChild.firstElementChild.style.display = "block";
		evt.cancelBubble = true;
		evt.stopPropagation();
	},
	hideLabelMenu : function(){
		let arr = $('.photohelper_menu');
		for( let i = 0; i < arr.length; ++i ){
			arr[i].style.display = "";
		}
	}, 
	removeImage : function( evt ){
	 	let type = this.parentNode.parentNode.parentNode.id.split('_')[0].replace("img","");
		let back = $('#' + type + 'img_back');
		if( type == "header" ){
			headerimg_back.style.backgroundColor = that.user.color.hex;
			headerimg_back.style.backgroundImage = "";
		} else if( type =="profile" ){
			back.style.backgroundImage = 'url("/svg/profile.svg")';
		}
		this.parentNode.style.display = "none";
		evt.stopPropagation();
	
		let label = $('#' + type + 'img_label');
		label.removeChild(label.firstChild);
		label.appendChild(makePhotoHelper(type,false));
	},
	openUserTab : function( evt, target ){
		let that = this;
		let tab;
		let tab_name;
		let history_str = "/@" + that.user.uid;
		if( evt ){
			tab = target;
			tab_name = target.id.split("_").pop();
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
		/*
			if( skip ){
				skip = 0;
			}
			posts = 0;
		*/
		let tabs = $('#user_tab').childNodes;
		for( let i = 0; i < tabs.length; ++i ){
			let t = tabs[i];
			t.className = "";
			t.style.color = "";
			t.style.height = "";
			t.style.borderBottom = "";
		}
		tab.className = "user_tab_now";
		if( $('#post_wrap') ){
			$('#post_wrap').innerHTML = "";
			$('#post_wrap').style.display = "none";
		}
		$('#follow_wrap').innerHTML = "";
		$('#follow_wrap').style.display = "none";
		$('#wrap_right').style.display = "";
		inits["timeline"].post_skip = 0;
		inits["timeline"].post_cnt = 0;
		switch(tab_name){
			case "following":
				that.getFollows(6,"following");
				break;
			case "follower":
				that.getFollows(6,"follower");
				break;
			case "follower_together":
				tab = $('#profile_tab_follower');
				that.getFollows(6,"follower",true);
				break;
			case "favorite":
				inits["timeline"].postOption.favorite = "true";
				inits["timeline"].getPosts(10);
				break;
			default:
				inits["timeline"].postOption.favorite = "false";
				inits["timeline"].getPosts(10);
		}
		history.pushState(null,null,history_str);
	},
	getFollows : function(limit,type,together){
		$('#wrap_right').style.display = "none";
		let wrap = $('#follow_wrap');
		let that = this;
		wrap.style.display = "";
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if (xhr.readyState == 4 && xhr.status == 200){
			if( xhr.responseText != "[]" ){
				let users = JSON.parse(xhr.responseText);
				for( let i = 0; i < users.length; ++i ){
					wrap.appendChild( makeUserCard( users[i],true ) );
				}
			} else {
				let none = $('div');
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
			let limit = 6;
			xhr.send('uid='+that.user.id+'&limit='+limit);
		} else {
			xhr.open("POST","/@" + that.user.uid + '/' + type, false); 
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send();
		}
	},
	addListener : function( element, event, handle ){
		element.addEventListener( event, handle, false );
		this.listeners.push({ element : element, event : event, handle : handle });
	},
	exit : function(){
		let that = this;
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = that.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		if( inits["timeline"].postOption ){
			delete inits["timeline"].postOption.uid;
			delete inits["timeline"].postOption.favorite;
		}
		$('#wrap_right').style.display = "";
		$('#wrap_top').removeChild( $('#profile_wrap') );
		$('#wrap_mid').removeChild( $('#follow_wrap') );
	}
}
