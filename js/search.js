window.addEventListener('load', function(){
	var container = $('div');
	container.id = "search_container";
	var back = $('div');
	back.id = "search_container_back";
	container.appendChild(back);
	var container_wrap = $('div');
	container_wrap.id = "search_wrap";
	container_wrap.appendChild(container);
	$('#wrap_top').appendChild(container_wrap);
	
	var wrap = $('div');
	wrap.id = "search_result_wrap";
	$('#wrap_mid').appendChild(wrap);
});


