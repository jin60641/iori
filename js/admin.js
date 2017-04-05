var obj_keys;

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
	var query_keys = Object.keys(query);
	var params = "";
	for( var i = 0; query_keys.length > i; ++i ){
		params += query_keys[i] + "=" + query[query_keys[i]] + "&";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		try {
			obj_keys = JSON.parse(xhr.responseText);
			trFilter();
			cb();
		} catch(e){
			console.log(e);
			alert(xhr.responseText);
		}
	}};
	xhr.open("POST", "/api/admin/getkeys", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
}

function makeTable(){
	var tb = $('table');
	tb.id = "admin_table";
	tb.appendChild(makeTr(obj_keys,true));
	$('#admin_box').appendChild(tb);
	if( doc == undefined ){
		getDocs();
	} else {
		$('#admin_table').appendChild(makeTr(doc));
	}
}

function findObj(start,objName){
	var i = start;
	var deep;
	if( objName.length > 0  ){
		deep = objName.split('.').length;
	} else {
		deep = 0;
	}
	for( ; i < obj_keys.length; ++i ){
		console.log(obj_keys[i]);
		var splited = obj_keys[i].split('.');
		splited.pop();
		var newObjName = splited.join('.');
		if( splited.length <= deep && newObjName != objName ){
			var first = obj_keys.splice(0,start);
			var second = [objName];
			var third = obj_keys.splice(0);
			obj_keys = first.concat(second).concat(third);
			if( i != obj_keys.length && deep != 0 ){
				return i-start;
			}
		} else if( splited.length > deep ){
			i += findObj(i,newObjName);
		}
	}
}

function trFilter(){
	var filtered = ['_id','__v','password'];
	for( var i = 0; i < filtered.length; ++ i ){
		if( obj_keys.indexOf(filtered[i]) >= 0 ){
			obj_keys = obj_keys.splice(0,obj_keys.indexOf(filtered[i])).concat(obj_keys.splice(1));
		}
	}
	findObj(0,"")
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

function openObject(e){
	var td = e.target;
	var ths = $('.admin_table_th');
	var width = ths.length;
	var index = 1;
	var parent = td.parentNode;
	for( ; index < width; ++index ){
		if( td == parent.childNodes[index] ){
			break;
		}
	}
	var trs = $('#admin_table').childNodes;
	var height = trs.length;
	var objName = ths[index-1].innerText.split('_').pop();
	var deep = objName.split('.').length;
	var flag;
	if( td.innerText == "펼치기" ){
		flag = true;
	} else {
		flag = false;
	}
	for( var j = 1; j < height; ++j ){
		if( flag ){
			trs[j].childNodes[index].innerText = "접기";
		} else {
			trs[j].childNodes[index].innerText = "펼치기";
		}
	}
	for( var i = index; i < width; ++i ){
		if( ths[i].innerText.indexOf(objName) >= 0 && ( ( flag && ths[i].innerText.split('.').length - 1 == deep ) || !flag ) ){
			for( var j = 0; j < height; ++j ){
				var target = trs[j].childNodes[i+1];
				if( flag ){
					target.style.display = "table-cell";
					if( target.innerText == "접기" ){
						target.innerText = "펼치기";
					}
				} else {
					target.style.display = "none";
				}
			}
		} else {
			break;
		}
	}
}

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
	for( var i = 0 ; i < obj_keys.length; ++i ){
		var td;
		if( th == true ){
			td = $('th');
			td.className = "admin_table_th";
			td.innerText = obj_keys[i];
			if( obj_keys[i].indexOf('.') >= 1 ){
				td.style.display = "none";
			}
		} else {
			td = $('td');
			td.className = "admin_table_td";
			var string = obj[obj_keys[i]];
	
			if( string == undefined ){
				var sub_keys = obj_keys[i].split('.');
				var tmp = obj;
				for( var j = 0; j < sub_keys.length; ++j ){
					tmp = tmp[sub_keys[j]];
					td.style.display = "none";
				}
				string = tmp;
			}
			if( typeof string == 'object' ){
				/*
				var a = $('a');
				a.innerText = obj_keys[i];
				a.href = "/admin/" + obj_keys[i] + "/" + string.id;
				td.appendChild(a);
				*/
				td.className += " admin_table_flip";
				td.innerText = "펼치기";
				td.onclick = openObject;
			} else if( obj_keys[i] == "date" || obj_keys[i] == "change" ){
				td.innerText = new Date(string).toLocaleString();
			} else {
				td.innerText = string;
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

	var query_keys = Object.keys(query);
	var params = "";
	for( var i = 0; query_keys.length > i; ++i ){
		params += query_keys[i] + "=" + query[query_keys[i]] + "&";
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

