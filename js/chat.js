window.addEventListener('load', function(){
	var chat_wrap = $("div");
	chat_wrap.id = "chat_wrap";

	var chat_header = $("div");
	chat_header.id = "chat_header";


	var chat_menu = $("div");
	chat_menu.id = "chat_menu";
	
	var chat_menu_text = $("div");
	chat_menu_text.id = "chat_menu_text";
	chat_menu.appendChild(chat_menu_text)
	chat_menu_text.innerText = "새 메시지";
	chat_menu_text.onclick = function( event ){
		event.stopPropagation();
		showChatMenu( true );
	};

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
	chat_title.onclick = function(){
		showChatLayer("true","info");
	}
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

	socket.on('update_last', function(){
		updateTitle();
	});

	socket.on('chat_new', function( data ){
		getChats( 0, data.type, data.dialog_id, true, true );
	});
	
	window.addEventListener('resize', imgmenu_resize );
	window.addEventListener('keydown', imgmenu_keydown );

	window.addEventListener('click', function(){
		showChatMenu(false);
	});

	var imglayer = $("div");
	imglayer.id = "imglayer";
	imglayer.addEventListener('transitionend', function(){ if( this.style.opacity == "0" ){
		this.style.zIndex = "-500";
	} else {
		this.style.visibility = "visibile";
	}});
	imglayer.onclick = function(evt){
		if( document.webkitIsFullScreen ){
			evt.stopPropagation();
			evt.preventDefault();
		} else {
			imglayer.style.zIndex="300";
			imglayer.style.opacity="0";
			lefthover.style.display = "none";
			righthover.style.display = "none";
			imgmenuhover.style.display = "none";
		}
	}

	var righthover = $("div");
	righthover.id = "righthover";
	imglayer.appendChild(righthover);

	var rightbtn = $("div");
	rightbtn.onclick = function(e){
		e.stopPropagation();
		e.preventDefault();
		var img = $("#imglayer_img");
		var params = { 
			flag : "gt",
			type : location.hash.substr(1,1),
			dialog_id : location.hash.split('?')[1],
			now : img.src.split('/').pop()
		}
		var query = "";
		var param_key = Object.keys(params);
		for( var i = 0; i < param_key.length; ++i ){
			query += param_key[i] + '=' + params[param_key[i]] + "&";
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText != "" ){
				var src = "/files/chat/" + xhr.responseText;
				img.src = src;
			}
		}}
		xhr.open("POST", "/api/chat/getfile", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
	}
	righthover.onclick = rightbtn.onclick;
	rightbtn.id = "rightbtn";
	imglayer.appendChild(rightbtn);

	var lefthover = $("div");
	lefthover.id = "lefthover";
	imglayer.appendChild(lefthover);

	var leftbtn = $("div");
	leftbtn.onclick = function(e){
		e.stopPropagation();
		e.preventDefault();
		var img = $("#imglayer_img");
		var params = {
			flag : "lt", 
			type : location.hash.substr(1,1),
			dialog_id : location.hash.split('?')[1],
			now : img.src.split('/').pop()
		}
		var query = "";
		var param_key = Object.keys(params);
		for( var i = 0; i < param_key.length; ++i ){
			query += param_key[i] + '=' + params[param_key[i]] + "&";
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText ){
				var src = "/files/chat/" + xhr.responseText;
				img.src = src;
			}
		}}
		xhr.open("POST", "/api/chat/getfile", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(query);
	}
	lefthover.onclick = leftbtn.onclick;
	leftbtn.id = "leftbtn";
	imglayer.appendChild(leftbtn);

	var imgmenuhover = $("div");
	imgmenuhover.id = "imgmenuhover";
	imgmenuhover.onclick = function(){
		event.stopPropagation();
	}
	imglayer.appendChild(imgmenuhover);
	var imgmenu = $("div");
	imgmenu.id = "imgmenu";
	imgmenu.onclick = function(event){
		event.stopPropagation();
//	  event.preventDefault();
	}
	leftbtn.addEventListener('transitionend', function(){
		event.stopPropagation();
		event.preventDefault();
	});
	rightbtn.addEventListener('transitionend', function(){
		event.stopPropagation();
		event.preventDefault();
	});
	imgmenu.addEventListener('transitionend', function(){
		event.stopPropagation();
		event.preventDefault();
	});
	imgmenu.innerHTML = "<img id='imgmenu_favorite' src='/img/favorite.png'>"; // 셰어로 사용할예정
	imgmenu.innerHTML += "<a id='imgdownload' download><img src='/img/download.png'></a>"; //<img src='/img/share.png'>";
	if( !(/(BB|iPad|iPhone|iPod|Android|\.NET)/i.test( navigator.userAgent )) ){
		imgmenu.innerHTML += "<img src='/img/imgfull.png' onclick='viewfull(this)' >";
	} else {
		imglayer.onclick = function(){ 
			document.body.style.overflowY = ""; 
			imglayer.style.opacity = "0";
		}
	}
	imglayer.appendChild(imgmenu);

	var imgbox = $("div");
	imgbox.id = "imgbox";
	imglayer.appendChild(imgbox);
	document.body.appendChild(imglayer);

	if( location.hash.length > 0 ){
		openDialog();
	}
	
	imgmenu_resize();
	document.addEventListener('webkitfullscreenchange', function(){
		event.stopPropagation();
		event.preventDefault();
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

// 이미지 전체화면
function viewfull(obj){
	var imglayer = $("#imglayer");
	var imgbox = $("#imgbox");
	if( document.webkitIsFullScreen ){
		document.webkitCancelFullScreen();
		obj.src="/img/imgfull.png";
		event.stopPropagation();
		event.preventDefault();
	} else {
		imgbox.style.width="100%";
		imgbox.style.height="100%";
		imgbox.style.top="0";
		imgbox.style.left="0";
		imgbox.style.position="absolute";
		imglayer.webkitRequestFullScreen();
		for( var j=imgbox.childNodes.length - 1 ; j>=1; --j ){
			imgbox.childNodes[j].style.border="0";
		}
		obj.src="/img/imgfull_exit.png";
	}
}



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
		var chat_panel = $("#chat_panel");
		skip_obj[params.dialog_id] += ( chats.length - params.limit );
		var chat_dialog_box = $("#chat_dialog_box");
		for( var i = chats.length - 1; i >= 0; --i ){
			var chat = $("div");
			chat.id = "chat_" + chats[i].id;
			chat.className = "chat";
		
			var chat_profileimg = $("img");
			chat_profileimg.src = "/files/profile/" + chats[i].from.uid + '?' + new Date();
			chat_profileimg.className = "chat_profileimg";
			chat.appendChild(chat_profileimg);
			
			var chat_body = $("div");
			chat_body.className = "chat_body";

			var chat_body_name = $("div");
			chat_body_name.className = "chat_body_name";
			chat_body_name.innerText = chats[i].from.name
			chat_body.appendChild(chat_body_name);

			if( chats[i].text ){
				chat_body.innerHTML += "<div class='chat_body_caret'><div class='outer'></div><div class='inner'></div></div>";
				var chat_body_text = $("div");
				chat_body_text.className = "chat_body_text";
				chat_body_text.innerText = chats[i].text;
				chat_body.appendChild(chat_body_text);
			} else if ( chats[i].file ){
				var chat_body_file = $("img");
				chat_body_file.className = "chat_body_file";
				chat_body_file.src = "/files/chat/" + chats[i].id + '?' + new Date();
				if( scroll ){
					chat_body_file.onload = function(){
						chat_panel.scrollTop = chat_panel.scrollHeight;
					}
				}
				chat_body_file.onclick = function(){
					viewimg(this.src);
				};
				chat_body.appendChild(chat_body_file);
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
					chat_dialog_box.removeChild(dialog);
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
		img.src = "/files/group/" + chat.to.id + '?' + new Date();
		name.innerText = chat.to.name;
		if( chat.from.id == session.id ){
			message_wrap.innerHTML += "<span>나:</span>";
		} else {
			message_wrap.innerHTML += "<span>" + chat.from.name + ":</span>";
		}
	} else if( chat.to.id != session.id ){ 									// 내가 -> 남에게
		dialog.id = "chat_dialogs_u_" + chat.to.uid;
		img.src = "/files/profile/" + chat.to.uid + '?' + new Date();
		name.innerText = chat.to.name;
		message_wrap.innerHTML += "<span>나:</span>";
	} else {													// 남이 -> 나에게
		dialog.id = "chat_dialogs_u_" + chat.from.uid;
		img.src = "/files/profile/" + chat.from.id + '?' + new Date();
		name.innerText = chat.from.name;
	}

	message_wrap.innerHTML += chat.text;
	if( !(chat.text && chat.text.length > 0) ){
		message_wrap.innerHTML += "파일";
	}
	dialog.appendChild(message_wrap);

	dialog.onclick = openDialog;
	

	return dialog;
}

var chat_panel_obj = {};
function openDialog(text){
	var dialog = this;
	var chat_panel = $("#chat_panel");
	if( chat_panel.className.length ){
		chat_panel_obj[chat_panel.className] = chat_panel;
	}

	if( dialog && dialog.id == undefined ){
		dialog = $( "#chat_dialogs_" + location.hash.substr(1,1) + "_" + location.hash.substr(3) );
	}

	if( dialog != undefined ){
		var type = dialog.id.split('_')[2];
		var dialog_id = dialog.id.split('_').slice(3).join('_')
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
		dialog.scrollIntoViewIfNeeded();
		dialog.className = "chat_dialogs chat_dialogs_selected";
	}

	if( dialog && dialog.id && chat_panel_obj[dialog.id] ){
		chat_box.replaceChild(chat_panel_obj[dialog.id],chat_panel);
	} else {
		var new_panel = chat_panel.cloneNode("true");
		while( new_panel.firstChild ){
			new_panel.removeChild(new_panel.firstChild);
		}
		chat_box.replaceChild(new_panel,chat_panel);
		new_panel.className = dialog_id;
	}
	
	getChats(20,null,null,true);
	
	$("#default_dialog").style.display = "none";
	$("#send_panel").style.display = "block";

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
				var to_id = parseInt(xhr.responseText);
				if( to_id != NaN ){
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
			var to_id = parseInt(xhr.responseText);
			if( to_id != NaN ){
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
	var chat_menu_box = $("#chat_menu_box");
	if( boolean ){
		chat_menu_box.style.display = "block";
	} else if( boolean == false ){
		chat_menu_box.style.display = "";
	}
}

function showChatLayer( boolean, type ){
	make_group_arr = [];
	if( boolean == false ){
		var layer = $("#chat_layer");
		if( layer ){
			document.body.removeChild(layer);
		}
		return;
	}

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
	if( type == "group" ){
		title.innerText = "새 그룹";
	} else {
		title.innerText = "새 메시지";
	}
	box.appendChild(title);

	var input_div = $("div");
	input_div.id = "chat_layer_input_box";

	var input = $("input");
	input.id = "chat_layer_input"
	input.className = "chat_search"
	input.placeholder = "검색";
	input.onfocus = function(){
		updateList(this.value);
	}
	input.onkeyup = input.onfocus;
	input.onfoucsout = input.onfocus;

	input_div.appendChild(input);

	box.appendChild(input_div);

	var list = $("div");
	list.id = "chat_layer_list";
	list.className = "chat_layer_div";
	box.appendChild(list);


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
	} else {
		list.style.height = "calc( 100% - 118px )";
	}

	layer.appendChild(box);

	document.body.appendChild(layer);
	updateList();
}

function updateList( query ){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(event){ if(xhr.readyState == 4 && xhr.status == 200) {
		if( xhr.responseText != "" ){
			var results = JSON.parse(xhr.responseText);
			var list = $("#chat_layer_list");
			while( list.firstChild ){
				list.removeChild(list.firstChild);
			}
			for( var i = 0; i < results.length; ++i ){
				if( results[i].uid ){
					if( results[i].uid == session.uid && results.length == 1 ){
						makeList();
					} else if( results[i].uid != session.uid ){
						list.appendChild(makeList(results[i]));
					}
				} else {
					list.appendChild(makeList(results[i].to));
				}
			}
		} else {
			makeList();
		}
	}}
	if( query == "" || query == undefined ){
		xhr.open("POST", "/@" + session.uid + "/following", false);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send();
	} else {
		xhr.open("POST", "/api/user/search", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('query='+query);
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
	if( title.innerText.indexOf("새 그룹") >= 0 || title.innerText.indexOf("명") >= 0 ){
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
				title.innerText = cnt + " 명과 대화하기";
				next.className = "chat_layer_menu_active";
				next.onclick = makeGroup;
			} else {
				title.innerText = "새 그룹";
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

function viewimg(url){
	var imglayer = $("#imglayer");
	var imgbox = $("#imgbox");
	var imgmenu = $("#imgmenu");
	var imgmenuhover = $("#imgmenuhover");
	var lefthover = $("#lefthover");
	var righthover = $("#righthover");

	imglayer.style.zIndex = "300";
	imglayer.style.visibility = "visible";
	imglayer.style.opacity = "1";
	imgbox.innerHTML = "<div id='helper'></div>";
	imgmenuhover.style.display = "block";
	imgmenu.style.display = "block";
	if( /(BB|iPad|iPhone|iPod|Android)/i.test( navigator.userAgent ) ){
		lefthover.style.display = "none";
		righthover.style.display = "none";
	} else {
		lefthover.style.display="block";
		righthover.style.display="block";
	}
	var img = $("img");
	img.id = "imglayer_img";
	img.src = url;
	imgdownload.href = img.src;
	imgdownload.download = img.src.split('/').pop() + '.png';
	img.onclick = function(){
		event.stopPropagation();
		event.preventDefault();
		var rightbtn = $("#rightbtn");
		rightbtn.click();
	}
	imgbox.appendChild(img);

	imgbox.childNodes[1].style.display="inline-block";
}

//이미지 메뉴 리사이징
function imgmenu_resize(){
	if(window.innerWidth < 530 ){
		imgmenu.style.display = "none";
	} else {
		imgmenu.style.display = "block";
	}
	imgmenu.style.left=(window.innerWidth - imgmenu.clientWidth - 20 )/2 + "px";
	//imgmenuhover.style.left=(window.innerWidth - imgmenu.clientWidth)/2 + "px";
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
			} else {
				span.innerText = info.last;
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

var make_group_arr = [];
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
