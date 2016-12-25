window.addEventListener('load', function(){
	var chat_wrap = document.createElement("div");
	chat_wrap.id = "chat_wrap";

	var chat_header = document.createElement("div");
	chat_header.id = "chat_header";


	var chat_menu = document.createElement("div");
	chat_menu.id = "chat_menu";
	chat_menu.innerText = "새 메시지";
	chat_header.appendChild(chat_menu);

	var chat_title = document.createElement("div");
	chat_title.id = "chat_title";
	chat_header.appendChild(chat_title);

	chat_wrap.appendChild(chat_header);

	var chat_dialog = document.createElement("div");
	chat_dialog.id = "chat_dialog";
	chat_wrap.appendChild(chat_dialog);
	
	var chat_dialog_search = document.createElement("div");
	chat_dialog_search.id = "chat_dialog_search";
	chat_dialog_search.className = "chat_dialogs";
	
	var chat_dialog_search_input = document.createElement("input");
	chat_dialog_search_input.id = "chat_dialog_search_input";
	chat_dialog_search_input.type = "text";
	chat_dialog_search_input.placeholder = "검색";
	chat_dialog_search.appendChild(chat_dialog_search_input);

	chat_dialog.appendChild(chat_dialog_search);

	var chat_dialog_box = document.createElement("div");
	chat_dialog_box.id = "chat_dialog_box";
	chat_dialog.appendChild(chat_dialog_box);

	var dialogs_keys = Object.keys(dialogs);

	for( var index = 0; index < dialogs_keys.length; ++index ){
		var i = dialogs_keys[index];
		chat_dialog_box.appendChild(makeDialog(dialogs[i]));
	}

// 더미데이터생성
	for(var i = 0; i < 50; i++ ){	
	var dialog = document.createElement("div");
	dialog.className = "chat_dialogs";
	
	var time = document.createElement("div");
	time.className = "chat_dialogs_time";
	time.innerText = "Wed";
	dialog.appendChild(time);
	
	var img = document.createElement("img");
	img.src = "/files/profile/@jinsang_rungE";
	dialog.appendChild(img);
	var dialog_message_wrap = document.createElement("div");
	dialog_message_wrap.innerHTML = "더미계정<br>더미텍스트";
	dialog_message_wrap.className = "chat_dialogs_message_wrap"
	
	dialog.appendChild(dialog_message_wrap);

	chat_dialog_box.appendChild(dialog);
	}
/////////////


	var chat_box = document.createElement("div");
	chat_box.id = "chat_box";
	chat_wrap.appendChild(chat_box);

	var chat_panel = document.createElement("div");
	chat_panel.id = "chat_panel";
	chat_panel.addEventListener('scroll', function(e){
		if( chat_panel.scrollTop <= 200 ){
			getChats(10);
		}
	});

	chat_box.appendChild(chat_panel);

	var send_panel = document.createElement("div");
	send_panel.id = "send_panel";

	var chat_input = document.createElement("textarea");
	chat_input.placeholder = "메세지를 입력하세요";
	chat_input.id = "chat_input";
	send_panel.appendChild(chat_input);

	chat_input.onkeypress = inputResize;
	chat_input.onkeyup = inputResize;
	chat_input.onkeydown = captureKey;


	var chat_file_input = document.createElement("input");
	chat_file_input.type = "file";
	chat_file_input.id = "chat_file_input";
	chat_file_input.accept = "image/*";
	chat_file_input.multiple = "multiple";
	chat_file_input.onchange = chatWrite;

	send_panel.appendChild(chat_file_input);

	var chat_file_label = document.createElement("label");
	chat_file_label.id = "chat_file_label";
	chat_file_label.htmlFor = "chat_file_input";
	send_panel.appendChild(chat_file_label);

	var send_btn = document.createElement("div");
	send_btn.innerText = "보내기";
	send_btn.id = "send_btn";
	send_btn.onclick = chatWrite;
	send_panel.appendChild(send_btn);

	chat_box.appendChild(send_panel);
	


	var default_dialog = document.createElement("div");
	default_dialog.id = "default_dialog";
	default_dialog.innerText = "채팅을 선택해주세요";
	chat_box.appendChild(default_dialog);
	
	document.body.appendChild(chat_wrap);	

	if( location.hash.length > 0 ){
		openDialog();
	}
	
	socket.on('chat_new', function( data ){
		getChats( 0, data.type, data.dialog_id, true );
	});
});

var skip_obj = {};
function getChats( limit, type, dialog_id, scroll ){
	var params = { limit : limit }

	if( type ){
		params.type = type;
	} else {
		params.type = location.hash.substr(1,1);
	}

	if( dialog_id ){
		params.dialog_id = dialog_id;
	} else {
		params.dialog_id = location.hash.split('?')[1];
	}

	if( limit == 0 ){
		params.limit = 1;
		params.skip = 0;
	} else {
		if( skip_obj[params.dialog_id] == undefined ){
			skip_obj[params.dialog_id] = 0;
		}
		params.skip = skip_obj[params.dialog_id];
		skip_obj[params.dialog_id] += params.limit;
	}

	var query = "";
	var param_key = Object.keys(params);
	for( var i = 0; i < param_key.length; ++i ){
		query += param_key[i] + '=' + params[param_key[i]] + "&";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var chats;
		try {
			chats = JSON.parse(xhr.responseText);
		} catch(e){
			if( xhr.responseText.length < 20 ){
				alert(xhr.responseText);
			}
			location.href = "/chat";
		}
		var chat_panel = document.getElementById("chat_panel");
		skip_obj[params.dialog_id] += ( chats.length - params.limit );
		var chat_dialog_box = document.getElementById("chat_dialog_box");
		for( var i = chats.length - 1; i >= 0; --i ){
			var chat = document.createElement("div");
			chat.id = "chat_" + chats[i].id;
			chat.className = "chat";
		
			var chat_profileimg = document.createElement("img");
			chat_profileimg.src = "/files/profile/" + chats[i].from.uid;
			chat_profileimg.className = "chat_profileimg";
			chat.appendChild(chat_profileimg);
			
			var chat_body = document.createElement("div");
			chat_body.className = "chat_body";

			var chat_body_name = document.createElement("div");
			chat_body_name.className = "chat_body_name";
			chat_body_name.innerText = chats[i].from.name
			chat_body.appendChild(chat_body_name);

			if( chats[i].text ){
				chat_body.innerHTML += "<div class='chat_body_caret'><div class='outer'></div><div class='inner'></div></div>";
				var chat_body_text = document.createElement("div");
				chat_body_text.className = "chat_body_text";
				chat_body_text.innerText = chats[i].text;
				chat_body.appendChild(chat_body_text);
			} else if ( chats[i].file ){
				for( var j = 1; j <= chats[i].file; ++j ){
					var chat_body_file = document.createElement("img");
					chat_body_file.className = "chat_body_file";
					chat_body_file.src = "/files/chat/" + chats[i].id + "/" + j;
					if( scroll ){
						chat_body_file.onload = function(){
							chat_panel.scrollTop = chat_panel.scrollHeight;
						}
					}
					chat_body.appendChild(chat_body_file);
				}
			}

			chat.appendChild(chat_body);

			if( chats[i].from.id == session.id ){
				chat.className += " my_chat";
				chat.appendChild( chat_profileimg );
			}
/*
			var previous = chat.previousElementSibling
*/
			if( scroll ){
				var dialog;
				var className = "chat_dialogs";
				if( chats[i].type == "g" ){
					dialog = document.getElementById("chat_dialogs_" +  chats[i].type + "_" + chats[i].to.id);
				} else {
					if( chats[i].from.id == session.id ){
						dialog = document.getElementById("chat_dialogs_" +  chats[i].type + "_" + chats[i].to.uid);
					} else {
						dialog = document.getElementById("chat_dialogs_" +  chats[i].type + "_" + chats[i].from.uid);
					}
				}
			
				if( dialog ){
					className = dialog.className;
					chat_dialog_box.removeChild(dialog);
				}
	
				var new_dialog = makeDialog( chats[i] );
				new_dialog.className = className;
				if( chat_dialog_box.childElementCount == 1 ){
					chat_dialog_box.appendChild(new_dialog);
				} else {
					chat_dialog_box.insertBefore(new_dialog,chat_dialog_box.firstChild);
				}
				chat_panel.appendChild(chat);
			} else {
				chat_panel.insertBefore(chat,chat_panel.firstElementChild);
				chat_panel.scrollTop += chat.clientHeight
			}
		}
		if( scroll ){
			chat_panel.scrollTop = chat_panel.scrollHeight;
		}
	}};
	xhr.open("POST", "/api/chat/getchats", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
}

function makeDialog( chat ){
	var dialog = document.createElement("div");
	dialog.className = "chat_dialogs";

	var time = document.createElement("div");
	time.className = "chat_dialogs_time";
	time.innerText = getDateString(chat.date);
	dialog.appendChild(time);
	
	var img = document.createElement("img");
	dialog.appendChild(img);

	var dialog_message_wrap = document.createElement("div");
	dialog_message_wrap.className = "chat_dialogs_message_wrap"

	if( chat.type == "group" ){
		dialog.id = "chat_dialogs_g_" + chat.to.id;
		img.src = "/groupimg/" + chat.to.id;
//		dialog_message_wrap.innerHTML = "<div>" + dialog.group_name + "</div>";
		if( chat.from.id == session.id ){
			dialog_message_wrap.innerHTML += "<span>나:</span> ";
		} else {
			dialog_message_wrap.innerHTML += "<span>" + chat.from.name + ":</span> ";
		}
	} else if( chat.to.id != session.id ){ 									// 내가 -> 남에게
		dialog.id = "chat_dialogs_u_" + chat.to.uid;
		img.src = "/files/profile/" + chat.to.uid;
		dialog_message_wrap.innerHTML = "<div>" + chat.to.name + "</div><span>나:</span> ";
	} else {													// 남이 -> 나에게
		dialog.id = "chat_dialogs_u_" + chat.from.uid;
		img.src = "/files/profile/" + chat.from.id;
		dialog_message_wrap.innerHTML = "<div>" + chat.from.name + "</div>";
	}

	dialog_message_wrap.innerHTML += chat.text;
	if( !(chat.text && chat.text.length > 0) ){
		dialog_message_wrap.innerHTML += "파일";
	}
	dialog.appendChild(dialog_message_wrap);

	dialog.onclick = openDialog;
	

	return dialog;
}

function openDialog(){
	
	var dialog = this;
	if( dialog && dialog.id == undefined ){
		dialog =  document.getElementById( "chat_dialogs_" + location.hash.substr(1,1) + "_" + location.hash.substr(3) );
	}
	if( dialog && dialog.className.indexOf("selected") >= 0 ){
		var chat_panel = document.getElementById("chat_panel");
		chat_panel.scrollTop = chat_panel.scrollHeight;
		return false;
	}
	var chat_input = document.getElementById("chat_input");
	var file_input = document.getElementById("chat_file_input");
	file_input.value = "";
	chat_input.value = "";

	var dialogs = document.getElementById("chat_dialog_box").childNodes;
	for( var i = 0; i < dialogs.length; ++i ){
		dialogs[i].className = "chat_dialogs"
	}
	if( dialog != undefined ){
		dialog.scrollIntoViewIfNeeded();
		dialog.className = "chat_dialogs chat_dialogs_selected";
		var type = dialog.id.split('_')[2];
		var dialog_id = dialog.id.split('_').slice(3).join('_')
		location.hash = "#" + type + "?" + dialog_id;
	}
	getChats(20,null,null,true);
	
	document.getElementById("default_dialog").style.display = "none";
	document.getElementById("send_panel").style.display = "block";

}

function getDateString(origin_date){
	var date = new Date(origin_date);
	var now = new Date();
	var date_time = Math.floor(date.getTime()/1000)
	var now_time = Math.floor(now.getTime()/1000)
	var gap = now_time - date_time;
	if( gap < 86400 ){
		return ((date.getHours()/12<1)?"오전":"오후") + " " + (date.getHours()%12) + ":" + date.getMinutes();

	} else if( date.getDate() != now.getDate() ){
		return date.getMonth()+'/'+date.getDate()+'/'+(date.getYear()-100);
	}
}


function inputResize(event){
	var obj = event.target;
	var chat_panel = document.getElementById("chat_panel");
	if( obj.scrollHeight > 33 ){
		if( obj.scrollHeight > 100 ){
			if( parseInt(obj.style.height.replace("px","")) >= obj.scrollHeight - 10 ){
			obj.style.height = "1px";
			obj.style.height = obj.scrollHeight+"px";
			chat_panel.style.height = "calc( 100% - " + ( obj.scrollHeight + 17 ) + "px )";
			}
			obj.style.overflowY = "visible";
		} else {
			obj.style.height = "1px";
			obj.style.height = obj.scrollHeight+"px";
			chat_panel.style.height = "calc( 100% - " + ( obj.scrollHeight + 17 ) + "px )";
			obj.style.overflowY = "hidden";
		}
	}
	if( obj.scrollHeight <= 33 ){
		obj.style.height = "23px";
		chat_panel.style.height = "";
	}
}

function openFile(event){
	event.stopPropagation();
	event.preventDefault();
/*
	if( event.dataTransfer ){
		event.dataTransfer.dropEffect = 'copy';
	}
*/
}

function captureKey(event){
	if( event.keyCode == 13 && !event.shiftKey){
		event.stopPropagation();
		event.preventDefault();
		chatWrite();
	}
	inputResize(event);
}

function chatWrite(){
	var chat_input = document.getElementById("chat_input");
	var file_input = document.getElementById("chat_file_input");
	var tmp = chat_input.value;
	var formdata = new FormData();
	if( file_input.files.length >= 1 || tmp.length >= 1 ){
		for( var i = 0; i < file_input.files.length; ++i ){
			formdata.append("file",file_input.files[i]);
		}
		formdata.append("text",tmp);
		formdata.append("type",location.hash.substr(1,1));
		formdata.append("to_id",location.hash.split('?')[1]);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			var to_id = parseInt(xhr.responseText);
			if( to_id != NaN ){
				getChats(0,null,null,true);
			}
		}}
		xhr.open("POST","/api/chat/writechat", false);  xhr.send(formdata);
		file_input.value = "";
		chat_input.value = "";
	} else {
		return 0;
	}
}


