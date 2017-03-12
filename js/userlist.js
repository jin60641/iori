function makeUserCard( obj ){
	var div = $('div');
	div.className = "user_list_div";
	
	var header = $('a');
	header.href = "/@" + obj.uid;
	if( obj.header ){
		header.style.backgroundImage = "url('/files/header/" + obj.id + "')";
	}
	header.className = "user_list_header";
	div.appendChild(header);
	
	var profile = $('a');
	profile.href = "/@" + obj.uid;
	profile.style.backgroundImage = "url('/files/profile/" + obj.id + "')";
	profile.className = "user_list_profile";
	div.appendChild(profile);
	
	var text = $('div');
	text.className = "user_list_text";

	var name = $('a');
	name.href = "/@" + obj.uid;
	name.innerText = obj.name;
	name.className = "user_list_name";
	text.appendChild(name);

	var uid = $('a');
	uid.href = "/@" + obj.uid;
	uid.innerText = '@' + obj.uid;
	uid.className = "user_list_uid";
	text.appendChild(uid);
	
	if( obj.uid != session.uid ){	
		var following = $('div');
		following.id = "user_follow_btn_" + obj.id;
		following.className = "user_follow_btn";
		if( obj.following ){
			following.innerText = "언팔로우";
		} else {
			following.innerText = "팔로우";
		}
		following.onclick = function(){
			if( session.id ){
				var tmp = this;
				followUser( this.id.split('_').pop(), function( result ){
					if( result ){
						tmp.innerText = "언팔로우";
					} else {
						tmp.innerText = "팔로우";
					}
				});
			} else {
				location.href = "/login/" + document.URL.split('/').slice(3).join("-");
			}
		}
		div.appendChild(following);
		div.appendChild(text);
		if( obj.follower ){
			var follower = $('div');
			follower.className = "user_list_follower";
			follower.innerText = "나를 팔로우 중입니다.";
			text.appendChild(follower);
		}
	} else {
		text.className = "user_list_text_self";
		div.appendChild(text);
	}

	
	
	return div;
}
