'use strict';
	
inits["register"] = {
	init : function(){
		let that = this;
		let helper = $('div');
		helper.id = "helper";
		$('#wrap_top').appendChild(helper);

		let form = $("form");
		form.id = "form";
		
		let form_name_label = $("label");
		form_name_label.innerText = "이름";
		form_name_label.htmlFor = "form_name";
		form.appendChild(form_name_label);
		let form_name = $("input");
		form_name.id = "form_name";
		form_name.type = "text";
		form.appendChild(form_name);
	
		let form_uid_label = $("label");
		form_uid_label.innerText = "아이디";
		form_uid_label.htmlFor = "form_uid";
		form.appendChild(form_uid_label);
	
		let form_uid = $("input");
		form_uid.id = "form_uid";
		form_uid.type = "text";
		form_uid.placeholder = "최대 20자 영문 대/소문자, 숫자, 밑줄(_) 사용가능"
		form.appendChild(form_uid);
	
		let form_email_label = $("label");
		form_email_label.innerText = "이메일";
		form_email_label.htmlFor = "form_email";
		form.appendChild(form_email_label);
		let form_email = $("input");
		form_email.id = "form_email";
		form_email.type = "email";
		form.appendChild(form_email);
	
		let form_password_label = $("label");
		form_password_label.innerText = "비밀번호";
		form_password_label.htmlFor = "form_email";
		form.appendChild(form_password_label);
		let form_password = $("input");
		form_password.type = "password";
		form_password.id = "form_password";
		form_password.placeholder = "8~20자 영문 대/소문자, 숫자, 특수문자 혼용";
		form.appendChild(form_password);
	
		let form_agree = $("div");
		form_agree.innerHTML = "<a target='_blank' href='/terms' >이용약관</a> 및 <a target='_blank' href='/privacy'>개인정보취급</a> 방침에 동의합니다.";
		form_agree.style.backgroundImage = 'url("/img/login/btn_checkbox_pressed.png")';
		form_agree.onclick = function(evt){
			if( evt.target.id == "form_agree" ){
				if( this.style.backgroundImage != 'url("/img/login/btn_checkbox_normal.png")' ){	
					this.style.backgroundImage = 'url("/img/login/btn_checkbox_normal.png")';
				} else {
					this.style.backgroundImage = 'url("/img/login/btn_checkbox_pressed.png")';
				}
			}
		}
		form_agree.id = "form_agree";
		form.appendChild(form_agree);
	
		let form_submit_btn = $("div");
		form_submit_btn.id = "form_submit_btn";
		form_submit_btn.className = "form_btn";
		form_submit_btn.onclick = function(e){
			that.send_register(e);
		}
		form_submit_btn.innerText = "회원가입";
		form.appendChild(form_submit_btn);
	
	    let form_alert = $("div");
	    form_alert.id = "form_alert";
	    form_alert.innerText = "'";
	    form.appendChild(form_alert);
	
		if(  session.name || session.email || session.uid ){
			if( session.name ){
				form_name.value = session.name;
	//			form_name.readOnly = true;
			}
			if( session.displayName ){
				form_name.value = session.displayName;
			}
			if( session.email ){
				form_email.value = session.email;
	//			form_email.readOnly = true;
			}
		} else {
			let form_facebook_btn = $("div");
			form_facebook_btn.id = "form_facebook_btn";
			form_facebook_btn.className = "form_btn";
			form_facebook_btn.onclick = function(){
				location.href = "/api/auth/facebook";
			};
			form_facebook_btn.innerHTML = "<img src='/img/login/ic_sns.png' />페이스북으로 회원가입";
			form.appendChild(form_facebook_btn);
		}
	
		let form_login = $("text");
		form_login.innerHTML = "이미 회원이신가요?";
		let form_login_a = $('a');
		makeHref(form_login_a,'/login');
		form_login_a.innerText = "로그인하기";
		form_login.appendChild(form_login_a);
		form.appendChild(form_login);

		$('#wrap_top').appendChild(form);
	},
	show_alert : function(msg){
		let form_alert = $("#form_alert");
		form_alert.innerText = msg;
		form_alert.style.opacity = 1;
	},
	send_register : function(){
		let that = this;
		let name = $("#form_name").value;
		let uid = $("#form_uid").value;
		let email = $("#form_email").value;
		let password = $("#form_password").value;
		if( $("#form_agree").style.backgroundImage != 'url("/img/login/btn_checkbox_pressed.png")' ){
			that.show_alert("약관동의를 체크해 주세요.");
			return;
		} else if( name.length == 0 ){
			$("#form_name").focus();
			that.show_alert("이름을 입력해 주세요.");
			return;
		} else if( uid.length == 0 ){
			$("#form_uid").focus();
			that.show_alert("아이디를 입력해 주세요.");
			return;
		} else if( uid.length < 8 || uid.length > 20 ){
			$("#form_uid").focus();
			that.show_alert("아이디는 8~20 자리 사이여야 합니다.");
			return;
		} else if( email.length == 0 ){
			$("#form_email").focus();
			that.show_alert("이메일을 입력해 주세요.");
			return;
		} else if( email.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/g ) == undefined ){
			$("#form_email").focus();
			that.show_alert("유효하지 않은 이메일 입니다.");
			return;
		} else if( password.length < 8 || password.length > 20 ){
			$("#form_password").focus();
			that.show_alert("비밀번호는 8~20 자리 사이여야 합니다.");
			return;
		} else {
			let score = 0;
			if( password.match(/[a-z]/) ){
				++score;
			}
			if( password.match(/[A-Z]/) ){
				++score;
			}
			if( password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/) ){
				++score;
			}
			if( password.match(/[0-9]/) ){
				++score;
			}
			if( score < 2 ){
				that.show_alert("비밀번호는 영어 대소문자, 숫자, 특수문자 중 두가지 이상을 조합해야 합니다.");
				$("#form_password").focus();
				return;
			} else if( score >= 2 ){
				that.show_alert("서버의 응답을 기다리고 있습니다.");
	
				let xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(event){ 
					if( xhr.readyState == 4 && xhr.status == 200 ){
						 that.show_alert(xhr.responseText.toString());
					}
				}
				xhr.open("POST", "/register", true); 
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
				xhr.send('name='+name+'&uid='+uid+'&email='+email+'&password='+password);
			}
		}
	},
	exit : function(){
		$('#wrap_top').removeChild($('#helper'));
		$('#wrap_top').removeChild($('#form'));
	}
}
