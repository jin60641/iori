'use strict';
	
inits["changepw"] = {
	exit : function(){
		$('#wrap_top').removeChild($('#form'));
	},
	init : function(){
		var that = this;
		let helper = $('div');
		helper.id = "helper";
		$('#wrap_top').appendChild(helper);

		var form = $("form");
		form.id = "form";
		form.onkeydown = function(e){
			that.form_onkeydown(e);
		}
		
		var form_password_label = $("label");
		form_password_label.innerText = "새 비밀번호";
		form_password_label.htmlFor = "form_password";
		form.appendChild(form_password_label);
		var form_password = $("input");
		form_password.id = "form_password";
		form_password.placeholder = "8~20자 영문 대/소문자, 숫자, 특수문자 혼용";
		form_password.type = "password";
		form.appendChild(form_password);
	
		var form_passwordCheck_label = $("label");
		form_passwordCheck_label.innerText = "새 비밀번호 확인";
		form_passwordCheck_label.htmlFor = "form_passwordCheck";
		form.appendChild(form_passwordCheck_label);
		var form_passwordCheck = $("input");
		form_passwordCheck.id = "form_passwordCheck";
		form_passwordCheck.type = "password";
		form.appendChild(form_passwordCheck);
	
		var form_submit_btn = $("div");
		form_submit_btn.id = "form_submit_btn";
		form_submit_btn.onclick = function(e){
			that.send_submit(e);
		};
		form_submit_btn.className = "form_btn";
		form_submit_btn.innerText = "비밀번호 변경";
		form.appendChild(form_submit_btn);
	
		var form_alert = $("div");
		form_alert.id = "form_alert";
		form_alert.innerText = "'";
		form.appendChild(form_alert);
	
		$('#wrap_top').appendChild(form);
	},
	form_onkeydown : function(e){
		var that = this;
		if(e.keyCode == 13 ){
			e.preventDefault();
			that.send_submit();
			return false;
		}
	},
	show_alert : function(msg){
		var form_alert = $("#form_alert");
		form_alert.innerText = msg;
		form_alert.style.opacity = 1;
	},
	send_submit : function(){
		var that = this;
		var password = $("#form_password").value;
		var passwordCheck = $("#form_passwordCheck").value;
		if( password.length == 0 ){
			that.show_alert("비밀번호를 입력해 주세요.");
			$("#form_password").focus();
		} else if( password != passwordCheck ){
			that.show_alert("비밀번호 확인이 일치하지 않습니다.");
			$("#form_password").focus();
		} else {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(event){
				if( xhr.readyState == 4 && xhr.status == 200 ){
					if( xhr.responseText == "success" ){
						alert("비밀번호가 변경되었습니다.");
						location.href = "/login";
					} else {
						that.show_alert(xhr.responseText);
					}
				}
			}
			that.show_alert("서버의 응답을 기다리는 중입니다.");
			xhr.open("POST", "/api/auth/changepw", true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			var pathname = location.pathname.split('/');
			xhr.send('password='+password+'&email='+pathname[2]+'&link='+pathname[3]);
		}
	}
}
