window.addEventListener('load', function(){
	var form = document.createElement("form");
	form.id = "form";
	
	var form_uid_label = document.createElement("label");
	form_uid_label.innerText = "아이디";
	form_uid_label.htmlFor = "form_uid";
	form.appendChild(form_uid_label);
	var form_uid = document.createElement("input");
	form_uid.onkeydown = enterLogin;
	form_uid.placeholder = "이메일로도 로그인 가능합니다.";
	form_uid.id = "form_uid";
	form_uid.type = "text";
	form_uid.name = "uid";
	form.appendChild(form_uid);

	var form_password_label = document.createElement("label");
	form_password_label.innerText = "비밀번호";
	form_password_label.htmlFor = "form_password";
	form.appendChild(form_password_label);
	var form_password = document.createElement("input");
	form_password.onkeydown = enterLogin;
	form_password.id = "form_password";
	form_password.type = "password"
	form.appendChild(form_password);

	var form_auto_login = document.createElement("div");
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
	var form_login_btn = document.createElement("div");
	form_login_btn.id = "form_login_btn";
	form_login_btn.onclick = send_login;
	form_login_btn.className = "form_btn";
	form_login_btn.innerText = "로그인";
	form.appendChild(form_login_btn);

	var form_alert = document.createElement("div");
	form_alert.id = "form_alert";
	form_alert.innerText = "'";
	form.appendChild(form_alert);

	if( session ){
		if( session.uid ){
			form_uid.value =  session.uid;
		}
	} else {
		var form_facebook_btn = document.createElement("div");
		form_facebook_btn.id = "form_facebook_btn";
		form_facebook_btn.className = "form_btn";
		form_facebook_btn.onclick = function(){
			var now = new Date();
			now.setTime(now.getTime() + (7*24*60*60*1000));
			var returnTo = document.URL.split('/').slice(4).toString();
			var auto = document.getElementById("form_auto_login");
			if( auto.style.backgroundImage == 'url("/img/login/btn_checkbox_pressed.png")' ){
//				document.cookie = "facebook=true;expires=" + now.toUTCString() + ";domain=iori.kr;path=/";
			}
			location.href = "/api/auth/facebook/" + returnTo;
		};
		form_facebook_btn.innerHTML = "<img src='/img/login/ic_sns.png' />페이스북으로 로그인";
		form.appendChild(form_facebook_btn);
	}


	var form_findpw = document.createElement("text");
	form_findpw.innerHTML = "비밀번호를 잊으셨나요?<a href='/findpw'>비밀번호 찾기</a>"
	var form_register = document.createElement("text");
	form_register.innerHTML = "아직 회원이 아니신가요?<a href='/register'>회원가입</a>"
	form.appendChild(form_findpw);
	form.appendChild(form_register);
	document.body.appendChild(form);
});

function show_alert(msg){
	var form_alert = document.getElementById("form_alert");
	form_alert.innerText = msg;
	form_alert.style.opacity = 1;
}

function send_login(){
	var uid = document.getElementById("form_uid").value;
	var password = document.getElementById("form_password").value;
	var auto = document.getElementById("form_auto_login");
	if( uid.length == 0 ){
		show_alert("이메일을 입력해 주세요.");
		document.getElementById("form_uid").focus();
	} else if( password.length == 0 ){
		show_alert("비밀번호 입력해 주세요.");
		document.getElementById("form_password").focus();
	} else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(event){
			if( xhr.readyState == 4 && xhr.status == 200 ){
				if( xhr.responseText == "success" ){
					if( auto.style.backgroundImage == 'url("/img/login/btn_checkbox_pressed.png")' ){
						var now = new Date();
						now.setTime(now.getTime() + (7*24*60*60*1000));
						document.cookie = "facebook=false, uid="+uid+", password="+password+";expires=" + now.toUTCString() + ";domain=iori.kr;path=/";
					}
					location.href = "/" + document.URL.split('/').slice(4).toString().split('-').join('/');
				} else {
					show_alert(xhr.responseText);
				}
			}
		}
		xhr.open("POST", "/api/auth/local", false);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('uid='+uid+'&password='+password);
	}
};


function enterLogin(e){
	if( e.keyCode == 13 ){
		send_login();
	}
}
