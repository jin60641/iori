postOption.search = location.pathname.split('/')[2];

window.addEventListener('load', function(){
	var container_wrap = $('div');
	container_wrap.id = "search_wrap";
	var container = $('div');
	container.id = "search_container";
	var back = $('div');
	back.id = "search_container_back";
	var container_query = $('div');
	container_query.id = "container_query";
	container_query.innerText = location.pathname.split('/')[2];
	back.appendChild(container_query);
	container.appendChild(back);
	container_wrap.appendChild(container);
	$('#wrap_top').appendChild(container_wrap);

	var search_tab = $('div');
	var tab_arr = [
		{ name : "사용자", id : "user" },
		{ name : "게시글", id : "post" }
	];
	for( var i = 0; i < tab_arr.length; ++i ){
		var tab = $("div");
		tab.id = "search_tab_"+tab_arr[i].id;
		tab.innerText = tab_arr[i].name;
		tab.onclick = openSearchTab;
		search_tab.appendChild(tab);
	}

	search_tab.id = "search_tab";
	
	container.appendChild(search_tab);
	
    var result_wrap = $('div');
    result_wrap.id = "search_result_wrap";
    $('#wrap_mid').appendChild(result_wrap);

	openSearchTab();
});


function openSearchTab( evt ){
	var tab;
	var tab_name;
	var history_str = "";
	if( evt ){
		tab = this;
		tab_name = this.id.split("_").pop();
	} else {
		tab_name = location.pathname.split("/")[3];
		tab = $('#search_tab_' + tab_name);
	}
	history_str += tab_name;
	skip = 0;
	var tabs = $('#search_tab').childNodes;
	for( var i = 0; i < tabs.length; ++i ){
		var t = tabs[i];
		t.style.color = "";
		t.style.height = "";
		t.style.borderBottom = "";
	}
    $('#post_wrap').innerHTML = "";
    $('#search_result_wrap').innerHTML = "";
    $('#post_wrap').style.display = "none";
    $('#search_result_wrap').style.display = "none";
	if( tab_name == "post" ){
	    $('#post_wrap').style.display = "";
		getPosts(10);
	} else {
    	$('#search_result_wrap').style.display = "";
		getUsers(postOption.search, 9, function( users ){
			for( var i = 0; i < users.length; ++i ){
				$('#search_result_wrap').appendChild(makeUserCard( users[i] ));
			}
		});
	}
	history.pushState(null,null,history_str);

	tab.style.color = session.color.hex;
	tab.style.borderBottom = "5px solid " + session.color.hex;
	
}


