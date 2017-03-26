var settings = {
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
			type : "checkbox"
		},{
			id : "reply",
			name : "답글",
			type : "checkbox"
		},{
			id : "follow",
			name : "팔로우",
			type : "checkbox"
		},{
			id : "chat",
			name : "채팅",
			type : "checkbox"
		},{
			id : "email",
			name : "이메일",
			type : "checkbox"
		},{
			id : "web",
			name : "웹알람",
			type : "checkbox"
		}],
		kr : "알림"
	}
}

window.addEventListener('load', function(){
	var wrap = $('div');
	wrap.id = "setting_wrap";

	var box = $('div');
	box.id = "setting_box";
	var title = $('div');
	title.id = "setting_title";
	box.appendChild(title);
	wrap.appendChild(box);
	$('#wrap2').appendChild(wrap);

	var tabs = $('div');
	tabs.id = "setting_tab";

	var keys = Object.keys(settings);
	for( var i = 0; i < keys.length; ++i ){
		tabs.appendChild(makeSettingTab(keys[i],settings[keys[i]].kr));
	}
	$('#wrap1').appendChild(tabs);
	
	var submit = $('div');
	submit.innerText = "저장";
	submit.id = "setting_submit";
	box.appendChild(submit);

	openSettingTab();
});

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
	var box = $("#setting_box");

	var fields = $(".setting_field");
	for( var i = fields.length - 1; i >= 0; --i ){
		box.removeChild(fields[i]);
	}

	var tabs = $("#setting_tab").childNodes;
	for( var i = 0; i < tabs.length; ++i ){
		tabs[i].className = "";
	}
	$("#setting_tab_"+page).className = "setting_tab_active";
	

	
	var title = $("#setting_title");
	var submit = $("#setting_submit");
	for( var i = 0; i < settings[page].tabs.length; ++i ){
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
	}
}

function checkNotice(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText == "success" ){
		}
	}};
	xhr.open("POST", "/api/user/change/notice", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	var query = "";
	var input = $(".setting_input");
	for( var i = 0; i < input; ++i ){
		query += input.name + '=' + input.value + '=' + input.checked + '&';
	}
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
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText == "success" ){
			alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
			sessionLogOut();
		} else if( xhr.responseText == "fail" ){
			$('#setting_text_oldpw').innerText = "비밀번호가 일치하지 않습니다.";
		} else {
			$('#setting_text_newpw').innerText = xhr.responseText;
		}
	}};
	xhr.open("POST", "/api/user/change/password", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	var query = "newpw=" + $('#setting_input_newpw').value;
	if( save == "true" ){
		query += "&oldpw=" + $('#setting_input_oldpw').value
	}
	xhr.send(query);
}

function checkChangeUid(save){
	$('#setting_text_uid').innerText = "iori.kr/@" + $('#setting_input_uid').value;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		$('#setting_info_uid').innerText = xhr.responseText;
	}};
	xhr.open("POST", "/api/user/change/uid", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	xhr.send('uid='+$('#setting_input_uid').value+'&save='+save);
}

function checkChangeEmail(save){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		$('#setting_info_email').innerText = xhr.responseText;
	}};
	xhr.open("POST", "/api/user/change/email", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	xhr.send('email='+$('#setting_input_email').value+'&save='+save);
}

function makeSettingTab( en, kr ){
	var tab = $('div');
	tab.id = "setting_tab_"+en;
	

	tab.innerText = kr;
	tab.onclick = function(){
		openSettingTab(en);
	}
	
	return tab;
}

function makeField( obj ){
	var field = $('div');
	field.className = "setting_field";

	var label = $('label');
	label.id = "setting_label_" + obj.id;
	label.htmlFor = "setting_input_" + obj.id;
	label.className = "setting_label";
	label.innerText = obj.name;
	field.appendChild(label);

	var div = $('div');
	div.id = "setting_div_" + obj.id;
	div.className = "setting_div";
	field.appendChild(div);

	var info = $('div');
	info.id = "setting_info_" + obj.id;
	info.className = "setting_text";
	div.appendChild(info);

	var input = $('input');
	input.name = obj.id;
	input.id = "setting_input_" + obj.id;
	input.type = obj.type;
	input.className = "setting_input";
	if( obj.value ){
		input.value = obj.value;
	}
	if( obj.placeholder ){
		input.placeholder = obj.placeholder;
	}
	div.appendChild(input);

	var text = $('div');
	text.id = "setting_text_" + obj.id;
	text.className = "setting_text";
	if( obj.text ){
		text.innerText = obj.text;
	}
	div.appendChild(text);

	return field;
}
