'use strict';

inits["admin"] = {
	page : null,
	doc : null,
	listeners : [],
	orderby : "id",
	asc : false,
	obj_keys : [],
	clicked : null,
	startPageX : null,
	admin_obj : {
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
	},
	changePage : function(num){
		const pages = $('.pages_num');
		for( let i = 0; i < pages.length; ++i ){
			pages[i].id = "";
		}
		pages[(num-1)%10].id = "current_page";
		this.getDocs((num-1));
	},	
	changePages : function(num,limitChange){
		if( this.getCurrentPage() == num && limitChange != true ){
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
		if( (this.getCurrentPage()-1)/10 != dec || limitChange == true ){
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
		this.changePage(num);
	},	
	getCurrentPage : function(){
		return parseInt($('#current_page').innerText);
	},
	makePages : function(){
		let that = this;
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
				that.changePages(1);
			}
			first.innerText = "<<";
			pages.appendChild(first);
			let left = $('div');
			left.innerText = "<";
			left.onclick = function(){
				that.changePages(Math.floor( ( that.getCurrentPage() - 1 ) / 10 ) * 10 );
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
					that.changePages(parseInt(this.innerText));
				});
				pages.appendChild(pages_num);
			}
			let right = $('div');
			right.addEventListener('click',function(){
				that.changePages( Math.floor( ( that.getCurrentPage() - 1 ) / 10 )*10+11 );
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
				that.changePages( page_cnt );
			});
			last.innerText = ">>";
			pages.appendChild(last);
			$('#admin_box').appendChild(pages);
			that.changePage(1);
		}};
		xhr.open("POST", "/api/admin/getcnt", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send("table="+that.getTableName());
	},
	changeLimit : function(){
		let that = this;
		let limit = $('#admin_limit');
		if( limit.value >= 100 ){
			limit.value = 100;
		} else if( limit.value <= 1 ){
			limit.value = 1;
		}
		that.changePages(that.getCurrentPage(),true);
	},
	init : function(){
		let that = this;
		if( location.pathname ){
			that.page = location.pathname.split('/').pop();
		}
		that.start();
	},
	start : function(){
		let that = this;
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
		
		const keys = Object.keys(that.admin_obj);
		for( let i = 0; i < keys.length; ++i ){
			tabs.appendChild(that.makeAdminTab(keys[i],that.admin_obj[keys[i]].kr));
		}
		$('#wrap_left').appendChild(tabs);
			
		let limit = $('input');
		limit.id = "admin_limit";
		limit.value = 20;
		limit.min = "1";
		limit.max = "100";
		limit.type = "number";
		limit.addEventListener('focusout',that.changeLimit);
		limit.addEventListener('change',that.changeLimit);
		$('#admin_box').appendChild(limit);
		let text = $('text');
		text.innerText = "개씩 보기";
		$('#admin_box').appendChild(text);
		let remove = $('div');
		remove.id = "admin_remove"
		remove.className = "admin_btn"
		remove.addEventListener('click', that.removeDocs);
		remove.innerText="삭제";
		$('#admin_box').appendChild(remove);
		that.openAdminTab();
		that.addListener(window,'mousemove',function(e){
			that.colResizeMove(e);
		});
		that.addListener(window,'mouseup',function(e){
			that.colResizeUp(e);
		});
		that.addListener(window,'resize', function(e){
			that.adminResize(e);
		});
	},
	adminResize : function(){
		if( $("#wrap_left").clientWidth == 0 ){
			$("#admin_wrap").insertBefore( $('#admin_tab'), $("#admin_wrap").firstElementChild );
		} else {
			$("#wrap_left").appendChild( $('#admin_tab') );
		}
	},
	openAdminTab : function( newtab ){
		let that = this;
		if( that.page == newtab ){
			return;
		}
		
		if( newtab != undefined ){
			that.page = newtab;
		}
	
		if( this.admin_obj[that.page] == undefined ){
			that.page = "stat";
		}
	
		if( $('#admin_table') ){
			$('#admin_box').removeChild($('#admin_table'));
		}
		if( $('#admin_pages') ){
			$('#admin_box').removeChild($('#admin_pages'));
		}
		if( document.URL.split('/').length == 4 ){
			history.pushState(null,null,"/admin/"+that.page);
		} else if( document.URL.split('/').length > 4 ){
			if( that.doc != undefined && that.doc.id ){
				history.pushState(null,null,'/admin/'+that.page+'/'+that.doc.id);
			} else {
				history.pushState(null,null,'/admin/'+that.page);
			}
		} else {
			history.pushState(null,null,that.page);
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
		$("#admin_tab_"+that.page).className = "admin_tab_active";
		
		let title = $("#admin_title");
		title.innerText = this.admin_obj[that.page].kr;
	
		this.getKeys();
	},
	getKeys : function(){
		let that = this;
		let query = {
			table : that.getTableName()
		}
		const query_keys = Object.keys(query);
		let params = "";
		for( let i = 0; query_keys.length > i; ++i ){
			params += query_keys[i] + "=" + query[query_keys[i]] + "&";
		}
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function (event){ if(xhr.readyState == 4 && xhr.status == 200) {
			try {
				that.obj_keys = JSON.parse(xhr.responseText);
				that.trFilter();
				that.makeTable();
			} catch(e){
				console.log(e);
				alert(xhr.responseText);
			}
		}};
		xhr.open("POST", "/api/admin/getkeys", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
	},
	cleanTable : function(){
		let tb = $('#admin_table');
		let trs = tb.childNodes;
		for( let i = trs.length - 1; i >= 1; --i ){
			tb.removeChild(trs[i]);
		}
	},
	makeTable : function(){
		let that = this;
		let tb = $('div');
		tb.id = "admin_table";
		tb.addEventListener('mousedown', function(e){
			e.preventDefault();
		});
		tb.appendChild(that.makeTr(that.obj_keys,true));
		$('#admin_box').appendChild(tb);
		if( that.doc == undefined ){
	//		that.getDocs(0);
		} else {
			$('#admin_table').appendChild(that.makeTr(that.doc));
		}
		that.makePages();
	},
	findObj : function(start,objName){
		let i = start;
		let deep;
		if( objName.length > 0  ){
			deep = objName.split('.').length;
		} else {
			deep = 0;
		}
		for( ; i < this.obj_keys.length; ++i ){
			let splited = this.obj_keys[i].split('.');
			splited.pop();
			let newObjName = splited.join('.');
			if( splited.length <= deep && newObjName != objName ){
				let first = this.obj_keys.splice(0,start);
				let second = [objName];
				let third = this.obj_keys.splice(0);
				this.obj_keys = first.concat(second).concat(third);
				if( i != this.obj_keys.length && deep != 0 ){
					return i-start;
				}
			} else if( splited.length > deep ){
				i += this.findObj(i,newObjName);
			}
		}
	},
	trFilter : function(){
		const filtered = ['_id','__v','password'];
		for( let i = 0; i < filtered.length; ++ i ){
			if( this.obj_keys.indexOf(filtered[i]) >= 0 ){
				this.obj_keys = this.obj_keys.splice(0,this.obj_keys.indexOf(filtered[i])).concat(this.obj_keys.splice(1));
			}
		}
		this.findObj(0,"")
	},
	wholeCheck : function(e){
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
	},
	openObject : function(e){
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
	},
	makeTr : function(obj,th){
		let that = this;
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
		checkbox.onclick = this.wholeCheck;
		if( th == true ){
			check_td = $('th');
			checkbox.id = "admin_table_wholecheck";
		} else {
			check_td = $('td');
		}
		check_td.appendChild(checkbox);
	
		tr.appendChild(check_td);
		for( let i = 0 ; i < this.obj_keys.length; ++i ){
			if( this.obj_keys[i] == "be" ){
				continue;
			}
			let td;
			if( th == true ){
				td = $('th');
				td.className = "admin_table_th";
				let div = $('div');
				div.id = "admin_table_th_div_" + this.obj_keys[i];
				div.innerText = this.obj_keys[i];
				td.appendChild(div);
				if( this.obj_keys[i].indexOf('.') >= 1 ){
					td.style.display = "none";
				}
				div.addEventListener('click', function(e){
					that.changeSort(e)
				},false);
				let resizer = $('div');
				resizer.addEventListener('mousedown', function(e){
					that.colResizeDown(e);
				},false);
				resizer.className = "admin_table_resizer";
				td.appendChild(resizer);
			} else {
				td = $('td');
				td.className = "admin_table_td";
				let div = $('div');
				let string = obj[this.obj_keys[i]];
		
				if( string == undefined && this.obj_keys[i].indexOf(".") >= 0 ){
					let sub_keys = this.obj_keys[i].split('.');
					let tmp = obj;
					if( tmp == undefined ){
						string = tmp;
						if( $("#admin_table_th_div_"+this.obj_keys[i]).parentNode.style.display == "none" ){
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
						if( $("#admin_table_th_div_"+this.obj_keys[i]).parentNode.style.display == "none" ){
							td.style.display = "none";
						}
						string = tmp;
					}
				}
				if( string == undefined ){
				} else if( typeof string == 'object' ){
					/*
					let a = $('a');
					a.innerText = this.obj_keys[i];
					a.href = "/admin/" + this.obj_keys[i] + "/" + string.id;
					td.appendChild(a);
					*/
					td.className += " admin_table_flip";
					div.innerText = "펼치기";
					td.onclick = this.openObject;
				} else if( this.obj_keys[i] == "date" || this.obj_keys[i] == "change" || this.obj_keys[i] == "last"){
					div.innerText = new Date(string).toLocaleString();
				} else {
					div.innerText = string.toString().replace(/((\r\n)|\n|\r)/gm,". ");
				}
				td.appendChild(div);
			}
			tr.appendChild(td);
		}
		return tr;
	},
	changeSort : function(event){
		let ths = $('.admin_table_th');
		let div = event.target;
		this.orderby = div.innerText;
		if( div.parentNode.style.backgroundColor != "" && this.asc == false ){
			this.asc = true;
		} else {
			this.asc = false;
		}
		this.getDocs(0);
		for( let i = 0; i < ths.length; ++i ){
			ths[i].style.backgroundColor = "";
		}
		div.parentNode.style.backgroundColor = "#d3d3d3";
	},
	getTableName : function(){
		return this.page[0].toUpperCase() + this.page.substr(1) + 's';
	},
	removeDocs : function(){
		if( confirm("정말로 삭제하시겠습니까?") == false ){
			return 0;
		}
		let params = "table=" + this.getTableName() + "&id=";
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
			this.getDocs();
		}};
		xhr.open("POST", "/api/admin/removedocs", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
	},
	getDocs : function(skip){
		let that = this;
		that.cleanTable();
		if( skip == undefined ){
			skip = that.getCurrentPage-1;
		}
		let query = {
			table : that.getTableName(),
			limit : $('#admin_limit').value,
			asc : that.asc,
			orderby : that.orderby
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
					$('#admin_table').appendChild(that.makeTr(docs[i]));
				}
			} catch(e){
				console.log(e);
				alert(xhr.responseText);
			}
		}};
		xhr.open("POST", "/api/admin/getdocs", true); xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); xhr.send(params);
	},
	makeAdminTab : function( en, kr ){
		let that = this;
		let tab = $('div');
		tab.id = "admin_tab_"+en;
		
		tab.innerText = kr;
		tab.onclick = function(){
			that.doc = undefined;
			that.openAdminTab(en);
		}
		
		return tab;
	},
	colResizeDown : function(e){
		e.stopPropagation();
		this.clicked = e.target;
		this.clicked.id = "admin_table_resizer_this.clicked";
		this.clicked.style.top = "1px"
		this.clicked.style.opacity = "1";
		this.clicked.style.zIndex = "500";
		this.clicked.style.right = "initial";
		this.clicked.style.left = e.pageX - $('#admin_table').offsetLeft - 2 + "px";
		let dotline = $('div');
		dotline.style.height = $('#admin_table').clientHeight + "px";
		this.clicked.appendChild(dotline);
		let div = this.clicked.previousElementSibling;
		div.parentNode.style.position = "inherit";
		div.style.maxWidth = "none";
		this.startPageX = e.pageX;
	},
	colResizeUp : function(e){
		if( this.clicked ){
			let div = this.clicked.previousElementSibling;
			div.parentNode.style.position = "";
			div.style.width = div.clientWidth + e.pageX-this.startPageX + "px";
			this.clicked.id = "";
			this.clicked.removeChild(this.clicked.firstElementChild);
			this.clicked.style.left = "";
			this.clicked.style.right = "";
			this.clicked.style.top = "0px"
			this.clicked.style.opacity = "";
			this.clicked.style.zIndex = "";
		}
		this.clicked = null;
	},
	colResizeMove : function(e){
		if( e.buttons && this.clicked ){
			this.clicked.style.left = e.pageX - $('#admin_table').offsetLeft - 2 + "px";
		}
	},
	addListener : function( element, event, handle ){
		element.addEventListener( event, handle, false );
		this.listeners.push({ element : element, event : event, handle : handle });
	},
	exit : function(){
		for( let i = 0; i < this.listeners.length; ++i ){
			let h = this.listeners[i];
			h.element.removeEventListener( h.event, h.handle, false );
		}
		$('#wrap_left').removeChild($('#admin_tab'));
		$('#wrap_mid').removeChild($('#admin_wrap'));
	}
};
