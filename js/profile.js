postOption.uid = user.id;

window.addEventListener('load', function(){
	body = document.createElement("div");
	body.id = "body";
	document.body.insertBefore(body,document.body.firstChild);

	container = document.createElement("div");
	container.id = "container";
	body.appendChild(container);


	var headerimg_form = document.createElement("form");
	headerimg_form.action="/api/user/headerimg";
	headerimg_form.id = "headerimg_form";
	headerimg_form.method="post";
	headerimg_form.enctype="multipart/form-data";

	var headerimg_label = document.createElement("label")
	headerimg_label.style.background = "url('/profile_header/" + user.id + "')";
	headerimg_form.appendChild(headerimg_label);

	var headerimg_file = document.createElement("input");
	headerimg_file.type = "file";
	headerimg_file.accept = "image/*";
	headerimg_file.id = "headerimg_file";
	headerimg_file.name = "headerimg_file";
	headerimg_file.style.display = "none";
	headerimg_form.appendChild(headerimg_file);

	var profileimg_form = document.createElement("form");
	profileimg_form.action="/api/user/profileimg";
	profileimg_form.id = "profileimg_form";
	profileimg_form.method="post";
	profileimg_form.enctype="multipart/form-data";

	var profileimg_label = document.createElement("label")
	profileimg_form.appendChild(profileimg_label);

	var profileimg_file = document.createElement("input");
	profileimg_file.type = "file";
	profileimg_file.accept = "image/*";
	profileimg_file.id = "profileimg_file";
	profileimg_file.name = "profileimg_file";
	profileimg_file.style.display = "none";
	profileimg_form.appendChild(profileimg_file);

	var user_img = document.createElement("img");
	user_img.id = "user_img";
	user_img.src = "/files/profile/" + user.id;
	profileimg_label.appendChild(user_img);	

	container.appendChild(headerimg_form);
	container.appendChild(profileimg_form);

	profileimg_label.style.cursor = "pointer";


	if( user.id == session.id ){
		profileimg_label.htmlFor = "profileimg_file";
		headerimg_label.htmlFor = "headerimg_file";
		profileimg_file.onchange = headerimg_file.onchange = function(event){
			event.target.parentNode.submit();
		}
	} else {
		user_img.onclick = function( event ){
			viewimg(0,1,new Date(),"/profileimg/" + user.id);
			event.cancleBubble = true;
		}

		var user_chat = document.createElement("div");
		user_chat.id = "user_chat";
		user_chat.innerText = "ㅁ";
		user_chat.onclick = function(){
			location.href = "/chat/#u?" + user.uid;
		}
		container.appendChild(user_chat);
		
		var user_follow = document.createElement("div");
		user_follow.id = "user_follow";
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
	}

	user_name = document.createElement("div");
	user_name.id = "user_name";
	user_name.innerHTML = user.name;
	container.appendChild(user_name);

	user_userid = document.createElement("div");
	user_userid.id = "user_userid";
	user_userid.innerHTML = "@" + user.uid;
	container.appendChild(user_userid);


/*
	friend_obj = document.createElement("div");
	body.appendChild(friend_obj);
*/
//	makeFriendList(friend_obj,user.id);

	var x = new XMLHttpRequest();
	x.onreadystatechange = function (event){
		if (x.readyState == 4 && x.status == 200){
			if(x.responseText.length >= 1 ){
				friend_box.innerText = x.responseText;
				friend_box.onclick = function(){
					if( friend_box.innerText == "no" ){
						friendAdd(userid,user_name.innerHTML);
						this.innerText = "request";
					} else if( friend_box.innerText == "request" || friend_box.innerText == "friend" ){
						friendDel(userid);
						friend_box.innerText = "no";
					} else if( friend_box.innerText == "me" ){
						location.href="/myinfo";
					}
					friend_box.style.backgroundImage =" url('/img/friend_" + friend_box.innerText + ".jpg')";
				}
				friend_box.style.backgroundImage =" url('/img/friend_" + friend_box.innerText + ".jpg')";
			}
		}
		container.appendChild(friend_box);
	}
//	x.open("POST","/isfriend", false); x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); x.send('id='+user.uid);
	window.addEventListener('scroll', resizeContainer );
	window.addEventListener('resize', resizeContainer );
});

function resizeContainer(){
	/*
	// for absolute
	if( document.body.scrollTop <= body.clientHeight + 42 - 130 ){
		container.style.top = "42px";
	} else {
		container.style.top = document.body.scrollTop + 42 - body.clientHeight + 80 + "px";
	}
	*/

	var header_size = 42;
	var max_scroll = 200;
	var save_size = 108;
//	if( document.body.clientHeight 
	if( document.body.scrollTop <= body.clientHeight - save_size ){
		container.style.top = header_size - document.body.scrollTop + "px";
	} else {
		container.style.top = -body.clientHeight + header_size + save_size + "px";
	}
}
