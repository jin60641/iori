'use strict';

inits["chat"] = {
	listeners : [],
	chat_panel_obj : {},
	make_group_arr : [],
	skip_obj : {},
	realfiles : [],
	addListener : function( element, event, handle ){
		element.addEventListener( event, handle, false );
		this.listeners.push({ element : element, event : event, handle : handle });
	},
	exit : function(){
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = this.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		document.body.removeChild($('#chat_wrap'));
		if( $('#chat_layer') ){
			document.body.removeChild($('#chat_layer'));
		}
        const socket_listeners = [ "chat_new", "update_last" ]
        for( let i = 0; i < socket_listeners.length; ++i ){
            socket.removeAllListeners(socket_listeners[i]);
        }

	},
	getChats : function( limit, type, dialog_id, scroll, dialog_scroll ){
		let that = this;
		let params = { limit : limit }
	
	
		if( type ){
			params.type = type;
		} else {
			params.type = location.pathname.split('/')[2];
		}
	
		if( dialog_id ){
			params.dialog_id = dialog_id;
		} else {
			params.dialog_id = location.pathname.split('/')[3];
		}
	
		if( limit == 0 ){
			params.limit = 1;
			params.skip = 0;
			that.skip_obj[params.dialog_id] += 1;
		} else {
			if( that.skip_obj[params.dialog_id] == undefined ){
				that.skip_obj[params.dialog_id] = 0;
			}
			params.skip = that.skip_obj[params.dialog_id];
			that.skip_obj[params.dialog_id] += params.limit;
		}
	
		let query = "";
		let param_key = Object.keys(params);
		for( let i = 0; i < param_key.length; ++i ){
			query += param_key[i] + '=' + params[param_key[i]] + "&";
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let chats;
			try {
				chats = JSON.parse(xhr.responseText);
			} catch(e){
				if( xhr.responseText.length < 20 ){
				}
				location.href = "/chat";
			}
		
	
			that.skip_obj[params.dialog_id] += ( chats.length - params.limit );
			let chat_dialog_box = $("#chat_dialog_box");
			if( !scroll ){
				chats.reverse();
			}
			for( let i = chats.length - 1; i >= 0; --i ){
				let chat_panel;
				let current_panel = $("#chat_panel");
				let current_id = current_panel.className.split('_').pop();
				if( chats[i].from.id == session.id ){
					chat_panel = current_panel;
				} else if( chats[i].type == "g" && current_id != chats[i].to.id ){
					chat_panel = that.chat_panel_obj[ "chat_dialogs_g_" + chats[i].to.id ];
				} else if( chats[i].type == "u" &&  chats[i].to.id == session.id && current_id != chats[i].from.id ){
					chat_panel = that.chat_panel_obj[ "chat_dialogs_u_" + chats[i].to.id ];
					if( chat_panel == undefined && current_panel.className == "chat_dialogs_u_" + chats[i].from.uid ){
						chat_panel = current_panel;
					}
				} else {
					chat_panel = current_panel;
				}
				if( current_id && current_id.length && chat_panel != undefined ){
					let chat = $("div");
					chat.id = "chat_" + chats[i].id;
					chat.className = "chat";
					let my_chat = false;
	
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
		
					let chat_profileimg;
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
					
					let chat_body = $("div");
					chat_body.className = "chat_body";
		
					let chat_body_name;
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
						let caret = $('div');
						caret.className = "chat_body_caret";
						let outer = $('div');
						outer.className ="chat_body_caret_outer";
						caret.appendChild(outer);
						let inner = $('div');
						inner.className = "chat_body_caret_inner";
						caret.appendChild(inner);
						chat_body.appendChild(caret);
						let chat_body_text = $("div");
						chat_body_text.className = "chat_body_text";
						chat_body_text.innerText = chats[i].text;
						chat_body.appendChild(chat_body_text);
					} else if ( chats[i].file ){
						let chat_body_file = $("img");
						chat_body_file.className = "chat_body_file";
						chat_body_file.src = "/files/chat/" + chats[i].id + '?' + new Date(chats[i].date);
						if( scroll ){
							chat_body_file.onload = function(){
								chat_panel.scrollTop = chat_panel.scrollHeight;
							}
						}
						chat_body_file.onclick = function(){
							let src = this.src.split('?');
							inits["imglayer"].viewimg(null,1,src[1],src[0],true);
						};
						chat_body.appendChild(chat_body_file);
					}
		
					chat.appendChild(chat_body);
					if( my_chat ){
						chat.className += " my_chat";
						chat.appendChild(chat_profileimg);
					}
		
		/*
					let previous = chat.previousElementSibling
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
					let dialog;
					let className = "chat_dialogs";
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
		
					let new_dialog = that.makeDialog( chats[i] );
					new_dialog.className = className;
					if( chats[i].type == "u" ){
						if( location.pathname.substr(6) == "u/" + chats[i].to.uid || location.pathname.substr(6) == "u/" + chats[i].from.uid ){
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
	},
	makeDialog : function( chat ){
		let that = this;
		let dialog = $("div");
		dialog.className = "chat_dialogs";
	
		let time = $("div");
		time.className = "chat_dialogs_time";
		time.innerText = that.getDateString(chat.date);
		dialog.appendChild(time);
		
		let img = $("img");
		dialog.appendChild(img);
	
		let message_wrap = $("div");
		message_wrap.className = "chat_dialogs_message_wrap"
	
		let name = $("div");
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
	
		dialog.onclick = function(e){
			that.openDialog(e,this);
		}
	
		return dialog;
	}, 
	openDialog : function(evt,target){
		let that = this;
		let dialog = target;
		let chat_panel = $("#chat_panel");
		if( chat_panel.className.length ){
			that.chat_panel_obj[chat_panel.className] = chat_panel;
		}
	
		if( dialog == undefined || dialog.id == undefined ){
			dialog = $( "#chat_dialogs_" + location.pathname.substr(6).replace('/','_') );
		}
	
		let dialog_id;
		if( dialog != undefined ){
			let type = dialog.id.split('_')[2];
			dialog_id = dialog.id.split('_').slice(3).join('_')
			/*
			if( dialog_id == session.uid ){
				alert("잘못된 접근입니다");
				return location.href = "/chat";
				
			}
			*/
			history.pushState(null,null,"/chat/" + type + "/" + dialog_id);
	
			dialog_id = dialog.id
			that.showChatLayer(false);
			dialog = $("#"+dialog_id)
		}
	
		if( dialog && dialog.className.indexOf("selected") >= 0 ){
			chat_panel.scrollTop = chat_panel.scrollHeight;
			return false;
		}
		let chat_input = $("#chat_input");
		let file_input = $("#chat_file_input");
		file_input.value = "";
		chat_input.value = "";
	
		let dialogs = $("#chat_dialog_box").childNodes;
		for( let i = 0; i < dialogs.length; ++i ){
			dialogs[i].className = "chat_dialogs"
		}
	
		if( dialog != undefined ){
			if( dialog.scrollIntoViewIfNeeded ){
				dialog.scrollIntoViewIfNeeded();	
			}
			dialog.className = "chat_dialogs chat_dialogs_selected";
		}
	
		if( dialog && dialog.id && that.chat_panel_obj[dialog.id] ){
			chat_box.replaceChild(that.chat_panel_obj[dialog.id],chat_panel);
		} else {
			let new_panel = chat_panel.cloneNode(true);
			new_panel.addEventListener('scroll', function(e){
				if( this.scrollTop <= 200 ){
					that.getChats(10);
				}
			});
	
			while( new_panel.firstChild ){
				new_panel.removeChild(new_panel.firstChild);
			}
			chat_box.replaceChild(new_panel,chat_panel);
			new_panel.className = dialog_id;
		}
	
		let new_panel;
		if( dialog && dialog.id ){
			new_panel = that.chat_panel_obj[ "chat_dialogs_" + dialog.id.split('_')[2] + '_' + dialog.id.split('_').slice(3).join('_') ];
		}
		if( new_panel == undefined ){
			that.getChats(20,null,null,true);
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
	
		that.updateTitle();
	},
	getDateString : function(origin_date){
		let that = this;
		let date = new Date(origin_date);
		let now = new Date();
		let date_time = Math.floor(date.getTime()/1000)
		let now_time = Math.floor(now.getTime()/1000)
		let gap = now_time - date_time;
		if( gap < 86400 ){
			return ((date.getDate()!=now.getDate())?"어제 ":"") + (date.getHours()<=9?"0":"") + date.getHours() + ":" + (date.getMinutes()<=9?"0":"") + date.getMinutes();
		} else if( date.getDate() != now.getDate() ){
			return (date.getYear()-100)+'/'+(date.getMonth()<=8?"0":"")+(date.getMonth()+1)+'/'+(date.getDate()<=9?0:"")+date.getDate();
		}
	},
	inputResize : function(event){
		let that = this;
		let obj = event.target;
		let chat_panel = $("#chat_panel");
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
	},
	openFile : function(event){
		let that = this;
		event.stopPropagation();
		event.preventDefault();
	/*
		if( event.dataTransfer ){
			event.dataTransfer.dropEffect = 'copy';
		}
	*/
	},
	captureKey : function(event){
		let that = this;
		if( event.keyCode == 13 && !event.shiftKey){
			event.stopPropagation();
			event.preventDefault();
			that.chatWrite();
		}
		that.inputResize(event);
	},
	chatWrite : function(){
		let that = this;
		let chat_input = $("#chat_input");
		let file_input = $("#chat_file_input");
		let tmp = chat_input.value;
		let pathname = location.pathname.split('/');
		let type = pathname[2];
		let to_id = pathname[3];
		for( let i = 0; i < file_input.files.length; ++i ){
			that.realfiles.push( file_input.files[i] );
		}
		file_input.value = "";
		if( that.realfiles.length >= 1 ){
			for( let i = 0; i < that.realfiles.length; ++i ){
				let formdata = new FormData();
				formdata.append("type",type);
				formdata.append("to_id",to_id);
				formdata.append("file",that.realfiles[i]);
				let xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
					let to = JSON.parse(xhr.responseText);
					if( to.uid != session.uid ){
						that.getChats(0,null,null,true,true);
					}
				}}
				xhr.open("POST","/api/chat/writechat", false);  xhr.send(formdata);
			}
			that.realfiles = [];
		} else if( tmp.length >= 1 ){
			let formdata = new FormData();
			formdata.append("type",type);
			formdata.append("to_id",to_id);
			formdata.append("text",tmp);
	
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200){
				let to = JSON.parse(xhr.responseText);
				if( to.uid != session.uid ){
					that.getChats(0,null,null,true,true);
				}
			}}
			xhr.open("POST","/api/chat/writechat", false);  xhr.send(formdata);
			chat_input.value = "";
		} else {
			return 0;
		}
	},
	showChatMenu : function( boolean ){
		let that = this;
		if( $('#chat_dialog').style.display == "none" && boolean != false ){
			$('#chat_dialog').style.display = "block";
			$('#chat_box').style.display = "none";
			$('#chat_title').innerText = "";
			$('.chat_dialogs_selected')[0].className = "chat_dialogs";
			$('#chat_menu').style.backgroundImage = "";
			$('#chat_menu').style.backgroundSize = "";
			history.pushState(null,null,"/chat");
			return;
		}
		let chat_menu_box = $("#chat_menu_box");
		if( boolean ){
			chat_menu_box.style.display = "block";
		} else if( boolean == false ){
			chat_menu_box.style.display = "";
		}
	},
	showChatLayer : function( boolean, type ){
		let that = this;
		that.make_group_arr = [];
		let uids = [];
		if( boolean == false ){
			let layer = $("#chat_layer");
			if( layer ){
				document.body.removeChild(layer);
			}
			return;
		} else if( type == "invite" ){
			let list = $('#chat_layer_list').childNodes;
			for( let i = 0; i < list.length; ++i ){
				uids.push(list[i].id.split('_').pop());
			}
			that.showChatLayer(false);
		}
	
		that.showChatMenu(false);
	
		let layer = $("div");
		layer.onclick = function(){
			that.showChatLayer(false);
		}
		layer.id = "chat_layer";
		
		let layer_close = $("div");
		layer_close.id = "chat_layer_close"
		layer_close.onclick = layer.onclick;
		layer.appendChild(layer_close);
	
	
		let box = $("div");
		box.id = "chat_layer_box";
		box.onclick = function(event){
			event.stopPropagation();
			event.cancelBubble = true;
		}
		
		let box_close = $("div");
		box_close.id = "chat_layer_box_close";
		box_close.onclick = layer_close.onclick;
		box.appendChild(box_close);
	
		let title = $("div");
		title.id = "chat_layer_title"
		box.appendChild(title);
		if( type == "info" ){
			title.innerText = "그룹 정보";
			
			let info_div = $("div");
			info_div.id = "chat_info_div";
			
			let info_img = $("div");
			/*
			info_img.onclick = function(){
				viewimg(null,1,new Date(),this.style.backgroundImage.replace(/url\(|\)$|"/ig, ''),false);
			}
			*/
			info_img.id = "chat_info_img";
			info_img.style.backgroundImage = "url('/files/group/" + location.pathname.split('/')[3] + "')";
			info_div.appendChild(info_img);
		
			let info_text = $("div");
			info_text.id = "chat_info_text";
			
			let chat_title = $("#chat_title");
	
			let info_name = $("div");
			info_name.id = "chat_info_name";
			info_name.innerText = chat_title.firstChild.wholeText;
			info_text.appendChild(info_name);
	
			let info_cnt = $("div");
			info_cnt.id = "chat_info_cnt";
			info_cnt.innerText = chat_title.lastChild.innerText;
			info_text.appendChild(info_cnt);
	
			info_div.appendChild(info_text);
		
			box.appendChild(info_div);
			
			let info_menu = $("div");
			info_menu.id = "chat_info_menu";
	
			let info_invite = $("div");
			info_invite.id = "chat_info_menu_invite";
			info_invite.innerText = "초대";
			info_invite.onclick = function(){
				that.showChatLayer(true,"invite");
			}
			info_menu.appendChild(info_invite);
	
			let info_exit = $("div");
			info_exit.id = "chat_info_menu_exit";
			info_exit.innerText = "나가기";
			info_exit.onclick = function(e){
				that.groupExit(e);
			}
	
			info_menu.appendChild(info_exit);
		
			box.appendChild(info_menu)
			
		} else {
			let input_div = $("div");
			input_div.id = "chat_layer_input_box";
	
			let input = $("input");
			input.id = "chat_layer_input"
			input.className = "chat_search"
			input.placeholder = "검색";
			input.onfocus = function(){
				that.updateList(type);
			}
	
			input_div.appendChild(input);
	
			box.appendChild(input_div);
			if( type == "group" ){
				title.innerText = "새 그룹";
			} else if ( type == "invite" ){
				title.innerText = "초대하기";
				input.onfocus = function(){
					that.updateList(type,uids);
				}
			} else {
				title.innerText = "새 메시지";
			}
	
			input.onkeyup = input.onfocus;
			input.onfoucsout = input.onfocus;
		}
	
		let list = $("div");
		list.id = "chat_layer_list";
		list.className = "chat_layer_div";
		box.appendChild(list);
		layer.appendChild(box);
		document.body.appendChild(layer);
	
		if( type == "info" ){
			that.updateList("info", location.pathname.split('/')[3]);
		} else if( type == "invite" ){
			that.updateList("invite",uids);
		} else {
			that.updateList(type);
		}
	
		if( type == "group" ){
			let menu = $("div");
			menu.id = "chat_layer_menu";
	
			let group = $("div");
			group.id = "chat_layer_group";
			group.className = "chat_layer_div";
	
			let group_file = $("input");
			group_file.type = "file";
			group_file.id = "chat_layer_group_file";
			group_file.onchange = function(e){
				that.openfilegroup(e);
			}
			group.appendChild(group_file);
			
			let group_label = $("label");
			group_label.htmlFor = "chat_layer_group_file";
			group_label.id = "chat_layer_group_label";
			group.appendChild(group_label);
	
			let group_name = $("input");
			group_name.id = "chat_layer_group_name";
			group_name.autocomplete = "off";
			group_name.placeholder = "그룹명을 입력하세요";
			group_name.onkeyup = function(){
				if( this.value.length ){
					let next = $("#chat_layer_menu_next");
					next.className = "chat_layer_menu_active";
					next.onclick = function(){
						let formdata = new FormData();
						let file_input = $("#chat_layer_group_file");
						let name = $("#chat_layer_group_name");
	
						formdata.append("file",file_input.files[0]);
						formdata.append("uids",that.make_group_arr);
						formdata.append("name",name.value);
	
						let xhr = new XMLHttpRequest();
						xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
							if( xhr.responseText ){
								let gid = xhr.responseText;
								history.pushState( null, null, "/chat/g/" + gid );
								that.showChatLayer(false);
								that.openDialog();
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
	
			let cancle = $("span");
			cancle.id = "chat_layer_menu_cancle";
			cancle.innerText = "취소";
			cancle.className = "chat_layer_menu_active";
			cancle.onclick = function(){
				that.showChatLayer(false);
			}
	
			menu.appendChild(cancle);
	
			let next = $("span");
			next.id = "chat_layer_menu_next";
			next.innerText = "그룹생성";
			menu.appendChild(next);
	
			box.appendChild(menu);
		} else if( type == "invite" ){
			let menu = $("div");
			menu.id = "chat_layer_menu";
	
			let cancle = $("span");
			cancle.id = "chat_layer_menu_cancle";
			cancle.innerText = "취소";
			cancle.className = "chat_layer_menu_active";
			cancle.onclick = function(){
				that.showChatLayer(false);
			}
			menu.appendChild(cancle);
	
			let next = $("span");
			next.id = "chat_layer_menu_next";
			next.innerText = "초대하기";
			menu.appendChild(next);
	
			box.appendChild(menu);
			
		} else {
			list.style.height = "calc( 100% - 203px )";
		}
		if( event ){
			that.showChatMenu(false);
			event.stopPropagation();
		}
	},
	updateList : function( type, param ){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText != "" ){
				let results = JSON.parse(xhr.responseText);
				let list = $("#chat_layer_list");
				while( list.firstChild ){
					list.removeChild(list.firstChild);
				}
				if( type == "info" ){
					results = results.users;
				}
				for( let i = 0; i < results.length; ++i ){
					if( results[i].to ){
						results[i] = results[i].to;
					}
					if( type == "invite" && param.indexOf(results[i].uid) >= 0 ){
						continue;
					}
					if( results[i].uid == session.uid ){
						if( list.firstElementChild ){
							list.insertBefore(that.makeList(results[i]),list.firstElementChild);	
						} else {
							list.insertBefore(that.makeList(results[i]),list.firstElementChild);	
						}
					} else {
						list.appendChild(that.makeList(results[i]));	
					}
				}
			} else {
				that.makeList();
			}
		}}
	
		let input = $("#chat_layer_input");
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
	},
	makeList : function( user ){
		let that = this;
		if( user == undefined ){ //검색결과 없을때 디자인 마땅히없음
			return;
		}
			
		let dialog = $("div");
		dialog.className = "chat_dialogs";
	
		let img = $("img");
		dialog.appendChild(img);
	
		let dialog_message_wrap = $("div");
		dialog_message_wrap.className = "chat_dialogs_message_wrap"
	
		dialog.id = "chat_dialogs_u_" + user.uid;
		img.src = "/files/profile/" + user.uid + '?' + new Date();
		dialog_message_wrap.innerHTML = "<div>" + user.name + "</div><span>@" + user.uid + "</span>";
	
	//	dialog_message_wrap.innerHTML += "chat";
	
		dialog.appendChild(dialog_message_wrap);
	
		let title = $("#chat_layer_title");
		let group_flag = false;
		if( title.innerText.indexOf("새 그룹") >= 0 || title.innerText.indexOf("대화") >= 0 ){
			group_flag = true;
		}
		let invite_flag = false;
		if( title.innerText.indexOf("초대") >= 0 ){
			invite_flag = true;
		}
		if( group_flag || invite_flag ){
			dialog.onclick = function(){
				let id = this.id.split('_').pop();
				let title = $("#chat_layer_title");
				if( this.className.indexOf("chat_dialogs_selected") == -1 ){
					this.className = "chat_dialogs chat_dialogs_selected group_selected";
					that.make_group_arr.push(id);
				} else {
					this.className = "chat_dialogs";
					that.make_group_arr.splice(that.make_group_arr.indexOf(id),1);
				}
				let next = $("#chat_layer_menu_next");
				let cnt = that.make_group_arr.length;
				if( cnt ){
					if( group_flag ){
						title.innerText = cnt + " 명과 대화하기";
						next.onclick = function(e){
							that.makeGroup(e);
						}
					} else {
						title.innerText = cnt + " 명을 초대하기";
						next.onclick = function(e){
							that.makeGroup(e);
						}
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
			if( that.make_group_arr.indexOf(user.uid) >= 0 ){
				dialog.className = "chat_dialogs chat_dialogs_selected group_selected";
			}
		} else {
			dialog.onclick = function(e){
				that.openDialog(e,this);
			}
		}
		
		return dialog;
	},
	filterDialogs : function(){
		let that = this;
		let value = $("#chat_dialog_search_input").value;
		let dialogs = $("#chat_dialog_box").childNodes;
		let names = $(".chat_dialogs_name");
		if( value != "" ){
			for( let i = 0; i < names.length; ++i ){
				if( names[i].innerText.indexOf(value) < 0 ){
					dialogs[i].style.display = "none";
				} else {
					dialogs[i].style.display = "";
				}
			}
		} else {
			for( let i = 0; i < dialogs.length; ++i ){
				dialogs[i].style.display = "";
			}
		}
	},
	imgmenu_keydown : function(e){
		let that = this;
		let imglayer = $("#imglayer");
		let imgmenuhover = $("#imgmenuhover");
		let lefthover = $("#lefthover");
		let righthover = $("#righthover");
	
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
	},
	updateTitle : function(){
		let that = this;
		let title = $("#chat_title");
		let pathname = location.pathname.split('/');
		let params = {
			type : pathname[2],
			dialog_id : pathname[3]
		}
		let query = "";
		let param_key = Object.keys(params);
		for( let i = 0; i < param_key.length; ++i ){
			query += param_key[i] + '=' + params[param_key[i]] + "&";
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText != "" ){
				let info = JSON.parse(xhr.responseText);
				title.innerText = info.name;
				let span = $("span");
				if( params.type == "g" ){
					span.innerText = info.users.length + "명이 참여중입니다";
					title.onclick = function(){
						that.showChatLayer("true","info");
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
	},
	groupExit : function(){
		let that = this;
		if(!confirm("정말로 그룹에서 나가시겠습니까?")){
			return;
		}
	
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText == "success" ){
				location.href = "/chat";
			}
		}}
		xhr.open("POST", "/api/chat/exit", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('gid='+location.pathname.split('/')[3]);
	},
	groupInvite : function(){
		let that = this;
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			if( xhr.responseText == "success" ){
				that.showChatLayer(false);
			}
		}}
		xhr.open("POST", "/api/chat/invite", false); 
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
		xhr.send('uids='+that.make_group_arr.toString()+'&gid='+location.pathname.split('/')[3]);
	},
	makeGroup : function(){
		let that = this;
		if( that.make_group_arr.length == 1){
			history.pushState(null,null,"/chat/u/" + that.make_group_arr[0] );
			return that.openDialog();
		}
	
		$("#chat_layer_menu_cancle").onclick = function(){
			$("#chat_layer_list").style.display = "block";
			$("#chat_layer_group").style.display = "none";
			$("#chat_layer_menu_next").className = "chat_layer_menu_active";
			$("#chat_layer_menu_next").onclick = that.makeGroup;
			$("#chat_layer_group_name").value = "";
			$("#chat_layer_group_file").value = "";
			$("#chat_layer_group_label").style.backgroundImage = "";
			this.onclick = function(){
				that.showChatLayer(false);
			}
		}
	
		$("#chat_layer_input").value = "";
		$("#chat_layer_list").style.display = "none";
		$("#chat_layer_group").style.display = "block";
		this.className = "";
	},
	openfilegroup : function(event){
		let that = this;
		event.stopPropagation();
		event.preventDefault();
		let input = event.target;
		let files = input.files;
		let label = $("#chat_layer_group_label");
	
		let reader = new FileReader();
		reader.addEventListener("load",function(event){
			label.style.backgroundImage = "url('" + event.target.result + "')";
		});
		reader.readAsDataURL(files[0]);
	},
	openfilechat : function(event){
		let that = this;
		event.stopPropagation();
		event.preventDefault();
		let file_input = $("#chat_file_input");
		if( event.clipboardData ){
			let items = (event.clipboardData  || event.originalEvent.clipboardData).items;
			for( let i = 0; i < items.length; ++i ){
				let item = items[i];
				if( item.type.indexOf("image") === 0 ){
					that.realfiles.push( item.getAsFile() );
				}
			}
		} else {
			let files = event.dataTransfer.files;
			for( let i = 0; i < files.length; ++i ){
				that.realfiles.push( files[i] );
			}
		}
		that.DragOut();
		that.chatWrite();
	},
	DragOut : function(evt){
		let that = this;
		if( evt != undefined ){
			evt.stopPropagation();
			evt.preventDefault();
		}
		let obj = $("#chat_input").style;
		obj.border = "";
		obj.marginLeft = "";
		obj.marginTop = "";
		obj.marginRight = "";
	},
	DragOver : function(evt){
		let that = this;
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
		let obj = $("#chat_input").style;
		obj.border = "2px dashed #bbb";
		obj.marginLeft = "5px";
		obj.marginTop = "5px";
		obj.marginRight = "9px";
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
		xhr.open("POST","/chat", false);  xhr.send();
	},
	start : function(dialogs){
		let that = this;

		let chat_wrap = $("div");
		chat_wrap.id = "chat_wrap";
	
		let chat_header = $("div");
		chat_header.id = "chat_header";
	
		let chat_menu = $("div");
		chat_menu.id = "chat_menu";
		chat_menu.onclick = function( event ){
			event.stopPropagation();
			that.showChatMenu( true );
		};
		
		let chat_menu_text = $("div");
		chat_menu_text.id = "chat_menu_text";
		chat_menu.appendChild(chat_menu_text)
		chat_menu_text.innerText = "새 메시지";
	
		chat_menu.appendChild(chat_menu_text);
	
		let chat_menu_box = $("div");
		chat_menu_box.id = "chat_menu_box";
		
		let chat_new_user = $("div");
		chat_new_user.id = "chat_new_user";
		chat_new_user.innerText = "1:1 시작하기";
		chat_new_user.onclick = function(){
			that.showChatLayer(true,"user");
		}
		chat_menu_box.appendChild(chat_new_user);
	
		let chat_new_group = $("div");
		chat_new_group.id = "chat_new_group";
		chat_new_group.innerText = "그룹생성";
		chat_new_group.onclick = function(){
			that.showChatLayer(true,"group");
		}
		chat_menu_box.appendChild(chat_new_group);
	
		
		chat_menu.appendChild(chat_menu_box);
	
		chat_header.appendChild(chat_menu);
	
		let chat_title = $("div");
		chat_title.id = "chat_title";
		chat_header.appendChild(chat_title);
	
		chat_wrap.appendChild(chat_header);
	
		let chat_dialog = $("div");
		chat_dialog.id = "chat_dialog";
		chat_wrap.appendChild(chat_dialog);
		
		let chat_dialog_search = $("div");
		chat_dialog_search.id = "chat_dialog_search";
		chat_dialog_search.className = "chat_dialogs";
		
		let chat_dialog_search_input = $("input");
		chat_dialog_search_input.id = "chat_dialog_search_input";
		chat_dialog_search_input.className = "chat_search";
		chat_dialog_search_input.type = "text";
		chat_dialog_search_input.placeholder = "검색";
		chat_dialog_search_input.onkeyup = that.filterDialogs;
		chat_dialog_search_input.onfocusout = that.filterDialogs;
		chat_dialog_search.appendChild(chat_dialog_search_input);
	
		chat_dialog.appendChild(chat_dialog_search);
	
		let chat_dialog_box = $("div");
		chat_dialog_box.id = "chat_dialog_box";
		chat_dialog.appendChild(chat_dialog_box);
	
		for( let i = 0; i < dialogs.length; ++i ){
			chat_dialog_box.appendChild(that.makeDialog(dialogs[i]));
		}
	
		let chat_box = $("div");
		chat_box.id = "chat_box";
		chat_box.addEventListener('dragover', function(e){
			that.DragOver(e);
		}, false);
		chat_box.addEventListener('dragleave', function(e){
			that.DragOut(e);
		}, false);
		chat_box.addEventListener('drop', function(e){
			that.openfilechat(e);
		}, false);
		chat_wrap.appendChild(chat_box);
	
		let chat_panel = $("div");
		chat_panel.id = "chat_panel";
		chat_panel.addEventListener('scroll', function(e){
			if( chat_panel.scrollTop <= 200 ){
				that.getChats(10);
			}
		});
	
		chat_box.appendChild(chat_panel);
	
		let send_panel = $("div");
		send_panel.id = "send_panel";
	
		let chat_input = $("textarea");
		chat_input.placeholder = "메세지를 입력하세요";
		chat_input.id = "chat_input";
		send_panel.appendChild(chat_input);

		chat_input.onpaste = function(e){
			that.openfilechat(e);
		}
	
		chat_input.onkeypress = function(e){
			that.inputResize(e);
		}
		chat_input.onkeyup = function(e){
			that.inputResize(e);
		}
		chat_input.onkeydown = function(e){
			that.captureKey(e);
		}
	
	
		let chat_file_input = $("input");
		chat_file_input.type = "file";
		chat_file_input.id = "chat_file_input";
		chat_file_input.accept = "image/*";
		chat_file_input.multiple = "multiple";
		chat_file_input.onchange = function(){
			that.chatWrite();
		}
		
		send_panel.appendChild(chat_file_input);
	
		let chat_file_label = $("label");
		chat_file_label.id = "chat_file_label";
		chat_file_label.htmlFor = "chat_file_input";
		send_panel.appendChild(chat_file_label);
	
		let send_btn = $("div");
		send_btn.innerText = "보내기";
		send_btn.id = "send_btn";
		send_btn.onclick = function(e){
			that.chatWrite();
		}
		send_panel.appendChild(send_btn);
	
		chat_box.appendChild(send_panel);
		
		let default_dialog = $("div");
		default_dialog.id = "default_dialog";
		default_dialog.innerText = "채팅을 선택해주세요";
		chat_box.appendChild(default_dialog);
		
		document.body.appendChild(chat_wrap);	
	
		socket.on('update_last', that.updateTitle );
	
		socket.on('chat_new', function( data ){
			that.getChats( 0, data.type, data.dialog_id, true, true );
		});
		
		that.addListener(window,'keydown', function(e){
			if( e.keyCode == 27 ){
				that.showChatLayer(false);
			}
		});
		that.addListener(window,'keydown', that.imgmenu_keydown );
	
		that.addListener(window,'popstate', function(){
			that.openDialog();
		});

		that.addListener(window,'click', function(e){
			that.showChatMenu(false);
		});
	
		if( location.pathname.split('/').length >= 3 ){
			that.openDialog();
		}
	}
}
