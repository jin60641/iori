'use strict';

inits["admin"] = function init(){
	let listeners = [];
	let obj_keys;
	const admin_obj = {
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
		const pages = $('.pages_num');
		for( let i = 0; i < pages.length; ++i ){
			pages[i].id = "";
		}
		pages[(num-1)%10].id = "current_page";
		getDocs((num-1));
	}
	
	function changePages(num,limitChange){
		if( getCurrentPage() == num && limitChange != true ){
			return 0;
		}
		const cnt = parseInt($('#pages_max').innerText);
		const limit = $('#admin_limit').value;
		const page_cnt = Math.ceil(cnt/limit);
		if( num > page_cnt ){
			num = page_cnt;
		} else if( num < 1 ){
			num = 1;
		}
		const dec = Math.floor((num-1)/10);
		if( (getCurrentPage()-1)/10 != dec || limitChange == true ){
			const pages = $('.pages_num');
			for( let i = 0; i <= 9; ++i ){
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
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			const cnt = xhr.responseText;
			let pages = $('div');
			pages.id = "admin_pages";
			const limit = $('#admin_limit').value;
			const page_cnt = Math.ceil(cnt/limit);
			let max_cnt = $('div');
			max_cnt.id = "pages_max";
			max_cnt.innerText = cnt;
			pages.appendChild(max_cnt);
			let first = $('div');
			first.className = "pages_btn";
			first.id = "pages_first";
			first.onclick = function(){
				changePages(1);
			}
			first.innerText = "<<";
			pages.appendChild(first);
			let left = $('div');
			left.innerText = "<";
			left.onclick = function(){
				changePages(Math.floor( ( getCurrentPage() - 1 ) / 10 ) * 10 );
			}
			left.className = "pages_btn";
			left.id = "pages_left";
			pages.appendChild(left);
			for( let i = 0; i < 10; ++i ){
				let pages_num = $('span');
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
			let right = $('div');
			right.addEventListener('click',function(){
				changePages( Math.floor( ( getCurrentPage() - 1 ) / 10 )*10+11 );
			});
			right.className = "pages_btn";
			right.id = "pages_right";
			right.innerText = ">";
			pages.appendChild(right);
			let last = $('div');
			last.className = "pages_btn";
			last.id = "pages_last";
			last.addEventListener('click', function(){
				const cnt = parseInt($('#pages_max').innerText);
				const limit = $('#admin_limit').value;
				const page_cnt = Math.ceil(cnt/limit);
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
		let limit = $('#admin_limit');
		if( limit.value >= 100 ){
			limit.value = 100;
		} else if( limit.value <= 1 ){
			limit.value = 1;
		}
		changePages(getCurrentPage(),true);
	}
	
	let wrap = $('div');
	wrap.id = "admin_wrap";
	
	let box = $('div');
	box.id = "admin_box";
	let title = $('div');
	title.id = "admin_title";
	box.appendChild(title);
	wrap.appendChild(box);
	$('#wrap_mid').appendChild(wrap);
	
	let tabs = $('div');
	tabs.id = "admin_tab";
	
	const keys = Object.keys(admin_obj);
	for( let i = 0; i < keys.length; ++i ){
		tabs.appendChild(makeAdminTab(keys[i],admin_obj[keys[i]].kr));
	}
	$('#wrap_left').appendChild(tabs);
		
	let limit = $('input');
	limit.id = "admin_limit";
	limit.value = 20;
	limit.min = "1";
	limit.max = "100";
	limit.type = "number";
	limit.addEventListener('focusout',changeLimit);
	limit.addEventListener('change',changeLimit);
	$('#admin_box').appendChild(limit);
	let text = $('text');
	text.innerText = "개씩 보기";
	$('#admin_box').appendChild(text);
	let remove = $('div');
	remove.id = "admin_remove"
	remove.className = "admin_btn"
	remove.addEventListener('click', removeDocs);
	remove.innerText="삭제";
	$('#admin_box').appendChild(remove);
	openAdminTab();
	addListener(window,'resize', adminResize );
	
	function adminResize(){
		if( $("#wrap_left").clientWidth == 0 ){
			$("#admin_wrap").insertBefore( $('#admin_tab'), $("#admin_wrap").firstElementChild );
		} else {
			$("#wrap_left").appendChild( $('#admin_tab') );
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
		let box = $("#admin_box");
	
		let fields = $(".admin_field");
		for( let i = fields.length - 1; i >= 0; --i ){
			box.removeChild(fields[i]);
		}
	
		let tabs = $("#admin_tab").childNodes;
		for( let i = 0; i < tabs.length; ++i ){
			tabs[i].className = "";
		}
		$("#admin_tab_"+page).className = "admin_tab_active";
		
		let title = $("#admin_title");
		title.innerText = admin_obj[page].kr;
	
		getKeys(makeTable);
	}
	
	function getKeys(cb){
		let query = {
			table : getTableName()
		}
		const query_keys = Object.keys(query);
		let params = "";
		for( let i = 0; query_keys.length > i; ++i ){
			params += query_keys[i] + "=" + query[query_keys[i]] + "&";
		}
		let xhr = new XMLHttpRequest();
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
		let tb = $('#admin_table');
		let trs = tb.childNodes;
		for( let i = trs.length - 1; i >= 1; --i ){
			tb.removeChild(trs[i]);
		}
	}
	
	function makeTable(){
		let tb = $('div');
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
		let i = start;
		let deep;
		if( objName.length > 0  ){
			deep = objName.split('.').length;
		} else {
			deep = 0;
		}
		for( ; i < obj_keys.length; ++i ){
			let splited = obj_keys[i].split('.');
			splited.pop();
			let newObjName = splited.join('.');
			if( splited.length <= deep && newObjName != objName ){
				let first = obj_keys.splice(0,start);
				let second = [objName];
				let third = obj_keys.splice(0);
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
		const filtered = ['_id','__v','password'];
		for( let i = 0; i < filtered.length; ++ i ){
			if( obj_keys.indexOf(filtered[i]) >= 0 ){
				obj_keys = obj_keys.splice(0,obj_keys.indexOf(filtered[i])).concat(obj_keys.splice(1));
			}
		}
		findObj(0,"")
	}
	
	function wholeCheck(e){
		let inputs = $(".admin_table_checkbox");
		let whole = $("#admin_table_wholecheck");
		if( e.target == whole ){
			for( let i = 0; i < inputs.length; ++i ){
				inputs[i].checked = e.target.checked;
			}
		} else {
			let cnt = 0;
			for( let i = 0; i < inputs.length; ++i ){
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
		let td = e.target;
		if( td.tagName == "DIV" ){
			td = e.target.parentNode;
		}
		let ths = $('.admin_table_th');
		let width = ths.length;
		let index = 1;
		let parent = td.parentNode;
		for( ; index < width; ++index ){
			if( td == parent.childNodes[index] ){
				break;
			}
		}
		let trs = $('#admin_table').childNodes;
		let height = trs.length;
		let objName = ths[index-1].firstElementChild.innerText.split('_').pop();
		let deep = objName.split('.').length;
		let flag;
		if( td.firstElementChild.innerText == "펼치기" ){
			flag = true;
		} else {
			flag = false;
		}
		for( let j = 1; j < height; ++j ){
			let element = trs[j].childNodes[index].firstElementChild;
			if( flag && element.innerText == "펼치기" ){
				element.innerText = "접기";
			} else if( element.innerText == "접기" ){
				element.innerText = "펼치기";
			}
		}
		for( let i = index; i < width; ++i ){
			if( ths[i].innerText.indexOf(objName) >= 0 && ( ( flag && ths[i].innerText.split('.').length - 1 == deep ) || !flag ) ){
				for( let j = 0; j < height; ++j ){
					let target = trs[j].childNodes[i+1];
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
		let tr = $('tr');
		tr.className = "admin_table_tr";
		let ths = $('.admin_table_th');
		let check_td;
		let checkbox = $('input');
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
		for( let i = 0 ; i < obj_keys.length; ++i ){
			if( obj_keys[i] == "be" ){
				continue;
			}
			let td;
			if( th == true ){
				td = $('th');
				td.className = "admin_table_th";
				let div = $('div');
				div.id = "admin_table_th_div_" + obj_keys[i];
				div.innerText = obj_keys[i];
				td.appendChild(div);
				if( obj_keys[i].indexOf('.') >= 1 ){
					td.style.display = "none";
				}
				div.addEventListener('click',changeSort,false);
				let resizer = $('div');
				resizer.addEventListener('mousedown',colResizeDown,false);
				resizer.className = "admin_table_resizer";
				td.appendChild(resizer);
			} else {
				td = $('td');
				td.className = "admin_table_td";
				let div = $('div');
				let string = obj[obj_keys[i]];
		
				if( string == undefined && obj_keys[i].indexOf(".") >= 0 ){
					let sub_keys = obj_keys[i].split('.');
					let tmp = obj;
					if( tmp == undefined ){
						string = tmp;
						if( $("#admin_table_th_div_"+obj_keys[i]).parentNode.style.display == "none" ){
							td.style.display = "none";
						}
					} else {
						for( let j = 0; j < sub_keys.length; ++j ){
							if( tmp[sub_keys[j]] == undefined ){
								tmp = " ";
							} else {
								tmp = tmp[sub_keys[j]];
							}
						}
						if( $("#admin_table_th_div_"+obj_keys[i]).parentNode.style.display == "none" ){
							td.style.display = "none";
						}
						string = tmp;
					}
				}
				if( string == undefined ){
				} else if( typeof string == 'object' ){
					/*
					let a = $('a');
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
					div.innerText = string.toString().replace(/((\r\n)|\n|\r)/gm,". ");
				}
				td.appendChild(div);
			}
			tr.appendChild(td);
		}
		return tr;
	}
	
	let orderby = "id";
	let asc = false;
	function changeSort(event){
		let ths = $('.admin_table_th');
		let div = event.target;
		orderby = div.innerText;
		if( div.parentNode.style.backgroundColor != "" && asc == false ){
			asc = true;
		} else {
			asc = false;
		}
		getDocs(0);
		for( let i = 0; i < ths.length; ++i ){
			ths[i].style.backgroundColor = "";
		}
		div.parentNode.style.backgroundColor = "#d3d3d3";
	}
	
	function getTableName(){
		return page[0].toUpperCase() + page.substr(1) + 's';
	}
	
	function removeDocs(){
		if( confirm("정말로 삭제하시겠습니까?") == false ){
			return 0;
		}
		let params = "table=" + getTableName() + "&id=";
		let cbs = $('.admin_table_checkbox');
		for( let i = 0; i < cbs.length; ++i ){
			if( cbs[i].id.indexOf("whole") >= 0 ){
				continue;
			} else if( cbs[i].checked == true ){
				params += cbs[i].id.split('_').pop() + ',';
			}
		}
		if( params[params.length-1] != "=" ){
			params = params.substr(0,params.length-1);
		}
		let xhr = new XMLHttpRequest();
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
		let query = {
			table : getTableName(),
			limit : $('#admin_limit').value,
			asc : asc,
			orderby : orderby
		}
		query.skip = skip*query.limit;
	
		let query_keys = Object.keys(query);
		let params = "";
		for( let i = 0; query_keys.length > i; ++i ){
			params += query_keys[i] + "=" + query[query_keys[i]] + "&";
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			let docs;
			try {
				docs = JSON.parse(xhr.responseText);
				for( let i = 0; i < docs.length; ++i ){
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
		let tab = $('div');
		tab.id = "admin_tab_"+en;
		
		tab.innerText = kr;
		tab.onclick = function(){
			doc = undefined;
			openAdminTab(en);
		}
		
		return tab;
	}
	
	let clicked = null;
	let startPageX = null;
	function colResizeDown(e){
		e.stopPropagation();
		clicked = e.target;
		clicked.id = "admin_table_resizer_clicked";
		clicked.style.top = "1px"
		clicked.style.opacity = "1";
		clicked.style.zIndex = "500";
		clicked.style.right = "initial";
		clicked.style.left = e.pageX - $('#admin_table').offsetLeft - 2 + "px";
		let dotline = $('div');
		dotline.style.height = $('#admin_table').clientHeight + "px";
		clicked.appendChild(dotline);
		let div = clicked.previousElementSibling;
		div.parentNode.style.position = "inherit";
		div.style.maxWidth = "none";
		startPageX = e.pageX;
	}
	
	
	function colResizeUp(e){
		if( clicked ){
			let div = clicked.previousElementSibling;
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
	
	addListener(window,'mousemove',colResizeMove);
	addListener(window,'mouseup',colResizeUp);
	
	function addListener( element, event, handle ){
		element.addEventListener( event, handle, false );
		listeners.push({ element : element, event : event, handle : handle });
	}
	return function(){
		for( let i = 0; i < listeners.length; ++i ){
			let h = listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
	}
};
