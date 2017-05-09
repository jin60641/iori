'use strict';
	
inits["search"] = {
	openSearchTab : function( evt, target ){
		let tab;
		let tab_name;
		let history_str = "";
		if( evt ){
			tab = target;
			tab_name = target.id.split("_").pop();
		} else {
			tab_name = location.pathname.split("/")[3];
			tab = $('#search_tab_' + tab_name);
		}
		history_str += tab_name;
		inits["timeline"].post_skip = 0;
		let tabs = $('#search_tab').childNodes;
		for( let i = 0; i < tabs.length; ++i ){
			let t = tabs[i];
			t.style.color = "";
			t.style.height = "";
			t.style.borderBottom = "";
		}
		if( $('#post_wrap') ){
			$('#post_wrap').innerHTML = "";
			$('#post_wrap').style.display = "none";
		}
		$('#search_result_wrap').innerHTML = "";
		$('#search_result_wrap').style.display = "none";
		if( tab_name == "post" ){
			let that = this;
			inits["timeline"].getPosts(10, function(){
				that.isResultNone(tab_name);
			});
		} else {
			$('#search_result_wrap').style.display = "";
			getUsers(inits["timeline"].postOption.search, 9, function( users ){
				for( let i = 0; i < users.length; ++i ){
					$('#search_result_wrap').appendChild(makeUserCard( users[i] ));
				}
			});
			this.isResultNone(tab_name);
		}
		history.pushState(null,null,history_str);
	
		tab.style.color = session.color.hex;
		tab.style.borderBottom = "5px solid " + session.color.hex;
	},
	isResultNone : function(tab_name){
		let none = $('#search_result_none');
		if( none ){
			none.parentNode.removeChild(none);
		}
		none = $('div');
		none.id = "search_result_none";
		none.innerText = "검색결과가 없습니다.";
		if( ( tab_name == "post" && $('#post_wrap') && $('#post_wrap').childNodes.length == 0 ) || ( tab_name == "user" && $('#search_result_wrap').childNodes.length == 0 ) ){
			$('#wrap_mid').appendChild(none);
		}
	},
	init : function(){
		inits["timeline"].postOption.search = location.pathname.split('/')[2];
		let that = this;
		let container_wrap = $('div');
		container_wrap.id = "search_wrap";
		let container = $('div');
		container.id = "search_container";
		let back = $('div');
		back.id = "search_container_back";
		let container_query = $('div');
		container_query.id = "container_query";
		container_query.innerText = decodeURI(location.pathname.split('/')[2]);
		back.appendChild(container_query);
		container.appendChild(back);
		container_wrap.appendChild(container);
		$('#wrap_top').appendChild(container_wrap);
		
		let search_tab = $('div');
		let tab_arr = [
			{ name : "사용자", id : "user" },
			{ name : "게시글", id : "post" }
		];
		for( let i = 0; i < tab_arr.length; ++i ){
			let tab = $("div");
			tab.id = "search_tab_"+tab_arr[i].id;
			tab.innerText = tab_arr[i].name;
			tab.onclick = function(e){
				that.openSearchTab(e,this);
			}
			search_tab.appendChild(tab);
		}
		
		search_tab.id = "search_tab";
			
		container.appendChild(search_tab);
			
		let result_wrap = $('div');
		result_wrap.id = "search_result_wrap";
		$('#wrap_mid').appendChild(result_wrap);
	
		that.openSearchTab();
	},
	exit : function(){
		$('#wrap_mid').removeChild($('#search_result_wrap'));
		$('#wrap_top').removeChild($('#search_wrap'));
		if( $('#search_result_none') ){
			$('#wrap_mid').removeChild( $('#search_result_none') );
		}
	}
}
