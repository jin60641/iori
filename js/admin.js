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

function changePage(num){
	var pages = $('.pages_num');
	for( var i = 0; i < pages.length; ++i ){
		pages[i].id = "";
	}
	pages[num%10-1].id = "current_page";
	getDocs((num-1));
}

function changePages(num,limitChange){
	if( getCurrentPage() == num && limitChange != true ){
		return 0;
	}
	var cnt = parseInt($('#pages_max').innerText);
	var limit = $('#admin_limit').value;
	var page_cnt = Math.ceil(cnt/limit);
	if( num > page_cnt ){
		num = page_cnt;
	} else if( num < 1 ){
		num = 1;
	}
	var dec = Math.floor((num-1)/10);
	if( (getCurrentPage()-1)/10 != dec || limitChange == true ){
		var pages = $('.pages_num');
		for( var i = 0; i <= 9; ++i ){
			if( dec*10+(i+1) <= page_cnt ){
				pages[i].style.display = "";
			} else {
				pages[i].style.display = "none";
			}
			pages[i].innerText = dec*10+(i+1);
		}
	}
	changePage(num);
}

function getCurrentPage(){
	return parseInt($('#current_page').innerText);
}


function makePages(){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		var cnt = xhr.responseText;
		var pages = $('div');
		pages.id = "admin_pages";
		var limit = $('#admin_limit').value;
		var page_cnt = Math.ceil(cnt/limit);
		var max_cnt = $('div');
		max_cnt.id = "pages_max";
		max_cnt.innerText = cnt;
		pages.appendChild(max_cnt);
		var first = $('div');
		first.className = "pages_btn";
		first.id = "pages_first";
		first.onclick = function(){
			changePages(1);
		}
		first.innerText = "<<";
		pages.appendChild(first);
		var left = $('div');
		left.innerText = "<";
		left.onclick = function(){
			changePages(Math.floor((getCurrentPage()-1)/10)*10+10);
		}
		left.className = "pages_btn";
		left.id = "pages_left";
		pages.appendChild(left);
		for( i = 0; i < 10; ++i ){
			var pages_num = $('span');
			if( page_cnt > i ){
				pages_num.style.display = "";
			} else {
				pages_num.style.display = "none";
			}
			pages_num.innerText = i + 1;
			pages_num.className="pages_num";
			pages_num.addEventListener('click', function(){
				changePages(parseInt(this.innerText));
			});
			pages.appendChild(pages_num);
		}
		var right = $('div');
		right.addEventListener('click',function(){
			changePages(getCurrentPage()+10);
		});
		right.className = "pages_btn";
		right.id = "pages_right";
		right.innerText = ">";
		pages.appendChild(right);
		var last = $('div');
		last.className = "pages_btn";
		last.id = "pages_last";
		last.addEventListener('click', function(){
			var cnt = parseInt($('#pages_max').innerText);
			var limit = $('#admin_limit').value;
			var page_cnt = Math.ceil(cnt/limit);
			changePages( page_cnt );
		});
		last.innerText = ">>";
		pages.appendChild(last);
		$('#admin_box').appendChild(pages);
		changePage(1);
	}};
	xhr.open("POST", "/api/admin/getcnt", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send("table="+getTableName());
}

function changeLimit(){
	var limit = $('#admin_limit');
	if( limit.value >= 100 ){
		limit.value = 100;
	} else if( limit.value <= 1 ){
		limit.value = 1;
	}
	changePages(getCurrentPage(),true);
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
	
	var limit = $('input');
	limit.id = "admin_limit";
	limit.value = 20;
	limit.min = "1";
	limit.max = "100";
	limit.type = "number";
	limit.addEventListener('focusout',changeLimit);
	limit.addEventListener('change',changeLimit);
	$('#admin_box').appendChild(limit);
	var text = $('text');
	text.innerText = "개씩 보기";
	$('#admin_box').appendChild(text);
	var remove = $('div');
	remove.id = "admin_remove"
	remove.className = "admin_btn"
	remove.addEventListener('click', removeDocs);
	remove.innerText="삭제";
	$('#admin_box').appendChild(remove);

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
	if( $('#admin_pages') ){
		$('#admin_box').removeChild($('#admin_pages'));
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
	var query = {
		table : getTableName()
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

function cleanTable(){
	var tb = $('#admin_table');
	var trs = tb.childNodes;
	for( var i = trs.length - 1; i >= 1; --i ){
		tb.removeChild(trs[i]);
	}
}

function makeTable(){
	var tb = $('div');
	tb.id = "admin_table";
	tb.addEventListener('mousedown', function(e){
		e.preventDefault();
	});
	tb.appendChild(makeTr(obj_keys,true));
	$('#admin_box').appendChild(tb);
	if( doc == undefined ){
//		getDocs(0);
	} else {
		$('#admin_table').appendChild(makeTr(doc));
	}
	makePages();
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
	if( td.tagName == "DIV" ){
		td = e.target.parentNode;
	}
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
	var objName = ths[index-1].firstElementChild.innerText.split('_').pop();
	var deep = objName.split('.').length;
	var flag;
	if( td.firstElementChild.innerText == "펼치기" ){
		flag = true;
	} else {
		flag = false;
	}
	for( var j = 1; j < height; ++j ){
		if( flag ){
			trs[j].childNodes[index].firstElementChild.innerText = "접기";
		} else {
			trs[j].childNodes[index].firstElementChild.innerText = "펼치기";
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
	tr.className = "admin_table_tr";
	var check_td;
	var checkbox = $('input');
	checkbox.type = "checkbox";
	checkbox.className = "admin_table_checkbox";
	if( obj.id ){
		checkbox.id = "admin_table_checkbox_" + obj.id;
	}
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
		if( obj_keys[i] == "be" ){
			continue;
		}
		var td;
		if( th == true ){
			td = $('th');
			td.className = "admin_table_th";
			var div = $('div');
			div.innerText = obj_keys[i];
			td.appendChild(div);
			if( obj_keys[i].indexOf('.') >= 1 ){
				td.style.display = "none";
			}
			var resizer = $('div');
			resizer.addEventListener('mousedown',colResizeDown,false);
			resizer.className = "admin_table_resizer";
			td.appendChild(resizer);
		} else {
			td = $('td');
			td.className = "admin_table_td";
			var div = $('div');
			var string = obj[obj_keys[i]];
	
			if( string == undefined && obj_keys[i].indexOf(".") >= 0 ){
				var sub_keys = obj_keys[i].split('.');
				var tmp = obj;
				for( var j = 0; j < sub_keys.length; ++j ){
					tmp = tmp[sub_keys[j]];
					td.style.display = "none";
				}
				string = tmp;
			}
			if( string == undefined ){
			} else if( typeof string == 'object' ){
				/*
				var a = $('a');
				a.innerText = obj_keys[i];
				a.href = "/admin/" + obj_keys[i] + "/" + string.id;
				td.appendChild(a);
				*/
				td.className += " admin_table_flip";
				div.innerText = "펼치기";
				td.onclick = openObject;
			} else if( obj_keys[i] == "date" || obj_keys[i] == "change" || obj_keys[i] == "last"){
				div.innerText = new Date(string).toLocaleString();
			} else {
				div.innerText = string.toString().replace(/(\r\n|\n|\r)/gm,". ");
			}
			td.appendChild(div);
		}
		tr.appendChild(td);
	}
	return tr;
}

function getTableName(){
	return page[0].toUpperCase() + page.substr(1) + 's';
}

function removeDocs(){
	if( confirm("정말로 삭제하시겠습니까?") == false ){
		return 0;
	}
	var params = "table=" + getTableName() + "&id=";
	var cbs = $('.admin_table_checkbox');
	for( var i = 0; i < cbs.length; ++i ){
		if( cbs[i].id.indexOf("whole") >= 0 ){
		} else if( cbs[i].checked == true ){
			params += cbs[i].id.split('_').pop() + ',';
		}
	}
	if( params[params.length-1] != "=" ){
		params = params.substr(0,params.length-1);
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
		getDocs();
	}};
	xhr.open("POST", "/api/admin/removedocs", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
}

function getDocs(skip){
	cleanTable();
	if( skip == undefined ){
		skip = getCurrentPage-1;
	}
	var query = {
		table : getTableName(),
		limit : $('#admin_limit').value
	}
	query.skip = skip*query.limit;

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

var clicked = null;
var startPageX = null;
function colResizeDown(e){
	clicked = e.target;
	clicked.id = "admin_table_resizer_clicked";
	clicked.style.top = "1px"
	clicked.style.opacity = "1";
	clicked.style.zIndex = "500";
	clicked.style.right = "initial";
	clicked.style.left = e.pageX - $('#admin_table').offsetLeft - 2 + "px";
	var dotline = $('div');
	dotline.style.height = $('#admin_table').clientHeight + "px";
	clicked.appendChild(dotline);
	var div = clicked.previousElementSibling;
	div.parentNode.style.position = "inherit";
	div.style.maxWidth = "none";
	startPageX = e.pageX;
}


function colResizeUp(e){
	if( clicked ){
		var div = clicked.previousElementSibling;
		div.parentNode.style.position = "";
		div.style.width = div.clientWidth + e.pageX-startPageX + "px";
		clicked.id = "";
		clicked.removeChild(clicked.firstElementChild);
		clicked.style.left = "";
		clicked.style.right = "";
		clicked.style.top = "0px"
		clicked.style.opacity = "";
		clicked.style.zIndex = "";
	}
	clicked = null;
}

function colResizeMove(e){
	if( e.buttons && clicked ){
		clicked.style.left = e.pageX - $('#admin_table').offsetLeft - 2 + "px";
	}
}

window.addEventListener('mousemove',colResizeMove,false);
window.addEventListener('mouseup',colResizeUp,false);
