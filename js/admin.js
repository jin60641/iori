window.addEventListener('load',function(){
	var admin_wrap = $("div");
	admin_wrap.id = "admin_wrap";
	var admin_menu = $("div");
	admin_menu.id = "admin_menu";
	var admin_menu_title = $("div");
	admin_menu_title.innerText = "관리자 메뉴";
	admin_menu_title.id = "admin_menu_title";
	admin_menu.appendChild(admin_menu_title);
	for( var i = 1; i <= 8; ++i ){
		var admin_menu_item = $("a");
		admin_menu_item.className = "admin_menu_item";
		switch(i){
			case 1:
				admin_menu_item.innerText = "사이트 통계";
				admin_menu_item.href = "/admin/stat";
				break;
			case 2: 
				admin_menu_item.innerText = "사용자 관리";
				admin_menu_item.href = "/admin/user";
				break;
			case 3:
				admin_menu_item.innerText = "상품관리";
				admin_menu_item.href = "/admin/item";
				break;
			case 4:
				admin_menu_item.innerText = "옵션관리";
				admin_menu_item.href = "/admin/option";
				break;
			case 5:
				admin_menu_item.innerText = "조합관리";
				admin_menu_item.href = "/admin/combi";
				break;
			case 6:
				admin_menu_item.innerText = "쿠폰관리";
				admin_menu_item.href = "/admin/coupon";
				break;
			case 7:
				admin_menu_item.innerText = "주문관리";
				admin_menu_item.href = "/admin/purchase";
				break;
			case 8:
				admin_menu_item.innerText = "방문신청관리";
				admin_menu_item.href = "/admin/visit";
				break;
		};
		admin_menu.appendChild(admin_menu_item);
	};
	admin_wrap.appendChild(admin_menu);
	document.body.appendChild(admin_wrap);
});
