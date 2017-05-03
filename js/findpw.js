'use strict';

	
inits["findpw"] = {
	form_onkeydown : function(e){
		let that = this;
		if(e.keyCode == 13 ){
			e.preventDefault();
			that.send_submit();
			return false;
		}
	},
	show_alert : function(msg){
		let form_alert = $("#form_alert");
		form_alert.innerText = msg;
		form_alert.style.opacity = 1;
	},
	send_submit : function(){
		let that = this;
		let email = $("#form_email").value;
		if( email.length == 0 ){
			that.show_alert("이메일을 입력해 주세요.");
			$("#form_email").focus();
		} else {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(event){
				if( xhr.readyState == 4 && xhr.status == 200 ){
					that.show_alert(xhr.responseText);
				}
			}
			that.show_alert("서버의 응답을 기다리는 중입니다.");
			xhr.open("POST", "/api/auth/findpw", true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send('email='+email);
		}
	},
	init : function(){
		let that = this;
		let form = $("form");
		form.id = "form";
		form.onkeydown = function(e){
			that.form_onkeydown(e);
		}
		
		let form_email_label = $("label");
		form_email_label.innerText = "이메일";
		form_email_label.htmlFor = "form_email";
		form.appendChild(form_email_label);
		let form_email = $("input");
		form_email.id = "form_email";
		form_email.type = "email";
		form.appendChild(form_email);
	
		let form_submit_btn = $("div");
		form_submit_btn.id = "form_submit_btn";
		form_submit_btn.onclick = function(e){
			that.send_submit(e);
		}
		form_submit_btn.className = "form_btn";
		form_submit_btn.innerText = "안내 이메일 받기";
		form.appendChild(form_submit_btn);
		
		let form_alert = $("div");
		form_alert.id = "form_alert";
		form_alert.innerText = "'";
		form.appendChild(form_alert);
		
		$('#wrap_top').appendChild(form);
	},
	exit : function(){
		$('#wrap_top').removeChild($('#form'));
	}
}
