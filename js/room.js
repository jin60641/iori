'use strict';

inits["room"] = {
	init : function(){
		let body = $('#wrap_mid');
		let room_quick = $("div");
		room_quick.innerText = "빠른시작";
		room_quick.className = "btn";
		room_quick.onclick = function(){
			if( rooms.length >= 1 ){
				location.href = "/chat/" + rooms[ Math.floor(Math.random()*rooms.length) ];
			} else {
				alert("입장 가능한 방이 없습니다.");
			}
		}
		body.appendChild(room_quick);
	
		let room_create = $("div")
		room_create.innerText = "+";
		room_create.className = "btn";
		room_create.onclick = createRoom;
		body.appendChild(room_create);
	
		let room_menu = $("div");
		room_menu.onkeyup = function(){
			if( event.keyCode == 13 ){
				room_menu_create.onclick();
			}
		}
		room_menu.id = "room_menu";
//		room_menu.innerHTML = '<div id="room_menu_head"><img src="/img/room_close.jpg" onclick="createRoom(event, true)"></div>';
	
		let room_menu_body = $("div");
		room_menu_body.id = "room_menu_body";
		room_menu.appendChild(room_menu_body);
	
		let label_title = $("div");
		label_title.className = "label";
		label_title.innerText = "방 제목";
		room_menu_body.appendChild( label_title );
	
		let input_title = $("input");
		input_title.type = "text";
		input_title.id = "room_menu_title";
		if( /(iPhone|iPod|iPad)/i.test( navigator.userAgent ) ){
			input_title.style.width = "calc( 80vw - 170px )";
		}
		room_menu_body.appendChild( input_title );
		let label_genre = $("div");
		label_genre.className = "label";
		label_genre.innerText = "장르";
		room_menu_body.appendChild( label_genre );
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let result = JSON.parse( xhr.responseText );
			let genre = $("select");
			genre.name = "genre";
			for( let i = 0; i < result.length; ++i ){
				let option = $("option");
				option.innerText = result[i];
				option.value = result[i];
				genre.appendChild( option );
			}
			room_menu_body.appendChild( genre );
//			room_menu_body.innerText += "<br><div class='label' id='room_menu_public'>공개설정</div>";
			let open_img = $("img");
			open_img.src = "/img/room_menu_open_orange.jpg";
			open_img.onclick = function(){
				if( open_img.src.indexOf("room_menu_open_gray.jpg") >= 0 ){
					open_img.src = "/img/room_menu_open_orange.jpg";
					close_img.src = "/img/room_menu_close_gray.jpg";
					room_menu_password.style.display = "none";
					room_menu_password.value = "";
				}
			}
			room_menu_body.appendChild(open_img);
	
			let close_img = $("img");
			close_img.src = "/img/room_menu_close_gray.jpg";
			close_img.onclick = function(){
				if( close_img.src.indexOf("room_menu_close_gray.jpg") >= 0 ){
					open_img.src = "/img/room_menu_open_gray.jpg";
					close_img.src = "/img/room_menu_close_orange.jpg";
					room_menu_password.style.display = "block";
				}
			}
			room_menu_body.appendChild(close_img);
	
			let room_menu_password = $("input");
			room_menu_password.placeholder = "비밀번호";
			room_menu_password.id = "room_menu_password";
			room_menu_password.style.display = "none";
			room_menu_password.type = "txet";
			room_menu_body.appendChild(room_menu_password);
		
			let room_menu_create = $("div");
			room_menu_create.id = "room_menu_create";
			room_menu_create.innerText = "방 생성";
			room_menu_create.onclick = function(){
				let selected;
				let options = document.getElementsByTagName("option");
				for( let i = 0; i < options.length; ++i ){
					if( options[i].selected ){
						selected = options[i].value;
					}
				}
				if( room_menu_title.value == "" ){
					alert("방 제목을 입력해주세요");
				} else if( room_menu_title.value.length >= 11 ){
					alert("방 제목은 최대 10글자까지입니다.");
				} else if( selected.length == null ){
					alert("장르를 선택해주세요");
				} else {
					socket.emit('room_create', { title : room_menu_title.value, genre : selected, password : room_menu_password.value });
				}
			}
			room_menu_body.appendChild(room_menu_create);
			//room_menu_body.innerHTML += "<img src='/img/room_menu_open.jpg'><img src='/img/room_menu_close.jpg'>";
		}};
	
		xhr.open("POST", "/getgenre", false); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send();
		room_menu.style.display = "none";
		document.body.appendChild( room_menu );
		
		socket.emit( 'room_list' );
	
		socket.on('room_create', function( data ){
			 location.href = '/chat/' + data;
		});
		
		socket.on( 'room_list' , function(data){
			let old_list = document.getElementsByClassName("room");
			for( let i = old_list.length - 1; i >= 0; --i ){
				body.removeChild(old_list[i]);
			}
			rooms = Object.keys(data)
			for( let i = 0; i < rooms.length; i++ ){
				let cnt = 0;
				for( let j = 0; j < data[ rooms[i] ].slot.length; ++j ){
					if( data[ rooms[i] ].slot[j] != "close" ){
						++cnt;
					}
				}
				let room = $("div");
				room.className = "room";
	
				let title = $("div");
				title.style.background = "url('/img/room_background?" + rooms[i] + "')";
				title.className = "title";
				title.innerText = decodeURI( rooms[i] );
				room.appendChild(title);
		
				let profile = $("img");
				profile.className = "profile";
				profile.src = "/profileimg/" + data[ rooms[i] ].host;
				room.appendChild(profile);
		
				let genre = $("div");
				genre.className = "genre";
				genre.innerText = data[ rooms[i] ].genre;
				room.appendChild(genre);
	
				let people = $("div");
				people.className = "people";
				people.innerText = Object.keys( data[ rooms[i] ].users ).length + "/" + cnt;
				room.appendChild(people);
			
				body.appendChild(room);
				if(data[ rooms[i] ].state == "game"){
					room.style.backgroundColor="#ccc";
					rooms.splice(i,1)
					room.onclick = function(){
						alert("진행중인 게임입니다.");
					}
				} else if( people.innerText.split('/')[0] == people.innerText.split('/')[1] ){
					room.onclick = function(){
						alert("방에 빈 자리가 없습니다.")
					}
				} else if( data[ rooms[i] ].password.length >= 1 ){
					let password = $("div");
					password.className = "password";
					password.id = data[ rooms[i] ].password ;
					room.appendChild(password);
					room.onclick = function(){
						let pw = prompt("비밀번호를 입력해주세요");
						if( pw ){
							if( pw == this.lastChild.id ){
								location.href = "/chat/" + this.firstChild.innerText;
							} else {
								alert("비밀번호가 틀렸습니다.");
							}
						}
					}
					rooms.splice(i,1)
				} else {
					room.onclick = function(){
						location.href = "/chat/" + this.firstChild.innerText;
					}
				}
				
			}
		});
	},
	createRoom : function( event, viewing ){
		if( viewing ){
			room_menu.style.display = "none";
			open_img.onclick();
			room_menu_title.value = "";
			room_menu_password.value = "";
		} else {
			room_menu.style.display = "block";
		}
	},
	exit : function(){
        const socket_listeners = [ "room_create", "room_list" ]
        for( let i = 0; i < socket_listeners.length; ++i ){
            socket.removeAllListeners(socket_listeners[i]);
        }
		document.body.removeChild($('#room_menu'));
	}
}

