'use strict';

function makeUserCard( obj, notSelf ){
	let div = $('div');
	div.className = "user_list_div";
	
	let header = $('a');
	makeHref( header, "/@" + obj.uid );
	header.style.backgroundColor = obj.color.hex;
	if( obj.header == true ){
		header.style.backgroundImage = "url('/files/header/" + obj.uid + "?')";
	} 
	header.className = "user_list_header";
	div.appendChild(header);
	
	let profile = $('a');
	makeHref( profile, "/@" + obj.uid );
	profile.style.backgroundImage = "url('/files/profile/" + obj.uid + "')";
	profile.className = "user_list_profile";
	div.appendChild(profile);
	
	let text = $('div');
	text.className = "user_list_text";

	let name = $('a');
	makeHref( name, "/@" + obj.uid );
	name.innerText = obj.name;
	name.className = "user_list_name";
	text.appendChild(name);

	let uid = $('a');
	makeHref( uid, "/@" + obj.uid );
	uid.innerText = '@' + obj.uid;
	uid.className = "user_list_uid";
	text.appendChild(uid);
	
	if( obj.uid != session.uid || notSelf ){	
		if( obj.uid != session.uid ){
			let following = $('div');
			following.id = "user_follow_btn_" + obj.id;
			following.className = "user_follow_btn";
			if( obj.following ){
				following.innerText = "언팔로우";
			} else {
				following.innerText = "팔로우";
			}
			following.onclick = function(){
				if( session.id ){
					let tmp = this;
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
			if( obj.follower ){
				let follower = $('div');
				follower.className = "user_list_follower";
				follower.innerText = "나를 팔로우 중입니다.";
				text.appendChild(follower);
			}
		}
		div.appendChild(text);
	} else {
		div.id = "user_list_self";
		text.className = "user_list_text_self";

		div.appendChild(text);
		if( my_info ){
			let obj = [{
				en : "post",
				kr : "게시글"
			},{
				en : "following",
				kr : "팔로잉"
			},{
				en : "follower",
				kr : "팔로워"
			}];
			let div_info = $('div');
			div_info.className = "user_list_info";
			for( let i = 0; i < obj.length; ++i ){
				let tab = $('a');
				makeHref( tab, "/@"+session.uid+'/'+obj[i].en );
				tab.className = "user_list_tab";
				
				let name = $('div');
				name.className = "user_list_tab_name";
				name.innerText = obj[i].kr;
				tab.appendChild(name);
				
				let value = $('div');
				value.className = "user_list_tab_value";
				value.id = "user_list_tab_value_"+obj[i].en;
				value.innerText = my_info[obj[i].en];
				tab.appendChild(value);

				div_info.appendChild(tab);
			}
			div.appendChild(div_info);
		}
		
		
	}

	
	
	return div;
}
