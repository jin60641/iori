'use strict';

window.addEventListener('load', function(){
	var container = $('div');
	container.id = "error_container";
	
	var box = $('span');
	box.id = "error_box";
	container.appendChild(box);
	
	var message = $('div');
	message.id = "error_message";
	
	var div = $('div');
	div.innerText = "요청하신 페이지가 존재하지 않습니다.";
	message.appendChild(div);

	message.innerHTML += "입력하신 페이지가 삭제되었거나 일시적으로 사용할 수 없습니다.<br>페이지의 주소를 올바르게 입력했는지 확인해보시기 바랍니다."

	box.appendChild(message);
	
	$('#wrap_mid').appendChild(container);
});
