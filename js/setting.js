'use strict';
	
window.addEventListener('load', function(){
	let listeners = [];
	function addListener( element, event, handle ){
		element.addEventListener( event, handle, false );
		listeners.push({ element : element, event : event, handle : handle });
	}

	const settings = {
		account : {
			tabs : [{
				id : "uid",
				name : "아이디",
				text : "iori.kr/@" + session.uid,
				placeholder : "영문 대/소문자, 숫자, 밑줄(_)",
				value : session.uid
			},{
				id : "email",
				name : "이메일",
				text : "이메일은 공개적으로 표시되지 않습니다.",
				value : session.email
			}],
			kr : "계정"
		},
		password : {
			tabs : [{
				id : "oldpw",
				name : "현재 비밀번호",
				type : "password"
			},{
				id : "newpw",
				placeholder : "8~20자 영문 대/소문자, 숫자, 특수문자 혼용",
				name : "새 비밀번호",
				type : "password"
			},{
				id : "checkpw",
				name : "비밀번호 확인",
				type : "password"
			}],
			kr : "비밀번호"
		},
		notice : {
			tabs : [{
				id : "favorite",
				name : "관심글",
				type : "checkbox",
			},{
				id : "reply",
				name : "답글",
				type : "checkbox",
			},{
				id : "follow",
				name : "팔로우",
				type : "checkbox",
			},{
				id : "chat",
				name : "채팅",
				type : "checkbox"
			},{
				id : "share",
				name : "공유",
				type : "checkbox"
			},{
				id : "email",
				name : "이메일",
				type : "checkbox"
			},{
				id : "web",
				name : "웹알림",
				type : "checkbox",
				onclick : checkChangeWebNotify
			}],
			kr : "알림"
		},
		color : {
			tabs : [{
				id : "color",
				name : "색상 선택",
				type : "color",
				value : session.color.hex
			}],
			kr : "테마 색상"
		},
		drop : {
			tabs : [],
			kr : "회원 탈퇴"
		}
	}
	
	
	function settingResize(){
		if( $("#wrap_left").clientWidth == 0 ){
			$("#setting_wrap").insertBefore( $('#setting_tab'), $("#setting_wrap").firstElementChild );
		} else {
			$("#wrap_left").appendChild( $('#setting_tab') );
		}
	}
	
	
	function openSettingTab( newtab ){
		if( page == newtab ){
			return;
		}
		
		if( newtab != undefined ){
			page = newtab;
		}
	
	
		if( settings[page] == undefined ){
			page = "account";
		}
	
		if( document.URL.split('/').length < 5 ){
			history.pushState(null,null,"/setting/"+page);
		} else {
			history.pushState(null,null,page);
		}
		let box = $("#setting_box");
	
		let fields = $(".setting_field");
		for( let i = fields.length - 1; i >= 0; --i ){
			box.removeChild(fields[i]);
		}
	
		let tabs = $("#setting_tab").childNodes;
		for( let i = 0; i < tabs.length; ++i ){
			tabs[i].className = "";
		}
		$("#setting_tab_"+page).className = "setting_tab_active";
		
	
		let title = $("#setting_title");
		let submit = $("#setting_submit");
		submit.innerText = "저장";
		for( let i = 0; i < settings[page].tabs.length; ++i ){
			box.insertBefore(makeField(settings[page].tabs[i]),submit);
		}
		title.innerText = settings[page].kr;
		if( page == "account" ){
			$('#setting_input_uid').addEventListener('keyup', checkChangeUid );
			$('#setting_input_email').addEventListener( 'keyup', checkChangeEmail );
			submit.onclick = function(){
				checkChangeUid("true");
				checkChangeEmail("true");
			};
		} else if( page == "password" ){
			$('#setting_input_newpw').addEventListener( 'keyup', checkPassword );
			$('#setting_input_newpw').addEventListener( 'keyup', checkChangePassword );
			$('#setting_input_checkpw').addEventListener( 'keyup', checkPassword );
			submit.onclick = function(){
				checkChangePassword("true");
			};
		} else if( page == "notice" ){
			submit.onclick = checkChangeNotice;
		} else if( page == "color" ){
			submit.onclick = checkChangeColor;
		} else if( page == "drop" ){
			submit.innerText = "회원 탈퇴";
			submit.onclick = checkDropUser;
		}
	}
	
	function checkDropUser(){
		if( confirm("정말로 회원 탈퇴를 진행하시려면 확인을 눌러주세요") == true ){
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
				alert("회원탈퇴가 완료되었습니다.");
				let date = "Thu, 01 Jan 1970 00:00:01 GMT"
				document.cookie = "facebook=,uid=,email=,password=;expires=" + date + ";domain=iori.kr;path=/";
				location.href = "/";
			}};
			xhr.open("POST", "/api/user/drop", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
			xhr.send();
		}
	}
	
	function checkChangeColor(){
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			alert(xhr.responseText);
			location.reload();
		}};
		xhr.open("POST", "/api/user/change/color", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('color='+setting_input_color.value);
	}
	
	function checkChangeNotice(){
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			alert(xhr.responseText);
		}};
		xhr.open("POST", "/api/user/change/notice", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		let query = "";
		let input = $(".setting_input");
		for( let i = 0; i < input.length; ++i ){
			query += input[i].name + '=' + input[i].checked + '&';
		}
		console.log(query);
		xhr.send(query);
	}
	
	function checkPassword(){
		if( $('#setting_input_newpw').value != $('#setting_input_checkpw').value ){
			$('#setting_text_checkpw').innerText = "비밀번호가 일치하지 않습니다.";
			return false;
		} else {
			$('#setting_text_checkpw').innerText = "";
			return true;
		}
	}
	
	function checkChangePassword(save){
		if( save == "true" ){
			if( !checkPassword() ){
				alert("새 비밀번호 확인이 일치하지 않습니다.");
				return;
			}
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText == "success" ){
				alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
				sessionLogOut();
			} else if( xhr.responseText == "fail" ){
				$('#setting_text_oldpw').innerText = "비밀번호가 일치하지 않습니다.";
			} else if( $('#setting_input_newpw').value.length >= 1 ){
				$('#setting_text_newpw').innerText = xhr.responseText;
			}
		}};
		xhr.open("POST", "/api/user/change/password", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		let query = "newpw=" + $('#setting_input_newpw').value;
		if( save == "true" ){
			query += "&oldpw=" + $('#setting_input_oldpw').value
		}
		xhr.send(query);
	}
	
	function checkChangeUid(save){
		$('#setting_text_uid').innerText = "iori.kr/@" + $('#setting_input_uid').value;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText == "success" ){
				alert("아이디가 변경되었습니다. 다시 로그인해주세요.");
				sessionLogOut();
			}
			$('#setting_info_uid').innerText = xhr.responseText;
		}};
		xhr.open("POST", "/api/user/change/uid", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('uid='+$('#setting_input_uid').value+'&save='+save);
	}
	
	function checkChangeEmail(save){
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			$('#setting_info_email').innerText = xhr.responseText;
		}};
		xhr.open("POST", "/api/user/change/email", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('email='+$('#setting_input_email').value+'&save='+save);
	}
	
	
	function checkChangeWebNotify(){
		let tmp = this;
		if( this.checked == true ){
			if (!("Notification" in window)) {
				alert("이 브라우저는 웹 알림을 지원하지 않습니다.");
				this.checked = false;
			} else if (Notification.permission != 'granted') {
				Notification.requestPermission(function (permission) {
					if (permission == "denied") {
						alert("웹 알림을 허용하셔야 합니다.");	
						tmp.checked = false;
					}
				});
			}
		}
	}
	function makeSettingTab( en, kr ){
		let tab = $('div');
		tab.id = "setting_tab_"+en;
		
		tab.innerText = kr;
		tab.onclick = function(){
			openSettingTab(en);
		}
		
		return tab;
	}
	
	function makeField( obj ){
		let field = $('div');
		field.className = "setting_field";
	
		let label = $('label');
		label.id = "setting_label_" + obj.id;
		label.htmlFor = "setting_input_" + obj.id;
		label.className = "setting_label";
		label.innerText = obj.name;
		field.appendChild(label);
	
		let div = $('div');
		div.id = "setting_div_" + obj.id;
		div.className = "setting_div";
		field.appendChild(div);
	
		let info = $('div');
		info.id = "setting_info_" + obj.id;
		info.className = "setting_info";
		div.appendChild(info);
	
		let input = $('input');
		input.name = obj.id;
		input.id = "setting_input_" + obj.id;
		if( obj.type ){
			console.log(input);
			console.log(input.type);
			console.log(obj.type);
			input.type = obj.type;
			if( obj.type == "checkbox" ){
				input.checked = session.notice[obj.id];
			}
		}
		input.className = "setting_input";
		if( obj.value ){
			input.value = obj.value;
		}
		if( obj.placeholder ){
			input.placeholder = obj.placeholder;
		}
		div.appendChild(input);
	
		let text = $('div');
		text.id = "setting_text_" + obj.id;
		text.className = "setting_text";
		if( obj.text ){
			text.innerText = obj.text;
		}
		if( obj.onclick ){
			input.onclick = obj.onclick;
		}
		div.appendChild(text);
	
	
		return field;
	}

	let wrap = $('div');
	wrap.id = "setting_wrap";

	let box = $('div');
	box.id = "setting_box";
	let title = $('div');
	title.id = "setting_title";
	box.appendChild(title);
	wrap.appendChild(box);
	$('#wrap_mid').appendChild(wrap);

	let tabs = $('div');
	tabs.id = "setting_tab";

	let keys = Object.keys(settings);
	for( let i = 0; i < keys.length; ++i ){
		tabs.appendChild(makeSettingTab(keys[i],settings[keys[i]].kr));
	}
	$('#wrap_left').appendChild(tabs);
	
	let submit = $('div');
	submit.innerText = "저장";
	submit.id = "setting_submit";
	box.appendChild(submit);

	openSettingTab();
	addListener(window,'resize', settingResize );
	settingResize();
	

	return function(){
		for( let i = 0; i < listeners.length; ++i ){
			let h = listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
	}

});
