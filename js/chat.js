'use strict';

window.addEventListener('load', function(){
	body.style.display = "none";

	var chat_wrap = $("div");
	chat_wrap.id = "chat_wrap";

	var chat_header = $("div");
	chat_header.id = "chat_header";


	var chat_menu = $("div");
	chat_menu.id = "chat_menu";
	chat_menu.onclick = function( event ){
		event.stopPropagation();
		showChatMenu( true );
	};
	
	var chat_menu_text = $("div");
	chat_menu_text.id = "chat_menu_text";
	chat_menu.appendChild(chat_menu_text)
	chat_menu_text.innerText = "새 메시지";

	chat_menu.appendChild(chat_menu_text);

	var chat_menu_box = $("div");
	chat_menu_box.id = "chat_menu_box";
	
	var chat_new_user = $("div");
	chat_new_user.id = "chat_new_user";
	chat_new_user.innerText = "1:1 시작하기";
	chat_new_user.onclick = showChatLayer;
	chat_menu_box.appendChild(chat_new_user);

	var chat_new_group = $("div");
	chat_new_group.id = "chat_new_group";
	chat_new_group.innerText = "그룹생성";
	chat_new_group.onclick = function(){
		showChatLayer(true,"group");
	}
	chat_menu_box.appendChild(chat_new_group);

	
	chat_menu.appendChild(chat_menu_box);

	chat_header.appendChild(chat_menu);

	var chat_title = $("div");
	chat_title.id = "chat_title";
	chat_header.appendChild(chat_title);

	chat_wrap.appendChild(chat_header);

	var chat_dialog = $("div");
	chat_dialog.id = "chat_dialog";
	chat_wrap.appendChild(chat_dialog);
	
	var chat_dialog_search = $("div");
	chat_dialog_search.id = "chat_dialog_search";
	chat_dialog_search.className = "chat_dialogs";
	
	var chat_dialog_search_input = $("input");
	chat_dialog_search_input.id = "chat_dialog_search_input";
	chat_dialog_search_input.className = "chat_search";
	chat_dialog_search_input.type = "text";
	chat_dialog_search_input.placeholder = "검색";
	chat_dialog_search_input.onkeyup = filterDialogs;
	chat_dialog_search_input.onfocusout = filterDialogs;
	chat_dialog_search.appendChild(chat_dialog_search_input);

	chat_dialog.appendChild(chat_dialog_search);

	var chat_dialog_box = $("div");
	chat_dialog_box.id = "chat_dialog_box";
	chat_dialog.appendChild(chat_dialog_box);

	for( var i = 0; i < dialogs.length; ++i ){
		chat_dialog_box.appendChild(makeDialog(dialogs[i]));
	}
/*
	var dialogs_keys = Object.keys(dialogs);
		
	for( var index = 0; index < dialogs_keys.length; ++index ){
		var i = dialogs_keys[index];
		dialogs[i].id;
		chat_dialog_box.appendChild(makeDialog(dialogs[i]));
	}
*/

/*
// 더미데이터생성
	for(var i = 0; i < 50; i++ ){	
	var dialog = $("div");
	dialog.className = "chat_dialogs";
	
	var time = $("div");
	time.className = "chat_dialogs_time";
	time.innerText = "Wed";
	dialog.appendChild(time);
	
	var img = $("img");
	img.src = "/files/profile/@jinsang_rungE";
	dialog.appendChild(img);
	var dialog_message_wrap = $("div");
	dialog_message_wrap.innerHTML = "<div class='chat_dialogs_name'>더미계정</div>더미텍스트";
	dialog_message_wrap.className = "chat_dialogs_message_wrap"
	
	dialog.appendChild(dialog_message_wrap);

	chat_dialog_box.appendChild(dialog);
	}
/////////////
*/

	var chat_box = $("div");
	chat_box.id = "chat_box";
	chat_box.addEventListener('dragover', DragOver, false);
	chat_box.addEventListener('dragleave', DragOut, false);
	chat_box.addEventListener('drop', openfile_chat, false);
//	chat_box.addEventListener('paste', openfile_chat_paste, false);
	chat_wrap.appendChild(chat_box);

	var chat_panel = $("div");
	chat_panel.id = "chat_panel";
	chat_panel.addEventListener('scroll', function(e){
		if( chat_panel.scrollTop <= 200 ){
			getChats(10);
		}
	});

	chat_box.appendChild(chat_panel);

	var send_panel = $("div");
	send_panel.id = "send_panel";

	var chat_input = $("textarea");
	chat_input.placeholder = "메세지를 입력하세요";
	chat_input.id = "chat_input";
	send_panel.appendChild(chat_input);

	chat_input.onkeypress = inputResize;
	chat_input.onkeyup = inputResize;
	chat_input.onkeydown = captureKey;


	var chat_file_input = $("input");
	chat_file_input.type = "file";
	chat_file_input.id = "chat_file_input";
	chat_file_input.accept = "image/*";
	chat_file_input.multiple = "multiple";
	chat_file_input.onchange = chatWrite;

	send_panel.appendChild(chat_file_input);

	var chat_file_label = $("label");
	chat_file_label.id = "chat_file_label";
	chat_file_label.htmlFor = "chat_file_input";
	send_panel.appendChild(chat_file_label);

	var send_btn = $("div");
	send_btn.innerText = "보내기";
	send_btn.id = "send_btn";
	send_btn.onclick = chatWrite;
	send_panel.appendChild(send_btn);

	chat_box.appendChild(send_panel);
	
	var default_dialog = $("div");
	default_dialog.id = "default_dialog";
	default_dialog.innerText = "채팅을 선택해주세요";
	chat_box.appendChild(default_dialog);
	
	document.body.appendChild(chat_wrap);	

	socket.on('update_last', updateTitle );

	socket.on('chat_new', function( data ){
		getChats( 0, data.type, data.dialog_id, true, true );
	});
	
	window.addEventListener('keydown', function(e){
		if( e.keyCode == 27 ){
			showChatLayer(false);
		}
	});
	window.addEventListener('keydown', imgmenu_keydown );

	window.addEventListener('click', function(e){
		showChatMenu(false);
	});


	if( location.hash.length > 0 ){
		openDialog();
	}

	document.addEventListener('webkitfullscreenchange', function(){
		event.stopPropagation();
		event.preventDefault();
		var imgbox = $('#imgbox');
		if(!document.webkitIsFullScreen){
			imgbox.style.width="";
			imgbox.style.height="";
			imgbox.style.top="";
			imgbox.style.left="";
			imgbox.style.position="";
			for( var j=imgbox.childNodes.length - 1 ; j>=1; --j ){
				imgbox.childNodes[j].style.border="";
			}
		}
	});
});



var skip_obj = {};
function getChats( limit, type, dialog_id, scroll, dialog_scroll ){
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
		skip_obj[params.dialog_id] += 1;
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
			}
			location.href = "/chat";
		}
	

		skip_obj[params.dialog_id] += ( chats.length - params.limit );
		var chat_dialog_box = $("#chat_dialog_box");
		if( !scroll ){
			chats.reverse();
		}
		for( var i = chats.length - 1; i >= 0; --i ){
			var chat_panel;
			var current_panel = $("#chat_panel");
			var current_id = current_panel.className.split('_').pop();
			if( chats[i].from.id == session.id ){
				chat_panel = current_panel;
			} else if( chats[i].type == "g" && current_id != chats[i].to.id ){
				chat_panel = chat_panel_obj[ "chat_dialogs_g_" + chats[i].to.id ];
			} else if( chats[i].type == "u" &&  chats[i].to.id == session.id && current_id != chats[i].from.id ){
				chat_panel = chat_panel_obj[ "chat_dialogs_u_" + chats[i].to.id ];
				if( chat_panel == undefined && current_panel.className == "chat_dialogs_u_" + chats[i].from.uid ){
					chat_panel = current_panel;
				}
			} else {
				chat_panel = current_panel;
			}
			if( current_id && current_id.length && chat_panel != undefined ){
				var chat = $("div");
				chat.id = "chat_" + chats[i].id;
				chat.className = "chat";
				var my_chat = false;

				if( chats[i].from.id == session.id ){
					my_chat = true;
				}

				if( chats[i].html ){
					chat.className = "chat_system";
					chat.innerHTML = chats[i].html;
					if( scroll ){
						chat_panel.appendChild(chat);
						chat_panel.scrollTop += chat.clientHeight
					} else {	
						chat_panel.insertBefore(chat,chat_panel.firstElementChild);
					}
					continue;
				}
	
				var chat_profileimg;
				if( my_chat ){
					chat_profileimg = $("span");
				} else {
					chat_profileimg = $("a");
					chat_profileimg.href = "/@"+chats[i].from.uid;
					chat_profileimg.addEventListener('mouseover',profileHover);
					chat_profileimg.addEventListener('mouseleave',profileLeave);

				}
				chat_profileimg.style.backgroundImage = "url('/files/profile/" + chats[i].from.uid + '?' + new Date() + "')";
				chat_profileimg.className = "chat_profileimg";
				chat.appendChild(chat_profileimg);
				
				var chat_body = $("div");
				chat_body.className = "chat_body";
	
				var chat_body_name;
				if( my_chat ){
					chat_body_name = $("span");
				} else {
					chat_body_name = $("a");
					chat_body_name.addEventListener('mouseover',profileHover);
					chat_body_name.addEventListener('mouseleave',profileLeave);
					chat_body_name.href = "/@"+chats[i].from.uid;
				}
				
				chat_body_name.className = "chat_body_name";
				chat_body_name.innerText = chats[i].from.name
				chat_body.appendChild(chat_body_name);
	
				if( chats[i].text ){
					var caret = $('div');
					caret.className = "chat_body_caret";
					var outer = $('div');
					outer.className ="chat_body_caret_outer";
					caret.appendChild(outer);
					var inner = $('div');
					inner.className = "chat_body_caret_inner";
					caret.appendChild(inner);
					chat_body.appendChild(caret);
					var chat_body_text = $("div");
					chat_body_text.className = "chat_body_text";
					chat_body_text.innerText = chats[i].text;
					chat_body.appendChild(chat_body_text);
				} else if ( chats[i].file ){
					var chat_body_file = $("img");
					chat_body_file.className = "chat_body_file";
					chat_body_file.src = "/files/chat/" + chats[i].id + '?' + new Date(chats[i].date);
					if( scroll ){
						chat_body_file.onload = function(){
							chat_panel.scrollTop = chat_panel.scrollHeight;
						}
					}
					chat_body_file.onclick = function(){
						var src = this.src.split('?');
						viewimg(null,1,src[1],src[0],true);
					};
					chat_body.appendChild(chat_body_file);
				}
	
				chat.appendChild(chat_body);
				if( my_chat ){
					chat.className += " my_chat";
					chat.appendChild(chat_profileimg);
				}
	
	/*
				var previous = chat.previousElementSibling
	*/
				if( scroll ){
					chat_panel.appendChild(chat);
				} else {
					chat_panel.insertBefore(chat,chat_panel.firstElementChild);
					chat_panel.scrollTop += chat.clientHeight
				}
			} else { 
			}
			if( scroll ){
				var dialog;
				var className = "chat_dialogs";
				if( chats[i].type == "g" ){
					dialog = $("#chat_dialogs_" +  chats[i].type + "_" + chats[i].to.id);
				} else {
					if( chats[i].from.id == session.id ){
						dialog = $("#chat_dialogs_" +  chats[i].type + "_" + chats[i].to.uid);
					} else {
						dialog = $("#chat_dialogs_" +  chats[i].type + "_" + chats[i].from.uid);
					}
				}
			
				if( dialog ){
					className = dialog.className;
				}
	
				var new_dialog = makeDialog( chats[i] );
				new_dialog.className = className;
				if( chats[i].type == "u" ){
					if( location.hash == "#u?" + chats[i].to.uid || location.hash == "#u?" + chats[i].from.uid ){
						new_dialog.className = "chat_dialogs chat_dialogs_selected";
					}
				} else {
				}

				if( chat_dialog_box.childElementCount == 0 ){
				//	chat_dialog_box.removeChild(dialog);
					chat_dialog_box.appendChild(new_dialog);
				} else if( dialog_scroll ){
					if( dialog ){
						chat_dialog_box.removeChild(dialog);
					}
					chat_dialog_box.insertBefore(new_dialog,chat_dialog_box.firstChild);
				} else {
					if( dialog ){
						chat_dialog_box.replaceChild(new_dialog,$('#'+new_dialog.id));
					} else {
						chat_dialog_box.removeChild(dialog);
						if( chat_dialog_box.childElementCount == 0 ){
							chat_dialog_box.appendChild(new_dialog);
						} else {
							chat_dialog_box.insertBefore(new_dialog,chat_dialog_box.firstChild);
						}
					}
				}
			}
		}
		if( scroll && chat_panel != undefined ){
			chat_panel.scrollTop = chat_panel.scrollHeight;
		}
	}};
	xhr.open("POST", "/api/chat/getchats", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
}

function makeDialog( chat ){
	var dialog = $("div");
	dialog.className = "chat_dialogs";

	var time = $("div");
	time.className = "chat_dialogs_time";
	time.innerText = getDateString(chat.date);
	dialog.appendChild(time);
	
	var img = $("img");
	dialog.appendChild(img);

	var message_wrap = $("div");
	message_wrap.className = "chat_dialogs_message_wrap"

	var name = $("div");
	name.className = "chat_dialogs_name"

	message_wrap.appendChild(name);

	if( chat.type == "g" ){
		dialog.id = "chat_dialogs_g_" + chat.to.id;
		img.src = "/files/group/" + chat.to.id;
		name.innerText = chat.to.name;
		if( chat.from.id == session.id ){
			message_wrap.innerHTML += "<span>나:</span>";
		} else {
			message_wrap.innerHTML += "<span>" + chat.from.name + ":</span>";
		}
	} else if( chat.to.id != session.id ){ 									// 내가 -> 남에게
		dialog.id = "chat_dialogs_u_" + chat.to.uid;
		img.src = "/files/profile/" + chat.to.uid;
		name.innerText = chat.to.name;
		message_wrap.innerHTML += "<span>나:</span>";
	} else {													// 남이 -> 나에게
		dialog.id = "chat_dialogs_u_" + chat.from.uid;
		img.src = "/files/profile/" + chat.from.id;
		name.innerText = chat.from.name;
	}
	img.src += '?' + new Date(chat.date);

	message_wrap.innerHTML += chat.text;
	if( !(chat.text && chat.text.length > 0) ){
		message_wrap.innerHTML += "파일";
	}
	dialog.appendChild(message_wrap);

	dialog.onclick = openDialog;
	

	return dialog;
}

var chat_panel_obj = {};
function openDialog(evt){
	var dialog = this;
	var chat_panel = $("#chat_panel");
	if( chat_panel.className.length ){
		chat_panel_obj[chat_panel.className] = chat_panel;
	}

	if( dialog == undefined || dialog.id == undefined ){
		dialog = $( "#chat_dialogs_" + location.hash.substr(1,1) + "_" + location.hash.substr(3) );
	}

	if( dialog != undefined ){
		var type = dialog.id.split('_')[2];
		var dialog_id = dialog.id.split('_').slice(3).join('_')
		/*
		if( dialog_id == session.uid ){
			alert("잘못된 접근입니다");
			return location.href = "/chat";
			
		}
		*/
		location.hash = "#" + type + "?" + dialog_id;

		var dialog_id = dialog.id
		showChatLayer(false);
		dialog = $("#"+dialog_id)
	}

	if( dialog && dialog.className.indexOf("selected") >= 0 ){
		chat_panel.scrollTop = chat_panel.scrollHeight;
		return false;
	}
	var chat_input = $("#chat_input");
	var file_input = $("#chat_file_input");
	file_input.value = "";
	chat_input.value = "";

	var dialogs = $("#chat_dialog_box").childNodes;
	for( var i = 0; i < dialogs.length; ++i ){
		dialogs[i].className = "chat_dialogs"
	}

	if( dialog != undefined ){
		if( dialog.scrollIntoViewIfNeeded ){
			dialog.scrollIntoViewIfNeeded();	
		}
		dialog.className = "chat_dialogs chat_dialogs_selected";
	}

	if( dialog && dialog.id && chat_panel_obj[dialog.id] ){
		chat_box.replaceChild(chat_panel_obj[dialog.id],chat_panel);
	} else {
		var new_panel = chat_panel.cloneNode(true);
		new_panel.addEventListener('scroll', function(e){
			if( this.scrollTop <= 200 ){
				getChats(10);
			}
		});

		while( new_panel.firstChild ){
			new_panel.removeChild(new_panel.firstChild);
		}
		chat_box.replaceChild(new_panel,chat_panel);
		new_panel.className = dialog_id;
	}

	var new_panel;
	if( dialog && dialog.id ){
		new_panel = chat_panel_obj[ "chat_dialogs_" + dialog.id.split('_')[2] + '_' + dialog.id.split('_').slice(3).join('_') ];
	}
	if( new_panel == undefined ){
		getChats(20,null,null,true);
	} else {
		new_panel.scrollTop = new_panel.scrollHeight;
	}
	
	$("#default_dialog").style.display = "none";
	$("#send_panel").style.display = "block";
	if( $('#chat_box').clientWidth == 0 || $('#chat_box').style.display == "none"){
		$('#chat_dialog').style.display = "none";
		$('#chat_box').style.display = "block";
		$('#chat_menu').style.backgroundImage = "url('/img/leftbtn.png')";
		$('#chat_menu').style.backgroundSize = "19px 30px";
	}

	updateTitle();
}

function getDateString(origin_date){
	var date = new Date(origin_date);
	var now = new Date();
	var date_time = Math.floor(date.getTime()/1000)
	var now_time = Math.floor(now.getTime()/1000)
	var gap = now_time - date_time;
	if( gap < 86400 ){
		return ((date.getDate()!=now.getDate())?"어제 ":"") + (date.getHours()<=9?"0":"") + date.getHours() + ":" + (date.getMinutes()<=9?"0":"") + date.getMinutes();
	} else if( date.getDate() != now.getDate() ){
		return (date.getYear()-100)+'/'+(date.getMonth()<=8?"0":"")+(date.getMonth()+1)+'/'+(date.getDate()<=9?0:"")+date.getDate();
	}
}

function inputResize(event){
	var obj = event.target;
	var chat_panel = $("#chat_panel");
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
	var chat_input = $("#chat_input");
	var file_input = $("#chat_file_input");
	var tmp = chat_input.value;
	if( file_input.files.length >= 1 ){
		for( var i = 0; i < file_input.files.length; ++i ){
			var formdata = new FormData();
			formdata.append("type",location.hash.substr(1,1));
			formdata.append("to_id",location.hash.split('?')[1]);
			formdata.append("file",file_input.files[i]);
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
				var to = JSON.parse(xhr.responseText);
				if( to.uid != session.uid ){
					getChats(0,null,null,true,true);
				}
			}}
			xhr.open("POST","/api/chat/writechat", false);  xhr.send(formdata);
		}
		file_input.value = "";
	} else if( tmp.length >= 1 ){
		var formdata = new FormData();
		formdata.append("type",location.hash.substr(1,1));
		formdata.append("to_id",location.hash.split('?')[1]);
		formdata.append("text",tmp);

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
			var to = JSON.parse(xhr.responseText);
			if( to.uid != session.uid ){
				getChats(0,null,null,true,true);
			}
		}}
		xhr.open("POST","/api/chat/writechat", false);  xhr.send(formdata);
		chat_input.value = "";
	} else {
		return 0;
	}
}

function showChatMenu( boolean ){
	if( $('#chat_dialog').style.display == "none" && boolean != false ){
		$('#chat_dialog').style.display = "block";
		$('#chat_box').style.display = "none";
		$('#chat_title').innerText = "";
		$('.chat_dialogs_selected')[0].className = "chat_dialogs";
		$('#chat_menu').style.backgroundImage = "";
		$('#chat_menu').style.backgroundSize = "";
		location.hash = "";
		return;
	}
	var chat_menu_box = $("#chat_menu_box");
	if( boolean ){
		chat_menu_box.style.display = "block";
	} else if( boolean == false ){
		chat_menu_box.style.display = "";
	}
}

function showChatLayer( boolean, type ){
	make_group_arr = [];
	var uids = [];
	if( boolean == false ){
		var layer = $("#chat_layer");
		if( layer ){
			document.body.removeChild(layer);
		}
		return;
	} else if( type == "invite" ){
		var list = $('#chat_layer_list').childNodes;
		for( var i = 0; i < list.length; ++i ){
			uids.push(list[i].id.split('_').pop());
		}
		showChatLayer(false);
	}

	showChatMenu(false);

	var layer = $("div");
	layer.onclick = function(){
		showChatLayer(false);
	}
	layer.id = "chat_layer";
	
	var layer_close = $("div");
	layer_close.id = "chat_layer_close"
	layer_close.onclick = layer.onclick;
	layer.appendChild(layer_close);


	var box = $("div");
	box.id = "chat_layer_box";
	box.onclick = function(event){
		event.stopPropagation();
		event.cancelBubble = true;
	}
	
	var box_close = $("div");
	box_close.id = "chat_layer_box_close";
	box_close.onclick = layer_close.onclick;
	box.appendChild(box_close);

	var title = $("div");
	title.id = "chat_layer_title"
	box.appendChild(title);
	if( type == "info" ){
		title.innerText = "그룹 정보";
		
		var info_div = $("div");
		info_div.id = "chat_info_div";
		
		var info_img = $("div");
		info_img.onclick = function(){
			viewimg(null,1,new Date(),this.style.backgroundImage.replace(/url\(|\)$|"/ig, ''),false);
		}
		info_img.id = "chat_info_img";
		info_img.style.backgroundImage = "url('/files/group/" + location.hash.split('?')[1] + "')";
		info_div.appendChild(info_img);
	
		var info_text = $("div");
		info_text.id = "chat_info_text";
		
		var chat_title = $("#chat_title");

		var info_name = $("div");
		info_name.id = "chat_info_name";
		info_name.innerText = chat_title.firstChild.wholeText;
		info_text.appendChild(info_name);

		var info_cnt = $("div");
		info_cnt.id = "chat_info_cnt";
		info_cnt.innerText = chat_title.lastChild.innerText;
		info_text.appendChild(info_cnt);

		info_div.appendChild(info_text);
	
		box.appendChild(info_div);
		
		var info_menu = $("div");
		info_menu.id = "chat_info_menu";

		var info_invite = $("div");
		info_invite.id = "chat_info_menu_invite";
		info_invite.innerText = "초대";
		info_invite.onclick = function(){
			showChatLayer(true,"invite");
		}
		info_menu.appendChild(info_invite);

		var info_exit = $("div");
		info_exit.id = "chat_info_menu_exit";
		info_exit.innerText = "나가기";
		info_exit.onclick = groupExit;

		info_menu.appendChild(info_exit);
	
		box.appendChild(info_menu)
		
	} else {
		var input_div = $("div");
		input_div.id = "chat_layer_input_box";

		var input = $("input");
		input.id = "chat_layer_input"
		input.className = "chat_search"
		input.placeholder = "검색";
		input.onfocus = function(){
			updateList(type);
		}

		input_div.appendChild(input);

		box.appendChild(input_div);
		if( type == "group" ){
			title.innerText = "새 그룹";
		} else if ( type == "invite" ){
			title.innerText = "초대하기";
			input.onfocus = function(){
				updateList(type,uids);
			}
		} else {
			title.innerText = "새 메시지";
		}

		input.onkeyup = input.onfocus;
		input.onfoucsout = input.onfocus;
	}

	var list = $("div");
	list.id = "chat_layer_list";
	list.className = "chat_layer_div";
	box.appendChild(list);
	layer.appendChild(box);
	document.body.appendChild(layer);

	if( type == "info" ){
		updateList("info",location.hash.split('?')[1]);
	} else if( type == "invite" ){
		updateList("invite",uids);
	} else {
		updateList(type);
	}

	if( type == "group" ){
		var menu = $("div");
		menu.id = "chat_layer_menu";

		var group = $("div");
		group.id = "chat_layer_group";
		group.className = "chat_layer_div";

		var group_file = $("input");
		group_file.type = "file";
		group_file.id = "chat_layer_group_file";
		group_file.onchange = openfile_group;
		group.appendChild(group_file);
		
		var group_label = $("label");
		group_label.htmlFor = "chat_layer_group_file";
		group_label.id = "chat_layer_group_label";
		group.appendChild(group_label);

		var group_name = $("input");
		group_name.id = "chat_layer_group_name";
		group_name.autocomplete = "off";
		group_name.placeholder = "그룹명을 입력하세요";
		group_name.onkeyup = function(){
			if( this.value.length ){
				var next = $("#chat_layer_menu_next");
				next.className = "chat_layer_menu_active";
				next.onclick = function(){
					var formdata = new FormData();
					var file_input = $("#chat_layer_group_file");
					var name = $("#chat_layer_group_name");

					formdata.append("file",file_input.files[0]);
					formdata.append("uids",make_group_arr);
					formdata.append("name",name.value);

					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
						if( xhr.responseText ){
							var gid = xhr.responseText;
							location.hash = "#g?" + gid;
							showChatLayer(false);
							openDialog();
						}
					}}
					xhr.open("POST", "/api/chat/makegroup", false); xhr.send(formdata);
				}
			}
		}
		group_name.onfocus = group_name.onkeyup;
		group_name.onfocusout = group_name.onkeyup;
		group.appendChild(group_name);

		box.appendChild(group);

		var cancle = $("span");
		cancle.id = "chat_layer_menu_cancle";
		cancle.innerText = "취소";
		cancle.className = "chat_layer_menu_active";
		cancle.onclick = function(){
			showChatLayer(false);
		}

		menu.appendChild(cancle);

		var next = $("span");
		next.id = "chat_layer_menu_next";
		next.innerText = "그룹생성";
		menu.appendChild(next);

		box.appendChild(menu);
	} else if( type == "invite" ){
		var menu = $("div");
		menu.id = "chat_layer_menu";

		var cancle = $("span");
		cancle.id = "chat_layer_menu_cancle";
		cancle.innerText = "취소";
		cancle.className = "chat_layer_menu_active";
		cancle.onclick = function(){
			showChatLayer(false);
		}
		menu.appendChild(cancle);

		var next = $("span");
		next.id = "chat_layer_menu_next";
		next.innerText = "초대하기";
		menu.appendChild(next);

		box.appendChild(menu);
		
	} else {
		list.style.height = "calc( 100% - 203px )";
	}
	if( event ){
		showChatMenu(false);
		event.stopPropagation();
	}
}

function updateList( type, param ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText != "" ){
			var results = JSON.parse(xhr.responseText);
			var list = $("#chat_layer_list");
			while( list.firstChild ){
				list.removeChild(list.firstChild);
			}
			if( type == "info" ){
				results = results.users;
			}
			for( var i = 0; i < results.length; ++i ){
				if( results[i].to ){
					results[i] = results[i].to;
				}
				if( type == "invite" && param.indexOf(results[i].uid) >= 0 ){
					continue;
				}
				if( results[i].uid == session.uid ){
					if( list.firstElementChild ){
						list.insertBefore(makeList(results[i]),list.firstElementChild);	
					} else {
						list.insertBefore(makeList(results[i]),list.firstElementChild);	
					}
				} else {
					list.appendChild(makeList(results[i]));	
				}
			}
		} else {
			makeList();
		}
	}}

	var input = $("#chat_layer_input");
	if( type == "info" ){
		xhr.open("POST", "/api/chat/getinfo", false);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('dialog_id='+param);
	} else if( input.value.length >= 1 ){
		xhr.open("POST", "/api/user/search", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('query='+input.value);
	} else {
		xhr.open("POST", "/@" + session.uid + "/following", false);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send();
	}
}

function makeList( user ){
	if( user == undefined ){ //검색결과 없을때 디자인 마땅히없음
		return;
	}
		
	var dialog = $("div");
	dialog.className = "chat_dialogs";

	var img = $("img");
	dialog.appendChild(img);

	var dialog_message_wrap = $("div");
	dialog_message_wrap.className = "chat_dialogs_message_wrap"

	dialog.id = "chat_dialogs_u_" + user.uid;
	img.src = "/files/profile/" + user.uid + '?' + new Date();
	dialog_message_wrap.innerHTML = "<div>" + user.name + "</div><span>@" + user.uid + "</span>";

//	dialog_message_wrap.innerHTML += "chat";

	dialog.appendChild(dialog_message_wrap);

	var title = $("#chat_layer_title");
	var group_flag = false;
	if( title.innerText.indexOf("새 그룹") >= 0 || title.innerText.indexOf("대화") >= 0 ){
		group_flag = true;
	}
	var invite_flag = false;
	if( title.innerText.indexOf("초대") >= 0 ){
		invite_flag = true;
	}
	if( group_flag || invite_flag ){
		dialog.onclick = function(){
			var id = this.id.split('_').pop();
			var title = $("#chat_layer_title");
			if( this.className.indexOf("chat_dialogs_selected") == -1 ){
				this.className = "chat_dialogs chat_dialogs_selected group_selected";
				make_group_arr.push(id);
			} else {
				this.className = "chat_dialogs";
				make_group_arr.splice(make_group_arr.indexOf(id),1);
			}
			var next = $("#chat_layer_menu_next");
			var cnt = make_group_arr.length;
			if( cnt ){
				if( group_flag ){
					title.innerText = cnt + " 명과 대화하기";
					next.onclick = makeGroup;
				} else {
					title.innerText = cnt + " 명을 초대하기";
					next.onclick = groupInvite;
				}
				next.className = "chat_layer_menu_active";
			} else {
				if( group_flag ){
					title.innerText = "새 그룹";
				} else {
					title.innerText = "초대하기";
				}
				next.className = "";
				next.onclick = "";
			}
		}
		if( make_group_arr.indexOf(user.uid) >= 0 ){
			dialog.className = "chat_dialogs chat_dialogs_selected group_selected";
		}
	} else {
		dialog.onclick = openDialog;
	}
	
	return dialog;
}

function filterDialogs(){
	var value = $("#chat_dialog_search_input").value;
	var dialogs = $("#chat_dialog_box").childNodes;
	var names = $(".chat_dialogs_name");
	if( value != "" ){
		for( var i = 0; i < names.length; ++i ){
			if( names[i].innerText.indexOf(value) < 0 ){
				dialogs[i].style.display = "none";
			} else {
				dialogs[i].style.display = "";
			}
		}
	} else {
		for( var i = 0; i < dialogs.length; ++i ){
			dialogs[i].style.display = "";
		}
	}
}

function imgmenu_keydown(e){
	var imglayer = $("#imglayer");
	var imgmenuhover = $("#imgmenuhover");
	var lefthover = $("#lefthover");
	var righthover = $("#righthover");

	if(imglayer.style.opacity == "1"){
		event.stopPropagation();
		if(e.keyCode==39 || e.keyCode == 40){
			event.preventDefault();
			rightbtn.click();
		} else if(e.keyCode==37 || e.keyCode == 38){
			event.preventDefault();
			leftbtn.click();
		} else if(e.keyCode==27){
			event.preventDefault();
			imglayer.style.opacity="0";
			lefthover.style.display="none";
			righthover.style.display="none";
			imgmenuhover.style.display="none";
		}
	}
}

function updateTitle(){
	var title = $("#chat_title");
	var params = {
		type : location.hash.substr(1,1),
		dialog_id : location.hash.split('?')[1]
	}
	var query = "";
	var param_key = Object.keys(params);
	for( var i = 0; i < param_key.length; ++i ){
		query += param_key[i] + '=' + params[param_key[i]] + "&";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText != "" ){
			var info = JSON.parse(xhr.responseText);
			title.innerText = info.name;
			var span = $("span");
			if( params.type == "g" ){
				span.innerText = info.users.length + "명이 참여중입니다";
				title.onclick = function(){
					showChatLayer("true","info");
				}
			} else {
				span.innerText = info.last;
				title.onclick = function(){
					location.href = "/@" + info.uid;
				}
			}
			title.appendChild(span);
		}
	}}
	if( params.type == "g" ){
		xhr.open("POST", "/api/chat/getinfo", false); 
	} else {
		xhr.open("POST", "/@" + params.dialog_id, false); 
	}
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
}

function groupExit(){
	if(!confirm("정말로 그룹에서 나가시겠습니까?")){
		return;
	}

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText == "success" ){
			location.href = "/chat";
		}
	}}
	xhr.open("POST", "/api/chat/exit", false); 
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	xhr.send('gid='+location.hash.split('?')[1]);
}

var make_group_arr = [];
function groupInvite(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText == "success" ){
			showChatLayer(false);
		}
	}}
	xhr.open("POST", "/api/chat/invite", false); 
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	xhr.send('uids='+make_group_arr.toString()+'&gid='+location.hash.split('?')[1]);
}

function makeGroup(){
	if( make_group_arr.length == 1){
		location.hash = "#u?" + make_group_arr[0];
		return openDialog();
	}

	$("#chat_layer_menu_cancle").onclick = function(){
		$("#chat_layer_list").style.display = "block";
		$("#chat_layer_group").style.display = "none";
		$("#chat_layer_menu_next").className = "chat_layer_menu_active";
		$("#chat_layer_menu_next").onclick = makeGroup;
		$("#chat_layer_group_name").value = "";
		$("#chat_layer_group_file").value = "";
		$("#chat_layer_group_label").style.backgroundImage = "";
		this.onclick = function(){
			showChatLayer(false);
		}
	}

	$("#chat_layer_input").value = "";
	$("#chat_layer_list").style.display = "none";
	$("#chat_layer_group").style.display = "block";
	this.className = "";
}

function openfile_group(event){
	event.stopPropagation();
	event.preventDefault();
	var input = event.target;
	var files = input.files;
	var label = $("#chat_layer_group_label");

	var reader = new FileReader();
	reader.addEventListener("load",function(event){
		label.style.backgroundImage = "url('" + event.target.result + "')";
	});
	reader.readAsDataURL(files[0]);
}

function openfile_chat(event){
	event.stopPropagation();
	event.preventDefault();
	var file_input = $("#chat_file_input");
	file_input.files = event.dataTransfer.files;
	DragOut();
}

function DragOut(evt){
	if( evt != undefined ){
		evt.stopPropagation();
		evt.preventDefault();
	}
	var obj = $("#chat_input").style;
	obj.border = "";
	obj.marginLeft = "";
	obj.marginTop = "";
	obj.marginRight = "";
}

function DragOver(evt){
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
	var obj = $("#chat_input").style;
	obj.border = "2px dashed #bbb";
	obj.marginLeft = "5px";
	obj.marginTop = "5px";
	obj.marginRight = "9px";
}


