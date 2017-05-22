'use strict';
	
inits["login"] = {
	show_alert : function(msg){
		let form_alert = $("#form_alert");
		form_alert.innerText = msg;
		form_alert.style.opacity = 1;
	},
	send_login : function(){
		let that = this;
		let uid = $("#form_uid").value;
		let password = $("#form_password").value;
		let auto = $("#form_auto_login");
		if( uid.length == 0 ){
			that.show_alert("아이디를 입력해 주세요.");
			$("#form_uid").focus();
		} else if( password.length == 0 ){
			that.show_alert("비밀번호 입력해 주세요.");
			$("#form_password").focus();
		} else {
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(event){
				if( xhr.readyState == 4 && xhr.status == 200 ){
					let result = JSON.parse(xhr.responseText);
					if( result.session ){
						session = result.session;
						if( auto.checked == true ){
							let now = new Date();
							now.setTime(now.getTime() + (7*24*60*60*1000));
							document.cookie = "facebook=false, uid="+uid+", password="+password+";expires=" + now.toUTCString() + ";domain=iori.kr;path=/";
						}
						if( document.URL.indexOf("login") >= 0 ){
							location.href =  "/" + document.URL.split('/').slice(4).toString().split('-').join('/');
							//getPage( "/" + document.URL.split('/').slice(4).toString().split('-').join('/') );
						} else {
							location.reload();
							//getPage( location.pathname );
						}
					} else {
						that.show_alert(result.msg);
					}
				}
			}
			xhr.open("POST", "/api/auth/local", false);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send('uid='+uid+'&password='+password);
		}
	},
	enterLogin : function(e){
		if( e.keyCode == 13 ){
			this.send_login();
		}
	},
	init : function(){
		if( session.signUp ){
			if( document.URL.indexOf("login") >= 0 ){
				if( document.URL.split('/login/')[1] ){
					getPage( "/" + document.URL.split('/').slice(4).toString().split('-').join('/') );
				} else {
					location.hrerf = "/";
				}
			} else {
				getPage( location.pathname );
			}
		}
		let helper = $('div');
		helper.id = "helper";
		$('#wrap_top').appendChild(helper);
		let form = $("form");
		form.id = "form";
			
		let form_uid_label = $("label");
		form_uid_label.innerText = "아이디";
		form_uid_label.htmlFor = "form_uid";
		form.appendChild(form_uid_label);
		let form_uid = $("input");
		let that = this;
		form_uid.onkeydown = function(e){
			that.enterLogin(e);
		}
		form_uid.placeholder = "이메일로도 로그인 가능합니다.";
		form_uid.id = "form_uid";
		form_uid.type = "text";
		form_uid.name = "uid";
		form.appendChild(form_uid);
	
		let form_password_label = $("label");
		form_password_label.innerText = "비밀번호";
		form_password_label.htmlFor = "form_password";
		form.appendChild(form_password_label);
		let form_password = $("input");
		form_password.onkeydown = function(e){
			that.enterLogin(e);
		}
		form_password.id = "form_password";
		form_password.type = "password"
		form.appendChild(form_password);
		/*
		let form_auto_login = $("div");
		form_auto_login.innerText = "로그인 유지";
		form_auto_login.style.backgroundImage = 'url("/img/login/btn_checkbox_pressed.png")';
		form_auto_login.onclick = function(){
			if( this.style.backgroundImage != 'url("/img/login/btn_checkbox_normal.png")' ){
				this.style.backgroundImage = 'url("/img/login/btn_checkbox_normal.png")';
			} else {
				this.style.backgroundImage = 'url("/img/login/btn_checkbox_pressed.png")';
			}
		}
		form_auto_login.id = "form_auto_login";
		form.appendChild(form_auto_login);
		*/
		let form_auto_login = $("input");
		form_auto_login.type = "checkbox"
		form_auto_login.id = "form_auto_login";
		form_auto_login.name = "form_auto_login";
		form.appendChild(form_auto_login);
		let form_auto_login_label = $("label");
		form_auto_login_label.id = "form_auto_login_label";
		form_auto_login_label.innerText = "로그인 유지";
		form_auto_login_label.htmlFor = "form_auto_login";
		form.appendChild(form_auto_login_label);
	
		let form_login_btn = $("div");
		form_login_btn.id = "form_login_btn";
		form_login_btn.onclick = function(e){
			that.send_login(e);
		}
		form_login_btn.className = "form_btn";
		form_login_btn.innerText = "로그인";
		form.appendChild(form_login_btn);
	
		let form_alert = $("div");
		form_alert.id = "form_alert";
		form_alert.innerText = "'";
		form.appendChild(form_alert);
		
		if( ( session.name || session.email || session.uid ) ){
			if( session.uid ){
				form_uid.value = session.uid;
			} else if( session.email ){
				form_uid.value = session.email;
			}
		} else {
			let form_facebook_btn = $("div");
			form_facebook_btn.id = "form_facebook_btn";
			form_facebook_btn.className = "form_btn";
			form_facebook_btn.onclick = function(){
				let now = new Date();
				now.setTime(now.getTime() + (7*24*60*60*1000));
				let returnTo;
				if( document.URL.indexOf("login") >= 0 ){
					returnTo = document.URL.split('/').slice(4).toString();
				} else {
					returnTo = document.URL.split('/').slice(3).toString();
				}
				let auto = $("#form_auto_login");
				if( auto.checked == true ){
	//				document.cookie = "facebook=true;expires=" + now.toUTCString() + ";domain=iori.kr;path=/";
				}
				location.href = "/api/auth/facebook/" + returnTo;
			};
			form_facebook_btn.innerHTML = "<img src='/img/login/ic_sns.png' />페이스북으로 로그인";
			form.appendChild(form_facebook_btn);
		}
	
	
		let form_findpw = $("text");
		form_findpw.innerText = "비밀번호를 잊으셨나요?"
		let form_findpw_a = $('a');
		makeHref(form_findpw_a,"/findpw");
		form_findpw_a.innerText = "비밀번호 찾기";
		form_findpw.appendChild(form_findpw_a);
		form.appendChild(form_findpw);

		let form_register = $("text");
		form_register.innerText = "아직 회원이 아니신가요?";
		let form_register_a = $('a');
		makeHref(form_register_a,"/register");
		form_register_a.innerText = "회원가입";
		form_register.appendChild(form_register_a);
		form.appendChild(form_register);

		$('#wrap_top').appendChild(form);
	},
	exit : function(){
		$('#wrap_top').removeChild($('#helper'));
		$('#wrap_top').removeChild($('#form'));
	}
}
