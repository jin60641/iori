window.addEventListener('load', function(){
	var chat_wrap = document.createElement("div");
	chat_wrap.id = "chat_wrap";

	var chat_header = document.createElement("div");
	chat_header.id = "chat_header";
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
		var dialog = document.createElement("div");
		dialog.className = "chat_dialogs";


		var time = document.createElement("div");
		time.className = "chat_dialogs_time";
		time.innerText = getDateString(dialogs[i].date);
		dialog.appendChild(time);
		
		var img = document.createElement("img");
		dialog.appendChild(img);

		var dialog_message_wrap = document.createElement("div");
		dialog_message_wrap.className = "chat_dialogs_message_wrap"

		if( dialogs[i].type == "group" ){
			dialog.id = "chat_dialogs_g_" + dialogs[i].to;
			img.src = "/groupimg/" + dialogs[i].to;
//			dialog_message_wrap.innerHTML = "<div>" + dialog.group_name + "</div>";
			if( dialogs[i].user.id == session.id ){
				dialog_message_wrap.innerHTML += "<span>나:</span> ";
			} else {
				dialog_message_wrap.innerHTML += "<span>" + dialogs[i].user_name + ":</span> ";
			}
		} else if( dialogs[i].user ){ 									// 내가 -> 남에게
			dialog.id = "chat_dialogs_u_" + dialogs[i].to;
			img.src = "/profileimg/" + dialogs[i].to;
			dialog_message_wrap.innerHTML = "<div>" + dialogs[i].user.name + "</div><span>나:</span> ";
		} else {													// 남이 -> 나에게
			dialog.id = "chat_dialogs_u_" + dialogs[i].user_userid;
			img.src = "/profileimg/" + dialogs[i].user_id;
			dialog_message_wrap.innerHTML = "<div>" + dialogs[i].user_name + "</div>";
		}

		dialog_message_wrap.innerHTML += dialogs[i].text;
		if( !(dialogs[i].text && dialogs[i].text.length > 0) ){
			dialog_message_wrap.innerHTML += "파일";
		}
		dialog.appendChild(dialog_message_wrap);

		dialog.onclick = openDialog;

		chat_dialog_box.appendChild(dialog);
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
	img.src = "/profileimg/@jinsang_rungE";
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
	chat_box.appendChild(chat_panel);

	var send_panel = document.createElement("div");
	send_panel.id = "send_panel";

	var chat_input = document.createElement("textarea");
	chat_input.placeholder = "메세지를 입력하세요";
	send_panel.appendChild(chat_input);

	chat_box.appendChild(send_panel);
	


	var default_dialog = document.createElement("div");
	default_dialog.id = "default_dialog";
	default_dialog.innerText = "Please select a chat to start messaging";
	chat_box.appendChild(default_dialog);
	
	document.body.appendChild(chat_wrap);	
	openDialog();

});

function openDialog(){
	var dialog = this;
	if( dialog != undefined && dialog.id != undefined ){
		var dialog_id = this.id.split('_').slice(3).join('_')
		location.hash = "#" + dialog_id;
	} else {
		dialog =  document.getElementById( "chat_dialogs_u_" + location.hash.substr(1) );
		if( dialog == undefined ){
			dialog = document.getElementById( "chat_dialogs_g_" + location.hash.substr(1) );
		}
		if( dialog == undefined ){
			return false;
		}
	}
	var dialogs = dialog.parentNode.childNodes;
	for( var i = 0; i < dialogs.length; ++i ){
		dialog.className = "chat_dialogs"
	}
	dialog.className = "chat_dialogs chat_dialogs_selected"
	
	document.getElementById("default_dialog").style.display = "none";
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


