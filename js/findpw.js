'use strict';

window.addEventListener('load', function(){
	var form = $("form");
	form.id = "form";
	form.onkeydown = form_onkeydown;
	
	var form_email_label = $("label");
	form_email_label.innerText = "이메일";
	form_email_label.htmlFor = "form_email";
	form.appendChild(form_email_label);
	var form_email = $("input");
	form_email.id = "form_email";
	form_email.type = "email";
	form.appendChild(form_email);

	var form_submit_btn = $("div");
	form_submit_btn.id = "form_submit_btn";
	form_submit_btn.onclick = send_submit;
	form_submit_btn.className = "form_btn";
	form_submit_btn.innerText = "안내 이메일 받기";
	form.appendChild(form_submit_btn);

	var form_alert = $("div");
	form_alert.id = "form_alert";
	form_alert.innerText = "'";
	form.appendChild(form_alert);

	$('#wrap_top').appendChild(form);
	
});

function form_onkeydown(e){
	if(e.keyCode == 13 ){
		e.preventDefault();
		send_submit();
		return false;
	}
}

function show_alert(msg){
	var form_alert = $("#form_alert");
	form_alert.innerText = msg;
	form_alert.style.opacity = 1;
}

function send_submit(){
	var email = $("#form_email").value;
	if( email.length == 0 ){
		show_alert("이메일을 입력해 주세요.");
		$("#form_email").focus();
	} else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(event){
			if( xhr.readyState == 4 && xhr.status == 200 ){
				show_alert(xhr.responseText);
			}
		}
		show_alert("서버의 응답을 기다리는 중입니다.");
		xhr.open("POST", "/api/auth/findpw", true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('email='+email);
	}
};
