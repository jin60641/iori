
var admin_obj = {
	stat : {
		kr : "사이트 통계"
	},
	user : {
		kr : "회원"
	},
	post : {
		kr : "게시글"
	},
	reply : {
		kr : "댓글"
	},
	chat : {
		kr : "채팅"
	},
	report : {
		kr : "신고"
	}
}

window.addEventListener('load', function(){
	var wrap = $('div');
	wrap.id = "admin_wrap";

	var box = $('div');
	box.id = "admin_box";
	var title = $('div');
	title.id = "admin_title";
	box.appendChild(title);
	wrap.appendChild(box);
	$('#wrap2').appendChild(wrap);

	var tabs = $('div');
	tabs.id = "admin_tab";

	var keys = Object.keys(admin_obj);
	for( var i = 0; i < keys.length; ++i ){
		tabs.appendChild(makeAdminTab(keys[i],admin_obj[keys[i]].kr));
	}
	$('#wrap1').appendChild(tabs);
	
	openAdminTab();
	window.addEventListener('resize', adminResize );
	adminResize();
});

function adminResize(){
	if( $("#wrap1").clientWidth == 0 ){
		$("#admin_wrap").insertBefore( $('#admin_tab'), $("#admin_wrap").firstElementChild );
	} else {
		$("#wrap1").appendChild( $('#admin_tab') );
	}
}


function openAdminTab( newtab ){
	if( page == newtab ){
		return;
	}
	
	if( newtab != undefined ){
		page = newtab;
	}

	if( admin_obj[page] == undefined ){
		page = "account";
	}

	if( document.URL.split('/').length < 5 ){
		history.pushState(null,null,"/admin/"+page);
	} else {
		history.pushState(null,null,page);
	}
	var box = $("#admin_box");

	var fields = $(".admin_field");
	for( var i = fields.length - 1; i >= 0; --i ){
		box.removeChild(fields[i]);
	}

	var tabs = $("#admin_tab").childNodes;
	for( var i = 0; i < tabs.length; ++i ){
		tabs[i].className = "";
	}
	$("#admin_tab_"+page).className = "admin_tab_active";
	
	var title = $("#admin_title");
	title.innerText = admin_obj[page].kr;

	makeTable();
	getKeys();
}

function getKeys(){
	var tableName = page;
	var query = {
		table : tableName[0].toUpperCase() + tableName.substr(1) + 's'
	}
	var obj_keys = Object.keys(query);
	var params = "";
	for( var i = 0; obj_keys.length > i; ++i ){
		params += obj_keys[i] + "=" + query[obj_keys[i]] + "&";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var schema_keys;
		try {
			schema_keys = JSON.parse(xhr.responseText);
			if( schema_keys.indexOf('_id') ){
				schema_keys = schema_keys.splice(0,schema_keys.indexOf('_id')).concat(schema_keys.splice(1));
			}
			if( schema_keys.indexOf('__v') ){
				schema_keys = schema_keys.splice(0,schema_keys.indexOf('__v')).concat(schema_keys.splice(1));
			}
			return 
			makeTable(schema_keys)
		} catch(e){
			alert(xhr.responseText);
		}
	}};
	xhr.open("POST", "/api/admin/getkeys", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
}

function makeTable(schema_keys){
	var tb = $('table');
	tb.id = "admin_table";
	tb.appendChild(makeTr(schema_keys,true));
	$('#admin_wrap').appendChild(tb);
	getDocs();
}

function makeTr(arr,th){
	var tr = $('tr');
	for( var i = 0 ; i < arr.length; ++i ){
		var td;
		if( th == "ture" ){
			td = $('th');
			td.className = "admin_table_th";
		} else {
			td = $('td');
			td.className = "admin_table_td";
		}
		td.innerText = arr[i];
		tr.appendChild(td);
	}
	return tr;
}

function getDocs(){
	var tableName = page;
	var query = {
		skip : $('.admin_table_document').length,
		table : tableName[0].toUpperCase() + tableName.substr(1) + 's',
		limit : 20
	}

	var obj_keys = Object.keys(query);
	var params = "";
	for( var i = 0; obj_keys.length > i; ++i ){
		params += obj_keys[i] + "=" + query[obj_keys[i]] + "&";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var docs;
		try {
			docs = JSON.parse(xhr.responseText);
			for( var i = 0; i < docs.length; ++i ){
				console.log(docs[i]);
				makeTr(docs[i]);
			}
		} catch(e){
			alert(xhr.responseText);
		}
	}};
	console.log(params);
	xhr.open("POST", "/api/admin/getdocs", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
}

function makeAdminTab( en, kr ){
	var tab = $('div');
	tab.id = "admin_tab_"+en;
	
	tab.innerText = kr;
	tab.onclick = function(){
		openAdminTab(en);
	}
	
	return tab;
}

