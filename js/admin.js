
var admin_obj = {
	stat : {
		kr : "통계"
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
		page = "stat";
	}

	if( $('#admin_table') ){
		$('#admin_box').removeChild($('#admin_table'));
	}
	if( document.URL.split('/').length == 4 ){
		history.pushState(null,null,"/admin/"+page);
	} else if( document.URL.split('/').length > 4 ){
		if( doc != undefined && doc.id ){
			history.pushState(null,null,'/admin/'+page+'/'+doc.id);
		} else {
			history.pushState(null,null,'/admin/'+page);
		}
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

	getKeys(makeTable);
}

function getKeys(cb){
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
		var obj_keys;
		try {
			obj_keys = JSON.parse(xhr.responseText);
			cb(trFilter(obj_keys));
		} catch(e){
			console.log(e);
			alert(xhr.responseText);
		}
	}};
	xhr.open("POST", "/api/admin/getkeys", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
}

function makeTable(obj_keys){
	schema_keys = obj_keys;
	var tb = $('table');
	tb.id = "admin_table";
	tb.appendChild(makeTr(schema_keys,true));
	$('#admin_box').appendChild(tb);
	if( doc == undefined ){
		getDocs();
	} else {
		$('#admin_table').appendChild(makeTr(doc));
	}
}


function trFilter(obj){
	var obj_keys = obj;
	var filtered = ['_id','__v','password'];
	for( var i = 0; i < filtered.length; ++ i ){
		if( obj_keys.indexOf(filtered[i]) >= 0 ){
			obj_keys = obj_keys.splice(0,obj_keys.indexOf(filtered[i])).concat(obj_keys.splice(1));
		}
	}
	return obj_keys;
}

function wholeCheck(e){
	var inputs = $(".admin_table_checkbox");
	var whole = $("#admin_table_wholecheck");
	if( e.target == whole ){
		for( var i = 0; i < inputs.length; ++i ){
			inputs[i].checked = e.target.checked;
		}
	} else {
		var cnt = 0;
		for( var i = 0; i < inputs.length; ++i ){
			if( inputs[i].checked == true ){
				cnt++;
			}
		}
		if( whole.checked ){
			--cnt;
		}
		if( inputs.length - 1 == cnt ){
			whole.checked = true;
		} else {
			whole.checked = false;
		}
	}
}


var schema_keys;
function makeTr(obj,th){
	var tr = $('tr');
	var check_td;
	var checkbox = $('input');
	checkbox.type = "checkbox";
	checkbox.className = "admin_table_checkbox";
	checkbox.onclick = wholeCheck;
	if( th == true ){
		check_td = $('th');
		checkbox.id = "admin_table_wholecheck";
	} else {
		check_td = $('td');
	}
	check_td.appendChild(checkbox);

	tr.appendChild(check_td);
	for( var i = 0 ; i < schema_keys.length; ++i ){
		var td;
		if( th == true ){
			td = $('th');
			td.className = "admin_table_th";
			td.innerText = schema_keys[i];
		} else {
			td = $('td');
			td.className = "admin_table_td";
			var string = obj[schema_keys[i]];
			if( typeof string == 'object' ){
				var a = $('a');
				a.innerText = schema_keys[i];
				a.href = "/admin/" + schema_keys[i] + "/" + string.id;
				td.appendChild(a);
			} else if( string == undefined ){
				
			} else if( schema_keys[i] == "date" || schema_keys[i] == "change" ){
				td.innerText = new Date(obj[schema_keys[i]]).toLocaleString();
			} else {
				td.innerText = obj[schema_keys[i]];
			}
		}
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
				$('#admin_table').appendChild(makeTr(docs[i]));
			}
		} catch(e){
			console.log(e);
			alert(xhr.responseText);
		}
	}};
	xhr.open("POST", "/api/admin/getdocs", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
}

function makeAdminTab( en, kr ){
	var tab = $('div');
	tab.id = "admin_tab_"+en;
	
	tab.innerText = kr;
	tab.onclick = function(){
		doc = undefined;
		openAdminTab(en);
	}
	
	return tab;
}

